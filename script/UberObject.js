/**
* UberObject - An object class - Eventual goal is to replace a lot of stuff
*   shared across both display.js and model.js
*/
function UberObject()
{
    this.m_strMessagingID = Messages.generateID();
    this.m_objMessages = undefined;    // keep track of which messages 
                                       //  are currently attached to us.

    this.m_objDOMEvents = undefined;
    this.m_bInitialized = false;
    this.m_aobjChildren = undefined;                                      
}

/**
* Generic display parameters
*/


UberObject.prototype.loadConfigParams = function()
{
    this.extendConfigParams( {
        m_strMessagingID: { type: 'string', bRequired: false },    
        type: { type: 'string', bRequired: false, default_value: 'uberobject' }
    } );
};

UberObject.prototype.extendConfigParams = function( in_objConfig )
{
    Util.Assert( TypeCheck.Object( in_objConfig ) );
    
    Object.extend( this.m_objConfigParams, in_objConfig );
};

TypeCheck.createForObject( 'UberObject' );

/**
* init - Initialize ourselves
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.init = function()
{
    Util.Assert( false === this.isInitialized() );

    this.createDataStructures();
                
    this.RegisterMessageHandlers();

    this.m_bInitialized = true;
    
    this.dataStructuresReady();
    
    this.childInitialization();
    this.RegisterChildMessageHandlers();
    
    return this;
};

/**
* createDataStructures - creates the data structures.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.createDataStructures = function()
{
    this.m_objMessages = new HashArray();
    this.m_objMessages.init();

    this.m_objDOMEvents = new HashArray();
    this.m_objDOMEvents.init();

    this.createChildDataStructures();
    
    return this;
};

/**
* createChildDataStructures - creates the data structures that hold our children.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.createChildDataStructures = function()
{
    this.m_aobjChildren = new HashArray();
    this.m_aobjChildren.init();
    
    return this;
};

/**
* dataStructuresReady - Called after all data structures are ready.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.dataStructuresReady = function()
{ 
    this.Raise( 'datastructuresready', undefined, true );
    
    return this;
};


/*
* initWithConfigObject - do initialization via a configuration object.
*   This function calls init, so read init.
* @param {Object} in_objConfig - configuration object
* @param {bool} in_bOverrideInit - If true, skips calling "init"
* @returns {bool} true if everything good, false otw.
*/
UberObject.prototype.initWithConfigObject = function( in_objConfig, in_bOverrideInit )
{
    Util.Assert( false === this.isInitialized() );
    Util.Assert( TypeCheck.Object( in_objConfig ) );
    
    this.m_objConfigParams = {};
    this.loadConfigParams();
    
    var objConfigParams = this.m_objConfigParams;

    var objConfig = in_objConfig;
    var bRetVal = true;
    
    // Check for valid options.
    for( var strOption in in_objConfig )
    {   // save off all of the variables.
        if( objConfigParams[ strOption ] )
        {   // Valid option, make sure it is the right type.
            var strType = typeof( in_objConfig[ strOption ] );
            if( ( strType == objConfigParams[ strOption ].type )
             || ( strType == 'undefined' && objConfigParams[ strOption ].bRequired == false ) 
             || ( 'undefined' == typeof( objConfigParams[ strOption ].type ) ) )
            {
                this[ strOption ] = in_objConfig[ strOption ];
                // Use this for housekeeping so we can check later whether we have
                //  all the required options.
                objConfigParams[ strOption ] = null;
                delete objConfigParams[ strOption ];
            }// end if
            else
            {   // Invalid type
                Util.Assert( false, 'Invalid object configuration type: ' + strOption + ', type required: ' + objConfigParams[ strOption ].type + ' type recieved: ' + strType );
                bRetVal = false;
            } // end if-else
        } // end if
    } // end if
    
    // Check for required/default options
    for( var strOption in objConfigParams )
    {
        if( objConfigParams[ strOption ] )
        {
            if( true === objConfigParams[ strOption ].bRequired ) 
            {
                Util.Assert( false, 'Missing required object configuration option: ' + strOption );
                bRetVal = false;
            } // end if
            else if( TypeCheck.Defined( objConfigParams[ strOption ].default_value ) )
            {
                this[ strOption ] = objConfigParams[ strOption ].default_value;
            } // end if-else if
        } // end if
    } // end for
    
    this.configurationReady();
    
    if( ( ! in_bOverrideInit )
     && ( true == bRetVal ) )
    {
        bRetVal = UberObject.prototype.init.apply( this );
    } // end if

    return bRetVal;
};

