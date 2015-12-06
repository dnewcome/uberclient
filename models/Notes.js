

/**
* Constructor - does NOT initialize
*/
function Notes()
{
    this.m_bActivityUpdate = false;
    this.m_bLoadCounts = false;
    this.m_bLoadingNote = false;
    
    Notes.Base.constructor.apply( this );
}
UberObject.Base( Notes, ModelCollection );

/**
* Email from Josh
* Integer values passed for sort ordering:
* 
* Create_OldFirst = 0,
* Create_NewFirst = 1,
* Modified_OldFirst = 2,
* Modified_NewFirst = 3,
* Title_AtoZ = 4,
* Title_ZtoA = 5
**/
Notes.eNoteSortOrder = new Enum(
    'CREATEDT_NEWFIRST',
    'CREATEDT_OLDFIRST',
    'UPDATEDT_NEWFIRST',
    'UPDATEDT_OLDFIRST',
    'TITLE_ATOZ',
    'TITLE_ZTOA'
);

Notes.eDBNoteSortOrder = {
    CREATEDT_OLDFIRST: 0,
    CREATEDT_NEWFIRST: 1,
    UPDATEDT_OLDFIRST: 2,
    UPDATEDT_NEWFIRST: 3,
    TITLE_ATOZ: 4,
    TITLE_ZTOA: 5
};

/**
* Notes.eLoadLevels - enum containing the "load levels" for a note.
*   can be bitwise OR'd together.
*/
Notes.eLoadLevels = {
    SUMMARY: 1 << 0,
    FULL:    1 << 1
};

/**
* Notes.eDBLoadLevels - Conversion of Notes.eLoadLevels to DB values.
*/
Notes.eDBLoadLevels = {};
Notes.eDBLoadLevels[ Notes.eLoadLevels.SUMMARY ] = 2;
Notes.eDBLoadLevels[ Notes.eLoadLevels.FULL ] = 0;

/**
* eShareLevels enum
* read - you have read access to the note.
* write - you have write access to the note.
* none - you are the owner.
*/
Notes.eShareLevels = new Enum(
    'read',
    'write',
    'none'
);



/**
* Message Handlers
*/

Notes.prototype.RegisterMessageHandlers = function()
{
	var me=this, all=Messages.all_publishers_id;
    me.RegisterListener( 'requestnoteadd', all, me.add );
    me.RegisterListener( 'requestnotenew', all, me.OnNotesNewNote );
    me.RegisterListener( 'requestnotedelete', all, me.OnRequestNoteDelete );
	me.RegisterListener( 'requestnotesemptytrash', all, me.emptyTrash );
	me.RegisterListener( 'requestnotesdelete', all, me.notesDelete );
	me.RegisterListener( 'requestnotestrash', all, me.notesTrash );
	me.RegisterListener( 'requestnotesuntrash', all, me.notesUnTrash );
	me.RegisterListener( 'requestnotesstar', all, me.notesStar );
	me.RegisterListener( 'requestnotesunstar', all, me.notesUnStar );
	me.RegisterListener( 'requestnoteshidden', all, me.notesHidden );
	me.RegisterListener( 'requestnotesunhidden', all, me.notesUnHidden );
	me.RegisterListener( 'requestnotestagged', all, me.notesTagged );
	// me.RegisterListener( 'requestnotesfoldered', all, me.notesFoldered );
	me.RegisterListener( 'requestnotesuntagged', all, me.notesUnTagged );
	me.RegisterListener( 'requestnotessharedbyperuser', all, me.notesSharedByPerUser );
	me.RegisterListener( 'requestnotesunsharedbyperuser', all, me.notesUnSharedByPerUser );
	me.RegisterListener( 'requestnoteids', all, me.loadNotes );
	
	me.RegisterListener( 'activityupdatepre', all, me.OnActivityUpdatePre );
	me.RegisterListener( 'activityupdatepost', all, me.OnActivityUpdatePost );
	
	Notes.Base.RegisterMessageHandlers.call( me );
};



/**
* parseShareLevel - parse a string into a share level from Notes.eShareLevels.  
*   Case insensitive.
* @param {String} in_strShareLevel (optional) - Share level to convert.  
*   If not given, returns invalid.
* @returns {Enum Value} - value defined in Notes.eShareLevels if valid, -1 otw.
*/
Notes.parseShareLevel = function( in_strShareLevel )
{
    var eRetVal = -1;
    
    if( in_strShareLevel )
    {
        var strShareLevel = in_strShareLevel.toLowerCase();

        if( TypeCheck.EnumKey( strShareLevel, Notes.eShareLevels ) )
        {
            eRetVal = strShareLevel;
        } // end if
    } // end if
    return eRetVal;
};

/**
* parseShareOwner - parse a share level string - any username named 'None' will be set to undefined.
* @param {String} in_strShareOwner (optional) - Share owner.
* @returns {String} - cleaned up share owner name
*/
Notes.parseShareOwner = function( in_strShareOwner )
{
    var strRetVal = in_strShareOwner != 'None' ? in_strShareOwner : undefined;
    return strRetVal;
};

