
/**
* UserPref - keep track of user preferences
*/
function UserPref()
{
    this.m_bAskOnTrash = undefined;
    this.m_eNoteSortOrder = undefined;
    this.m_eNewNoteCategoryAction = undefined;
    this.m_bSearchTrash = undefined;
    this.m_eCategoryCount = undefined;
    this.m_bNoteContext = true;
    
    UserPref.Base.constructor.apply( this );
}
// do prototype chaining
UberObject.Base( UserPref, Model );

UserPref.prototype.init = function()
{
    return UserPref.Base.init.apply( this, [ 'userpreferences', 'userpreferences' ] );
};

/**
* Register our message handlers 
*/
UserPref.prototype.RegisterMessageHandlers = function()
{
    this.RegisterListener( 'requestuserprefSetAskOnTrash', Messages.all_publishers_id, this.setAskOnTrashFlag );
    this.RegisterListener( 'requestuserprefUnsetAskOnTrash', Messages.all_publishers_id, this.unsetAskOnTrashFlag );
    this.RegisterListener( 'requestuserprefSetNewNoteCategoryAction', Messages.all_publishers_id, this.setNewNoteCategoryAction );
    this.RegisterListener( 'requestuserprefSetNoteSortOrder', Messages.all_publishers_id, this.setNoteSortOrder );
    this.RegisterListener( 'requestuserprefSetNoteContext', Messages.all_publishers_id, this.setNoteContext );
    this.RegisterListener( 'requestuserprefSetCategoryCount', Messages.all_publishers_id, this.setCategoryCount );
    
    Model.prototype.RegisterMessageHandlers.apply( this );
};

/**
*   Message Handlers
*/



/**
* unsetTrashFlag - Un Set the trash flag.  Raises a 'userprefSetAskOnTrash' message if successful.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.setAskOnTrashFlag = function()
{
    var bFlagValue = true;
    var objConfig = {
        ask_on_trash: bFlagValue
    };
    
    var objTranslation = {
        m_bAskOnTrash: bFlagValue
    };
    
    var objMessages = {
        userprefSetAskOnTrash: bFlagValue
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetAskOnTrashFlag', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};


/**
* unsetTrashFlag - Un Set the AskOnTrash flag.  Raises a 'userprefUnsetAskOnTrash' message if successful.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.unsetAskOnTrashFlag = function()
{
    var bFlagValue = false;
    var objConfig = {
        ask_on_trash: bFlagValue
    };
    
    var objTranslation = {
        m_bAskOnTrash: bFlagValue
    };
    
    var objMessages = {
        userprefUnsetAskOnTrash: bFlagValue
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetAskOnTrashFlag', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};

/**
* setNewNoteCategoryAction - Set the new note category action
* @param {number} in_eNewNoteCategoryAction - enum value to set value to.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.setNewNoteCategoryAction = function( in_eNewNoteCategoryAction )
{
    var objConfig = {
        new_note_category_action: in_eNewNoteCategoryAction
    };
    
    var objTranslation = {
        m_eNewNoteCategoryAction: in_eNewNoteCategoryAction
    };
    
    var objMessages = {
        userprefSetNewNoteCategoryAction: in_eNewNoteCategoryAction
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetNewNoteCategoryAction', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};


/**
* setNoteSortOrder - Set the new note sort order
* @param {number} in_eNoteSortOrder - enum value to set value to.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.setNoteSortOrder = function( in_eNoteSortOrder )
{
    var objConfig = {
        note_sort_order: in_eNoteSortOrder
    };
    
    var objTranslation = {
        m_eNoteSortOrder: in_eNoteSortOrder
    };
    
    var objMessages = {
        userprefSetNoteSortOrder: in_eNoteSortOrder
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetSortOrder', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};

/**
* setNoteContext - Set the new note sort order
* @param {number} in_bNoteContext - enum value to set value to.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.setNoteContext = function( in_bNoteContext )
{
    var objConfig = {
        note_context: in_bNoteContext
    };
    
    var objTranslation = {
        m_bNoteContext: in_bNoteContext
    };
    
    var objMessages = {
        userprefSetNoteContext: in_bNoteContext
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetContext', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};


/**
* setCategoryCount - Set the new note category action
* @param {number} in_eNoteSortOrder - enum value to set value to.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.setCategoryCount = function( in_eCategoryCount )
{
    var objConfig = {
        catgory_count: in_eCategoryCount
    };
    
    var objTranslation = {
        m_eCategoryCount: in_eCategoryCount
    };
    
    var objMessages = {
        userprefSetNoteSortOrder: in_eNoteSortOrder
    }; 
        
    var bRetVal = this.dbSaveAction( 'UserPreferencesSetCategoryCount', objConfig, objTranslation, objMessages );
			
	return bRetVal;
};


/**
*   Database type functions.
*/

/**
* dbLoad - Loads the User Preferences from the DB.
* @returns {bool} true if successful, false otw.
*/
UserPref.prototype.dbLoad = function()
{
    var bRetVal = false;
    
    var objOutputArguments = {
        Trash_Confirm_Flag: undefined,
        new_note_category_action: undefined,
        note_sort_order: undefined,
        search_trash: undefined,
        category_count_display: undefined,
        note_context: undefined
    };
    
	var objResp = Util.callDBAction( 'UserPreferencesLoad', undefined, objOutputArguments );
	
	if( objResp )
	{
        this.m_bAskOnTrash = objOutputArguments.Trash_Confirm_Flag;
        this.m_eNewNoteCategoryAction = objOutputArguments.new_note_category_action;
        this.m_eNoteSortOrder = objOutputArguments.note_sort_order;
        this.m_bSearchTrash = objOutputArguments.search_trash;
        this.m_eCategoryCount = objOutputArguments.category_count_display;
        this.m_bNoteContext = objOutputArguments.note_context;
        bRetval = true;
	} // end if
	
	return bRetVal;
};

