
var openTooltips = [];          // (internal) Array of IDs of currently active tooltips
var timer = null;               // (internal) Timer to keep track of "click and hold" or just "simple click"
var editLock = "false";			// (internal) Variable to hold if course selection is locked due to options menu
var pressAndHoldTime = 500;     // Period of time for the program to consider a touch/click as a "click and hold"

/* Initialization function: */
 $(document).ready(function(){

     // Loads data for course completion:
     checkCookies();

	 // Adds functionality to buttons in the options menu:
	 handleOptionsMenu();

	 // Handles mobile orientation warnings:
	 handleMobileOrientation();

     // Adds click event to close all tooltips:
     $("body").click(function(e) {

         // Variable to exclude from the close tooltip function:
         var keepOpen = -1;

         // If a course was clicked, retrieve its index:
         if (e.target.id.indexOf("course") != -1){
             // Retrieves the index of the clicked course:
             keepOpen = e.target.id.match(/\d+/);
         }

         closeAllTooltips(keepOpen);

     });

     // Creates stacked progress bar
     var progbar = $("<div/>",
        {
            "class": "progress",
            "id": "progbar"
        });
     $("#panel").append(progbar);    
 
     var colors = ["blue", "yellow", "green"]
     var childprogbars = [];

     categories.forEach(function(category,i) {
        if (getTotalCredits(category.id) == 0) {
            var completed = getCompletedWorkload(category.id);
            var total = getTotalWorkload(category.id);
        } else {
            var completed = getCompletedCredits(category.id);
            var total = getTotalCredits(category.id);
        }
        childprogbars[i] = $("<div/>",
        {
            "class": "progress-bar",
            "id": "subprogbar"+category.id,
            "role": "progressbar",
            "style": "width:100%; background-color:"+colors[i],
            "text": category.name + " " + completed + "/" + total
        });
        $("#progbar").append(childprogbars[i]); 
     });

           
     // Get total credits and workload per category
     categories.forEach(function(category) {
        getTotalCredits(category.id);
        getTotalWorkload(category.id);
    });


     // Creates semester columns:
     for (var i=1; i<=semesters; i++){

         // Creates column div:
         var column = $("<div/>",
             {
                 "class": "column",
                 "id": "column"+i
             });

        // Creates a button representing a semester:
        var rectangle = $("<button/>",
            {
                "class": "box semester-box incomplete-semester unselectable",
                "id": "semester"+i
            });

        // Creates a span element to hold the name of the semester:
        var name = $("<span/>",
            {
                "class": "semester-name",
                "id": "semester-name"+i
            });
        name.html(i+"º PERÍODO");

        // Inserts column into DOM:
        rectangle.append(name);
        column.append(rectangle);
        $("#panel").append(column);
     }

    // Creates course buttons:
    for (var i in courses){

        // Creates a button representing a course:
        var rectangle = $("<button/>",
            {
                "class": "box course-box unselectable",
                "id": "course"+i,
            });

        // Assigns the click event handlers for courses:
        (function(i) {
            // Checks if device has touch or mouse:
            var mouseDown = "touchstart", mouseUp = "touchend";
            if (document.ontouchstart !== null){
                mouseDown = "mousedown", mouseUp = "mouseup";
            }
            // Event for when click is pressed:
            rectangle.on(mouseDown, function(e){
                // Starts the timer:
                timer = setTimeout(function(){ onLongTouch(i) }, pressAndHoldTime);
	            // Impedes click event from being triggered by descendants:
	            }).on('click', 'div', function(e) {
	                e.stopPropagation();
	            });
            // Event for when click is released:
            rectangle.on(mouseUp, function(e){
                // If this passes, click wasn't a hold:
                if (timer != null){
                    // Prevents "click and hold" from happening:
                    clearTimeout(timer);
                    // Signals there was no "click and hold":
                    timer = null;
					// If editting is unlocked (by option in menu):
					if (editLock != "true"){
	                    // Decides to assign a tooltip or a toggle event:
	                    if (courses[i].step != undefined){
	                        courseTooltip(i);
	                    } else {
	                        courseToggle(i);
	                    }
					}
                }
            // Impedes click event from being triggered by descendants:
            }).on('click', 'div', function(e) {
                e.stopPropagation();
            });
            // For mouse environments, clears timer when dragging away from course box:
            rectangle.mouseleave( function(e){
                // Prevents "click and hold" from happening:
                clearTimeout(timer);
                // Signals there was no "click and hold":
                timer = null;
            });
        }(i));

        // Updates button according to course completion:
        var status = parseInt(courses[i].status);
        if ((status == courses[i].credits) || status == courses[i].workload) {
            rectangle.addClass("complete-course");
        } else {
            rectangle.addClass("incomplete-course");
            // Checks if background should be colored partially:
        }

        // Creates a span element to hold the name of the course:
        var name = $("<span/>",
            {
                "class": "course-name",
                "id": "course-name"+i
            });
        name.html(courses[i].name);

        // Creates a span element to hold the number of credits or workload:
        var credits = $("<span/>",
            {
                "class": "course-credits",
                "id": "course-credits"+i
            });

        // Displays credits or workload if course has no credits:
        var text = "";
        if (courses[i].credits == 0){
            text = " horas)";
            credits.html("(" + courses[i].workload + text);
        } 
        else if (courses[i].credits == 1){
            text = " crédito)";
            credits.html("(" + courses[i].credits + text);
        } 
        else {
            text = " créditos)";
            credits.html("(" + courses[i].credits + text);
        }
        
        // Inserts course info into the corresponding semester DOM:
        var parent = $("#column" + courses[i].semester);
        rectangle.append(name);
        rectangle.append(credits);
        parent.append(rectangle);

        // Checks if background should be partially colored:
        if (courses[i].step != undefined) {
            scaleBackground(i);
        }

    }

    // Checks semester completion:
    for (var i=1; i<=semesters; i++){
        verifySemester(i);
    }

});


