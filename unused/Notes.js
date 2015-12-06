

/**
* Collection class for note models
*/
function Notes()
{
	// container to hold refs to Note models we create
	this.m_aobjNotes = new Object();
        	    
    // paging variables
	this.m_objPageLoadedFlags = null;
	this.m_currentPage = null;
	
	this.m_pageFunction = null; // ref to method being used to get notes currently	
	this.m_pageFunctionArgs = null; // todo: wrap this up into a container along with pageFunction
	
	this.m_strID = Messages.generateID();
    this.RegisterMessageHandlers();
}

Notes.prototype.mc_intPageSize = 10; // `constant'

/**
* Future interface for paging support.  The model will have sort of `paging state' where
* we are holding a type of note collection, eg. trash.  Calling an explicit	type of get will
* set the state, after which we can get subsequent pages just by calling GetNextPage
*/
Notes.prototype.GetNextPage = function() {};
Notes.prototype.GetPage = function( in_intPageNumber ) {};


/**
* Event Handler for GetByViewNode
*/
Notes.prototype.OnGetByViewNode = function( in_strViewNodeID ) 
{	
	ResetPaging( this.GetByViewNode, arguments );
	this.GetByViewNode( 1, this.mc_intPageSize, in_strViewNodeID );
};

/**
* Get a set of notes matching a particular category
*/
Notes.prototype.GetByViewNode = function( startRow, maxRows, in_strViewNodeID )
{
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetByViewNode', 
		'sessionID='+sessionID+
		'&userViewNodeID='+in_strViewNodeID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler );			
};


/**
* Event Handler for GetByRecentlyUpdated
*/
Notes.prototype.OnGetByRecentlyUpdated = function()
{
	ResetPaging( this.GetByRecentlyUpdated );
	this.GetByRecentlyUpdated( 1, this.mc_intPageSize );
};

/**
* get the most recently updated notes
*/	
Notes.prototype.GetByRecentlyUpdated = function( startRow, maxRows )
{
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetRecentlyUpdated', 
		'sessionID='+sessionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler );			
};

/**
* Event Handler for GetBySearch
*/
Notes.prototype.OnGetBySearch = function( in_strSearchTerm )
{
	ResetPaging( this.GetBySearch, arguments );
	this.GetBySearch( 1, this.mc_intPageSize, in_strSearchTerm );
};

/**
* Searches for all notes containing a string
*/
Notes.prototype.GetBySearch = function( startRow, maxRows, in_strSearchTerm )
{
	var sessionID = Util.getSID();
	Util.callWebServiceAsync('NoteSearch', 
		'sessionID='+sessionID+
		'&search='+in_strSearchTerm+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler 
	);
};	


/**
* Event Handler for GetByUpdateDT
*/
Notes.prototype.OnGetByUpdateDT = function()
{
	ResetPaging( this.GetByUpdateDT );
	this.GetByUpdateDT( 1, this.mc_intPageSize );
};

/**
* Get notes ordered by Updated Date
*/
Notes.prototype.GetByUpdateDT = function( startRow, maxRows )
{
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetAllByUpdateDt', 
		'sessionID='+sessionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler 
	);		
};

/**
* Event Handler for GetTrash
*/
Notes.prototype.OnGetTrash = function()
{
	ResetPaging( this.GetTrash );
	this.GetTrash( 1, this.mc_intPageSize );
};
	
/**
* gets all notes for user marked as trash
*/
Notes.prototype.GetTrash = function( startRow, maxRows )
{
	if( startRow == 1) 
	{
		ResetPaging( this.GetTrash );
	}
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetTrashed', 
		'sessionID='+sessionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows+
		'&sort=0', this.GetAsyncHandler 
	);
};

/**
* Event Handler for emptyTrash
*/
Notes.prototype.OnEmptyTrash = function()
{
	this.EmptyTrash();
};

/**
* EmptyTrash - Empties the trash.  
*   Raises an 'emptytrash' message if successful
*/
Notes.prototype.EmptyTrash = function()
{
    var bRetVal = false;
	var objResp = Util.callWebServiceSafe( 'NotesEmptyTrash' );
	
	if( objResp )
	{
	    bRetVal = true;
	} // end if
	
	return bRetVal;
};

