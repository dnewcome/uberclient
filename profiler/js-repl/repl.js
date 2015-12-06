
/**
* Simple javascript debug console intended for use in tweaking Ubernote at runtime.
*	Supports loading other javascript files dynamically, and invoking methods
*	on the parent window, and inspecting properties without breaking into a debugger
*
* TODO: support watch expressions, maybe some other things like defining trace sinks
*	dynamically.  Command history would be nice.  Encapsulate the code better.  
*	This isn't much of an issue yet since we have our own execution context here, 
*	but would make for cleaner code.
*
* TODO: Event usage here not compatible with Firefox.  Will need to modify usage of 
*	event object.
*/


var m_commandline = undefined;
var m_console = undefined;


/**
* we are dependent on two DOM elements to serve as 
*	command line, find them in initialization.
*/
function init()
{
	m_commandline = document.getElementById( "commandline" );
	m_console = document.getElementById( "console" );
}

/**
* The main handler function that evaluates our commandline. This is called on
*	every keypress, but we only eval when enter is pressed
*
* TODO: Too much happening here, refactor
*/
function handler( in_cmdline )
{
	if( event.keyCode == 13 )
	{
		// look for directives first, denoted by exclamation point.  
		// It must be in the first position of the line to be considered
		if( in_cmdline.value.indexOf("!") == 0 )
		{
			processDirectives( in_cmdline.value );
		}
		
		// eval() the line as javascript if not a console directive
		else
		{
			var newLine = document.createElement( "div" );
			newLine.className = "line";
			newLine.innerHTML = "> " + in_cmdline.value;
			
			try
			{
				var evalResult = eval( in_cmdline.value );
			}
			catch( e )
			{
				var evalResult = e.name + ": " + e.message;
			}
			
			var evalResultLine = document.createElement( "div" );				
			evalResultLine.className = "line";
			evalResultLine.innerHTML = evalResult;

			m_console.appendChild( newLine );
			m_console.appendChild( evalResultLine );
			evalResultLine.scrollIntoView();
		}		
		
		// clear the command prompt
		m_commandline.value = "";

	}
}

/**
* Look for command directives beginning with an exclamation point
*	These are commands that are intended for our interpreter, not
*	javascript expressions.
*/
function processDirectives( in_cmdline )
{
	var strCommandToken = undefined;
	
	// regexp object to match whatever command we have
	var regCommand = /!(.*?)\s(.*)/;
	var arrMatches = regCommand.exec( in_cmdline );
	
	// we get null back if there is no match, and we need to make sure that 
	// we have the right number of arguments
	if( arrMatches && arrMatches.length == 3 && arrMatches[1] == "load" )
	{
		// load a javascript file here
		loadScript( arrMatches[2] );
	}
}

/**
* Load a javascript file into the current execution context
*	The same thing was implemented in Include.js, should use that stuff
*	eventually.
*
* TODO: support loading into parent window
*/
function loadScript( in_url )
{
	var objDocumentHead = document.getElementsByTagName('head')[0];
	var objScript = document.createElement( "script" );
	
	objScript.src = in_url;
	objScript.type = "text/javascript";
	objScript.language = "JavaScript";
	
	objDocumentHead.appendChild( objScript );
}