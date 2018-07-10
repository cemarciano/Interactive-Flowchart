
var openTooltips = [];          	// (internal) Array of IDs of currently active tooltips
var timer = null;               	// (internal) Timer to keep track of "click and hold" or just "simple click"
var editLock = "false";				// (internal) Variable to hold if course selection is locked due to options menu
var colorId = 0;					// (internal) Represents the index of the color being used to toggle courses as completed, as taken from the window.colors list
var creditsOrCode = "credits"		// (internal) Holds whether credits or code are being displayed for courses at a given time
var pressAndHoldTime = 500;    		// Period of time for the program to consider a touch/click as a "click and hold"

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
                "class": "box course-box transition unselectable",
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
			// Mouse hover in and hover out function:
			rectangle.hover(
				// handlerIn function, for when the mouse enters the object.
				function(){
					// Only runs if not in a touch device:
					if (document.ontouchstart !== null){
						// Checks if course is complete:
						if (isComplete(i)){
							// Retrieves course color:
							var courseColor = window.colors[courses[i].color];
							// Make hover color a darker variation of original color:
							var hoverColor = LightenDarkenColor(window.colors[courses[i].color], -15);
							$(this).css("background-color", hoverColor);
						// Case where course is complete with a given color:
						} else {
							// Make background red:
							$(this).css("background-color", "#ffeded");
							$(this).css("border-color", "#870404");
						}
					}
				},
				// handlerOut function, for when the mouse leaves the object.
				function(){
					// Only runs if not in a touch device:
					if (document.ontouchstart !== null){
						// Checks if course is complete:
						if (isComplete(i)){
							// Restores original color:
							$(this).css("background-color", window.colors[courses[i].color]);
						// Case where course is complete with a given color:
						} else {
							// Make background white:
							$(this).css("background-color", "white");
							$(this).css("border-color", "black");
						}
					}
				}
			);
            // For mouse environments, clears "click and hold" timer when dragging away from course box:
            rectangle.mouseleave( function(e){
                // Prevents "click and hold" from happening:
                clearTimeout(timer);
                // Signals there was no "click and hold":
                timer = null;
            });
        }(i));


        // Updates button according to course color (-1 is incomplete).
		// Checks if course has been completed:
        if (isComplete(i)){
            rectangle.css("background-color", window.colors[courses[i].color]);
        } else {
			rectangle.css("background-color", "white");
		}

        // Creates a span element to hold the name of the course:
        var name = $("<span/>",
            {
                "class": "course-name",
                "id": "course-name"+i
            });
        name.html(courses[i].name);

        // Creates a span element to hold the number of credits:
        var credits = $("<span/>",
            {
                "class": "course-credits",
                "id": "course-credits"+i
            });

        // Inserts course info into the corresponding semester DOM:
        var parent = $("#column" + courses[i].semester);
        rectangle.append(name);
        rectangle.append(credits);
        parent.append(rectangle);

		// Fills in course credits:
		setCreditsText(i);

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


// Sets the credit text for course i. Will make it fade if *fade* is true:
function setCreditsText(i, fade){

	// Retrieves text object:
	var credits = $("#course-credits"+i);

	// Checks what kind of credits the metric means:
	var text = "";
	if (courses[i].credits == 1){
		text = " crédito)";
	} else if (courses[i].credits < 30){
		text = " créditos)";
	} else {
		text = " horas)";
	}
	// Finishes formatting text:
	text = "(" + courses[i].credits + text;

	// Checks if fading has been set:
	if ((fade == true) && (credits.html() !== text)){
		credits.clearQueue().fadeTo(0, 0);
		credits.html(text);
		credits.fadeTo(400, 1);
	} else {
		credits.html(text);
	}
}


// Sets the code text for course i. Will make it fade if *fade* is true:
function setCodeText(i, fade){

	// Retrieves text object:
	var code = $("#course-credits"+i);

	// Formats code text:
	var text = "(" + courses[i].code + ")";

	// Checks if code is available for course i:
	if (courses[i].code !== undefined){
		// Checks if fading is enabled and if text isn't already the same:
		if ((fade == true) && (code.html() !== text)){
			code.clearQueue().fadeTo(0, 0);
			code.html(text);
			code.fadeTo(400, 1);
		} else {
			code.html(text);
		}
	} else {
		// Displays the number of credits if code is unavailable:
		setCreditsText(i);
	}
}


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


function isComplete(index){
	return ((courses[index].color != -1) && (courses[index].step == undefined)) || (courses[index].partial == courses[index].credits);
}