UberObject.prototype.configurationReady = function()
{
    this.Raise( 'configurationready' );
};

/**
* isInitialized - check to see if we are initialized
* @returns {bool} true if initialized, false otw.
*/
UberObject.prototype.isInitialized = function()
{
    return this.m_bInitialized;
};

/**
* childInitialization - initialize applicable children.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.childInitialization = function()
{
    this.Raise( 'childinitialization', arguments, true );

    return this;
};

/**
* attachChild - attach a child object to ourselves
* @param {String} in_strChildID - ID of child.
* @param {Variant} in_vChild - child to store.
* @param {Number} in_nIndex (optional) - Index to store child in child list.  If not given, store at end.
* @returns {bool} true if successful (child with same ID did not exist), false otw.
*/

UberObject.prototype.attachChild = function( in_strChildID, in_vChild, in_nIndex )
{
    Util.Assert( TypeCheck.String( in_strChildID ) );
    // This should be TypeCheck.UberObject, but doesn't work well with Decorators
    Util.Assert( TypeCheck.Defined( in_vChild ) );  
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    
    var bRetVal = -1 < this.m_aobjChildren.add( in_strChildID, in_vChild, in_nIndex );
    return bRetVal;
};

/**
* attachUberObject - attach an UberObject based item as a child.
* @param {Object} in_objObject - child object to store.
* @returns {bool} true if successful (child with same ID did not exist), false otw.
*/
UberObject.prototype.attachUberObject = function( in_objObject )
{
    Util.Assert( TypeCheck.UberObject( in_objObject ) );

    return this.attachChild( in_objObject.m_strMessagingID, in_objObject );
};

/**
* createInitUberObject - create and initialize an UberObject based object.  Attaches
*   object to the current objects list of children.  Any parameters past the constructor will
*   be passed to the init/create function of the object.
* @param {Function || Factory} in_fncConstructor - the constructor or factory method
*   to create an object.
* @returns {Object} - Created/initialized object.
*/
UberObject.prototype.createInitUberObject = function( in_fncConstructor )
{
    Util.Assert( TypeCheck.Factory( in_fncConstructor && in_fncConstructor.factory ) || TypeCheck.Function( in_fncConstructor ) || TypeCheck.Factory( in_fncConstructor ) );
    
    var objRetVal = undefined;
    var nIndex = undefined;
    var strID = '';
    var bAttach = true;
    
    var aArguments = Array.prototype.slice.call( arguments );
    aArguments.shift();
    
    if( TypeCheck.Object( in_fncConstructor ) && in_fncConstructor.factory )
    {   // the constructor is a factory configuration object
        objRetVal = in_fncConstructor.factory.create( in_fncConstructor );
        nIndex = in_fncConstructor.index;
        strID = in_fncConstructor.id;
        bAttach = Util.AssignIfDefined( in_fncConstructor.attach, true );
    } // end if
    else if( TypeCheck.Factory( in_fncConstructor ) )
    {   // The constructor is a factory.
        objRetVal = in_fncConstructor.create.apply( in_fncConstructor, aArguments );
    } // end if
    else
    {   // the constructor is a function.
        objRetVal = new in_fncConstructor();
        objRetVal.init.apply( objRetVal, aArguments );
    } // end if-else
    
    if( bAttach )
    {
        this.attachChild( strID || objRetVal.m_strMessagingID, objRetVal, nIndex );
    } // end if
    
    return objRetVal;
};