Notes._fncResultSet = function()
{
    this.notes = [ { 
               Note_ID: Util.convertSQLServerUniqueID,
               Create_Dt: Util.convertSQLServerTimestamp,
               Update_Dt: Util.convertSQLServerTimestamp,
               Body: undefined,
               Summary: undefined,
               Title: undefined,
               Star: parseBool,
               Trash: parseBool,
               Note_Type: undefined,
               Hidden: parseBool,
               Share_Level: Notes.parseShareLevel,
               Share_Owner: Notes.parseShareOwner,
               Share_ID: undefined,
               Source_Type: undefined,
               Update_User: undefined,
			   Folder: undefined,
			   Parent_Folder: undefined
     } ];
     this.note_categories = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID
     } ];
     this.Source = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID
     } ];
     this.ShareBy = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID,
               Name: undefined,
               Email_Address: undefined,
               Share_Level: Notes.parseShareLevel
     } ];
     this.ShareWith = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID,
               Name: undefined,
               Email_Address: undefined,
               Share_Level: Notes.parseShareLevel
     } ];
     
     this.Attachments = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID,
               Name: undefined,
               Extension: undefined,
               Byte_Size: parseInt10,
               Create_Dt: Util.convertSQLServerTimestamp,
               Update_Dt: Util.convertSQLServerTimestamp
     } ];

     this.ShareOthers = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID,
               Name: undefined,
               Share_Level: Notes.parseShareLevel
     } ];
/*
     this.Comments = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID,
               Name: undefined,
               Comment: undefined,
               Inline_Flag: parseBool,
               Create_Dt: Util.convertSQLServerTimestamp
     } ];
  */        
     this.count = parseInt10;
};

Notes._objNotesListOutputConfig = function()
{
    this.notes = [ { 
               Note_ID: Util.convertSQLServerUniqueID
     } ];
     this.note_categories = [ {
               Note_ID: Util.convertSQLServerUniqueID,
               Category_ID: Util.convertSQLServerUniqueID
     } ];
     this.count = parseInt10;
};

Notes.prototype.init = function()
{
    Notes.Base.init.apply( this, [ 'note' ] );
};



/**
* emptyTrash - Empties the trash, on success raises an 'emptytrash' message.
*/
Notes.prototype.emptyTrash = function()
{
    Util.Assert( this.isInitialized() );
    var bRetVal = this.dbEmptyTrash();
    
    if( true == bRetVal )
    {
        this.Raise( 'notesemptytrash' );
        this.RaiseForAddress( 'requestsystemcategoriessetcount', SystemCategories.Categories.trashed, [ 0 ] );
    } // end if
    
    return bRetVal;
};



/**
* loadModelBatch - Loads a note from the cache if possible, if not, go to DB
*   once completed, the note will return a 'noteload' message.
*/
Notes.prototype.loadModelBatch = function()
{
    if( true === this.m_bActivityUpdate )
    {
        /**
        * We use m_bLoadingNote to indicate that at least one note is being loaded.
        *   If at least one note is loaded, we must load the category counts AFTER
        *   the notes are loaded, if not, we must do it as soon as the activity updates
        *   are over.
        */
        this.m_bLoadingNote = true;
        this.m_bActivityCausedUpdate = true;
    } // end if

    return Notes.Base.loadModelBatch.apply( this, arguments );
};

Notes.prototype.supressNextRequest = function() {
	this.supressrequest = true;
};

/**
* loadNotes - do a load of all notes for a view node.  Each note loaded will raise a 'noteload' message
*   if in_bRaiseLoad is true.
* @param {String} in_strCategoryID - ID of the Category to get
* @param {bool} in_bForceDBLoad (optional) - Tells whether to force a load from the DB.  
*    If forced load, all notes in both the cache and the db will raise a 'loadnote' message.
* @param {bool} in_bRaiseLoad (optional) - Flag to raise a 'loadnote' message.
* @param {Number} in_nFirstRow (optional) - First DB row to load.
* @param {Number} in_nNumRows (optional) - Number of DB rows to load.
* @returns {Array} of ID's.  Array with have length of 0 if none exist.
*/
Notes.prototype.loadNotes = function( in_objConfig )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Object( in_objConfig ) );
    Util.Assert( TypeCheck.UFunction( in_objConfig.callback ) );
    Util.Assert( TypeCheck.UObject( in_objConfig.context ) );
    Util.Assert( TypeCheck.UString( in_objConfig.metatagid ) );
    Util.Assert( TypeCheck.String( in_objConfig.collectionid ) );
    Util.Assert( TypeCheck.UString( in_objConfig.searchterm ) );
    Util.Assert( TypeCheck.String( in_objConfig.sort ) );
    Util.Assert( TypeCheck.Number( in_objConfig.startrow ) );
    Util.Assert( TypeCheck.Number( in_objConfig.maxrows ) );
	
	var me=this;
	if( me.supressrequest ) {
		me.supressrequest = false;
		return;
	}
	
    // With a system category we have to delete the itemID.
    var strItemID = ( in_objConfig.collectionid == MetaTags.eCollections.systemcategories ) 
        ? '' 
        : in_objConfig.metatagid || '';
    
    // With a system category we have to convert the filter.
    var nFilter = ( in_objConfig.collectionid == MetaTags.eCollections.systemcategories ) 
        ? Category.eCategoryFilter[ in_objConfig.metatagid ]
        : Category.eCategoryFilter[ in_objConfig.collectionid ];

    var objConfig = {
        Filter: nFilter,
        ItemID: strItemID,
        sort: Notes.eDBNoteSortOrder[ in_objConfig.sort ],
        notedata: 1,
        StartRow: in_objConfig.startrow + 1,
        MaxRows: in_objConfig.maxrows,
        search: in_objConfig.searchterm || ''
    };
            
    me.dbLoadNotes( objConfig, in_objConfig.callback, in_objConfig.context );
};







