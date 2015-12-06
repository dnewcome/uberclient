/**
*
* Include mechanism for js files
*	TODO: Avoid multiple inclusions, work out more sophisticated path 
*	resolution mechinism. Should we have an artificial base path?
*/
function include( in_filename )
{
	var bDefined = defined( in_filename );
	
	if( !bDefined )
	{
		var objDocumentHead = document.getElementsByTagName('head')[0];
		var objScriptElement = document.createElement('script');
	
		objScriptElement.src = in_filename;
		objScriptElement.type="text/javascript";
		objScriptElement.language="JavaScript";
	
		objDocumentHead.appendChild( objScriptElement );
	}
}

/**
*
* define identifiers in a c-like way. used by include to see if a 
*	file is already included, but should be useful in other scenarios.
*/
function define( in_identifier, in_value )
{
	if( !definitions )
	{
		definitions = new Object();
	}
	
	definitions[ in_identifier ] = in_value;
}

function defined( in_identifier )
{
	bReturnValue = false;
	
	if( !( typeof( definitions ) == 'undefined' ) && definitions[ in_identifier ] )
	{
		bReturnValue = true;
	}
	
	return bReturnValue;
}


function loadScripts()
{
	include( "script/Event.js" );

	    
	// include( "tools/breakpoint.js" );
	   
	    
	// include( "lib/niftycube.js" );

	// include( "models/Notes.js" );
	include( "models/Notes2.js" );
	include( "displays/CategoryDisplay.js" );
	include( "displays/ViewNodeCategoryDisplay.js" );
	include( "models/Note.js" );
	 
	include( "script/Config.js" );
	 
	include( "script/NotesDataAccess.js" );
	include( "Behaviors/Behaviors.js" );
	include( "script/ModalDialog.js" );
	include( "models/NoteModel.js" );
	include( "displays/ViewBase.js" );
	include( "displays/EditButtons.js" );
	include( "displays/NoteDisplay.js" );
	include( "displays/ViewNodeDisplay.js" );
	include( "displays/ViewNode.js" );
	include( "models/Category.js" );
	include( "models/ViewNode.js" );
	 
	include( "displays/MainControl.js" );
	include( "script/GlobalEventHandler.js" );
	include( "script/NoteText.js" );
	include( "script/Dialogs.js" );
	include( "script/menu.js" );
	include( "script/drag.js" );
	include( "displays/InlineEdit.js" );
	include( "script/splitter.js" );
	include( "displays/viewNode.js" );

	include( "script/HashArray.js" );
	include( "displays/Tags.js" );
	include( "script/context.js" );
	include( "script/app.js" );
	//"script/categories.js" );
	include( "script/viewsControl.js" );
	include( "script/view.js" );
	include( "script/viewsCollection.js" );
	include( "script/notesControl.js" );
	include( "script/util.js" );
	include( "script/Hash2D.js" );
	include( "script/TemplateManager.js" );
	include( "script/Message.js" );
	include( "script/DomElement.js" );
	include( "script/DomEvents.js" );
	include( "script/noteBar.js" );
	 
	include( "lib/prototype-1.4.0.js" );
	include( "lib/BrowserInfo.js" );
	 
	// include( "profiler/profiler.js" );
	 
	 
	include( "models/NoteCategory.js" );
	 
	include( "displays/Display.js" );
	include( "displays/DisplayArray.js" );
	include( "displays/DynamicDisplayArray.js" );
	include( "displays/Notes.js" );
}