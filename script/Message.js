/**
*   SMPS - Shane's Message Passing System
*     Put back to forth - SPMS - Shane's (male) PMS.  Watch out for this one.
*       
* class MessagePump: This is a generic message pump.
*   Raise:
*   RaiseForAddress:
*   RegisterListener:
*   UnRegisterListener:
*   UnRegisterListenerForAddress
*
*/

function MessagePump()
{
    // this is going to be a multi-dimensional array of message handlers.
    //  The message handlers are going to be arranged in the array 
    //      [ message_id ] [ publisher_id ] [ subscriber_id ]
    //  The the publisher_id "all_publishers" is a special publisher if a listener
    //  wants to listen to a particular message from all publishers of a 
    //  particular message_id.
    this.m_aobjMessageHandlers = undefined; 
    this.all_publishers_id = undefined;
};

MessagePump.prototype.init = function( in_objIDGenerator )
{
    Util.Assert( TypeCheck.Object( in_objIDGenerator ) );

    this.m_aobjMessageHandlers = {}; 
    this.all_publishers_id = Util.cleanID( "all_publishers" );

    this.m_objMessageGenerator = in_objIDGenerator;
};

/**
* teardown - teardown any remaining things we have.
*/
MessagePump.prototype.teardown = function()
{
    for( var strMessage in this.m_aobjMessageHandlers )
    {
        var aobjPublishers = this.m_aobjMessageHandlers[ strMessage ];
        for( var strPublisher in aobjPublishers )
        {
            var aobjSubscribers = aobjPublishers[ strPublisher ];
            for( var strSubscriber in aobjSubscribers )
            {
                this.UnRegisterListener( strMessage, strPublisher, strSubscriber );
            } // end for
        } // end for        
    } // end for
};

/**
* Raises the event, calling all registered handlers. Pass all the parameters that the registered 
* callback functions expect to see, they will be applied through the `arguments' object even though
* we don't have any params listed in the function signature here.
* @param {String} in_strMessage - Name of the message
* @param {String} in_strPublisher - Publisher ID
* @param {array of object types} in_atArguments (optional) - Array of arguments passed to the function handler
*       these arguments will be passed to function in the order they are placed in the array.
* @param {bool} in_bBlocking (optional) - If true, this will by a synchronous (blocking) call to the listeners.
*/
MessagePump.prototype.Raise = function (in_strMessage, in_strPublisher, in_atArguments, in_bBlocking) {
    Util.Assert(TypeCheck.String(in_strMessage));
    Util.Assert(TypeCheck.String(in_strPublisher));


    in_strMessage = Util.cleanID(in_strMessage);
    in_strPublisher = Util.cleanID(in_strPublisher);

    var me = this;          // use this enclosure to call our helper.
    var fncRaise = function () {
        RaiseHelper(me.all_publishers_id);
        RaiseHelper(in_strPublisher);
    };

    if (in_bBlocking) {
        fncRaise();
    } // end if
    else {   // set this to false, because by default we are blocking here.
        setTimeout(fncRaise, 0);
    } // end if-else

    // Helper function so that we can call
    function RaiseHelper(in_strPublisher) {
        var bRetVal = false;
        var aobjPublishers, objFunkContainer;    // Do we let out the funk?

        // First check the message holder for publisher.
        if (aobjPublishers = me.m_aobjMessageHandlers[in_strMessage]) {
            // then check the publisher for their subscribers
            var aobjSubscribers = aobjPublishers[in_strPublisher];
            for (var strSubscriber in aobjSubscribers) {
                objFunkContainer = aobjSubscribers[strSubscriber];
                var atArguments = in_atArguments || objFunkContainer.m_avArguments || [];
                // unleash the funk.  Watch out!  
                objFunkContainer.callFunctionFast(atArguments);
                bRetVal = true;
            } // end for            
        } // end if

        return bRetVal;
    } // end RaiseHelper
};



