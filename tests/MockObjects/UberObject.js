/* UberObject mock object class */

function UberObject()
{
    this.m_objConfigParams = {};
    this.m_strMessagingID = 'testuberobjectid';
    this.m_objRegisteredMessages = {};
    this.m_objRaisedMessages = {};
    this.m_bLoadConfigParamsChained = false;
    this.m_bInitChained = false;
    this.m_bConstructorChained = true;
    this.m_bExtendConfigParamsCalled = false;
    this.m_bRegisterMessageHandlersChained = false;
    this.m_bTeardownChained = false;
};

Object.extend( UberObject.prototype, {
    init: function( in_objConfig ) {
        if( in_objConfig )
        {
            this.initWithConfigObject( in_objConfig );
        } // end if
        else
        {
            this.loadConfigParams();
            this.RegisterMessageHandlers();
        } // end if-else
        this.m_bInitChained = true;
    },
    initWithConfigObject: function( in_objConfig, in_bOverrideInit )
    {
        this.loadConfigParams();
        // Check for valid options.
        Object.extend( this, in_objConfig );
        this.RegisterMessageHandlers();
        this.m_bInitChained = true;
        return true;
    },
    
    loadConfigParams: function() { this.m_bLoadConfigParamsChained = true; },

    extendConfigParams: function( in_objConfig )
    {
        for( var strKey in in_objConfig )
        {
            this[ strKey ] = TypeCheck.Defined( in_objConfig[ strKey ].default_value ) ? 
                in_objConfig[ strKey ].default_value : null;
        } // end for
        this.m_bExtendConfigParamsCalled = true;
    },

    RegisterMessageHandlers: function() {
        this.m_bRegisterMessageHandlersChained = true;
    },
    attachUberObject: function() {},
    teardown: function() {
        this.m_bTeardownChained = true;
    },
    
    setMessagingID: function( in_strMessagingID ) {
        this.m_strMessagingID = in_strMessagingID;
    },

    getMessages: function() { return this.m_objRegisteredMessages; },

    RegisterListener: function( in_strMessage, in_vPublisher, in_fncListener, 
        in_avArguments, in_objContext, in_strMessagingID )
    {
        UberObject.prototype.RegisterListenerObject.apply( this, [ { 
            message: in_strMessage,
            listener: in_fncListener,
            context: in_objContext,
            from: in_vPublisher,
            to: in_strMessagingID
        } ] );
        return this;
    },
    
    RegisterListenerObject: function( in_objObject ) {
        if( ! TypeCheck.Function( in_objObject.listener ) )
        {
            fireunit.ok( false, 'Invalid listener for: ' + in_objObject.message );
        } // end if
        this.m_objRegisteredMessages[ in_objObject.message ] = in_objObject;
        return this;
    },
    
    UnRegisterListener: function( in_strMessage, in_vPublisher, in_fncListener )
    {
        delete this.m_objRegisteredMessages[ in_strMessage ];
    },
    
    Raise: function( in_strMessage, in_objArguments ) {
        this.m_objRaisedMessages[ in_strMessage ] = { arguments: in_objArguments };
    },
    
    RaiseForAddress: function( in_strMessage, in_strAddress, in_objArguments ) {
        this.m_objRaisedMessages[ in_strMessage ] = { arguments: in_objArguments, to: in_strAddress };
    },
    
    resetRaisedMessages: function()
    {
        this.m_objRaisedMessages = {};
    },
    
    getRaisedMessages: function()
    {
        return this.m_objRaisedMessages;
    },
    
    getRaisedMessage: function( in_strMessage )
    {
        return this.getRaisedMessages()[ in_strMessage ];
    },

    testRaisedMessages: function( in_objExpected, in_strHeading )
    {
        var objExpected = Object.clone( in_objExpected );
        var objRaised = Object.clone( this.getRaisedMessages() );
        var bRetVal = true;
        
        for( var strKey in objExpected )
        {
            var objExpectedConfig = in_objExpected[ strKey ];
            var objRaisedConfig = objRaised[ strKey ];
            if( TypeCheck.Defined( objRaisedConfig ) )
            {   // could be null, so do the extra check
                if( objExpectedConfig )
                {
                    function testMessageItem( in_strField )
                    {
                        if( objExpectedConfig[ in_strField ] )
                        {
                            if( objExpectedConfig[ in_strField ] != objRaisedConfig[ in_strField ] )
                            {
                                fireunit.ok( false, in_strHeading + ': ' + in_strField + ' fields do not match' );
                                bRetVal = false;
                            } // end if
                            else
                            {
                                fireunit.ok( true, in_strHeading + ': ' + in_strField + ' test passsed' );
                            } // end if 
                        } // end if
                    } // end function
                    
                    testMessageItem( 'arguments' );
                    testMessageItem( 'from' );
                    testMessageItem( 'to' );
                } // end if 
                delete objRaised[ strKey ];
            }
            else
            {
                fireunit.ok( false, in_strHeading + ': expected message not raised: ' + strKey );
                bRetVal = false;
            } // end if
        } // end for
        
        for( var strKey in objRaised )
        {
            fireunit.ok( false, in_strHeading + ' - unexpected message raised: ' + strKey );
            bRetVal = false;
        } // end for
        
        if( bRetVal == true )
        {
            fireunit.ok( true, in_strHeading + ' - all message tests passed' );
        } // end if
        
        return bRetVal;
    },
    
    testExpectedListeners: function( in_objExpected )
    {
        var objRegisteredMessages = Object.clone( this.getMessages() );
        
        var bMissing = false, bUnExpected = false;
        for( var strMessage in in_objExpected )
        {
            var objRegisteredConfig = objRegisteredMessages[ strMessage ];
            if( objRegisteredConfig )
            {
                var objExpectedConfig = in_objExpected[ strMessage ];
                
                if( objExpectedConfig )
                {
                    var bError = objExpectedConfig.from != objRegisteredConfig.from;
                    if( bError )
                    {
                        fireunit.ok( false, 'expected from field error: ' + strMessage );
                    }
                
                    var bError = objExpectedConfig.to != objRegisteredConfig.to;
                    if( bError )
                    {
                        fireunit.ok( false, 'expected to field error: ' + strMessage );
                    }
                } // end if
                delete objRegisteredMessages[ strMessage ];
            } // end if
            else
            {
                fireunit.ok( false, 'expected handler missing: ' + strMessage );
                bMissing = true;
            } // end if
        } // end for

        if( false == bMissing )
        {
            fireunit.ok( true, 'all expected messages registered' );
        } // end if
        for( var strMessage in objRegisteredMessages )
        {
            fireunit.ok( false, 'unexpected message registered: ' + strMessage );
            bUnExpected = true;
        } // end for
        
        if( false == bUnExpected )
        {
            fireunit.ok( true, 'no unexpected messages found' );
        } // end if
        
    }
    
} );

UberObject.Base = function( in_fncThis, in_fncBaseType )
{
    fireunit.ok( TypeCheck.Function( in_fncThis ), 'UberObject.Base: in_fncThis is a function' );
    fireunit.ok( TypeCheck.Function( in_fncBaseType ), 'UberObject.Base: in_fncBaseType is a function' );
  
    var F = function() {};
    F.prototype = in_fncBaseType.prototype;
    // Overwrite the prototype chain.  
    in_fncThis.prototype = new F();
    in_fncThis.prototype.constructor = in_fncThis;
    
    // This should allow the user to call a base function like:
    //  this.Base.FunctionName.apply( this, [ arguments ] );
    //  which is easier to remember the name of an object
    //  this object is based from.
    in_fncThis.Base = F.prototype;
};


