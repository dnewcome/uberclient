/**
* NoteCategories Model - This model is used to hold bindings between a note and a category
*   for the currently loaded set of notes.
*/

/** 
    * Public interface:
    *
    * constructor (NoteCategories)
    * init()
    * isInitialized()
    * teardown()
    * addNoteCategory( in_strNoteID, in_strCategoryID, in_bRaiseIncrement )
    * removeNoteCategory( in_strNoteID, in_strCategoryID, in_bRaiseDecrement )
    * removeNote( in_strNoteID, in_bRaiseDecrement )
    * removeCategory( in_strCategoryID )
    * exists( in_strNoteID, in_strCategoryID )
    * GetFilteredNotesForCategory( in_strCategoryID )
    * getCategoriesForNote( in_strNoteID )
*
*/

/* This is a collection of 2d hash tables.  The first's primary key is NoteID, then CategoryID
* The second table's is CategoryID then NoteID.
*/

/**
* constructor - calls init automatically.
*/
function NoteCategories()
{
    this.m_aobjNotes = undefined;
    this.m_objUpdatedCategoriesForNotes = undefined;
    this.m_aobjCategories = undefined;
    this.m_anNoteNumUserCategories = undefined;

    Model.apply( this );        
};
NoteCategories.prototype = new Model;

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
NoteCategories.eNoteSortOrder = {
    CREATEDT_OLDFIRST: 0,
    CREATEDT_NEWFIRST: 1,
    UPDATEDT_OLDFIRST: 2,
    UPDATEDT_NEWFIRST: 3,
    TITLE_ATOZ: 4,
    TITLE_ZTOA: 5
};

/**
* teardown - Initializes our data structures and message handlers.  If there were previously 
*   data structures, they WILL BE LOST.
* @returns {bool} true if structures had to be torn down, false otw.
*/
NoteCategories.prototype.init = function()
{
    var bRetVal = false;
    
    if( this.m_aobjNotes )
    {
        this.teardown();
        bRetVal = true;
    } // end if
    
    this.m_aobjNotes = new Hash2D();
    this.m_aobjCategories = new Hash2D();
    this.m_anNoteNumUserCategories = {};

    this.m_aobjCategories.init();
    this.m_aobjNotes.init();
    
    Model.prototype.init.apply( this, [ 'notecategories', Messages.generateID() ] );
    
    return bRetVal;
};


NoteCategories.prototype.teardownData = function()
{
    var bRetVal = false;
    
    if( this.m_aobjNotes )
    {
        this.m_aobjNotes.teardown();
        this.m_aobjCategories.teardown();
        
        delete this.m_aobjNotes;
        delete this.m_aobjCategories;

        Model.prototype.teardownData.apply( this );
        bRetVal = true;
    } // end if

    return bRetVal;
};

/**
* addNote - add a note to the collection and set up its default categories.
* @param {Object} in_objNote - Note to add.
*/
NoteCategories.prototype.addNote = function( in_objNote )
{
    Util.Assert( TypeCheck.Defined( in_objNote ) );

    if( TypeCheck.Undefined( this.m_anNoteNumUserCategories[ in_objNote.m_strID ] ) )
    {
        this.m_anNoteNumUserCategories[ in_objNote.m_strID ] = 0;
        var bTrashFlag = !!in_objNote.m_bTrashFlag;
        
        this.m_objUpdatedCategoriesForNotes[ in_objNote.m_strID ] = [];
        
        if( true == bTrashFlag )
        {   // Do this first because everything else depends on it!
            this.addNoteCategory( in_objNote.m_strID, SystemCategories.Categories.trashed, bTrashFlag );
        } // end if

        this.addNoteCategory( in_objNote.m_strID, SystemCategories.Categories.all, bTrashFlag );

        // Only do this if we truely a new note, otherwise all notes that get loaded end up
        // as "untagged".  Because we are only doing "diffs" on the categories when we load 
        // them and not tearing the note down and completely rebuilding it.
        this.addNoteCategory( in_objNote.m_strID, SystemCategories.Categories.untagged, bTrashFlag );
    } // end if
    
    return true;
};