/**
* OnModelLoad - loadNote message handler - does not force DB load.
*/
Notes.prototype.OnModelLoad = function( in_strNoteID, in_dtUpdate, in_bForce, in_eLoadLevel )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.UDate( in_dtUpdate ) );
    Util.Assert( TypeCheck.UBoolean( in_bForce ) );
    
    var objNote = this.m_aobjChildren.getByKey( in_strNoteID );
    in_eLoadLevel = Util.AssignIfDefined( in_eLoadLevel, Notes.eLoadLevels.FULL );
        
    if( ( !objNote ) 
     || ( in_bForce )
     || ( ( in_dtUpdate && objNote.m_objExtraInfo )
       && ( objNote.m_dtDBUpdate_Dt < in_dtUpdate ) )
     || ( objNote.m_nLoadLevel < in_eLoadLevel ) )
    {   
        if( ! objNote && this.m_bActivityUpdate )
        {
            this.m_bLoadCounts = true;
        } // end if
      
        // do not do a get if we are currently editing this note.
        if( !( objNote && objNote.m_bEdited ) )
        {
            this.loadModelBatch( in_strNoteID, in_eLoadLevel );
        } // end if
    } // end if
    else
    {
        this.raiseLoad( objNote );
    } // end if
    
}; 


/**
* OnModelCheck - check whether a note is loaded, and if it is, 
*   check against the optional update date to see if it has been updated externally.
*   If needs loaded, or re-loaded, do it.
* @param {String} in_strNoteID - NoteID to check.
* @param {Date} in_dtUpdate (optional) - Update date to check.
*/
Notes.prototype.OnModelCheck = function()
{
    this.OnModelLoad.apply( this, arguments );
};


/**
* OnActivityUpdatePost - 'activityupdatepost' message handler.  
*   turns off informing the system messages of note adds.
*/
Notes.prototype.OnActivityUpdatePre = function()
{
    this.m_bActivityUpdate = true;
    this.m_bLoadingNote = false;
};

/**
* OnActivityUpdatePost - 'activityupdatepost' message handler.  
*   turns off informing the system messages of note adds.
*/
Notes.prototype.OnActivityUpdatePost = function()
{
    this.m_bActivityUpdate = false;
    
    /**
    * If we are loading at least one note, then we want to get the counts AFTER
    *   we get that note, otherwise what happens when we add or delete categories
    *   is that the count request finishes first, updates the counts to the CURRENT values
    *   that we want to have at the end, but then we either add or subtract to the count
    *   based on the new categories for the note.
    */
    if( ( false === this.m_bLoadingNote )
     && ( true === this.m_bLoadCounts ) )
    {
        this._loadCounts();
    } // end if
};


/**
* OnNotesNewNote - create a new note with the ID 'Note.new_note_id' and 
*   raise the noteadd message.
* @param {String} in_strCategoryID (optional) - CategoryID to tag the note with.
*/
Notes.prototype.OnNotesNewNote = function( in_strCategoryID )
{
    Util.Assert( TypeCheck.UString( in_strCategoryID ) );
    
	var objNote = new Note();
	var objNoteInfo = {
       Note_ID: Note.new_note_id,
       Create_Dt: 0,
       Update_Dt: 0,
       Body: '',
       Summary: '',
       Title: '',
       Star: false,
       Trash: false,
       Note_Type: Note.eNoteType.Text,
       Hidden: false,
       Share_Level: Notes.eShareLevels.none,
       Share_Owner: undefined,
       Share_ID: undefined,
       Source_Type: undefined,
       Update_User: undefined
	};
	objNote.init( objNoteInfo );
    
    // Save the categoryID off in the note so that once the note is added to the DB,  
    //  we add the category to the note.
    objNote.m_strCategoryID = in_strCategoryID;
    objNote.m_objExtraInfo = objNoteInfo;
    
    this.add( objNote );
    
    objNote.teardown();
};


/**
* Database functionality
*/

/**
* dbAdd - Adds a note with a NoteID of NEWNOTE to the database
* @param {Object} in_objNote - Note to add to DB.
* @returns {Object} a new Note model if successful, undefined otw.
*/
Notes.prototype.dbAdd = function (in_objNote) {
    Util.Assert(TypeCheck.Note(in_objNote));
    Util.Assert(in_objNote.m_strID == Note.new_note_id);

    var objInput = {
        body: Util.AssignIfDefined(in_objNote.m_objExtraInfo.Body, null),
        title: Util.AssignIfDefined(in_objNote.m_objExtraInfo.Title, null)
    };

    var objOutput = {
        noteID: Util.convertSQLServerUniqueID
    };

    var objResp = Util.callDBAction('NoteAdd', objInput, objOutput);
    var objRetVal = undefined;

    if (objResp) {
        objRetVal = new Note();
        var objDBInfo = Object.clone(in_objNote.m_objExtraInfo);
        objDBInfo.Note_ID = objOutput.noteID;
        // Use now so that we don't have local/server skewage.
        objDBInfo.Create_Dt = new Date();
        objDBInfo.Update_Dt = objDBInfo.Create_Dt;

        objRetVal.init(objDBInfo);
        objRetVal.m_objExtraInfo = objDBInfo;

        this.RaiseForAddress('requestsystemcategoriesaddnote', SystemCategories.Categories.all);
        this.RaiseForAddress('requestsystemcategoriesaddnote', SystemCategories.Categories.nofolder);
        this.RaiseForAddress('requestsystemcategoriesaddnote', SystemCategories.Categories.untagged);

        var strCategoryID = SystemCategories.SourceCategories.client;
        var objCollection = objRetVal.getBindingsObject('source');

        objRetVal.OnAddBindingComplete('source', strCategoryID, true);

        // Note had a default folder, move it.
        if (in_objNote.m_strCategoryID) {
            objRetVal.OnFolder(in_objNote.m_strCategoryID);
        }  // end if
    } // end if

    return objRetVal;
};

