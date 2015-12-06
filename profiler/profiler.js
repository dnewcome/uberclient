/**
* Profiler.js does not describe a class. This is a place to put performance profiling
* code.  Functions and variables here are global.
*/

/**
* Block of code to wire up functions in app to be profiled using funmon2.js

function profinit()
{
	FunctionMonitor.register("_resize", window, "app");
	
	for (var member in app.notescontrol)
	{
		 if ( typeof(app.notescontrol[member]) == 'function' )
		 FunctionMonitor.register("app.notescontrol." + member);
	} 
}
*/

/**
* Public var!! persists reference to the profiler window 
* TODO: wrap this stuff up into a proper class
*/
var profilerWindow;

/**
* Public var!! holds the last timestamp for comparison delta
* TODO: wrap this stuff up into a proper class
*/
var lastTime = new Date();

/**
* Global function!! opens a new browser window for profiling log
* TODO: wrap this stuff up into a proper class
*/
function openProfilerWindow()
{	profilerWindow = window.open(); 
}

/**
* Global function!! writes a timestamped log entry to the profiler window
* @param {string} eventText - this is printed to the log along with timestamp
* TODO: wrap this stuff up into a proper class
*/
function logProfilerEvent( eventText )
{	var dt = new Date();
	profilerWindow.document.write( 
		dt.getHours() + ':' + 
		dt.getMinutes() + ':' +
		dt.getSeconds() + '.' +
		dt.getMilliseconds() + '  ' + 
		eventText + '<br>' );
}

/**
* Global function!! writes a log entry to the profiler window
* showing the amount of time elapsed since the last event
* TODO: wrap this stuff up into a proper class
*/
function logProfilerDiff( eventText )
{	var dt = new Date();
	var diff = dt.getTime() - lastTime.getTime();
	lastTime = dt;
	profilerWindow.document.write( eventText + ', ' + diff + ', ' );
}

/**
* Global function!! profiling version of the addNote function
* TODO: wrap this stuff up into a proper class
*/
function addNoteProfile( id, bodyText )
{
	/* create the new elements and form the note */
	logProfilerDiff('step01');
	var newNote = document.createElement( 'div' );
	logProfilerDiff('step02');
	var noteText = document.createElement( 'iframe' );
	logProfilerDiff('step03');
	var noteLabel = document.createElement( 'div');
	logProfilerDiff('step04');
	newNote.appendChild( noteLabel );
	logProfilerDiff('step05');
	newNote.appendChild( noteText );
	logProfilerDiff('step06');
	/* set up attributes */
	newNote.className = 'note';
	logProfilerDiff('step07');
	noteLabel.className = 'title';
	logProfilerDiff('step08');
	/* hack: this stuff shouldn't be inline */
	noteLabel.innerHTML = id + 
		'<input type="button" value="B" onclick="this.parentNode.nextSibling.contentWindow.document.execCommand( \'Bold\' );"/>' +
		'<input type="button" value="7" onclick="this.parentNode.nextSibling.contentWindow.document.execCommand( \'FontSize\', false, 7 );"/>' +
		'<input type="button" value="img" onclick="this.parentNode.nextSibling.contentWindow.document.execCommand( \'InsertImage\', true );"/>' +
		'<input type="button" value=">>" onclick="this.parentNode.nextSibling.contentWindow.document.execCommand( \'Indent\' );"/>' +
		'<input type="button" value="<<" onclick="this.parentNode.nextSibling.contentWindow.document.execCommand( \'Outdent\', true );"/>';
	logProfilerDiff('step09');
	newNote.id = id;
	logProfilerDiff('step10');
	newNote.onclick = giveFocus;
	logProfilerDiff('step11');
	/* iframes have odd Diffs..no onclick. not sure if i should use onfocus or onactivate..etc */
	noteText.onfocus = giveFocus;
	logProfilerDiff('step12');
 	/* append the new note to the dom */
 	var mainDiv = document.getElementById( 'notepane' );
 	logProfilerDiff('step13');
	mainDiv.appendChild( newNote );
	logProfilerDiff('step14');
	/* note that this has to be done after adding to the dom */
	noteText.contentWindow.document.write(bodyText);
	logProfilerDiff('step15');
	/* note - we need this to keep FF happy.. otherwise the page will 'load' forever */
	noteText.contentWindow.document.close();
	logProfilerDiff('step16');
	//noteText.contentWindow.document.getElementsByTagName('body').innerHTML = bodyText;
	noteText.contentWindow.document.designMode = 'on';
	logProfilerDiff('step17');
	noteText.contentWindow.document.onkeydown = resizeTextarea;
	logProfilerDiff('step18');
	profilerWindow.document.write('<br>');
}

/**
* test cloneNode() performance
*/
function cloneMe()
{
	profilerWindow.document.body.appendChild( document.body.cloneNode() );
}