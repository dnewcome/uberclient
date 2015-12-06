/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'Override this TestName';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new UberObject();
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        // Perform any tests below here
        this.sampleTest1();
    },
    
    sampleTest1: function() 
    {
        fireunit.ok( true, 'this is sampletest1' );
    }
} );