/**
* OnDBAddComplete - Called from model.add.  We are using it to set the alternate ID
*   that the 'add' message is from
* @param {Object} in_objModel - note model being added.
* @returns {bool} true if succesfully inserted, false otw.
*/
Notes.prototype.OnDBAddComplete = function( in_objModel )
{
    Util.Assert( TypeCheck.Note( in_objModel ) );
    
    var bRetVal = Notes.Base.OnDBAddComplete.apply( this, [ in_objModel, Note.new_note_id ] );
    
    return bRetVal;
};



/**
* dbEmptyTrash - Empties the trash.  
*/
Notes.prototype.dbEmptyTrash = function()
{
    var bRetVal = !!UberXMLHTTPRequest.callWebServiceSync( 'NotesEmptyTrash' );
	return bRetVal;
};

/**
* notesDelete - Delete a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesDelete = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    var aActionIDs = [];
    for( var strNoteID in in_objNoteIDs )
    {
        var objNote = this.getByID( strNoteID );
        if( objNote )
        {
            objNote.deleteMe( undefined, undefined, true );
            aActionIDs.push( strNoteID );
        } // end if
    } // end if

    if( aActionIDs.length )
    {
        var strNoteIDs = aActionIDs.join( ',' );
        var objInput = { 
            noteID: strNoteIDs
	    };

        Util.callDBActionAsync( 'NoteRemove', objInput );
    } // end if
};

/**
* notesTrash - Trash a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesTrash = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnTrash );
};

/**
* notesUnTrash - UnTrash a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesUnTrash = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnUnTrash );
};

/**
* notesHidden - Hidden a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesHidden = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnHidden );
};

/**
* notesUnHidden - UnHidden a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesUnHidden = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnUnHidden );
};


/**
* notesStar - Star a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesStar = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnStar );
};


/**
* notesUnStar - UnStar a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesUnStar = function( in_objNoteIDs )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );

    this.notesMetaUpdate( in_objNoteIDs, Note.MetaUpdateFunctions.OnUnStar );
};

/**
* notesMetaUpdate - Perform an meta update on a set of notes.
* @param {Object} in_objNoteIDs - object of note IDs.  
* @param {Object} in_objEntry - Configuration from Note.MetaUpdateFunctions
* @param {Function} in_fncNoteCheck (optional) - if given, called for each note to make sure
*   update can happen for that note.  The return value of in_fncNoteCheck should be a boolean,
*   true indicates the note should be added to the meta update, false means not added.
*/
Notes.prototype.notesMetaUpdate = function( in_objNoteIDs, in_objEntry, in_fncNoteCheck )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.Object( in_objEntry ) );
    Util.Assert( TypeCheck.UFunction( in_fncNoteCheck ) );

    var aActionIDs = [];

    for( var strNoteID in in_objNoteIDs )
    {
        var objNote = this.getByID( strNoteID );
        
        if( objNote )
        {
            var bSkip = false;
            for( var strKey in in_objEntry.translation )
            {
                if( objNote.m_objExtraInfo[ strKey ] == in_objEntry.translation[ strKey ] )
                {   // already done for this entry.  Do not do again.
                    bSkip = true;
                } // end if
            } // end for
            
            if( ( false === bSkip )
             && ( in_fncNoteCheck ) )
            {
                bSkip = !in_fncNoteCheck( objNote );
            } // end if
            
            if( false === bSkip )
            {
                aActionIDs.push( strNoteID );
                for( var strKey in in_objEntry.translation )
                {
                    objNote.m_objExtraInfo[ strKey ] = in_objEntry.translation[ strKey ];
                } // end for
                
                if( in_objEntry.oncomplete )
                {
                    in_objEntry.oncomplete.apply( objNote, in_objEntry.arguments || [] );
                } // end if

                if( in_objEntry.message )
                {
                    objNote.Raise( in_objEntry.message );
                } // end if
            } // end if
        } // end if
    } // end for

    // Don't call the DB if we have no remaining items    
    if( aActionIDs.length )
    {
    
        var strNoteIDs = aActionIDs.join( ',' );
        var objInput = { 
            noteID: strNoteIDs,
	        action: in_objEntry.action
	    };

        var OnComplete = function( in_objOutput ) {
            for( var nIndex = 0; strNoteID = aActionIDs[ nIndex ]; ++nIndex )
            {
                var objNote = this.getByID( strNoteID );
                if( objNote )
                {   // XXX This is probably calling save twice, once in the oncomplete, once here.
                    objNote.OnSaveResponse( in_objOutput );
                } // end if
            } // end if
        };

	    var objOutput = {
	        Update_Dt: Util.convertSQLServerTimestamp
	    };

        
        Util.callDBActionAsync( in_objEntry.service, objInput, objOutput, 
            OnComplete, this );
    } // end if
};