// Function to toggle complete/incomplete when clicking on a course:
function courseToggle(index){
    // Finds the corresponding course button:
    var course = $("#course"+index);
    var status = "";

    // Toggles the button completion.
	// Case where course is already complete:
    if (courses[index].color == colorId){
		// Make course incomplete:
		course.css("background-color", "white");
        status = -1;
	// Case where course is incomplete:
    } else {
		// Completes course:
		course.css("background-color", window.colors[colorId]);
		course.css("border-color", "black");
        status = colorId;
    }

    // Saves the cookie:
    setCookie(index+"color", status);
    courses[index].color = status;

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
                "class": "tt" + index + " tooltip top"
            });

        // Creates the slider div:
        var slider = $("<div/>",
            {
                "class": "slider"
            });
        tooltip.append(slider);

        // Initializes the slider (slider[0] is just jquery obj to vanilla JS obj):
        noUiSlider.create(slider[0], {
            // Initital value:
    		start: courses[index].partial,
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
            step: courses[index].step,
            // Min and max values:
    		range: {
    			'min': 0,
    			'max': courses[index].credits
    		}
    	});

        // Listens for a change of value on the slider:
        slider[0].noUiSlider.on("update", function(){

			// Contamines course with current color:
			setCookie(index+"color", colorId);
			courses[index].color = colorId;

            // Reads the changed value:
            var status = slider[0].noUiSlider.get().toString();
            // Prevents initialization issues:
            if (status == "NaN") status = "0";
            // Saves the cookie:
            setCookie(index+"partial", status);
            courses[index].partial = status;

            // Adds completion color to course element:
            var scale = scaleBackground(index);

            // Checks if course status was changed:
            if (scale == 1) {
				// Makes course look as completed:
                course.css("background-image", "");
				course.css("background-color", window.colors[courses[index].color]);
				course.css("border-color", "black");
				// Checks if semester status changed:
				verifySemester(courses[index].semester);
            } else if (scale != 1){
				// Makes course behave as incomplete:
				course.css("background-color", "white");
				// Checks if semester status changed:
				verifySemester(courses[index].semester);
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

        // Ignores the course of index "keepOpen":
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
    var scale = courses[index].partial / courses[index].credits;
    if (scale != 1){
		var colorToScale = window.colors[courses[index].color];
        $("#course"+index).css("background-image", "-webkit-linear-gradient(bottom, " + colorToScale + ", " + colorToScale + " " + scale*100 + "%, transparent " + scale*100 + "%, transparent 100%)");
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
            if (isComplete(i)){
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


	////////////////////////
	/// LOCK OPTION ICON ///
	////////////////////////


	// Retrieves option icon:
	var lockButton = $("#lock");

	// Colors the lock button according to cookie preset:
	if (editLock == "true"){
		lockButton.css("background-color", window.colors[0]);
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
	});


	//////////////////////////
	/// BUCKET OPTION ICON ///
	//////////////////////////


	// Bucket option icon:
	var bucketButton = $("#bucket");

	// Colors the bucket button according to cookie preset:
	bucketButton.css("background-color", window.colors[colorId]);

	// When clicking bucket option:
	bucketButton.on(mouseDown, function(){
		// Jumps to the next color in the colors list:
		colorId++;
		// If current id is beyond the last element of the colors list:
		if (colorId == window.colors.length){
			// Brings the color id back to the first element:
			colorId = 0;
		}

		// Colors the bucket button:
		bucketButton.css("background-color", window.colors[colorId]);

		// Saves the cookie:
		setCookie("colorId", colorId.toString());
	});


	//////////////////////////
	/// SWITCH OPTION ICON ///
	//////////////////////////

	// Switch option icon:
	var switchButton = $("#switch");

	// When clicking switch option:
	switchButton.on(mouseDown, function(){
		// Switches state:
		if (creditsOrCode === "credits"){
			// Runs through every course:
			for (var i in courses){
				setCodeText(i, true);
			}
			// Saves state:
			creditsOrCode = "code";
		} else {
			// Runs through every course:
			for (var i in courses){
				setCreditsText(i, true);
			}
			// Saves state:
			creditsOrCode = "credits";
		}
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

//////////////////////////////////
/// HANDLE HEX COLOR DARKENING ///
//////////////////////////////////

// Changes col to be either darker (ex.:amt=-20) or lighter (ex.:amt=20):
function LightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

}


////////////////////////
/// COOKIE FUNCTIONS ///
////////////////////////


// Checks if cookies already exist:
function checkCookies() {
    var check = getCookie("newcomer12");
    // If cookie doesn't exist:
    if (check == "") {
        // Sets the first visit as false:
        setCookie("newcomer12", "false");
		// Sets the edit-lock as false:
        setCookie("editLock", "false");
		// Sets the current editing color:
        setCookie("colorId", "0");
        // Creates a cookie for each course:
        for (var i in courses){
            setCookie(i+"color", "-1");
            courses[i].color = -1;
			// Checks if course is a multi-credit block:
			if (courses[i].step !== undefined){
				setCookie(i+"partial", "0");
				courses[i].partial = 0;
			}
        }
    } else {
        // Retrieves each cookie:
        for (var i in courses){
            courses[i].color = Number(getCookie(i+"color"));
			// Checks if course is a multi-credit block:
			if (courses[i].step !== undefined){
				// Retrieves how much of the block has been completed:
				courses[i].partial = Number(getCookie(i+"partial"));
			}
        }
		// Retrieves options menu cookies:
		editLock = getCookie("editLock");
		colorId = Number(getCookie("colorId"));
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