/**
* addNoteCategory - Adds a note/category pair.
* @param {String} in_strNoteID - ID of the note
* @param {String} in_strCategoryID - ID of the category
* @param {bool} in_bTrashFlag (optional) - trash flag for the note.  If not given, look to see if the
*       noteID is part of the trash category.
* @returns {bool} true if this was not already in the collection, false otw.
*/
NoteCategories.prototype.addNoteCategory = function( in_strNoteID, in_strCategoryID, in_bTrashFlag )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    
    in_bTrashFlag = TypeCheck.Defined( in_bTrashFlag ) ? !!in_bTrashFlag : 
        this.m_aobjNotes.exists( in_strNoteID, SystemCategories.Categories.trashed );

//    this.noteSetup( in_strNoteID, in_bTrashFlag );

    var bRetVal = this.m_aobjNotes.add( in_strNoteID, in_strCategoryID, null );
    
    if( true == bRetVal )
    {
        this.m_aobjCategories.add( in_strCategoryID, in_strNoteID, null );

        if ( false == Category.isSystemCategory( in_strCategoryID ) )
        {
            if( 0 == this.m_anNoteNumUserCategories[ in_strNoteID ] )
            {
                this.removeNoteCategory( in_strNoteID, SystemCategories.Categories.untagged, in_bTrashFlag );
            } // end if

            this.m_anNoteNumUserCategories[ in_strNoteID ]++;
        } // end if

        this.RaiseForAddress( 'requestcategoryaddnote', in_strCategoryID, [ in_bTrashFlag ] );
    } // end if
    
    return bRetVal;
};

NoteCategories.prototype.noteSetup = function( in_strNoteID, in_bTrashFlag )
{
    if( TypeCheck.Undefined( this.m_anNoteNumUserCategories[ in_strNoteID ] ) )
    {   // did not previously exist, set it up.
        var objNote = {
            m_bTrashFlag: in_bTrashFlag,
            m_strID: in_strNoteID
        };
        this.addNote( objNote );
    } // end if
};