/**
* notesTagged - Tagged a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesTagged = function( in_objNoteIDs, in_strMetaTagID )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.String( in_strMetaTagID ) );
    
    var fncTest = function( in_objNote )
    {   
        return !in_objNote.hasBinding( 'tagged', in_strMetaTagID );
    };
    this.notesMetaTagAction( in_objNoteIDs, fncTest, 'OnTagComplete', 'NoteCategoryTag', 'tagged', in_strMetaTagID );
};


/**
* notesUnTagged - UnTagged a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
*/
Notes.prototype.notesUnTagged = function( in_objNoteIDs, in_strMetaTagID )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.String( in_strMetaTagID ) );

    var fncTest = function( in_objNote )
    {
        return in_objNote.hasBinding( 'tagged', in_strMetaTagID );
    };
    this.notesMetaTagAction( in_objNoteIDs, fncTest, 'OnUntagComplete', 'NoteCategoryUnTag', 'tagged', in_strMetaTagID );
};

/**
* notesSharedByPerUser - Tagged a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
* @param {String} in_strMetaTagID - Share ID to add.
* @param {String} in_eShareLevel - Share level
*/
Notes.prototype.notesSharedByPerUser = function( in_objNoteIDs, in_strMetaTagID, in_eShareLevel )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.String( in_strMetaTagID ) );
	Util.Assert( TypeCheck.EnumKey( in_eShareLevel, Notes.eShareLevels ) );
    
    var me=this;
    var fncTest = function( in_objNote )
    {   // Current user has to be the owner of the note to share it, 
        //  and we do not want the note to already have the binding.
        var bShareOwner = in_objNote.isOwner();
        if( !bShareOwner )
        {
            me.Raise( 'appokmessage', [ _localStrings.SHARE_ERROR_NOT_OWNER, 'error' ] );
        } // end if
        
        return ( ( false == in_objNote.hasBinding( 'sharedbyperuser', in_strMetaTagID ) )
              && ( true == bShareOwner ) );
    };
    this.notesMetaTagAction( in_objNoteIDs, fncTest, 'OnTagComplete', 'NoteShareAdd', 'sharedbyperuser', 
		in_strMetaTagID, { shareLevel: in_eShareLevel, personalMessage: '' }, { Share_Level: in_eShareLevel } );
};


/**
* notesUnSharedByPerUser - UnTagged a set of notes
* @param {Object} in_objNoteIDs - object of note IDs.  
*   The keys are used as the note IDs, the values are ignored.
* @param {String} in_strMetaTagID - ShareID to remove.
*/
Notes.prototype.notesUnSharedByPerUser = function( in_objNoteIDs, in_strMetaTagID )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.String( in_strMetaTagID ) );

    var fncTest = function( in_objNote )
    {   // Current user has to be the owner of the note to share it, 
        //  and we do not want the note to already have the binding.
        return ( ( true == in_objNote.hasBinding( 'sharedbyperuser', in_strMetaTagID ) )
              && ( true == in_objNote.isOwner() ) );
    };
    
    this.notesMetaTagAction( in_objNoteIDs, fncTest, 'OnUntagComplete', 'NoteShareRemove', 'sharedbyperuser', in_strMetaTagID );
};

/**
* notesMetaTagAction - Performs a meta tag action on multiple notes.
* @param {Object} in_objNoteIDs - noteIDs to perform action on.
* @param {Function} in_fncTest - Test to check whether a note in in_objNoteIDs 
*   should be added to the noteID list.  Called with the note model as the parameter.
* @param {String} in_strComplete - name of completion function in the note.
* @param {String} in_strDBAction - Name of web service.
* @param {String} in_strCollectionID - CollectionID to for the binding.
* @param {String} in_strMetaTagID - Meta Tag ID to do action with.
* @param {Object} in_objInput - Input to send to DB.
* @param {Object} in_objExtraInfo - Extra Info to send to the completion function.
*/
Notes.prototype.notesMetaTagAction = function( in_objNoteIDs, in_fncTest, in_strComplete, 
    in_strDBAction, in_strCollectionID, in_strMetaTagID, in_objInput, in_objExtraInfo )
{
    Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
    Util.Assert( TypeCheck.Function( in_fncTest ) );
    Util.Assert( TypeCheck.String( in_strComplete ) );
    Util.Assert( TypeCheck.String( in_strDBAction ) );
    Util.Assert( TypeCheck.String( in_strCollectionID ) );
    Util.Assert( TypeCheck.String( in_strMetaTagID ) );
    
    var aActionIDs = [], aNoteIDs = in_objNoteIDs;

	if( !TypeCheck.Array( in_objNoteIDs ) )
	{
		aNoteIDs = Object.keys( in_objNoteIDs );
	} // end if
	
    // Call all the completion functions to update the actual note.
    for( var strNoteID, nIndex = 0; strNoteID = aNoteIDs[ nIndex ]; ++nIndex )
    {
        var objNote = this.getByID( strNoteID );
        if( objNote && in_fncTest( objNote ) )
        {
			var objExtraInfo = Object.clone( in_objExtraInfo || {} );
			Object.extend( objExtraInfo, { Note_ID: objNote.m_strID, Category_ID: in_strMetaTagID } );
			
            aActionIDs.push( strNoteID );
            objNote[ in_strComplete ]( in_strCollectionID, in_strMetaTagID, true, objExtraInfo );            
        } // end if
    } // end for

    // This does the save response when the DB does the save.
    var OnComplete = function( in_objOutput ) {
        for( var nIndex = 0; strNoteID = aActionIDs[ nIndex ]; ++nIndex )
        {
            var objNote = this.getByID( strNoteID );
            if( objNote )
            {
                objNote.OnSaveResponse( in_objOutput );
            } // end if
        } // end if
    };

    // Don't call the DB if we have no remaining items    
    if( aActionIDs.length )
    {
        var strNoteIDs = aActionIDs.join( ',' );
        var objInput = Object.extend( in_objInput || {}, { 
            noteID: strNoteIDs,
	        categoryID: in_strMetaTagID
	    } );

	    var objOutput = {
	        Update_Dt: Util.convertSQLServerTimestamp
	    };
        
        Util.callDBActionAsync( in_strDBAction, objInput, objOutput, 
            OnComplete, this );    
    } // end if
};


