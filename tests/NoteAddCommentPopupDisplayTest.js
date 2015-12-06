/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteAddCommentPopupDisplayTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new NoteAddCommentPopupDisplay();
    },
    
    initTestObject: function()
    {
        this.m_objPopup = new Display();
        this.m_strHeader;
        this.m_strValue;
        this.m_strOKText = 'origoktext';
        
        this.m_objPopup.setHeader = function( in_strHeader ) { this.m_strHeader = in_strHeader; }.bind( this );
        this.m_objPopup.setValue = function( in_strValue ) { this.m_strValue = in_strValue; }.bind( this );
        this.m_objPopup.setOKText = function( in_strValue ) { this.m_strOKText = in_strValue; }.bind( this );
        this.m_objPopup.getOKText = function() { return this.m_strOKText }.bind( this );
        
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_objPopup: this.m_objPopup } ] );
    },
    
    getExpectedConfig: function()
    {
        return {
            m_objPopup: null
        };
    },
    
    getExpectedListeners: function()
    {
        var objTestObject = this.getTestObject();
        
        return { 
            addcommentshow: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnAddCommentShow();
        this.testOnCommentAdd();
		
		this.testOnHide();
    },
    
    testOnAddCommentShow: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        objEvent.target = fireunit.id( 'container' );

        objTestObject.OnAddCommentShow( 'noteid1', objEvent );
        fireunit.ok( this.m_objPopup.m_bShown, 'test1: popup is shown' );
        fireunit.compare( _localStrings.ADD_COMMENT, this.m_strHeader, 'test1: header set correctly' );
        fireunit.compare( _localStrings.ADD_COMMENT, this.m_strOKText, 'test1: OK Button set correctly' );
        fireunit.compare( '', this.m_strValue, 'test1: content cleared' );
        
        objTestObject.testExpectedListeners( {
            addcommentshow: null,
            textinputcancelled: null,
            textinputsubmit: null
        } );
    },
    
    testOnCommentAdd: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        objEvent.target = fireunit.id( 'container' );
        
        // reset this so we have known text
        this.m_strOKText = 'origoktext';
        
        // test1 - test an empty string
        objTestObject.OnAddCommentShow( 'noteid1', objEvent );
        objTestObject.resetRaisedMessages();
        objTestObject.OnCommentAdd( '' );
        objTestObject.testRaisedMessages( { forcefocus: null }, 'test1' );
        fireunit.ok( !this.m_objPopup.m_bShown, 'test1: popup hidden' );
        
        // test2 - test a non-empty string
        objTestObject.OnAddCommentShow( 'noteid1', objEvent );
        objTestObject.resetRaisedMessages();
        objTestObject.OnCommentAdd( 'comment2' );
        objTestObject.testRaisedMessages( { forcefocus: null, requestcommentadd: null }, 'test2' );
        fireunit.ok( !this.m_objPopup.m_bShown, 'test2: popup hidden' );
        
        objTestObject.testExpectedListeners( {
            addcommentshow: null
        } );
    },
	
	testOnHide: function()
	{
		var objTestObject = this.getTestObject();
		
		objTestObject.resetRaisedMessages();
		objTestObject.OnHide();
		objTestObject.testRaisedMessages( { forcefocus: null }, 'test1' );
	}
} );