/**
* removeNoteCategory - Removes a note/category pair from the collection.
* @param {String} in_strNoteID - ID of the note
* @param {String} in_strCategoryID - ID of the category
* @param {bool} in_bTrashFlag (optional) - trash flag for the note.  If not given, assume false
* @param {bool} in_bCancelMessage (optional) - If set to true, will not send a 
*       requestcategorydeletenote message
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.removeNoteCategory = function( in_strNoteID, in_strCategoryID, 
    in_bTrashFlag, in_bCancelMessage )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    
    in_bTrashFlag = TypeCheck.Defined( in_bTrashFlag ) ? !!in_bTrashFlag : 
        this.m_aobjNotes.exists( in_strNoteID, SystemCategories.Categories.trashed );
    
  //  this.noteSetup( in_strNoteID, in_bTrashFlag );
    
    // See if it exists and we can remove it, what we get back is really the
    //  Value of that, so see if we get a value "defined" value back.
    var bRetVal = this.m_aobjNotes.remove( in_strNoteID, in_strCategoryID );
    bRetVal = TypeCheck.Defined( bRetVal );
    
    if( bRetVal )
    {    
        this.m_aobjCategories.remove( in_strCategoryID, in_strNoteID );
        if ( false == Category.isSystemCategory( in_strCategoryID ) )
        {
            this.m_anNoteNumUserCategories[ in_strNoteID ]--;
            if( 0 == this.m_anNoteNumUserCategories[ in_strNoteID ] )
            {
                this.addNoteCategory( in_strNoteID, SystemCategories.Categories.untagged, in_bTrashFlag );
            } // end if
        } // end if
        
        this.RaiseForAddress( 'requestcategorydeletenote', in_strCategoryID, [ in_bTrashFlag ] );
    } // end if
    
    return bRetVal;
};

/**
* removeNote - Removes a note and all it's categories from the collection
* @param {String} in_strNoteID - ID of the note
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.removeNote = function( in_strNoteID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    
    var bRetVal = false;
    var bTrash = this.m_aobjNotes.exists( in_strNoteID, SystemCategories.Categories.trashed );
    var aobjCategories = this.m_aobjNotes.getByFirstKey( in_strNoteID );
    if( aobjCategories )
    {    
        for( var strCategoryID in aobjCategories )
        {
            this.removeNoteCategory( in_strNoteID, strCategoryID, bTrash );
        } // end for
        
        // We have to do this because when we remove all user the categories, 
        //  we actually re-put the note in the "untagged" catetory.
        this.removeNoteCategory( in_strNoteID, SystemCategories.Categories.untagged, bTrash );
        
        this.m_aobjNotes.removeByFirstKey( in_strNoteID );
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* trashNote - trashes a note, sends a 'requestcategorytrashnote' message to every
*   category the note has.
* @param {String} in_strNoteID - ID of the note
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.trashNote = function( in_strNoteID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );

    var aobjCategories = this.m_aobjNotes.getByFirstKey( in_strNoteID );
    for( var strCategory in aobjCategories )
    {
        this.RaiseForAddress( 'requestcategorytrashnote', strCategory );
    } // end for

    var bRetVal = this.addNoteCategory( in_strNoteID, SystemCategories.Categories.trashed, true );  
    return bRetVal;
};

/**
* untrashNote - 
* @param {String} in_strNoteID - ID of the note
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.untrashNote = function( in_strNoteID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    
    var aobjCategories = this.m_aobjNotes.getByFirstKey( in_strNoteID );
    for( var strCategory in aobjCategories )
    {
        this.RaiseForAddress( 'requestcategoryuntrashnote', strCategory );
    } // end for

    var bRetVal = this.removeNoteCategory( in_strNoteID, SystemCategories.Categories.trashed, false );
    return bRetVal;
};

/**
* starNote - Adds a note to the 'starred' category.
* @param {String} in_strNoteID - ID of the note
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.starNote = function( in_strNoteID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );

    var bRetVal = this.addNoteCategory( in_strNoteID, SystemCategories.Categories.starred, false );
    return bRetVal;
};

/**
* unstarNote - Removes a note from the 'starred' category.
* @param {String} in_strNoteID - ID of the note
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.unstarNote = function( in_strNoteID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strNoteID ) );

    return this.removeNoteCategory( in_strNoteID, SystemCategories.Categories.starred, false );
};

/**
* emptyTrash - Takes all notes in the trashed category, 
*   removes all the notes from all categories a note is in.
*/
NoteCategories.prototype.emptyTrash = function()
{
    Util.Assert( this.isInitialized() );
    var aobjNotes = this.m_aobjCategories.getByFirstKey( SystemCategories.Categories.trashed );

    for( var strNoteID in aobjNotes )
    {
        this.Raise( 'notedelete', [ strNoteID, true ] );
    } // end for
};


/**
* removeCategory - Removes a category and all it's notes from the collection
* @param {String} in_strCategoryID - ID of the category
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.removeCategory = function( in_strCategoryID )
{
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    Util.Assert( this.isInitialized() );
    
    var bRetVal = false;
    var aobjNotes = this.m_aobjCategories.getByFirstKey( in_strCategoryID );

    for( var strNoteID in aobjNotes )
    {
        this.removeNoteCategory( strNoteID, in_strCategoryID );
        bRetVal = true;        
    } // end for
    this.m_aobjCategories.removeByFirstKey( in_strCategoryID );

    return bRetVal;
};


/**
* flushCategory - Removes all the notes from a category's collection - does
*   not raise a requestcategorydeletenote message.
* @param {String} in_strCategoryID - ID of the category
* @returns {bool} true if this was already in the collection, false otw.
*/
NoteCategories.prototype.flushCategory = function( in_strCategoryID )
{
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    Util.Assert( this.isInitialized() );
    
    var bRetVal = false;
    var aobjNotes = this.m_aobjCategories.getByFirstKey( in_strCategoryID );

    for( var strNoteID in aobjNotes )
    {
        this.removeNoteCategory( strNoteID, in_strCategoryID, undefined, true );
        bRetVal = true;        
    } // end for

    return bRetVal;
};

/**
* exists - See if a NoteID/CategoryID pair exist
* @returns {bool} true if exists, false otw.
*/
NoteCategories.prototype.exists = function( in_strNoteID, in_strCategoryID )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    Util.Assert( this.isInitialized() );
    
    var bRetVal = this.m_aobjNotes.exists( in_strNoteID, in_strCategoryID );
    
    return bRetVal;
};