/**
* dbLoadNotes - load a specified number of rows from the database calling the specified web service.  
*   Will create notes, add them to the cache, a system category, and optionally raise 
*   a 'noteload' for each note loaded.
*   NOTE: Asyncronous call.  Results of the response are not known until later.
* @param {String} in_strCategoryID {string} - Web service to call
* @param {Number} in_nFirstRow - first row to get
* @param {Number} in_nNumRows - last row to get
* @param {bool} in_bRaiseLoaded - specifies whether or not to raise the 'noteload' message.
*/
Notes.prototype.dbLoadNotes = function( in_objDBConfig, in_objCallback, in_objContext )
{
    Util.Assert( this.isInitialized() );
    
    var fncOnComplete = function( in_objDecodedItems ) 
    {   // call the generic response handler
        var astrNoteIDs = [];
        for( var nIndex = 0, objItem; objItem = in_objDecodedItems.notes[ nIndex ]; ++nIndex )
        {
            if( objItem.Note_ID )
            {
                astrNoteIDs[ astrNoteIDs.length ] = objItem.Note_ID;
            } // end if
        } // end for
        
        var objConfig = { 
            noteids: astrNoteIDs, 
            totalcount: in_objDecodedItems.count 
        };
        
        in_objCallback.apply( in_objContext, [ objConfig ] );
        
        this.Raise( 'noteids', [ objConfig ] );
    }; // end function
    
    var objOutputConfig = new Notes._objNotesListOutputConfig();

    var bRetVal = !!Util.callDBActionAsync( 'NotesGetMaster', in_objDBConfig, 
	        objOutputConfig, fncOnComplete, this );
	return bRetVal;
	
};

/**
* dbProcessBatchItem - reset the max load level of the notes.
* @param {Object} in_objBatch - an object with a list of note IDs.
*/
Notes.prototype.dbProcessBatchItem = function( in_objBatch, in_strModelID, in_vConfig )
{
    in_objBatch.m_nMaxLevel = in_vConfig;
    
    return Notes.Base.dbProcessBatchItem.apply( this, arguments );
};

/**
* dbProcessBatchPost - do the actual batch NotesGet request
* @param {Object} in_objBatch - an object with a list of note IDs.
* @returns {bool} true if DB request successfully made, false otw.
*/
Notes.prototype.dbProcessBatchPost = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
   
	var bRetVal = false;
	if( in_objBatch.m_nCount > 0 )
	{
        //'NotesGet' service - just jam 36 character GUID's 
        //  together and nothing else, no delimeters.
        var objConfig = {
            NoteIDs: in_objBatch.all_model_ids,
            notedata: Notes.eDBLoadLevels[ in_objBatch.m_nMaxLevel ]
        };
        var objOutputConfig = new Notes._fncResultSet();
        // Save this for use in PostProcess so we can set the load level correctly
        this.m_nMaxBatchLevel = in_objBatch.m_nMaxLevel;
        
	    bRetVal = !!Util.callDBActionAsync( 'NotesGet', objConfig, 
	        objOutputConfig, this.loadDecodedItems, this );
	} // end if   
	
	return bRetVal;
};

/**
* _preProcessItem - used in conjunction with loadDecodedItems to pre-process
*   a decoded DB item and prepare it for loading/modifying a model.  An overridden
*   MUST SET A ID FIELD IN THE ITEM!
* @param {variant} in_objItem - item to pre process
* @returns {bool} true to start processing, false to abort.
*/
Notes.prototype._preProcessItem = function( in_objItem )
{
    Util.Assert( TypeCheck.Object( in_objItem ) );
    
    var bRetVal = !!in_objItem.Note_ID;
    if( bRetVal )
    {
        in_objItem.ID = in_objItem.Note_ID;
        in_objItem.Title = in_objItem.Title || '';
        in_objItem.Summary = in_objItem.Summary || '';
        in_objItem.Note_Type = Note.eNoteType[ in_objItem.Note_Type ] || Note.eNoteType.Text;
	   if( ( true === Config.bSSL ) && in_objItem.Body )
	   {
            in_objItem.Body = URITransforms.proxySrcURIs( in_objItem.Body, Config.strProxyURL );
        } // end if
		
    } // end if
    return bRetVal;
};