/**
* Event Handler for GetAll
*/
Notes.prototype.OnGetAll = function()
{
	ResetPaging( this.GetAll );
	this.GetAll( 1, this.mc_intPageSize );
};

/**
* Makes database requeset for all notes asynchronously
* @param {string} userID formatted as a string
*/
Notes.prototype.GetAll = function( startRow, maxRows ) 
{	
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetAll',
		'sessionID='+sessionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler );		
};


/**
* Event Handler for GetRevisions
*/
Notes.prototype.OnGetRevisions = function( in_strNoteRevisionID )
{
	ResetPaging( this.GetRevisions, arguments );
	this.GetRevisions( 1, this.mc_intPageSize, in_strNoteRevisionID );
};

/**
* Get past revisions of a note
*/
Notes.prototype.GetRevisions = function( startRow, maxRows, in_strNoteRevisionID )
{
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesRevisionsGet', 
		'sessionID='+sessionID+
		'&noteID='+in_strNoteRevisionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler );		
};

/**
* Event Handler for GetStarred
*/
Notes.prototype.OnGetStarred = function()
{
	ResetPaging( this.GetStarred );
	this.GetStarred( 1, this.mc_intPageSize );
};
	
/**
* gets all notes for user marked as starred
*/
Notes.prototype.GetStarred = function( startRow, maxRows )
{
	if( startRow == 1) 
	{
		ResetPaging( this.GetStarred );
	}
	sessionID = Util.getSID();
	Util.callWebServiceAsync( 'NotesGetStarred', 
		'sessionID='+sessionID+
		'&startRow='+startRow+
		'&maxRows='+maxRows, this.GetAsyncHandler 
	);
};

/**
* Callback function for `Get' methods
*/	
Notes.prototype.GetAsyncHandler = function( resp )
{	
	if( resp.readyState == 4 ) // this callback gets called for every state, not much we can do other than check
	{	
		//var notesCount = resp.responseXML.getElementsByTagName('count')[0]
		var notesCount = Util.getFirstElementByTagNameValue( resp.responseXML, 'count', null );
		var notesArray = resp.responseXML.getElementsByTagName('notes');
		
		if( me.pages == null ) /* see if this is the first page */
		{
		    var nNumPages = Math.ceil( notesCount / this.mc_intPageSize  );
		    if( ! nNumPages )
		    {   // default to at least one page
		        nNumPages = 1;
		    } // end if
			
			this.m_objPageLoadedFlags = new Array( nNumPages );
			this.m_objPageLoadedFlags[0] = true; // indicate page is loaded
			
			
			me.Merge( notesArray );
			
		}
		else /* not the first page */
		{
			
		}
	}
};

/**
* Method to create model instances given an array of Note xml node references
* @in_aobjNotes {array} array of note references
*/
Notes.prototype.CreateModels = function( in_aobjNoteRefs )
{
	for( var i = 0; i < in_aobjNoteRefs.length; i++ )
	{
		// create the model, add it to m_aobjNotes
	}
};

/**
* call if we are starting a new paging operation
* @in_pageFunction {function} This is the callback to get another page
*/
function ResetPaging( in_pageFunction, in_arguments )
{
	// reset paging vars
	this.currentPage = 1; // first page is 1, not 0
	this.m_objPageLoadedFlags = null;
	
	// store current paging method info
	this.m_pageFunction = in_pageFunction;
	this.m_pageFunctionArgs = in_arguments;
}

/**
* Register our message handlers 
*/
Notes.prototype.RegisterMessageHandlers = function() 
{
    Messages.RegisterListener( 'requestnotesgetbyviewnode', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetByViewNode, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetbyrecentlyupdated', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetByRecentlyUpdated, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetbysearch', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetBySearch, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetbyupdatedt', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetByUpdateDT, 
		this
	);
	Messages.RegisterListener( 'requestnotesgettrash', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetTrash, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetall', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetAll, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetrevisions', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetRevisions, 
		this 
	);
	Messages.RegisterListener( 'requestnotesgetstarred', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnGetStarred, 
		this 
	);
	Messages.RegisterListener( 'requestemptytrash', 
		Messages.all_publishers_id, 
		this.m_strID, 
		this.OnEmptyTrash, 
		this 
	);
	
};

/**
* Do we need this?
*/
Notes.prototype.UnRegisterMessageHandlers = function() 
{
};