/**
* Raises the event, calling all registered handlers. Pass all the parameters that the registered 
* callback functions expect to see, they will be applied through the `arguments' object even though
* we don't have any params listed in the function signature here.
* @param {String} in_strMessage Name of the message
* @param {String} in_strPublisher - Publisher ID
* @param {String} in_strSubscriber - Subscriber ID
* @param {array of object types} in_atArguments (optional) - Array of arguments passed to the function handler.
*       these arguments will be passed to function in the order they are placed in the array.
* @param {bool} in_bBlocking (optional) - If true, this will by a synchronous (blocking) call to the listeners.
*/
MessagePump.prototype.RaiseForAddress = function( in_strMessage, in_strPublisher, 
    in_strSubscriber, in_atArguments, in_bBlocking ) 
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strPublisher ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );

    in_strMessage = Util.cleanID( in_strMessage );
    var strPublisher = Util.cleanID( in_strPublisher );
    in_strSubscriber = Util.cleanID( in_strSubscriber );

    var me = this;          // use this enclosure to call our helper.
    var fncRaise = function()
    {   // first check the normal publishers.    
        RaiseHelper( strPublisher ) || RaiseHelper( me.all_publishers_id );
    };

    if( in_bBlocking )
    {
        fncRaise();
    } // end if
    else
    {   // set this to false, because by default we are blocking here.
        setTimeout( fncRaise, 0 );
    } // end if-else

    // Helper function so that we can call
    function RaiseHelper( in_strPublisher ) 
    {
        var bRetVal = false;
        var aobjPublishers, aobjSubscribers, objFunkContainer = null;    // Do we let out the funk?
        
        // First check the message container, then the publisher
        if ( ( aobjPublishers = me.m_aobjMessageHandlers[ in_strMessage ] ) 
          && ( aobjSubscribers = aobjPublishers[ in_strPublisher ] )
          && ( objFunkContainer = aobjSubscribers[ in_strSubscriber ] ) )
        {   
            // unleash the funk.  Watch out!  
            var aArguments = in_atArguments || objFunkContainer.m_avArguments || [];
            objFunkContainer.callFunctionFast( aArguments );
            bRetVal = true;
        } // end if
        
        return bRetVal;
    } // end RaiseHelper
};


/**
* RegisterListener - Adds a callback function to the list of registered listeners
* @param {String} in_strMessage - Message to register for
* @param {Variant} in_vPublisher (optional) - Will accept either a string publisherID or an HTMLElement.  
* @param {String} in_strSubscriber - Subscriber ID
* @param {function} in_fncListener - Callback function to call
* @param {Object} in_objScope (optional) - Optional scope to run the listener in
* @returns {variant} the function container if succesfully registered, false otw.
*/
MessagePump.prototype.RegisterListener = function( in_strMessage, in_vPublisher, 
    in_strSubscriber, in_fncListener, in_objScope, in_avArguments )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    Util.Assert( TypeCheck.Function( in_fncListener ) );
    
    var vRetVal = false;
    
    if( in_vPublisher )
    {	// Check on string first because the in_objDOMElement might not be a DOMElement yet.
        strFunction = TypeCheck.Object( in_vPublisher ) ? 
            'RegisterListenerWithHTMLElement' : 'RegisterListenerWithPublisherID';
        vRetVal = this[ strFunction ]( in_strMessage, in_vPublisher, in_strSubscriber, 
            in_fncListener, in_objScope, in_avArguments );
    } // end if
    return vRetVal;
};