/**
* _postProcessItem - used in conjunction with loadDecodedItems to post-process
*   a decoded DB item. raises the model+load message.
* @param {variant} in_objItem - item to post process
* @param {Object} in_objModel - Model to post process.
* @param {bool} in_bRaiseLoad (optional) - Whether to raise the model+load message.
*   Assumed to be true.
*/
Notes.prototype._postProcessItem = function( in_objItem, in_objModel, in_bRaiseLoad )
{
    Util.Assert( TypeCheck.Object( in_objItem ) );
    Util.Assert( TypeCheck.Object( in_objModel ) );
    
    if( ( true === this.m_bActivityCausedUpdate )
     && ( true === in_objItem.newitem ) )
    {
        this.Raise( 'activityupdatenoteadd' );
    } // end if
    
    if( in_objModel.m_objExtraInfo )
    {   // Fill in missing information from last update.  We do this because
        // we either request summary information or full information.  If we
        // request summary, we don't get the body.
        if( false === TypeCheck.Defined( in_objItem.Body ) )
        {   // requested just the summary, update the body.
            in_objItem.Body = in_objModel.m_objExtraInfo.Body;
        } // end if-else
        
    } // end if

    in_objModel.m_nLoadLevel = this.m_nMaxBatchLevel;

    var bRetVal = Notes.Base._postProcessItem.apply( this, arguments );
    return bRetVal;
};

Notes.prototype._createModelFromItem = function( in_objItem )
{
    objRetVal = new Note();
    objRetVal.init( in_objItem );
    
    this.m_astrUpdatedNotes.push( in_objItem.Note_ID );        
    
    return objRetVal;
};

Notes.prototype._updateModelFromItem = function( in_objModel, in_objItem )
{
    in_objModel.reinit( in_objItem );
        
    this.m_astrUpdatedNotes.push( in_objItem.Note_ID );
};

/**
* loadDecodedItems - overridden from ModelCollection.  Loads decoded note and note_category
*   DB items into our local data storage, raises necessary messages.
* @param {Object} in_objDecodedItems - the decoded note/note_category items.
* @param {Boolean} in_bRaiseLoad - if true, raises the note load for each note in 
*   decoded items.
*/
Notes.prototype.loadDecodedItems = function( in_objDecodedItems, in_bRaiseLoad )
{
    Util.Assert( in_objDecodedItems && in_objDecodedItems.notes );
    
    // use this to keep track of the updated notes so we can correctly find tag
    //  deletions.
    this.m_astrUpdatedNotes = [];
  
    Notes.Base.loadDecodedItems.apply( this, [ in_objDecodedItems.notes, in_bRaiseLoad ] );
    
    /**
    * We don't actually remove the meta tag instance until restart because
    *   we don't have a mechanism to easily know if a missing item is because
    *   it is really gone or if it is because the share is gone.  So what we
    *   will do is let the note category bindings take care of the binding,
    *   but keep the instance of the share in memory, but since the note category
    *   bindings dissappear, we know not to display it.
    */
    app.sharedby.loadDecodedItems( in_objDecodedItems, false ); 
    app.attachments.loadDecodedItems( in_objDecodedItems, false );
    app.othersharedwith.loadDecodedItems( in_objDecodedItems, false );
    //app.comment.loadDecodedItems( in_objDecodedItems, false );

    this.loadBindings( in_objDecodedItems );
    
    /* This must be done in the loadDecodedItems because the OnAcitivityUpdatesPost
    *   is called before we ever reach this function.  The m_bActivityCausedUpdate
    *   is the indicator of whether to raise the messages indicating "increment" or 
    *   "decrement" count.
    */
    this.m_bActivityCausedUpdate = false;
        
	if( true === this.m_bLoadCounts )
	{
        this._loadCounts();
	} // end if
	
	this.Raise( 'notesdecoded' );
};

/**
* loadBindings - loads all the bindings for the note.
* @param {Object} in_objDecodedItems - the decoded items.
*/
Notes.prototype.loadBindings = function( in_objDecodedItems )
{
    Util.Assert( TypeCheck.Object( in_objDecodedItems ) );

    var aobjConfigs = [ {
            decodeditems: in_objDecodedItems.note_categories,
            container: MetaTags.eCollections.tagged,
            /* Run through OnUntagComplet and OnTagComplete so that we do
            * the processing for the 'untagged' system category
            */
            removecallback: 'OnUntagComplete',  
            addcallback: 'OnTagComplete'
        }, { 
            decodeditems: in_objDecodedItems.ShareBy,
            container: MetaTags.eCollections.sharedbyperuser
        }, { 
            decodeditems: in_objDecodedItems.ShareWith,
            container: MetaTags.eCollections.sharedwithperuser
        }, { 
            decodeditems: in_objDecodedItems.Source,
            container: MetaTags.eCollections.source
        }, { 
            decodeditems: in_objDecodedItems.Attachments,
            container: MetaTags.eCollections.attachment
        }, { 
            decodeditems: in_objDecodedItems.ShareOthers,
            container: MetaTags.eCollections.othersharedwith
        }/*, { 
            decodeditems: in_objDecodedItems.Comments,
            container: MetaTags.eCollections.comment
        }*/
    ];
    
    for( var nIndex = 0, objConfig; objConfig = aobjConfigs[ nIndex ]; ++nIndex )
    { 
        this.processBindingType( objConfig );
    } // end for
};

