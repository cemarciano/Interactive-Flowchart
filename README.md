# Interactive Flowchart

Use it live at: https://gremio-eci.github.io/grade

Interactive flowchart to keep track of your progress throughout the courses you take in university.

The example portrayed here is related to the Federal University of Rio de Janeiro's Petroleum Engineering undergrad.

## Usage

Access the downloaded branch and run an HTTP server. One example using Python 2 would be:

```python -m SimpleHTTPServer 8000```

Now simply access the flowchart.html file through localhost:8000/flowchart.html

The project is very compatible with mobile devices, just go to X.X.X.X:8000 (address of your server) to try it out.

## Customization

The js/database.js file contains a list of courses you need to take to graduate. Simply altering that list will allow you to fully customize the flowchart without losing any functionality.

| Attribute | Meaning |
| --- | --- |
| name | Course name |
| credits | How many credits a course yields |
| semester | The semester to which the course belongs |
| requirements* | Array containing IDs of courses that lock a course's completion |
| step* | If set, a tooltip and a slider will show up with this step value |

*optional