/**
* RegisterListenerWithHTMLElement - Adds a callback function to the list of registered listeners fo
* @param {String} in_strMessage - Message to register for
* @param {Object} in_objHTMLElement (optional) - DOMElement to register - If not present, function does nothing
* @param {String} in_strSubscriber - Subscriber ID
* @param {function} in_fncListener - Callback function to call
* @param {Object} in_objScope (optional) - Optional scope to run the listener in
* @returns {variant} the function container if succesfully registered, false otw.
*/
MessagePump.prototype.RegisterListenerWithHTMLElement = function( in_strMessage, in_objHTMLElement, 
    in_strSubscriber, in_fncListener, in_objScope, in_avArugments )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    Util.Assert( TypeCheck.Function( in_fncListener ) );
    var vRetVal = false;
    
    if( in_objHTMLElement )
    {
        DOMElement.fromElement( in_objHTMLElement );
        var strElementID = in_objHTMLElement.m_strElementID;
        vRetVal = this.RegisterListenerWithPublisherID( in_strMessage, strElementID, 
            in_strSubscriber, in_fncListener, in_objScope );
        
        if( vRetVal )
        {
            UberEvents.addEvent( in_objHTMLElement, in_strMessage, in_fncListener, in_objScope );
            vRetVal.m_vExtraInfo.htmlElement = in_objHTMLElement;
        } // end if
     } // end if
     
     return vRetVal;
};


/**
* Adds a callback function to the list of registered listeners
* @param {String} in_strMessage - Message to register for
* @param {String} in_strPublisher - Publisher ID
* @param {String} in_strSubscriber - Subscriber ID
* @param {function} in_fncListener - Callback function to call
* @param {Object} in_objScope (optional) - Optional scope to run the listener in
* @returns {variant} the function container if succesfully registered, false otw.
*/
MessagePump.prototype.RegisterListenerWithPublisherID = function( in_strMessage, in_strPublisher, 
    in_strSubscriber, in_fncListener, in_objScope, in_avArugments )
{ 
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strPublisher ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    Util.Assert( TypeCheck.Function( in_fncListener ) );
    
    var strMessage = Util.cleanID( in_strMessage );
    var strPublisher = Util.cleanID( in_strPublisher );
    var strSubscriber = Util.cleanID( in_strSubscriber );
    
    var vRetVal = new FunctionContainer( in_fncListener, in_objScope, 
        { message: strMessage, publisher: strPublisher, subscriber: strSubscriber }, 
        in_avArugments );
    
    // Make a location in the messages for the publisher
    var objPublishers = this.m_aobjMessageHandlers[ strMessage ] = this.m_aobjMessageHandlers[ strMessage ] || {};
    
    // Make a location in the publisher for the subscriber
    var objSubscribers = objPublishers[ strPublisher ] = objPublishers[ strPublisher ] || {};
    
    // the array is set up, now add the function container to the subscriber    
    //      Note, this will overwrite if there was an old handler in this location. 
    //      This means we can only have one handler per subscriber per publisher 
    //      per message.
    objSubscribers[ strSubscriber ] = vRetVal;

    return vRetVal;
};


/**
* Removes one handler for a message.
*  NOTE - if removing an HTMLElement by ID, call UnRegisterListenerWithHTMLElement directly.
* @param {String} in_strMessage - Message to delete from
* @param {Variant} in_vPublisher (optional) - Will accept either a string publisherID or an HTMLElement.  
*   If not passed in, function will do nothing.  
* @param {String} in_strSubscriber - Address of handler to delete
* @returns {variant} the function container if succesfully unregistered, false otw.
*/
MessagePump.prototype.UnRegisterListener = function( in_strMessage, in_vPublisher, in_strSubscriber )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    
    var vRetVal = false;
    
    if( in_vPublisher )
    {
        var strFunction = TypeCheck.DOMElement( in_vPublisher ) ? 
            'UnRegisterListenerWithHTMLElement' : 'UnRegisterListenerWithPublisherID';
        vRetVal = this[ strFunction ]( in_strMessage, in_vPublisher, in_strSubscriber );
    } // end if
    return vRetVal;
};

/**
* Removes an event handler for a DOMElement.
* @param {String} in_strMessage - Message to register for
* @param {Object} in_objDOMElement - DOMElement to unregister for
* @param {String} in_strSubscriber - Subscriber ID
* @param {Object} in_objScope (optional) - Optional scope to run the listener in
* @returns {variant} the function container if succesfully unregistered, false otw.
*/
MessagePump.prototype.UnRegisterListenerWithHTMLElement = function( in_strMessage, in_objDOMElement, 
    in_strSubscriber )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.DOMElement( in_objDOMElement ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );
    
    var strElementID = in_objDOMElement.m_strElementID;
    var vRetVal = this.UnRegisterListenerWithPublisherID( in_strMessage, strElementID, in_strSubscriber );
    
    return vRetVal;
};