/**
* processBindingType - Take the new set of category IDs passed in, compares them
*   to the previous state of the category IDs and either calls OnUntagComplete
*   or OnTagComplete for a particular note-category combination.
* @param {Object of Arrays} in_objConfig - An object that contains the 
*   NEW set of categoryIDs for a note.
*/
Notes.prototype.processBindingType = function( in_objConfig )
{
    Util.Assert( in_objConfig );

    in_objConfig.bindings = this._findUpdatedBindings( in_objConfig.container, 
        in_objConfig.decodeditems );

    this._processBindings( in_objConfig );
};

Notes.prototype._findUpdatedBindings = function( in_strCollectionID, 
    in_objDecodedItems )
{
    var objRetVal = {};
    
    for ( var nIndex = 0, objBinding; objBinding = in_objDecodedItems[ nIndex ]; ++nIndex )
    {   
        if( objBinding.Note_ID )
        {   // Reassign to the array element in case the DB sent back a category 
            //      for a note that wasn't in the original note list
            var objBindingsForNote = objRetVal[ objBinding.Note_ID ] = 
                objRetVal[ objBinding.Note_ID ] || {};
            objBindingsForNote[ objBinding.Category_ID ] = objBinding;
        } // end if
    } // end for
    
    return objRetVal;
};


/**
* _processBindings - Process the notecategories doing additions and deletions based off 
*   the Updated categories list.  Calls 'notecategoryadd' and 'notecategoryremove' if needed.
* @param {Object} in_aobjUpdatedCategories - Object of Array of Strings - Indexed by noteID,
*   all noteIDs to be processed must be present with an array, even if the array is empty,
*   Each array holds a list of categoryIDs that are the updated notecategories.
*/
Notes.prototype._processBindings = function( in_objConfig )
{
    var objBindings = in_objConfig.bindings;
    var eContainer = in_objConfig.container;    
    var strRemoveComplete = in_objConfig.removecallback || 'OnRemoveBindingComplete';
    var strAddComplete = in_objConfig.addcallback || 'OnAddBindingComplete';
    
    for( var nIndex = 0, strNoteID; strNoteID = this.m_astrUpdatedNotes[ nIndex ]; ++nIndex )
    {
        var objNote = this.getByID( strNoteID );
        var astrNewBindings = Object.keys( objBindings[ strNoteID ] || {} );
        var astrOldBindings = ( objNote && objNote.getBindings( eContainer ) ) || [];
        
        // We do the Array.prototype.without.apply because without expects arguments to be passed
        //  individually.  We can pass the entire array and it converts it correctly.
        var astrBindingsToAdd = 
            Array.prototype.without.apply( astrNewBindings, astrOldBindings );
        var astrBindingsToDelete = 
            Array.prototype.without.apply( astrOldBindings, astrNewBindings );
        var astrBindingsToUpdate = 
            Array.prototype.without.apply( astrOldBindings, astrBindingsToDelete );
            
        this._addRemoveBindingsForNote( objNote, eContainer, astrBindingsToAdd, 
            strAddComplete, objBindings[ strNoteID ] );
        this._addRemoveBindingsForNote( objNote, eContainer, astrBindingsToUpdate, 
            strAddComplete, objBindings[ strNoteID ] );
        this._addRemoveBindingsForNote( objNote, eContainer, astrBindingsToDelete, 
            strRemoveComplete );
    } // end for
};



/**
* _addRemoveBindingsForNote - process the bindings for a particular note.
* @param {String} in_strNoteID - NoteID to for notecategories
* @param {String} in_strCollectionID - CollectionID the categoryIDs belong to.
* @param {Array} in_astrMetaTagIDs - Array of strings with MetaTagIDs for the note.
* @param {String} in_strStorageCallback - Name of function to call for updating 
*   the noteMetaTag storage
* @param {Object} in_objBindings - The bindings to add to the note.  If deleting
*   the last binding for a type for a note, this will not exist.
*/
Notes.prototype._addRemoveBindingsForNote = function( in_objNote, 
    in_strCollectionID, in_astrMetaTagIDs, in_strStorageCallback,
    in_objBindings )
{
    Util.Assert( TypeCheck.Note( in_objNote ) );
    Util.Assert( TypeCheck.String( in_strCollectionID ) );
    Util.Assert( TypeCheck.Array( in_astrMetaTagIDs ) );
    Util.Assert( TypeCheck.String( in_strStorageCallback ) );
    Util.Assert( TypeCheck.UObject( in_objBindings ) );

    // We pass the ActivityCausedUpdate to the storage callback because it indicates we
    // raise the "count" update.  We do not want to raise the count update on paging
    // nor on startup, where this.m_bActivityCausedUpdate will be "false"
    for( var nIndex = 0, strMetaTagID; strMetaTagID = in_astrMetaTagIDs[ nIndex ]; ++nIndex )
    {
        in_objNote[ in_strStorageCallback ]( in_strCollectionID, strMetaTagID, 
            this.m_bActivityCausedUpdate, in_objBindings && in_objBindings[ strMetaTagID ]  );
    } // end for
};

Notes.prototype.OnRequestNoteDelete = function( in_strNoteID )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    
    if( !this.getByID( in_strNoteID ) )
    {
        this.m_bLoadCounts = true;
    } // end if
};

Notes.prototype._loadCounts = function()
{
    this.RaiseForAddress( 'loadall', 'categoriesloader' );
    this.m_bLoadCounts = false;
};