/**
* teardown - teardown the data and the DOM
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.teardown = function()
{
    Util.Assert( true == this.isInitialized() );

    this.teardownData( false );
    this.teardownChildren();
    
    this.m_bInitialized = false;
    this.m_strMessagingID = undefined;
    
    return this;
};

/**
* teardownData - free our references
* @param in_bDoChildren {bool} (optional) - if true, does teardownData 
*   on each child UberObject.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.teardownData = function( in_bDoChildren )
{
    Util.Assert( true == this.isInitialized() );

    if( true === in_bDoChildren )
    {
        this.m_aobjChildren.each( this._teardownChildData );
    } // end if
    
    this.UnRegisterMessageHandlers();

    this.m_objMessages.teardown();
    this.m_objMessages = null;
    delete this.m_objMessages;
    
    this.m_objDOMEvents.teardown();
    this.m_objDOMEvents = null;
    delete this.m_objDOMEvents;
    
    return this;
};

/**
* _teardownChildData - teardown the child's data.
* @param {Object} in_objChild - Child to teardown.
*/
UberObject.prototype._teardownChildData = function( in_objChild )
{
    if( in_objChild.teardownData )
    {
        in_objChild.teardownData();
    } // end if
};

/**
* _teardownChildData - teardown the child's data.
* @param {Object} in_objChild - Child to teardown.
*/
UberObject.prototype._teardownChild = function( in_objChild )
{
    if( in_objChild.teardown )
    {
        in_objChild.teardown();
    } // end if
};

