/**
* Model class - the purpose of this is to be the base class of all Models.  It
*   provides (or at least will) common functionality across all models, ie, database
*   interaction and a standard way of approaching things.  It would be similar to 
*   the corresponding Display.js for the displays.
*/

/**
* Constructor - DOES NOT INITIALIZE, initialization is done in init.
*/ 
function Model()
{   
    this.m_strID = undefined;
    this.m_strModelType = 'unknown';

    UberObject.apply( this );
};
Model.prototype = new UberObject;

TypeCheck.createForObject( 'Model' );


/**
* init - Initialize the model, register message handlers.  This function
*   gives us a new m_strMessagingID, but only if the m_strMessagingID has
*   not already been initialized earlier (by an inherited object)
* @param {String} in_strModelType - Model type - used to raise messages.
* @param {String} in_strID - Model ID.
* @returns {Object} - 'this'
*/
Model.prototype.init = function( in_strModelType, in_strID )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    Util.Assert( TypeCheck.String( in_strModelType ) );

    this.m_strID = in_strID;
    this.m_strModelType = in_strModelType;
    
    return UberObject.prototype.init.apply( this );    
};

Model.prototype.RegisterMessageHandlers = function()
{
    this.RegisterListener( 'request' + this.m_strModelType + 'delete', Messages.all_publishers_id, this.deleteMe );
    
    UberObject.prototype.RegisterMessageHandlers.apply( this );
};

/**
* dbSaveAction - Performs a database action, if db action successful, update the model, and raise specified
*   messages.
* @param {String} in_strDBAction - database action to call.
* @param {Object} in_objConfig (conditional) - object to use for configuration.  Must be present 
*    if either in_objTranslation or in_objMessages is passed in.
* @param {Object} in_objTranslation (optional) - Key of the config field that has the value to set the model to.
* @param {Object} in_objMessages (optional) - Field in the model corresponding to DB field.
* @returns {bool} true on success, false otw.
*/
Model.prototype.dbSaveAction = function( in_strDBAction, in_objConfig, in_objTranslation, in_objMessages )
{
    Util.Assert( TypeCheck.String( in_strDBAction ) );
    // Create our configuration object
    // Do the database action, set the return value to true if we have a response.
	var bRetVal = !!Util.callDBAction( in_strDBAction, in_objConfig );
	
	if( bRetVal )
	{   
	    this._handleResponse( in_objConfig, in_objTranslation, in_objMessages );
	} // end if
	
	return bRetVal;
};

/**
* dbSaveActionAsync - Performs a database action, if db action successful, update the model, and raise specified
*   messages.
* @param {String} in_strDBAction - database action to call.
* @param {Object} in_objConfig (conditional) - object to use for configuration.  Must be present 
*    if either in_objTranslation or in_objMessages is passed in.
* @param {Object} in_objTranslation (optional) - Key of the config field that has the value to set the model to.
* @param {Object} in_objMessages (optional) - Field in the model corresponding to DB field.
* @param {Function} in_fncCallback (optional) - function to call with the response when complete.
* @param {Object} in_objScope (optional) - scope to call callback in.  If not given, call function 
*   with model.
* @returns {bool} true on success, false otw.
*/
Model.prototype.dbSaveActionAsync = function( in_strDBAction, in_objConfig, in_objTranslation, 
    in_objMessages, in_fncCallback, in_objScope )
{
    Util.Assert( TypeCheck.String( in_strDBAction ) );
    Util.Assert( TypeCheck.UFunction( in_fncCallback ) );
    Util.Assert( TypeCheck.UObject( in_objScope ) );
    
    var me=this;
    var OnComplete = function( in_objResponse )
    {
        me._handleResponse( in_objConfig, in_objTranslation, in_objMessages );
        
        if( in_fncCallback )
        {
            in_fncCallback.call( in_objScope || me, in_objResponse );
        } // end if
    };
    
    // Create our configuration object
    // Do the database action, set the return value to true if we have a response.
	var bRetVal = !!Util.callDBActionAsync( in_strDBAction, in_objConfig, undefined, OnComplete );
	
	return bRetVal;
};

/**
* _handleResponse - handle the response of the DB calls.  Does the translations and raises 
*   the messages.
* @param {Object} in_objConfig (conditional) - object to use for configuration.  Must be present 
*    if either in_objTranslation or in_objMessages is passed in.
* @param {Object} in_objTranslation (optional) - Key of the config field that has the value to set the model to.
* @param {Object} in_objMessages (optional) - Field in the model corresponding to DB field.
*/
Model.prototype._handleResponse = function( in_objConfig, in_objTranslation, in_objMessages )
{
    if( in_objTranslation )
    {   // Do all of the translations from the config object to the model object.
        Util.Assert( in_objConfig );
        for( var strKey in in_objTranslation )
        {
            var vValue = in_objTranslation[ strKey ];
            this[ strKey ] = vValue;
        } // end for
    } // end if
    
    if( in_objMessages )
    {   // Do all of the messages	    
        Util.Assert( in_objConfig );
        for( var strKey in in_objMessages )
        {
            var vValue = in_objMessages[ strKey ];
            // Construct our array if a value exists.
            var vArguments = vValue ? [ vValue ] : undefined;
            
            this.Raise( strKey, vArguments );
        } // end for
    } // end if
};

/**
* deleteMe - handler for request+model_type+delete message.
* @param {String} in_strDBAction - DB Action
* @param {Object} in_objConfig - DB Configuration, not needed if in_bSkipDBSave is true
* @param {bool} in_bSkipDBSave - if true, skips DB Save.
*/
Model.prototype.deleteMe = function( in_strDBAction, in_objConfig, in_bSkipDBSave )
{
    Util.Assert( true === this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strDBAction ) );
    Util.Assert( in_bSkipDBSave || TypeCheck.Object( in_objConfig ) );
    Util.Assert( TypeCheck.UBoolean( in_bSkipDBSave ) );
    
    /* We raise the delete message if we skip the DB save
     *  or the return value was true.  We do this instead
     *  of passing the messages to the dbSaveAction in case
     *  we do a skipDBSave.
     */
    var bRetVal = in_bSkipDBSave || 
        this.dbSaveAction( in_strDBAction, in_objConfig );

    if( bRetVal )
    {
        this.Raise( this.m_strModelType + 'delete', [ this.m_strID ] );
        this.teardown();
    } // end if
    
    return bRetVal;
};


/**
* getID - get the model ID
* @returns {String} model ID
*/
Model.prototype.getID = function()
{
    return this.m_strID;
};


/**
* raiseModelUpdate - raise a this.m_strModelType+'update' message with the model 
*   and the extra info
*/
Model.prototype.raiseModelUpdate = function()
{
    this.Raise( this.m_strModelType + 'update', [ this.m_objExtraInfo, this ] );
};