/**
* getCategoriesForNote - return an Array of CategoryID's for the specified Note.
* @returns undefined if NoteID does not exist.
*/
NoteCategories.prototype.getCategoriesForNote = function( in_strNoteID )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( this.isInitialized() );

    var aRetVal = this.m_aobjNotes.getSecondKeysByFirstKey( in_strNoteID );
    
    return aRetVal;
};



/**
* Message Handling Functions
*/

NoteCategories.prototype.RegisterMessageHandlers = function()
{    
    this.RegisterListener( 'noteadd', Messages.all_publishers_id, this.addNote );
    this.RegisterListener( 'notetag', Messages.all_publishers_id, this.addNoteCategory );
    this.RegisterListener( 'noteuntag', Messages.all_publishers_id, this.removeNoteCategory );
    this.RegisterListener( 'notetrash', Messages.all_publishers_id, this.trashNote );
    this.RegisterListener( 'noteuntrash', Messages.all_publishers_id, this.untrashNote );
    this.RegisterListener( 'notedelete', Messages.all_publishers_id, this.removeNote );
    this.RegisterListener( 'categorydelete', Messages.all_publishers_id, this.removeCategory );
    this.RegisterListener( 'notestar', Messages.all_publishers_id, this.starNote );
    this.RegisterListener( 'noteunstar', Messages.all_publishers_id, this.unstarNote );
    this.RegisterListener( 'notesemptytrash', Messages.all_publishers_id, this.emptyTrash );
    this.RegisterListener( 'requestnotecategoriesloadpre', Messages.all_publishers_id, this.loadDecodedItemsPre );
    this.RegisterListener( 'requestnotecategoriesload', Messages.all_publishers_id, this.loadDecodedItems );
    this.RegisterListener( 'requestnotecategoriesnotesetup', Messages.all_publishers_id, this.noteSetup );
    
    Model.prototype.RegisterMessageHandlers.apply( this );
};

/**
* Helper functions
*/



/**
* GetFilteredNotesForCategory - return an Array of NoteID's for the specified Category.
* @param {String} in_strCategoryID - ID of category for which to get notes list
* @param {String} in_strFilterCategoryID (optional) - If note belongs to category, filter it out.
* @param {number} in_strFirstIndex (optional) - Lowest index to get (0 based)
* @param {number} in_nNumRows (optional) - Number of rows from the lowest index.
* @returns {Variant} undefined if CategoryID does not exist, return an Array of NoteID's for the specified Category.
*/
NoteCategories.prototype.GetFilteredNotesForCategory = function( in_strCategoryID, 
    in_strFilterCategoryID, in_nFirstIndex, in_nNumRows )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_strCategoryID ) == 'string' );
    
    var aRetVal = undefined;
    var objAllNotesInCat = this.m_aobjCategories.getByFirstKey( in_strCategoryID );
    
    if( objAllNotesInCat )
    {
        var objAllNotesInFilter = undefined;
        if( in_strFilterCategoryID )
        {
            objAllNotesInFilter = this.m_aobjCategories.getByFirstKey( in_strFilterCategoryID );
        } // end if
    
        aRetVal = this.convertObjectToArrayWithFilter( objAllNotesInCat, objAllNotesInFilter, in_nFirstIndex, in_nNumRows );
    } // end if
    
    return aRetVal;
};


NoteCategories.prototype.getNotesForCategories = function( in_aobjCategoryIDs, in_aobjFilterCategoryIDs, in_nFirstIndex, in_nNumRows )
{
    Util.Assert( this.isInitialized() );
    
    var aRetVal = undefined;
    var objAllNotes = {};
    var objNotesInFilter = {};
    
    for( strCategoryID in in_aobjCategoryIDs )
    {
        var objNotesInCat = this.m_aobjCategories.getByFirstKey( strCategoryID );
        Util.union( objAllNotes, objNotesInCat );
    } // end for 
    
    for( strCategoryID in in_aobjFilterCategoryIDs )
    {
        var objNotesInCat = this.m_aobjCategories.getByFirstKey( strCategoryID );
        Util.union( objNotesInFilter, objNotesInCat );
    } // end for
    
    if( objAllNotes )
    {
        aRetVal = this.convertObjectToArrayWithFilter( objAllNotes, objNotesInFilter, in_nFirstIndex, in_nNumRows );
    } // end if
    
    return aRetVal;
};

