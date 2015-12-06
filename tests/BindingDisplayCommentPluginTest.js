/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'BindingDisplayCommentPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new BindingDisplayCommentPlugin();
    },
	
	initTestObject: function()
	{
		var objTestObject = this.getTestObject();
		objTestObject.m_objPlugged = new BindingDisplay();
		
		UnitTestHarness.Base.initTestObject.apply( this, [ { m_strUserName: 'testuser' } ] );
	},

	getExpectedConfig: function()
	{
		return {
			m_strUserName: null
		};
	},
	
	getExpectedListeners: function()
	{
		return {
			loaddataobject: null
		};
	},
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
		
		this.testOnLoadDataObject();
    },
	
	testOnLoadDataObject: function()
	{
		var objTestObject = this.getTestObject();
		
		// test1 - not the owner, make sure we do not have the class
		var objExtraInfo = { Name: 'otherowner' };
		objTestObject.m_objPlugged.setExtraInfo( objExtraInfo );
		objTestObject.OnLoadDataObject();
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'commentowner' ), 'test1: not the comment owner' );
		
		// test2 - is the comment owner, make sure commentowner is on the classnames.
		var objExtraInfo = { Name: 'testuser' };
		objTestObject.m_objPlugged.setExtraInfo( objExtraInfo );
		objTestObject.OnLoadDataObject();
		fireunit.ok( fireunit.id( 'container' ).hasClassName( 'commentowner' ), 'test2: is the comment owner' );

		// test3 - not the owner, make sure the classname is removed
		var objExtraInfo = { Name: 'otherowner' };
		objTestObject.m_objPlugged.setExtraInfo( objExtraInfo );
		objTestObject.OnLoadDataObject();
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'commentowner' ), 'test3: not the comment owner' );
	}
} );