// Function to display a course's requirements when holding its box:
function onLongTouch(index) {
    // Signals that the timer is no longer running:
    timer = null;
    // Retrieves requirements for course "index":
    var requirements = courses[index].requirements;
    // Light them up if requirements exist:
    if (requirements != undefined){
        for (var i in requirements){
            $("#course"+requirements[i]).addClass("course-glow");
            // Sets a timer for the glow to end after a few seconds:
            (function(i) {
                setTimeout(function(){ $("#course"+requirements[i]).removeClass("course-glow"); }, 4600);
            }(i));
        }
    }
}


// Function to define the completed number of credits 
function getCompletedCredits(category) {
    var comp_cred = 0;
    courses.forEach(function(course, index) {
        var status = getCookie(index);
        if ((course.category == category) && (status != 0)) 
            comp_cred += course.credits;
    });
    return comp_cred;
}

// Function to define the completed workload 
function getCompletedWorkload(category) {
    var comp_workload = 0;
    courses.forEach(function(course, index) {
        var status = getCookie(index);
        if ((course.category == category) && (status != 0)) 
            comp_workload += course.workload;
    });
    return comp_workload;
}

    console.log(getCookie(2));
    getCompletedCredits(1);
// Function to define the total number of credits needed for diploma completion
function getTotalCredits(category) {
    var total_cred = 0;
    courses.forEach(function(course) {
        if (course.category == category) total_cred += course.credits;
    });
    console.log(total_cred);
    return total_cred;
}

// Function to define the total workload needed for diploma completion
function getTotalWorkload(category) {
    var total_workload = 0;
    courses.forEach(function(course) {
        if (course.category == category) total_workload += course.workload;
    });
    console.log(total_workload);
    return total_workload;
}

getTotalWorkload(1);