/**
* XXX Move this!!!!
* What can we do to make this more efficient, especially if we have a large set
*   and a small range?  Seems we might have to convert this entire thing to
*   a HashArray.
*/
NoteCategories.prototype.convertObjectToArrayWithFilter = function( in_objObject, in_objFilterObject, 
    in_nFirstIndex, in_nNumRows )
{
    var strFirstIndexType = typeof( in_nFirstIndex );
    var strNumRowsType = typeof( in_nNumRows );
    Util.Assert( in_objObject );
    Util.Assert( strFirstIndexType == 'undefined' || strFirstIndexType == 'number' );
    Util.Assert( strNumRowsType == 'undefined' || strNumRowsType == 'number' );

    var nNumRemainingRows = Util.AssignIfDefined( in_nNumRows, Infinity );
    var nNumUntilStartIndex = Util.AssignIfDefined( in_nFirstIndex, 0 );
    var aRetVal = [];
    var nIndex = 0;
      
    for( var strKey in in_objObject )
    {   // only add the ones that are not in the filter and that are within the proper range.
        var bAdd = true;
        if( in_objFilterObject && TypeCheck.Defined( in_objFilterObject[ strKey ] ) )
        {   // Remove if filtered first off.
            bAdd = false;
        } // end if

        if( ( true == bAdd ) && nNumUntilStartIndex > 0 )
        {
            bAdd = false;
            nNumUntilStartIndex--;
        } // end if

        if( ( true == bAdd ) && ( 0 < nNumRemainingRows ) )
        {
            aRetVal.push( strKey );
            nNumRemainingRows--;
        } // end if
        
        if( nNumRemainingRows <= 0 )
        {   // do this AFTER the push.
            break;
        } // end if
    } // end for
    
    return aRetVal;
};

NoteCategories.prototype.loadDecodedItemsPre = function()
{
    this.m_objUpdatedCategoriesForNotes = {};
};

NoteCategories.prototype.loadDecodedItems = function( in_objDecodedItems, in_bReset )
{
    Util.Assert( in_objDecodedItems );
    
    if( in_bReset )
    {
        this.teardown();
        this.init();
    } // end if

    // find each notecategory head node, then process the nodes
    this._findNoteCategoriesFromDecodedItems( in_objDecodedItems, 
        this.m_objUpdatedCategoriesForNotes );
    
    // find the set complements
    var objAddDelete = this._findAdditionsDeletions( this.m_objUpdatedCategoriesForNotes );
        
    this._processNoteCategories( objAddDelete.deletions, 'removeNoteCategory', 'noteuntag' );
    this._processNoteCategories( objAddDelete.additions, 'addNoteCategory', 'notetag' );

    this.Raise( 'notecategoriesloadpost' );
    
    return bRetVal;
};

NoteCategories.prototype._findNoteCategoriesFromDecodedItems = function( in_objDecodedItems, 
    in_aobjCategoriesForNote )
{
    for ( var nIndex = 0, objCurrSet; objCurrSet = in_objDecodedItems.note_categories[ nIndex ]; ++nIndex )
    {   
        if( objCurrSet.Note_ID )
        {
            var strNoteID = Util.convertSQLServerUniqueID( objCurrSet.Note_ID );
            var strCategoryID = Util.convertSQLServerUniqueID( objCurrSet.Category_ID );
            
            // Reassign to the array element in case the DB sent back a category 
            //      for a note that wasn't in the original note list
            if( strCategoryID )
            {
                var objCatsForNote = in_aobjCategoriesForNote[ strNoteID ] = 
                    in_aobjCategoriesForNote[ strNoteID ] || [];
                objCatsForNote[ objCatsForNote.length ] = strCategoryID;
            } // end if
            else
            {
                this.Raise( 'raiseerror', [ 'NoteCategories._findNoteCategoriesFromDecodedItems', 
                    ErrorLevels.eErrorType.ERROR, ErrorLevels.eErrorLevel.HIGH, 
                    'Missing Category_ID on notecategory decode from the database.' ] );
            } // end if-else
        } // end if
    } // end for
};


