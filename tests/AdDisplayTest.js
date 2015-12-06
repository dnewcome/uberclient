function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'AdDisplayTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    init: function()
    {
        UnitTestHarness.Base.init.apply( this, arguments );
        
        this.m_objIframe = new UberObject();
        this.m_objIframe.init();
    },
    
    createTestObject: function()
    {   
        return new AdDisplay();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_strBaseURL: 'testurl.url' } ] );
        
        var objTestObject = this.getTestObject();
        var me=this;
        objTestObject.$ = function() { return me.m_objIframe; };
    },

    getExpectedConfig: function()
    {
        return {
            m_strBaseURL: null,
            m_strUpdateMessage: null
        };
    },
        
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testUpdateNoNotes();
        this.testUpdateNotes();
    },
    
    getExpectedListeners: function()
    {
        return {
            updatead: null
        };
    },

    testUpdateNoNotes: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.update( {} );
        fireunit.ok( 'testurl.url?noteids=' == this.m_objIframe.src, 'test1: no notes update correct' );
    },
    
    testUpdateNotes: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.update( { note1: null, note2: null } );
        fireunit.ok( 'testurl.url?noteids=note1,note2' == this.m_objIframe.src , 'test1: with notes update correct' );
    }
} );



