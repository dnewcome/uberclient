function UnitTest()
{
    var objTest = new UnitTestHarness();
    objTest.run();
};

function UberUnitTest()
{
    this.m_strTestName = 'm_strTestName needs overriden';
};

Object.extend( UberUnitTest.prototype, {
    run: function()
    {
        this.init();
        this.m_objTestObject = this.createTestObject();
        this.initTestObject();
        this.testExpectedConfig();
        this.testExpectedFunctions();
        this.testChainedFunctions();
        this.testExpectedListeners();
        this.test();
        this.finish();
    },
    
    init: function()
    {
        try
        {
            document.title = this.m_strTestName + ' Test';
            fireunit.log( 'begin ' + this.m_strTestName + ' Test' );
        } catch(e)
        {
            document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        } // end try-catch
    },
    
    /**
    * createTestObject - creates the test object, must be overriden.  Must
    *   return the created test object.
    * @returns {Object} - created test object.
    */
    createTestObject: function()
    {
        fireunit.ok( false, 'createTestObject MUST be overridden in the test' );
    },
    
    /**
    * initTestObject - initializes the test object, passes any parameters 
    *   given to initTestObject to the init function.
    */
    initTestObject: function()
    {
        if( this.m_objTestObject )
        {
            if( this.m_objTestObject.init )
            {
                this.m_objTestObject.init.apply( this.m_objTestObject, arguments );
            } // end if
            else
            {
                fireunit.log( 'testunit has no init function' );
            }
        } // end if
        else
        {
            fireunit.ok( false, 'test object not created' );
        } // end if-else
    },
    
    /**
    * getTestObject - returns the object being tested.
    * @returns {Object} - returns the object created in createTestObject.
    */
    getTestObject: function()
    {
        return this.m_objTestObject;
    },
    
    /** 
    * testChainedFunctions - Tests to see that functions that init functions that 
    *   are normally chained together are really chained together.
    */
    testChainedFunctions: function()
    {
        var objTestObject = this.m_objTestObject;
        fireunit.ok( objTestObject.m_bConstructorChained, 'constructors all chained together' );
        fireunit.ok( objTestObject.m_bInitChained, 'inits all chained together' );
        fireunit.ok( objTestObject.m_bLoadConfigParamsChained, 'loadConfigParams all chained together' );
        fireunit.ok( objTestObject.m_bRegisterMessageHandlersChained, 'RegisterMessageHandlers chained together' );
    },
    
    /**
    * getExpectedConfig - override this to return the expected configuration.
    *   the key of the object should be the field name.
    */
    getExpectedConfig: function()
    {
        return {};
    },
    
    testExpectedConfig: function()
    {
        var objConfig = this.getExpectedConfig();
        var objTestObject = this.getTestObject();
        
        for( var strKey in objConfig )
        {
            fireunit.ok( TypeCheck.Defined( objTestObject[ strKey ] ), 'configuration item: ' + strKey + ' found.' );
        } // end for
    },
    
    /**
    * testExpectedFunctions - should be overridden in a test - checks to make sure functions exist.
    */
    testExpectedFunctions: function() {},
    
    /**
    * finish - finishes off the test by calling fireunit.testDone.
    */
    finish: function()
    {
        // Wait for asynchronous operation.
        var me=this;
        setTimeout(function(){
            // Finish test
            fireunit.testDone();
            var objReRun = document.createElement( 'a' );
            objReRun.innerHTML = 'Rerun ' + ( me.m_strTestName || 'test' );
            objReRun.href = document.location.href;
            var objListItem = document.createElement( 'li' );
            objListItem.appendChild( objReRun );
            document.body.appendChild( objListItem );

            var objMainMenu = document.createElement( 'a' );
            objMainMenu.innerHTML = 'Main Menu';
            objMainMenu.href = 'UberTestSuite.htm';
            var objListItem = document.createElement( 'li' );
            objListItem.appendChild( objMainMenu );
            document.body.appendChild( objListItem );
        }, 1000);
    },
    
    /**
    * test - runs the test.  Should usually be overridden by the test.
    */
    test: function() {},
    
    /**
    * getExpectedListeners - returns the list of messages that should be registered on the object.
    * @returns {Object} - list of messages that are expected to be registered on the test object
    *   for this test.
    *   format is:
    */
    getExpectedListeners: function() {},
    
    /**
    * testExpectedListeners - tests that the messages returned by
    *   getExpectedMessages (overriden in the test) have been registered.
    */ 
    testExpectedListeners: function()
    {
        var objExpected = this.getExpectedListeners();
        
        if( objExpected )
        {
            this.m_objTestObject.testExpectedListeners( objExpected );
        } // end if
        else
        {
            fireunit.log( this.m_strTestName + ': no expected messages setup' );
        } // end if-else
    }
    
} );