// Function to toggle complete/incomplete when clicking on a course:
function courseToggle(index){

    // Finds the corresponding course button:
    var course = $("#course"+index);
    var category = categories[courses[index].category-1];
    var subprogbar = $("#subprogbar"+category.id);
    
    if (getTotalCredits(category.id) == 0) {
        var completed = getCompletedWorkload(category.id);
        var total = getTotalWorkload(category.id);
    } else {
        var completed = getCompletedCredits(category.id);
        var total = getTotalCredits(category.id);
    }    

    console.log(category.name + " " + completed + "/" + total);
    //var status = "";

    // Define status meaning (credits or workload) and stepsize for each progress bar
    if(courses[index].credits == 0) {
        var status = courses[index].workload.toString();
        var step = parseInt(status)/getTotalWorkload(courses[index].category);
    } else {
        var status = courses[index].credits.toString();
        var step = parseInt(status)/getTotalCredits(courses[index].category);
    } 
    
    // Toggles the button completion:
    if (course.hasClass("incomplete-course")){
        course.removeClass("incomplete-course").addClass("complete-course");
        completed+= parseInt(status);
        subprogbar.text(category.name + " " + completed + "/" + total);        
        //subprogbar.width(subprogbar.width()*(1+step));
    } else {
        course.removeClass("complete-course").addClass("incomplete-course");
        console.log(step);
        completed-= parseInt(status);
        subprogbar.text(category.name + " " + completed + "/" + total);        
        //subprogbar.width(subprogbar.width()*(1-step));
        status = "0";

    }

    // Saves the cookie:
    setCookie(index, status);
    courses[index].status = status;

    // Checks if semester status was changed:
    verifySemester(courses[index].semester);

}

// Function to display a tooltip with a slider when clicking on a course:
function courseTooltip(index){

    // Finds the corresponding course button:
    var course = $("#course"+index);

    // Case where tooltip isn't open yet:
    if (openTooltips.indexOf(index.toString()) == -1){

        // Saves the state of the tooltip:
        openTooltips.push(index);

        // Creates a tooltip:
        var tooltip = $("<div/>",
            {
                "class": "tt" + index + " tooltip top",
                "style": "display: block" //tag-debug
            });

        // Creates the slider div:
        var slider = $("<div/>",
            {
                "class": "slider",
            });
        tooltip.append(slider);

        var max;
        if (courses[index].credits == 0)
            max = courses[index].workload;
        else 
            max = courses[index].credits;

        console.log(parseInt(courses[index].status));    
        // Initializes the slider (slider[0] is just jquery obj to vanilla JS obj):
        noUiSlider.create(slider[0], {
            // Initital value:
    		start: parseInt(courses[index].status),
            // Background:
    		connect: [true, false],
            // Allows for immediate movement of slide:
            behaviour: 'snap',
            // Display current value as tooltip:
            tooltips: true,
            // Parse displayed value as an integer:
            format: {
                to: function ( value ) {
                    return parseInt(value);
                },
                from: function ( value ) {
                    return parseInt(value);
                    }
                },
            // Slider step:
            step: parseInt(courses[index].step),
            // Min and max values:
    		range: {
    			'min': 0,
    			'max': max  
    		}
    	});

        // Listens for a change of value on the slider:
        slider[0].noUiSlider.on("update", function(){

            // Reads the changed value:
            var status = slider[0].noUiSlider.get().toString();
            // Prevents initialization issues:
            if (status == "NaN") status = "0";
            // Saves the cookie:
            setCookie(index, status);
            courses[index].status = status;

            // Adds completion color to course element:
            var scale = scaleBackground(index);

            // Checks if course status was changed:
            if ((scale == 1) && (course.hasClass("incomplete-course"))) {
                course.css("background-image", "");
                courseToggle(index);
            } else if ((scale != 1) && (course.hasClass("complete-course"))){
                courseToggle(index);
            }

        });

        // Appends tooltip to DOM:
        course.append(tooltip);

        // Triggers tooltip fade in:
        tooltip.fadeIn(300);

    // Case where tooltip is already open:
    } else {

        closeAllTooltips(-1);

    }

}

function closeAllTooltips(keepOpen){

    // Runs through the list of open tooltips:
    for (var i in openTooltips){

        // Ignores the course of index "exclusion":
        if (openTooltips[i] != keepOpen.toString()){

            // Finds the open tooltip (and possible copies of it):
            var tooltip = $(".tt"+openTooltips[i]);

            // Triggers tooltip fade out and removes it from DOM:
            tooltip.fadeOut(300, function(){
                this.remove();
            });

            // Removes from open tooltips array:
            openTooltips.splice(i, 1);
        }
    }
}