/**
* teardownChildren - free our child references
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.teardownChildren = function()
{
    Util.Assert( true == this.isInitialized() );

    var objChild = undefined;
    while( objChild = this.m_aobjChildren.getByIndex( 0 ) )
    {
        this._teardownChild( objChild );
        this.m_aobjChildren.removeByIndex( 0 );
        objChild = null;
    } // end for
    this.m_aobjChildren.teardown();
    this.m_aobjChildren = null;
    
    return this;
};



/**
* RegisterMessageHandlers - Registers the message handlers for an object
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.RegisterMessageHandlers = function()
{
    this.Raise( 'registermessagehandlers' );
    return this;
};

/**
* UnRegisterMessageHandlers takes care of any registrations that we have
*   so we can unregister anything registered using the UberObject.RegisterListener.
*   Keeps houskeeping nice.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.UnRegisterMessageHandlers = function()
{
    this._UnregisterAllMessagesInStorage( this.m_objMessages );
    
    this._UnregisterAllMessagesInStorage( this.m_objDOMEvents );
    
    this.Raise( 'unregistermessagehandlers' );
    
    return this;
};

/**
* RegisterChildMessageHandlers - Registers any applicable child message handlers
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.RegisterChildMessageHandlers = function()
{
    this.Raise( 'registerchildmessagehandlers' );
    return this;
};

/**
* UnRegisterChildMessageHandlers - Unregisters any applicable child message handlers
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.UnRegisterChildMessageHandlers = function()
{
    return this;
};


/**
* RaiseForAddress - Raises the event, calling all registered handlers. Pass all the parameters that the registered 
* callback functions expect to see, they will be applied through the `arguments' object even though
* we don't have any params listed in the function signature here.
* @param {String} in_strMessage Name of the message
* @param {String} in_strSubscriber - Subscriber ID
* @param {array of object types} in_atArguments (optional) - Array of arguments passed to the function handler.
*       these arguments will be passed to function in the order they are placed in the array.
* @param {bool} in_bBlocking (optional) - If true, this will by a synchronous (blocking) call to the listeners.
* @param {String} in_strMessagingID (optional) - Optional messaging ID to use - if not given, use this.m_strMessagingID
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.RaiseForAddress = function( in_strMessage, in_strSubscriber, 
    in_atArguments, in_bBlocking, in_strMessagingID ) 
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    Util.Assert( TypeCheck.UString( in_strMessagingID ) );
    
    Messages.RaiseForAddress( in_strMessage, in_strMessagingID || this.m_strMessagingID, 
            in_strSubscriber, in_atArguments, in_bBlocking );
    
    return this;
};


/**
* Raises the event, calling all registered handlers. Pass all the parameters that the registered 
* callback functions expect to see, they will be applied through the `arguments' object even though
* we don't have any params listed in the function signature here.
* @param {String} in_strMessage - Name of the message
* @param {array of object types} in_atArguments (optional) - Array of arguments passed to the function handler
*       these arguments will be passed to function in the order they are placed in the array.
* @param {bool} in_bBlocking (optional) - If true, this will by a synchronous (blocking) call to the listeners.
* @param {String} in_strMessagingID (optional) - Optional messaging ID to use - if not given, use this.m_strMessagingID
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.Raise = function( in_strMessage, in_atArguments, in_bBlocking, in_strMessagingID ) 
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.UString( in_strMessagingID ) );

    Messages.Raise( in_strMessage, in_strMessagingID || this.m_strMessagingID, 
            in_atArguments, in_bBlocking );

    return this;
};



/**
* RegisterListener - A simplified interface to Messages.RegisterListener.  Only allows
*   attachment with the "this" scope and with the listener ID specified in this.m_strMessagingID
* @param {String} in_strMessage - Message to listen for
* @param {Variant} in_vPublisher - Publisher to listen for, can be a stringID or an HTMLElement
* @param {Function} in_fncListener - Callback to call when message is raised.
* @param {Object} in_objScope (optional) - Scope for the callback.  If none given, use the "this" scope.
* @param {String} in_strMessagingID (optional) - Optional messaging ID to use - if not given, use this.m_strMessagingID
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.RegisterListener = function( in_strMessage, in_vPublisher, in_fncListener, 
    in_avArguments, in_objScope, in_strMessagingID )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.Function( in_fncListener ) );
    Util.Assert( TypeCheck.UArray( in_avArguments ) );
    
    var objRetVal = Messages.RegisterListener( in_strMessage, in_vPublisher, in_strMessagingID || this.m_strMessagingID, in_fncListener, in_objScope || this, in_avArguments );
    this._RegisterMessageStorage( objRetVal );
    
    return this;
};


/**
* UnRegisterListener - A simplified interface to Messages.UnRegisterListener.  Only allows
*   unregistering with the "this" scope and with the listener ID specified in this.m_strMessagingID
* @param {String} in_strMessage - Message to listen for
* @param {Variant} in_vPublisher - Publisher to listen for, can be a stringID or an HTMLElement
* @param {Function} in_fncListener - Callback to call when message is raised.
* @param {String} in_strMessagingID (optional) - Optional messaging ID to use - if not given, use this.m_strMessagingID
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.UnRegisterListener = function( in_strMessage, in_vPublisher, in_fncListener, in_strMessagingID )
{
    var objRetVal = Messages.UnRegisterListener( in_strMessage, in_vPublisher, 
        in_strMessagingID || this.m_strMessagingID, in_fncListener );
    this._UnRegisterMessageStorage( objRetVal );
    
    return this;
};

UberObject.prototype._RegisterMessageStorage = function( in_objFuncContainer )
{
    if( in_objFuncContainer && in_objFuncContainer instanceof FunctionContainer )
    {   // Got a function container back.
        var strStorage = this._findMessageStorage( in_objFuncContainer );
        this[ strStorage ].add( in_objFuncContainer.m_strID, in_objFuncContainer );
    } // end if
};

UberObject.prototype._UnRegisterMessageStorage = function( in_objFuncContainer )
{
    if( in_objFuncContainer && in_objFuncContainer instanceof FunctionContainer )
    {   // Got a function container back.
        var strStorage = this._findMessageStorage( in_objFuncContainer );
        this[ strStorage ].removeByKey( in_objFuncContainer.m_strID );
    } // end if
};

/**
* _findMessageStorage - Find which storage container to put a function container in.
* @param {object} in_objFuncContainer - a HashArray that holds FunctionContainers to unregister.
*/
UberObject.prototype._findMessageStorage = function( in_objFuncContainer )
{
    Util.Assert( in_objFuncContainer instanceof FunctionContainer );
    
    var strRetVal = TypeCheck.Defined( in_objFuncContainer.m_vExtraInfo.htmlElement ) 
        ? 'm_objDOMEvents' : 'm_objMessages';
    
    return strRetVal;
};

