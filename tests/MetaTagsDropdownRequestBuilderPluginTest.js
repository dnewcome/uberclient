
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'MetaTagsListRequestBuilderPlugin';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new MetaTagsDropdownRequestBuilderPlugin();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_strCollectionID: 'tagged' } ] );
    },
    
    getExpectedListeners: function()
    {
        return {
            createrequest: null,
            tagrequest: null,
            untagrequest: null,
            cancelrequest: null,
            applyrequests: null,
            show: null,
            contextset: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnContextSet();
        this.testOnCreate();
        this.testOnTag();
        this.testOnUnTag();
        this.testOnCancel();
        this.testOnApplyRequests();
    },
    
    testOnTag: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - try to 'addtaggedbinding' a tag.
        objTestObject._resetRequests();
        objTestObject.OnTag( 'id1' );
        var strAction =  objTestObject._getRequest( 'id1' );
        fireunit.compare( 'addtaggedbinding', strAction, 'test1: tag action correctly set' );
        
        // test2 - try to untag and then tag 
        objTestObject._resetRequests();
        objTestObject.OnUnTag( 'id2' );
        objTestObject.OnTag( 'id2' );
        var strAction =  objTestObject._getRequest( 'id2' );
        fireunit.compare( 'addtaggedbinding', strAction, 'test2: tag action correctly set' );
    },
    
    testOnUnTag: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - try to 'removetaggedbinding' a tag.
        objTestObject._resetRequests();
        objTestObject.OnUnTag( 'id1' );
        var strAction =  objTestObject._getRequest( 'id1' );
        fireunit.compare( 'removetaggedbinding', strAction, 'test1: untag action correctly set' );
        
        // test2 - try to tag and then untag 
        objTestObject._resetRequests();
        objTestObject.OnTag( 'id2' );
        objTestObject.OnUnTag( 'id2' );
        var strAction =  objTestObject._getRequest( 'id2' );
        fireunit.compare( 'removetaggedbinding', strAction, 'test2: untag action correctly set' );
        
    },
    
    testOnCreate: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - create a new tag
        objTestObject._resetRequests();
        objTestObject.OnCreate( 'name1' );
        var strAction =  objTestObject._getRequest( 'name1' );
        fireunit.compare( 'createtagged', strAction, 'test1: note can be created' );
    },
    
    testOnCancel: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - remove a 'modify' request.
        objTestObject._resetRequests();
        objTestObject.OnTag( 'id1' );
        objTestObject.OnCancel( 'id1' );
        var strAction = objTestObject._getRequest( 'id1' );
        fireunit.ok( !strAction, 'test1: update request successfully removed' );

        // test2 - remove an 'add' request.
        objTestObject._resetRequests();
        objTestObject.OnCreate( 'id2' );
        objTestObject.OnCancel( 'id2' );
        var strAction = objTestObject._getRequest( 'id2' );
        fireunit.ok( !strAction, 'test2: create request successfully removed' );
        
        // test3 - remove a non-existent request.
        objTestObject._resetRequests();
        objTestObject.OnCancel( 'id2' );
        var strAction = objTestObject._getRequest( 'id2' );
        fireunit.ok( !strAction, 'test3: non-existent request removal success' );
    },
    
    testOnApplyRequests: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        // test1 - try to 'addtaggedbinding' a tag.
        objPlugged.resetRaisedMessages();
        objTestObject._resetRequests();
        objTestObject.OnTag( 'id1' );
        objTestObject.OnApplyRequests();
        objPlugged.testRaisedMessages( { addtaggedbinding: null }, 'test1' );
        var objRequests = objTestObject._getRequests();
        fireunit.ok( !Util.objectHasProperties( objRequests ), 'test1: requests are cleared after apply' );
        
        // test2 - try to 'removetaggedbinding' a tag.
        objPlugged.resetRaisedMessages();
        objTestObject.OnUnTag( 'id1' );
        objTestObject.OnApplyRequests();
        objPlugged.testRaisedMessages( { removetaggedbinding: null }, 'test2' );

        // test3 - try to create a tag.
        objPlugged.resetRaisedMessages();
        objTestObject.OnCreate( 'name1' );
        objTestObject.OnApplyRequests();
        objPlugged.testRaisedMessages( { createtagged: null }, 'test3' );

        // test4 - try to 'addtaggedbinding' and 'removetaggedbinding'.
        objPlugged.resetRaisedMessages();
        objTestObject.OnTag( 'id1' );
        objTestObject.OnUnTag( 'id2' );
        objTestObject.OnApplyRequests();
        objPlugged.testRaisedMessages( { addtaggedbinding: null , removetaggedbinding: null }, 'test4' );
    },
    
    testOnContextSet: function()
    {
        // test1 - make sure the context change works.
        var objTestObject = this.getTestObject();
        objTestObject.OnContextSet( 'testid1' );
        fireunit.compare( 'testid1', objTestObject._getContextID(), 'test1: context id set correctly' );
    }
} );
