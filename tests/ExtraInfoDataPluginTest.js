function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ExtraInfoDataPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ExtraInfoDataPlugin();
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );

        this.testUpdateElementNumberZeroForValue();
	},
    
    getExpectedListeners: function()
    {
        return { 
            loaddataobject: null,
            domavailable: null 
        };
    },

    /*
    * testUpdateElementNumberZeroForValue
    *   test to see if the element's type is set to number and the data for that number is 0, 
    *   that we put a "0" in the element and not empty.
    */    
    testUpdateElementNumberZeroForValue: function()
    {
        var objTestObject = this.getTestObject();
        var objElement = fireunit.id( 'elementTestTemplate' );
        objElement.setAttribute( '_dataField', 'Test_Data' );
        objElement.setAttribute( '_type', 'number' );
        
        var objTestData = { Test_Data: 0 };
        
        // test1 - make sure innerHTML set to 0.
        objTestObject._updateElement( objElement, objTestData );
        fireunit.compare( '0', objElement.innerHTML, 'test1: InnerHTML set to "0"' );
    }
} );



