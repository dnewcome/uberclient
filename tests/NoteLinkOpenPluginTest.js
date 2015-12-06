/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteLinkOpenPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    init: function()
    {
        // we replace the built in window.open so we aren't opening windows everywhere.
        this._origWindowOpen = window.open;
        window.open = function( in_strURL ) { this.m_strWindowOpenURL = in_strURL; }.bind( this );
        
        UnitTestHarness.Base.init.apply( this, arguments );
    },

    finish: function()
    {
        window.open = this._origWindowOpen;
        
        UnitTestHarness.Base.finish.apply( this, arguments );
    },
    
    createTestObject: function()
    {   
        // Create the test object here
        return new NoteLinkOpenPlugin();
    },

    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        objTestObject.m_objPlugged = new Display();
        objTestObject.m_objPlugged.init();
        
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
    },
    
    getExpectedListeners: function()
    {
        this.getTestObject().OnRegisterDOMEventHandlers();
        
        return { 
            registerdomeventhandlers: null,
            opennotelink: null,
            notelinkopenevent: null,
            click: null
        };
    },
        
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnLinkOpenEvent();
    },
    
    testOnLinkOpenEvent: function()
    {
        window.Ubernote = {
            m_bStandaloneEditor: false
        };

        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        objEvent.type = 'click';
        
        // test1 - clicking on non-noteid link, do nothing
        objPlugged.resetRaisedMessages();
        objEvent.target = fireunit.id( 'normallink' );
        objEvent.setPreventDefault( false );
        objTestObject.OnLinkOpenEvent( objEvent );
        fireunit.ok( objEvent.isPreventDefaulted(), 'test1: click on normal link, cancelled and opened' );
        fireunit.compare( 'http://donothing.html', this.m_strWindowOpenURL, 'test1: correct URL opened' );
        objPlugged.testRaisedMessages( {}, 'test1: no messages raised' );
                
        // test2 - clicking on noteid link, cancel event
        objPlugged.resetRaisedMessages();
        objEvent.target = fireunit.id( 'notelink' );
        objEvent.setPreventDefault( false );
        objTestObject.OnLinkOpenEvent( objEvent );
        fireunit.ok( objEvent.isPreventDefaulted(), 'test2: click on note link, event cancelled' );
        objPlugged.testRaisedMessages( {requestdisplaynotes: null}, 'test2: expecting requestdisplaynotes' );
        
        // test3 - clicking on a javascript link, do not open anything, no message raised, do not cancel.
        objPlugged.resetRaisedMessages();
        this.m_strWindowOpenURL = undefined;
        objEvent.target = fireunit.id( 'javascriptlink' );
        objEvent.setPreventDefault( false );
        objTestObject.OnLinkOpenEvent( objEvent );
        fireunit.ok( ! objEvent.isPreventDefaulted(), 'test3: click on javascript link, event not cancelled' );
        fireunit.ok( 'undefined' == typeof( this.m_strWindowOpenURL ), 'test3: no URL opened' );
        objPlugged.testRaisedMessages( {}, 'test3: no expected messages' );
        
        // test4 - clicking on noteid link, but already in external window, should call window.open
        objPlugged.resetRaisedMessages();
        window.Ubernote = {
            m_bStandaloneEditor: true
        };

        objEvent.target = fireunit.id( 'notelink' );
        objEvent.setPreventDefault( false );
        objTestObject.OnLinkOpenEvent( objEvent );
        fireunit.ok( objEvent.isPreventDefaulted(), 'test4: click on note link, event cancelled' );
        objPlugged.testRaisedMessages( { requestnoteexternal: null }, 'test4' );
    }
} );



