function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ContactsTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new Contacts();
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
    
		this.testDbAdd();
    },
	
	testDbAdd: function()
	{
		var objTestObject = this.getTestObject();
	}
} );