/**
* _findAdditionsDeletions - finds the additions and deletions of notecategories based off 
*   the current notecategory state and a new set of notecategories.
* @param {Object} in_aobjCategoriesForNote - Object of Array of Strings - Indexed by noteID,
*   all noteIDs to be processed must be present with an array, even if the array is empty,
*   Each array holds a list of categoryIDs that are the updated notecategories.
* @returns {Object} - object with two objects of arrays (same format as input), 
*   named "deletions" and "additions".  Each array holds a list of categoryIDs 
*   for a particular note.
*/
NoteCategories.prototype._findAdditionsDeletions = function( in_aobjCategoriesForNote )
{
    var aCategoriesToDelete = {}, aCategoriesToAdd = {};
    for( var strNoteID in in_aobjCategoriesForNote )
    {
        var aNewCatsForNote = in_aobjCategoriesForNote[ strNoteID ] || [];
        var aOldCatsForNote = this.getCategoriesForNote( strNoteID ) || [];
        
        // We do the Array.prototype.without.apply becasue without expects arguments to be passed
        //  individually.  We can pass the entire array and it converts it correctly.
        aCategoriesToDelete[ strNoteID ] = 
            Array.prototype.without.apply( aOldCatsForNote, aNewCatsForNote );
        aCategoriesToAdd[ strNoteID ] = 
            Array.prototype.without.apply( aNewCatsForNote, aOldCatsForNote );
    } // end for
    return { deletions: aCategoriesToDelete, additions: aCategoriesToAdd };
};


/**
* _processNoteCategories - process the note categories for all notes.
* @param in_objNoteCategories {Object} - Object that holds an Array of strings 
*   with categoryIDs for each note.
* @param in_strStorageCallback {String} - Name of function to call for updating 
*   the notecategory store
* @param in_strMessage {String} - Message to raise
*/
NoteCategories.prototype._processNoteCategories = function( in_objNoteCategories, 
    in_strStorageCallback, in_strMessage )
{
    Util.Assert( TypeCheck.Object( in_objNoteCategories ) );
    Util.Assert( TypeCheck.String( in_strStorageCallback ) );
    Util.Assert( TypeCheck.String( in_strMessage ) );
    
    for( var strNoteID in in_objNoteCategories )
    {
        var aCurrNote = in_objNoteCategories[ strNoteID ];
        this._processNoteCategoriesForNote( strNoteID, aCurrNote, 
            in_strStorageCallback, in_strMessage );
    } // end for
};

/**
* _processNoteCategoriesForNote - process the note categories for a particular note.
* @param in_strNoteID {String} - NoteID to for notecategories
* @param in_aCategories {Array} - Array of strings with categoryIDs for the note.
* @param in_strStorageCallback {String} - Name of function to call for updating 
*   the notecategory storage
* @param in_strMessage {String} - Message to raise
*/
NoteCategories.prototype._processNoteCategoriesForNote = function( in_strNoteID, 
    in_aCategories, in_strStorageCallback, in_strMessage )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.Array( in_aCategories ) );
    Util.Assert( TypeCheck.String( in_strStorageCallback ) );
    Util.Assert( TypeCheck.String( in_strMessage ) );

    for( var nIndex = 0, strCategoryID; strCategoryID = in_aCategories[ nIndex ]; ++nIndex )
    {
        this._processNoteCategory( in_strNoteID, strCategoryID, 
            in_strStorageCallback, in_strMessage );
    } // end for
};

/**
* _processNoteCategory - process a note category
* @param in_strNoteID {String} - NoteID
* @param in_strCategoryID {String} - CategoryID
* @param in_strStorageCallback {String} - Name of function to call for 
*   updating the notecategory storage
* @param in_strMessage {String} - Message to raise
*/
NoteCategories.prototype._processNoteCategory = function( in_strNoteID, 
    in_strCategoryID, in_strStorageCallback, in_strMessage )
{
    Util.Assert( TypeCheck.String( in_strNoteID ) );
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    Util.Assert( TypeCheck.String( in_strStorageCallback ) );
    Util.Assert( TypeCheck.String( in_strMessage ) );

    if ( false == Category.isSystemCategory( in_strCategoryID ) )
    {
        this[ in_strStorageCallback ]( in_strNoteID, in_strCategoryID );
        this.Raise( in_strMessage, [ in_strNoteID, in_strCategoryID ], 
            false, in_strNoteID );
    } // end if
};
