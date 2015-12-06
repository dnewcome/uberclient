
function UnitTestHarness()
{
	this.m_objTestData = { testmodel: null };

	UnitTestHarness.Base.constructor.apply( this, arguments );
	this.m_strTestName = 'SharesTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
	createTestObject: function()
	{   // Create the test object here
		return new Shares();
	},

	initTestObject: function()
	{
        this.m_objContacts = new MetaTags();
        this.m_objContacts.init();
        
		UnitTestHarness.Base.initTestObject.apply( this, [ { m_strModelType: 'sharedbyperuser', m_objContacts: this.m_objContacts} ] );

		var objTestObject = this.getTestObject();
		objTestObject._createModelFromItem = function( in_objData ) { return in_objData; };
		
		this.m_objShareModel = {
			m_strName: 'originalsharename',
			getName: function(){ return this.m_strName; },
			setName: function( in_strName ) { this.m_strName = in_strName; }
		};
		objTestObject.getByID = function( in_strID ) { return this.m_objShareModel; }.bind( this );
	},
	
	test: function()
	{
		UnitTestHarness.Base.test.apply( this, arguments );
		this.testDbAdd();
	},

	getExpectedListeners: function()
	{
		return { 
            requestnotessharedbyperuser: null
		};
	},

	testDbAdd: function()
	{
		var objTestObject = this.getTestObject();
		
		// test1 - make sure a model was made how we want it to be.
		var objModel = objTestObject.dbAdd( this.m_objTestData );
        
        // Note_Count and Type are added to the model to override defaults.
        this.m_objTestData.Note_Count = 0;
        this.m_objTestData.Type = 'sharedbyperuser';
		fireunit.ok( Object.equalValues( this.m_objTestData, objModel ), 'test1: model created' );
	}
} );



