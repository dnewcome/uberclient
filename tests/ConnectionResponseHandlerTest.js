
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ConnectionResponseHandlerTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ConnectionResponseHandler();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_n404Threshold: 2 } ] );
    },
    
    getExpectedListeners: function()
    {
        return {
            ajaxresponse: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        this.testOnResponse();
    },
    
    testOnResponse: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - test nominal 200 case
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 200 }, 'testservice' );
        objTestObject.testRaisedMessages( {}, 'test1: 200 status, do nothing' );
        
        // test2 - test 404 case 1
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 404 }, 'testservice' );
        objTestObject.testRaisedMessages( {}, 'test2: 404 status, do nothing yet' );

        // test3 - test 404 case 2 (triggers offline)
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 404 }, 'testservice' );
        objTestObject.testRaisedMessages( { offline: null }, 'test3: 404 status, offline started' );

        // test4 - test 200 case (triggers online)
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 200 }, 'testservice' );
        objTestObject.testRaisedMessages( { online: null }, 'test4: 200 status, online started again' );

        // test4a - test 200 case - second 200 after offline, should do nothing
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 200 }, 'testservice' );
        objTestObject.testRaisedMessages( {}, 'test4a: 200 status, no message expected' );
        
        // test5 - test 300 - should raise raiserror.
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 300 }, 'testservice' );
        objTestObject.testRaisedMessages( { raiseerror: null }, 'test5: 300 status, error raised' );

        // test6 - test 300 - userSessionLog - nothing raised.
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 300 }, 'userSessionLog' );
        objTestObject.testRaisedMessages( {}, 'test6: 300 status, nothing raised for userSessionLog' );

        // test7 - test 300 - GetActivityUpdates - nothing raised.
        objTestObject.resetRaisedMessages();
        objTestObject.OnResponse(  { status: 300 }, 'GetActivityUpdates?testdate' );
        objTestObject.testRaisedMessages( {}, 'test7: 300 status, nothing raised for GetActivityUpdates' );
    }
} );



