function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'KeyListenerPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new KeyListenerPlugin();
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_strInputSelector: 'testdiv' } ] );
        
        var objTestObject = this.getTestObject();
        objTestObject.m_strMessagingID = 'keylistenerplugin';
        objTestObject.m_objPlugged = new Display();
        objTestObject.m_objPlugged.init( { m_strMessagingID: 'testdisplay' } );
    },
        
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testTabIndex();   
        this.testKeyDownOnly();
        this.testKeyDownAlt();
        this.testFocusOnShow();
    },
    
    getExpectedConfig: function()
    {
        return {
            m_strInputSelector: null,
            m_objKeys: null
        };
    },
   
    getExpectedListeners: function()
    {
        this.getTestObject().OnRegisterDomEventHandlers();
        return {
            registerdomeventhandlers: null,
            onkeydown: null,
            onshow: null
        };
    },
    
    testTabIndex: function()
    {
        var objElement = fireunit.id( 'testdiv' );
        fireunit.ok( objElement.tabIndex >= 0, 'tabindex set "gte" 0: ' + objElement.tabIndex.toString() );
    },
    
    testKeyDownOnly: function()
    {
        // test1 - key not registered.
        // test2 - key registered.
        // test3 - two messages registered for same key
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        var objKeys = {};
        
        objKeys[ KeyCode.A ] = {
            message: 'theakey'
        };
        objKeys[ KeyCode.B ] = [
            { message: 'thebkey1' },
            { message: 'thebkey2' }
        ];
        
        objTestObject.m_objKeys = objKeys;
        
        // test1 - invalid key
        objEvent.setKeyCode( KeyCode.C );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( {}, 'test1, key not registered, no messages raised' );
        
        // test2 - valid key, one message
        objEvent.setKeyCode( KeyCode.A );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( { theakey: null }, 'test2, key registered, theakey raised' );

        // test3 - valid key, two message
        objEvent.setKeyCode( KeyCode.B );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( { thebkey1: null, thebkey2: null }, 'test3, key registered, thebkey1/2 raised' );
    },
    
    testKeyDownAlt: function()
    {
        // test1 - key not registered.
        // test2 - key registered, no alt key.
        // test3 - key registered, alt key.
        // test4 - two messages registered for same key, no alt pressed
        // test5 - two messages registered for same key, alt pressed
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        var objKeys = {};
        
        objKeys[ KeyCode.A ] = {
            message: 'theakey',
            altKey: true
        };
        objKeys[ KeyCode.B ] = [
            { message: 'thebkey1', altKey: true },
            { message: 'thebkey2', altKey: true }
        ];

        objTestObject.m_objKeys = objKeys;

        // test1 - invalid key
        objEvent.setKeyCode( KeyCode.C );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( {}, 'test1, key not registered, no messages raised' );
        
        // test2 - valid key without alt, no messages
        objEvent.altKey = false;
        objEvent.setKeyCode( KeyCode.A );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( {}, 'test2, key registered, alt not pressed, no messages' );

        // test3 - valid key with alt, raise messages
        objEvent.altKey = true;
        objEvent.setKeyCode( KeyCode.A );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( { theakey: null }, 'test3, key registered, alt pressed, theakey raised' );

        // test4 - valid key without alt, no messages.
        objEvent.altKey = false;
        objEvent.setKeyCode( KeyCode.B );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( {}, 'test4, key registered, alt not pressed, no messages' );

        // test5 - valid key with alt, thebkey1/2 raised.
        objEvent.altKey = true;
        objEvent.setKeyCode( KeyCode.B );
        objPlugged.resetRaisedMessages();
        objTestObject.OnKeyDown( objEvent );
        objPlugged.testRaisedMessages( { thebkey1: null, thebkey2: null }, 'test5, key registered, thebkey1/2 raised' );
    
    },
    
    testFocusOnShow: function()
    {
        var objElement = fireunit.id( 'testdiv' );
        var bFocused = undefined;
        objElement.focus = function() {
            bFocused = true;
        };
        
        var objTestObject = this.getTestObject();
                
        // test1 - m_bFocusOnShow not set, should not affect bFocued;
        Timeout.reset();
        objTestObject.m_bFocusOnShow = false;
        objTestObject.OnShow();
        Timeout.causeTimeout( '0' );
        fireunit.ok( 'undefined' == typeof( bFocused ), 'test1: m_bFocusOnShow not set, focus not called' );

        // test2 - m_bFocusOnShow set, should set bFocued to true;
        Timeout.reset();
        objTestObject.m_bFocusOnShow = true;
        objTestObject.OnShow();
        Timeout.causeTimeout( '0' );
        fireunit.ok( true === bFocused, 'test2: m_bFocusOnShow set, focus called' );
    }
} );



