function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListCollapsePluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ListCollapsePlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.m_objPlugged = new ListDisplay();
        
        UnitTestHarness.Base.initTestObject.apply( this );
    },
    
    getExpectedListeners: function()
    {
        return { collapselist: null,
            onshow: null,
            uncollapselist: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnCollapse();
        this.testOnReset();
    },
    
    testOnCollapse: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - see one item shown        
        objTestObject.OnCollapse( [ { id: 'testitem2' } ] );
        fireunit.ok( objPlugged.m_astrShownItems.length == 1, 'test1:  one item shown' );
        fireunit.ok( objPlugged.m_astrShownItems[ 0 ] == 'testitem2', 'test1:  testitem2 shown' );

        // test3 - see two items shown.
        objTestObject.OnCollapse( [ { id: 'testitem1' }, { id: 'testitem3' } ] );
        fireunit.ok( objPlugged.m_astrShownItems.length == 2, 'test2:  two items shown' );
        fireunit.ok( -1 != objPlugged.m_astrShownItems.indexOf( 'testitem1' ), 'test2:  testitem1 shown' );
        fireunit.ok( -1 != objPlugged.m_astrShownItems.indexOf( 'testitem3' ), 'test2:  testitem3 shown' );
    },
    
    testOnReset: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.OnReset();
    }
} );