/**
* _UnregisterAllMessagesInStorage - Unregister all messages that are in a storage.
* @param {object} in_objStroage - a HashArray that holds FunctionContainers to unregister.
*/
UberObject.prototype._UnregisterAllMessagesInStorage = function( in_objStorage )
{
    Util.Assert( in_objStorage instanceof HashArray );
    
    var objFuncCont = undefined;
    for( var nIndex = in_objStorage.length - 1; 
                objFuncCont = in_objStorage.getByIndex( nIndex ); --nIndex )
    {
        this.UnRegisterListener( objFuncCont.m_vExtraInfo.message, 
            objFuncCont.m_vExtraInfo.publisher, 
            objFuncCont.m_fncFunction );
    } // end for
};

/**
* logFeature - log the usage of a particular feature to the DB
* @param {String} in_strFeatureName - Name of the feature
* @param {String} in_strAdditionalInfo - Additional info to tack on to message.
* @returns {Object} this - so we can chain calls together.
*/
UberObject.prototype.logFeature = function( in_strFeatureName, in_strAdditionalInfo )
{
    Util.Assert( TypeCheck.String( in_strFeatureName ) );
    Util.Assert( TypeCheck.String( in_strAdditionalInfo ) );
    
    this.Raise( 'log', [ Logger.eLogType.feature, 
        this.type + ': ' + in_strFeatureName, in_strAdditionalInfo ] );
    
    return this;
};


/**
* createTemplateFunctions - Really just a "call modifier on a list"
* @param {Function} in_fncCreationFunc - Function creation function
* @param {Array} in_avEntries - Entries to call as parameter to in_fncCreationFunc. 
*/
UberObject.createTemplateFunctions = function( in_fncCreationFunc, in_avEntries )
{
    Util.Assert( TypeCheck.Function( in_fncCreationFunc ) );
    Util.Assert( TypeCheck.Array( in_avEntries ) );
    
    for( var nIndex = 0, objEntry; objEntry = in_avEntries[ nIndex ]; ++nIndex )
    {   // Create an externally available function of the form below for each of the above
        in_fncCreationFunc( objEntry );
    } // end for
};

/**
* Base - set the base type for an object. - this function should
*   be called directly after the constructor of an object to set up the
*   prototype chain and add a paramater to the prototype called Base.
*   This must be called directly after the constructor or because it
*   overwrites the prototype chain!
*   Base allows us to directly access the base objects prototype chain,
*   this instead of calling a base function by the full name, we can
*   say 'in_fncThis.Base.functionName.apply( this, [ argument_list ] );
*   
* @param {Function} in_fncThis - the 'this' we are adding on to.
* @param {Function} in_fncBaseType - the 'base' for the 'this'.
*       This object MUST have a 'prototype' field!  
*/
UberObject.Base = function( in_fncThis, in_fncBaseType )
{
    Util.Assert( TypeCheck.Function( in_fncThis ) );
    Util.Assert( TypeCheck.Function( in_fncBaseType ) );
    Util.Assert( TypeCheck.Defined( in_fncBaseType.prototype ) );
  
    var F = function() {};
    F.prototype = in_fncBaseType.prototype;
    // Overwrite the prototype chain.  
    in_fncThis.prototype = new F();
    in_fncThis.prototype.constructor = in_fncThis;
    
    // This should allow the user to call a base function like:
    //  this.Base.FunctionName.apply( this, [ arguments ] );
    //  which is easier to remember the name of an object
    //  this object is based from.
    in_fncThis.Base = F.prototype;//prototype;
  
};