/**
* UnRegisterListenerWithPublisherID - Removes one handler for a message.
* @param {String} in_strMessage - Message to delete from
* @param {String} in_strPublisher - Publisher ID
* @param {String} in_strSubscriber - Address of handler to delete
* @returns {variant} the function container if succesfully unregistered, false otw.
*/
MessagePump.prototype.UnRegisterListenerWithPublisherID = function( in_strMessage, in_strPublisher, 
    in_strSubscriber )
{
    Util.Assert( TypeCheck.String( in_strMessage ) );
    Util.Assert( TypeCheck.String( in_strPublisher ) );
    Util.Assert( TypeCheck.String( in_strSubscriber ) );

    var strMessage = Util.cleanID( in_strMessage );
    var strPublisher = Util.cleanID( in_strPublisher );
    var strSubscriber = Util.cleanID( in_strSubscriber );
    var objRetVal = false;
    
    if( ( this.m_aobjMessageHandlers[ strMessage ] ) &&
        ( this.m_aobjMessageHandlers[ strMessage ][ strPublisher ] ) &&
        ( objRetVal = this.m_aobjMessageHandlers[ strMessage ][ strPublisher ][ strSubscriber ] ) )
    {
        this.m_aobjMessageHandlers[ strMessage ][ strPublisher ][ strSubscriber ] = null;
        delete this.m_aobjMessageHandlers[ strMessage ][ strPublisher ][ strSubscriber ];

        // do some cleanup!
        // delete the publisher if we have no more subscribers
        if( ! Util.objectHasProperties( this.m_aobjMessageHandlers[ strMessage ][ strPublisher ] ) )
        {
            this.m_aobjMessageHandlers[ strMessage ][ strPublisher ] = null;
            delete this.m_aobjMessageHandlers[ strMessage ][ strPublisher ];
            
            // delete the message if we have no more publishers
            if( ! Util.objectHasProperties( this.m_aobjMessageHandlers[ strMessage ] ) )
            {
                this.m_aobjMessageHandlers[ strMessage ] = null;
                delete this.m_aobjMessageHandlers[ strMessage ];
            } // end if
        } // end if

        /* If that was an event, remove the event from the DOM! */
        if( TypeCheck.Defined( objRetVal.m_vExtraInfo.htmlElement ) )
        {
            UberEvents.removeEvent( objRetVal.m_vExtraInfo.htmlElement, strMessage, objRetVal.m_fncFunction );
            // We have to do this to break the circular reference with the DOM element so we can get
            // the RAM back.
            objRetVal.m_vExtraInfo.htmlElement = null;
            
            // We need htmlElement to have a value so that UberObject can correctly unregister the event
            // in the proper storage.
            objRetVal.m_vExtraInfo.htmlElement = true;
        } // end if
    } // end if
    
    return objRetVal;
};

/**
* Will be deprecated!
*/
MessagePump.prototype.UnRegisterListenerForAddress = function( in_strMessage, in_strPublisher, 
    in_strSubscriber )
{
    Util.Assert( in_strMessage );
    Util.Assert( in_strPublisher );
    Util.Assert( in_strSubscriber );

    return this.UnRegisterListener( in_strMessage, in_strPublisher, in_strSubscriber );
};

/**
* Removes all handlers for a message.
* @param {String} in_strMessage - Message to delete all handlers for
*/
MessagePump.prototype.UnRegisterMessage = function( in_strMessage )
{
    Util.Assert( in_strMessage );

    if( this.m_aobjMessageHandlers[ in_strMessage ] )
    {
        delete this.m_aobjMessageHandlers[ in_strMessage ];
    } // end if
};

MessagePump.prototype.generateID = function()
{
    return this.m_objMessageGenerator.getUniqueID();
};



var Messages = new MessagePump();
Messages.init( new UniqueIDGenerator( "mp_autoevt" ) );
