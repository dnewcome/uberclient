function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'BatchTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new BatchPlugin();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ {
            m_strMessageForAdd: 'addmessage',
            m_strMessageToRaise: 'messageraised',
            m_nInterval: 100,
            m_nTimeout: 100
        } ] );
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testIntervalStarted();
        this.testGetBatch();
        this.testAdd();
        this.testProcess();
        this.testAddSecondSet();
    },
    
    getExpectedConfig: function()
    {
        var objRetVal = {
            m_strMessageForAdd: true,
            m_strMessageToRaise: true,
            m_nInterval: true,
            m_nTimeout: true
        };
        
        return objRetVal;
    },

    getExpectedListeners: function()
    {
        return {
            addmessage: null
        };
    },
    
    testIntervalStarted: function()
    {
        var objTestObject = this.getTestObject();
        var objInterval = objTestObject.m_objInterval;
        
        fireunit.ok( TypeCheck.Defined( objInterval ), 'interval supposedly exists' );
        fireunit.ok( Timeout.getTimeout( objInterval ), 'interval valid' );
    },
    
    testGetBatch: function()
    {
        var objTestObject = this.getTestObject();
        var objBatch = objTestObject.getBatch();
        
        fireunit.ok( TypeCheck.Object( objBatch ), 'test1: getBatch returns an object' );
    },
    
    testAdd: function()
    {
        var objTestObject = this.getTestObject();
        var objBatch;
        
        fireunit.ok( !objTestObject.m_objTimeout, 'test1: no timeout set' );
        // Test to see if the addItem adds the stuff we need.
        objTestObject.addItem( '1' );
        objBatch = objTestObject.getBatch();
        fireunit.ok( '1' in objBatch, 'test2: 1 is in batch' );
        fireunit.ok( !( '2' in objBatch ), 'test3: 2 is not in batch' );        
        var objTimeout = objTestObject.m_objTimeout;
        fireunit.ok( objTimeout, 'test4: timeout now set' );
        
        objTestObject.addItem( '2' );
        objBatch = objTestObject.getBatch();
        fireunit.ok( '1' in objBatch, 'test5: 1 is in batch' );
        fireunit.ok( '2' in objBatch, 'test6: 2 is in batch' );        
        var objTimeout2 = objTestObject.m_objTimeout;
        fireunit.ok( objTimeout == objTimeout2, 'test7: timeout stays the same' );
    },
    
    testProcess: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        // Make sure no messages are raised.
        objPlugged.testRaisedMessages( {} );
        objTestObject.process();
        objPlugged.testRaisedMessages( { messageraised: null } );
        
        // test1/2 - make sure the 1/2 are not in the batch anymore and list was really cleared.
        var objBatch = objTestObject.getBatch();
        fireunit.ok( ! ( '1' in objBatch ), 'test1: 1 is not in batch, correctly removed' );
        fireunit.ok( ! ( '2' in objBatch ), 'test2: 2 is not in batch, correctly removed' );        
        
        var objTimeout = objTestObject.m_objTimeout;
        fireunit.ok( !objTimeout, 'test3: timeout is cleared' );
    },

    testAddSecondSet: function()
    {
        var objTestObject = this.getTestObject();
        var objBatch;
        
        // Test to see if we can add a second set that includes some 
        //  members of the first set, as well as some new ones.
        fireunit.ok( !objTestObject.m_objTimeout, 'test1: no timeout set' );
        objTestObject.addItem( '2' );
        var objTimeout1 = objTestObject.m_objTimeout;
        fireunit.ok( objTimeout1, 'test1: timeout set' );
        objTestObject.addItem( '3' );
        objTestObject.addItem( '4' );
        objBatch = objTestObject.getBatch();
        fireunit.ok( !( '1' in objBatch ), 'test2: 1 is not in batch' );
        fireunit.ok( '2' in objBatch, 'test3: 2 is in batch' );        
        fireunit.ok( '3' in objBatch, 'test4: 3 is in batch' );
        fireunit.ok( '4' in objBatch, 'test5: 4 is in batch' );        
        var objTimeout2 = objTestObject.m_objTimeout;
        fireunit.ok( objTimeout2 == objTimeout1, 'test6: timeouts are the same' );
    }
    
    
} );