// Adds a fraction of a completed background to a course if it is not completed:
function scaleBackground(index){
    // Adds completion color to course element:
    if(courses[index].credits == 0)
        var scale = parseInt(courses[index].status) / courses[index].workload;
    else
        var scale = parseInt(courses[index].status) / courses[index].credits;
    if (scale != 1){
        $("#course"+index).css("background-image", "-webkit-linear-gradient(bottom, #b1fca4, #b1fca4 " + scale*100 + "%, transparent " + scale*100 + "%, transparent 100%)");
    }
    // Returns the calculated value:
    return scale;
}


function verifySemester(index){

    // Variable to hold ALL courses belonging to semester "index":
    var belonging = 0;
    // Variable to hold COMPLETED courses belonging to semester "index":
    var completed = 0;
    // Retrieves courses from semester "index":
    for (var i in courses){
        // Checks if course belongs to requested semester:
        if (courses[i].semester == index){
            belonging += 1;
            // Checks if course is completed:
            var status = parseInt(courses[i].status)
            if ((status == courses[i].credits) || (status == courses[i].workload)) {
                completed += 1;
            }
        }
    }

    // Selects the semester button:
    var semester = $("#semester"+index);
    // Checks if all courses belonging to semester "index" are complete:
    if (belonging == completed){
        // Marks semester as complete:
        if (semester.hasClass("incomplete-semester")){
            semester.removeClass("incomplete-semester").addClass("complete-semester");
        }
    } else {
        // Marks semester as incomplete:
        if (semester.hasClass("complete-semester")){
            semester.removeClass("complete-semester").addClass("incomplete-semester");
        }
    }

}


// Adds functionality to buttons in the options menu:
function handleOptionsMenu(){

	// Checks if device has touch or mouse:
	var mouseDown = "touchstart";
	if (document.ontouchstart !== null){
		mouseDown = "mousedown";
	}

	// Lock option icon:
	var lockButton = $("#lock");

	// Colors the lock button according to cookie preset:
	if (editLock == "true"){
		lockButton.addClass("complete-course");
	} else {
		lockButton.addClass("incomplete-course");
	}

	// When clicking lock option:
	lockButton.on(mouseDown, function(){
		// If option is already marked:
		if (lockButton.hasClass("incomplete-course")){
			// Mark option:
	        lockButton.removeClass("incomplete-course").addClass("complete-course");
			editLock = "true";
		} else {
			// Unmarks option:
			lockButton.removeClass("complete-course").addClass("incomplete-course");
			editLock = "false";
		}
		// Saves the cookie:
		setCookie("editLock", editLock);
		console.log(getCookie("editLock"));
	});
}


// Handles mobile orientation warnings:
function handleMobileOrientation(){

	var isMobile = false;

	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		isMobile = true;
	}

	// Checks if orientation is portrait:
	if ((window.innerHeight > window.innerWidth) && (isMobile)) {
		// Displays a warning message:
		$("#portrait-warning").show();
	}

	// Allows orientation warning to be displayed when window is resized:
	$(window).resize(function() {
		if ((window.innerHeight > window.innerWidth) && (isMobile)){
			$("#portrait-warning").show();
		} else {
			$("#portrait-warning").hide();
		}
	});
}


// COOKIE FUNCTIONS 


// Checks if cookies already exist:
function checkCookies() {
    var check = getCookie("newcomer8");
    // If cookie doesn't exist:
    if (check == "") {
        // Sets the first visit as false:
        setCookie("newcomer8", "false");
		// Sets the edit-lock as false:
        setCookie("editLock", "false");
        // Creates a cookie for each course:
        for (var i in courses){
            setCookie(i, "0");
            courses[i].status = "0";
        }
    } else {
        // Retrieves each cookie:
        for (var i in courses){
            courses[i].status = getCookie(i);
        }
		editLock = getCookie("editLock");
		console.log(editLock);
    }
}

// Retrieves cookie cname:
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Saves a cookie cname with value cvalue:
function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (20 * 365 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
