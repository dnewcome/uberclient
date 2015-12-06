/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'MetaTagPluginTitleTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new MetaTagTitlePlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        objTestObject.m_objPlugged = new BindingDisplay();
        
        UnitTestHarness.Base.initTestObject.apply( this );
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
        this.testOnLoadData();
    },
    
    testOnLoadData: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        // test1 - see if the title was set
        objPlugged.setExtraInfo( { Name: 'testtag', Note_Count: 5 }  );
        objTestObject.OnLoadData();
        fireunit.compare( 'testtag (5)', fireunit.id( 'container' ).getAttribute( 'title' ), 'test1 - title set correctly' );

        // test2 - try a different title.
        objPlugged.setExtraInfo( { Name: 'testtag2', Note_Count: 7 }  );
        objTestObject.OnLoadData();
        fireunit.compare( 'testtag2 (7)', fireunit.id( 'container' ).getAttribute( 'title' ), 'test2 - title set correctly' );
    }
} );



