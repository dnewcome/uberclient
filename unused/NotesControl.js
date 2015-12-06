/**
* class NotesControl: describes a UI control for displaying and working with note objects in the application.
* @param {object} parent reference to the owner of this notescontrol object
*/

function NotesControl( parent ) 
{
	var me = this;
	
	this.parent = parent;
	this.type = 'notescontrol';

    this.m_eSortOrder = NoteCategories.eNoteSortOrder.CREATEDT_NEWFIRST;
    
    this.m_strCurrentCategoryID = undefined;
    this.m_strNewCategoryID = undefined;
    	
	/* public methods */
	this.New = newNote;//()
	
	this.searchNotes = searchNotes;//(searchTerm)

    this.redisplayCurrentCategory = redisplayCurrentCategory;
    this.setSortOrder = setSortOrder;

    this.m_strMessagingID = Messages.generateID();
    
	Messages.RegisterListener( 'categorychange', Messages.all_publishers_id, this.m_strMessagingID, OnCategoryChange, this );
	Messages.RegisterListener( 'createnote', Messages.all_publishers_id, this.m_strMessagingID, newNote, this );
	
	Messages.RegisterListener( 'requestsetnotesortorder', Messages.all_publishers_id, this.m_strMessagingID, setSortOrder, this );

	Messages.RegisterListener( 'noteupdate', Messages.all_publishers_id, this.m_strMessagingID, this.redisplayCurrentCategory, this );
	Messages.RegisterListener( 'notetrash', Messages.all_publishers_id, this.m_strMessagingID, this.redisplayCurrentCategory, this );
	Messages.RegisterListener( 'notedelete', Messages.all_publishers_id, this.m_strMessagingID, this.redisplayCurrentCategory, this );
	Messages.RegisterListener( 'noteuntrash', Messages.all_publishers_id, this.m_strMessagingID, this.redisplayCurrentCategory, this );
    
    Messages.RegisterListener( 'notesdisplaysystemcategory', Messages.all_publishers_id, this.m_strMessagingID, requestSetSystemCategory, this );

    function getConfig( in_strCategoryID, in_nStartRow, in_nNumRows )
    {
        var objConfig = {};
        if( objConfig )
        {
            objConfig.action = 'NotesGetMaster';
            objConfig.startRow = in_nStartRow;
            objConfig.maxRows = in_nNumRows;
            objConfig.categoryid = in_strCategoryID;
            
            me.m_strCategoryID = in_strCategoryID;
            me.m_nStartRow = in_nStartRow;
            me.m_nNumRows = in_nNumRows;
        } // end if
        
        return objConfig;
    }            
	
    function redisplayCurrentCategory()
    {
        //  WHAT?  Yes, do this so that any other messages on these
        //  can be processed first.
        Timeout.setTimeout( setSystemCategory, 0, me, [ me.m_strCurrentCategoryID ] );
    }

	function OnCategoryChange ( in_strCategoryID )
	{
	    // Let any active notes know they are losing their forcus
	    Messages.Raise( 'onnewnotefocus', me.m_strMessagingID );
	    
	    // Sometimes the category changes and it is taken care of somewhere else.
	    if( in_strCategoryID )
	    {
	        setSystemCategory( in_strCategoryID );
	    } // end if
	}

    function setSystemCategory( in_strCategoryID )
    {
        Util.Assert( TypeCheck.String( in_strCategoryID ) );
        
	    me.m_strCurrentCategoryID = in_strCategoryID;
	    /*
	    if( in_strCategoryID == SystemCategories.Categories.all )
	    {
	        Messages.Raise( 'categorysetall', me.m_strMessagingID );
	    } // end if
	    */
        var strMessage = findTabMessage( in_strCategoryID );
        Messages.Raise( 'notespagingsetcatagory', me.m_strMessagingID, [ in_strCategoryID, 0, strMessage ] );
    }

    function findTabMessage( in_strCategoryID )
    {
        var strMessage;
        if(  in_strCategoryID == SystemCategories.Categories.search ) 
        {   // return the saved search term message
            strMessage = me.m_strMessage;
        } // end if
        else
        {   // find the current category.
            var objCategory = app.usercategories.getByID( in_strCategoryID );
            if( objCategory )
            {
                strMessage = NotesControl._localStrings.CURRENT_CATEGORY + '<b>' + objCategory.getName() + '</b>';
            } // end if        
        }
        return strMessage;
    }

    function requestSetSystemCategory( in_strCategoryID, in_nStartRow, in_nNumRows )
    {
        var objConfig = getConfig( in_strCategoryID, in_nStartRow, in_nNumRows );
        
        if( objConfig )
        {
            processSystemCategory( objConfig );
        } // end if
    }

    function processSystemCategory( in_objConfig )
    {
        me.m_strNewCategoryID	= in_objConfig.categoryid;
        if( in_objConfig.action )
        {
            var objOutputConfig = new Notes._objOutputConfig();
            var objDBConfig = getDBConfig( in_objConfig );
            var bRetVal = !!Util.callDBActionAsync( in_objConfig.action, objDBConfig, 
                    objOutputConfig, getNotesHandler, me );
        } // end if
        else
        {
            setSystemCategory( in_objConfig.categoryid );
        } // end if-else
    }

    function getDBConfig( in_objConfig )
    {
        var objRetVal = { 
            filter: Category.eCategoryFilter[ in_objConfig.categoryid ],
            itemID: '',
            startRow: in_objConfig.startRow, 
            maxRows: in_objConfig.maxRows, 
            sort: me.m_eSortOrder,
            onlyNoteIDs: 1
        };
        if( in_objConfig.action == SystemCategories.Categories.search )
        {
            objRetVal.search = me.m_strSearchTerm;
        } // end if
        return objRetVal;
    }    
    
	/**
	*	Searches for all notes containing a string
	*/
	function searchNotes( in_nStartRow, in_nNumRows, in_strSearchTerm )
	{
	    Util.Assert( TypeCheck.String( in_strSearchTerm ) || TypeCheck.Undefined( in_strSearchTerm ) );
	    
	    if( in_strSearchTerm )
	    {   
            this.m_strMessage = NotesControl._localStrings.SEARCH_TERM + '<b>' + in_strSearchTerm + '</b>';
            me.m_strSearchTerm = in_strSearchTerm;
            
            requestSetSystemCategory( SystemCategories.Categories.search, in_nStartRow, in_nNumRows );
		} // end if
	}	

	/**
	*	calling this creates a new note on the server and calls
	*	the gui function to add to DOM
	*/
	function newNote()
	{	
        Messages.RegisterListener( 'noteadd', Note.new_note_id, 
            me.m_strMessagingID, noteAddComplete, me );	
        
        Messages.Raise( 'requestnotenew', me.m_strMessagingID );
	}
	
	function noteAddComplete( in_objNote )
	{
        Messages.UnRegisterListener( 'noteadd', Note.new_note_id, 
            this.m_strMessagingID, noteAddComplete );
            
        var bTagOnAdd = true;//app.userpreferences.m_eNewNoteCategoryAction
	    var bGoToMainOnAdd = false;//app.userpreferences.m_eNewNoteCategoryAction
        // If we are in a system category that is not the all notes category.
        if( ( true == bGoToMainOnAdd )
           || ( true == Category.isSystemCategory( this.m_strCurrentCategoryID ) ) )
        {   // Go to the main category and highlight the new note.
            setTimeout( function() {
                // do this in a setTimeout to give any other handlers for this to take care of it.
                me.m_strCurrentCategoryID = SystemCategories.Categories.all;
                noteReadyForDisplay( in_objNote.m_strID );
            }, 0 );
        } // end if
        else if( ( true == bTagOnAdd ) 
         && ( true == TypeCheck.Defined( this.m_strCurrentCategoryID ) )
         && ( false == Category.isSystemCategory( this.m_strCurrentCategoryID ) ) )
        {   // Register to wait for the note tag that we are adding, once we add, change categories.
            // add any tags, and then focus the note.
            Messages.RegisterListener( 'notetag', in_objNote.m_strID, this.m_strMessagingID, noteReadyForDisplay, this );
            Messages.RaiseForAddress( 'requestnotetag', this.m_strMessagingID, in_objNote.m_strID, [ this.m_strCurrentCategoryID ] );
        } // end if
    }	

	function noteReadyForDisplay( in_strNoteID )
	{
        Messages.UnRegisterListener( 'notetag', in_strNoteID, me.m_strMessagingID, noteReadyForDisplay );
	    if( true == TypeCheck.Defined( me.m_strCurrentCategoryID ) )
	    {
	        setSystemCategory( me.m_strCurrentCategoryID );
    		setTimeout( function() {    // Give us time to set the category up first.
	            Messages.RaiseForAddress( 'notefocus', me.m_strMessagingID, in_strNoteID );
	        }, 200 );
        } // end if
	}
		
    function setSortOrder( in_eSortOrder )
    {
        if( me.m_eSortOrder != in_eSortOrder )
        {
            me.m_eSortOrder = in_eSortOrder;

            requestSetSystemCategory( me.m_strCategoryID, me.m_nStartRow, me.m_nNumRows );
        } // end if
    }
    
	/**
	* Callback function for GetAsync
	*/	
	function getNotesHandler( in_objDecodedItems )
	{	
	    // XXX While not "GOOD" to call these notecategories functions directly,
	    //  I am doing it to speed up the startup as much as possible.  As unfortunate
	    //  as it is, it just "feels" faster on startup to call the functions directly
	    //  instead of going through the message passer.
	    
        //Messages.Raise( 'requestnotecategoriesloadpre', me.m_strMessagingID );
        app.notecategories.loadDecodedItemsPre();
        // build our notes array and display those.    	
        // We reset the category (because this is only used for system categories) on every
        //  request.  That way we are always up to date.
        //Messages.Raise( 'categorydelete', me.m_strMessagingID, [ me.m_strNewCategoryID ] );
        app.notecategories.removeCategory( me.m_strNewCategoryID );
        var bTrashFlag = ( me.m_strNewCategoryID == SystemCategories.Categories.trashed );
        for( var nIndex = 0; objItem = in_objDecodedItems.notes[ nIndex ]; ++nIndex )
        {
            if( objItem.Note_ID )
            {
                objItem.Note_ID = Util.convertSQLServerUniqueID( objItem.Note_ID );
                objItem.Update_Dt = Util.convertSQLServerTimestamp( objItem.Update_Dt ) || '';
                app.notecategories.noteSetup( objItem.Note_ID, bTrashFlag );
/*                Messages.Raise( 'requestnotecategoriesnotesetup', me.m_strMessagingID,
                    [ objItem.Note_ID, bTrashFlag ] );
*/
                app.notecategories.addNoteCategory( objItem.Note_ID, me.m_strNewCategoryID, bTrashFlag );
			    // Request the model to check, we may have updated.
/*			    Messages.Raise( 'notetag', me.m_strMessagingID, 
			        [ objItem.Note_ID, me.m_strNewCategoryID, bTrashFlag ] );
			        */
			} // end if
        } // end for

        Messages.Raise( 'requestnotecategoriesload', me.m_strMessagingID, [ in_objDecodedItems ] );
		setTimeout( function() { setSystemCategory( me.m_strNewCategoryID ); }, 0 );
    		
        if( me.m_strSendMessage )
		{   // Delay this by one second to make sure the browsers are ready to display.
		    // Had it at 500, but mozilla was crapping out.
    		setTimeout( function() {
    		    Messages.Raise( me.m_strSendMessage, me.m_strMessagingID, me.m_avArguments );
                me.m_strSendMessage = undefined;
                me.m_avArguments = undefined;
	    	}, 1000 );
	    } // end if
	}
}

NotesControl._localStrings = {
    SEARCH_TERM: 'Results for search term: ',
    CURRENT_CATEGORY: 'Viewing: '
};   
