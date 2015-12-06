
function UnitTest()
{
    var objTest = new ListClassnamePluginTest();
    objTest.run();
};

function ListClassnamePluginTest()
{
    ListClassnamePluginTest.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListClassnamePluginTest';
};
UberObject.Base( ListClassnamePluginTest, UberUnitTest );

Object.extend( ListClassnamePluginTest.prototype, {
    getExpectedListeners: function() {
        return {
            addclassname: null,
            removeclassname: null,
            removeallclassnames: null
        };
    },
    
    createTestObject: function()
    {
        return new ListClassnamePlugin();
    },
    
    initTestObject: function()
    {
        ListClassnamePluginTest.Base.initTestObject.apply( this, arguments );
        
        var objPlugged = this.getTestObject().getPlugged();
        // set up a test getElementByID for ListClassnamePlugin
        objPlugged.getElementByID = function( in_strItemID )
        {
            this.m_strLastGetElementID = in_strItemID;
            return fireunit.id( in_strItemID );
        };
    },
    
    test: function()
    {
        this.testAddClassName();
        
        // Run after testAddClassName so we have data set up.
        this.testRemoveClassName();

        this.testRemoveAll();
        
        ListClassnamePluginTest.Base.test.apply( this );
    },
    
    /**
    * testAddClassName - test to see if addClassName is working correctly
    */
    testAddClassName: function()
    {
        var objTestObject = this.getTestObject();
        
        fireunit.ok( TypeCheck.Function( objTestObject.addClassName ), 'addClassName function exists' );
        
        var objElement1 = fireunit.id( 'listitem1' );
        fireunit.ok( !!objElement1, 'listitem1 found' );
        var objElement2 = fireunit.id( 'listitem2' );
        fireunit.ok( !!objElement2, 'listitem2 found' );
        
        // test1 - see if we get the class name back.
        objTestObject.addClassName( 'listitem1', 'classname1' );
        fireunit.ok( objElement1.hasClassName( 'classname1' ), 'test1: listitem1 has classname1' );

        // test2 - see if we can add a second class name.
        objTestObject.addClassName( 'listitem1', 'classname2' );
        fireunit.ok( objElement1.hasClassName( 'classname2' ), 'test2: listitem1 has classname2' );
        
        // test3 - see if we still have the first class name and that it hasn't been deleted.
        fireunit.ok( objElement1.hasClassName( 'classname1' ), 'test3: listitem1 still has classname1' );
        
        // test4 - make sure that the class name has not been added to both valid elements 
        fireunit.ok( !objElement2.hasClassName( 'classname1' ), 'test4: listitem2 does not have classname1' );
        
        // test5 - see if we can adding a classname to an invalid item blows us up.
        objTestObject.addClassName( 'listitem3', 'classname3' );
    },
    
    /**
    * testRemoveClassName - test to see if removeClassName is working correctly
    */
    testRemoveClassName: function()
    {
        var objTestObject = this.getTestObject();
        
        fireunit.ok( TypeCheck.Function( objTestObject.removeClassName ), 'removeClassName function exists' );
        
        var objElement1 = fireunit.id( 'listitem1' );
        fireunit.ok( !!objElement1, 'listitem1 found' );
        
        // test1 - Make sure class name removed
        objTestObject.removeClassName( 'listitem1', 'classname1' );
        fireunit.ok( !objElement1.hasClassName( 'classname1' ), 'test1: listitem1 does not have classname1' );

        // test2 - see if we can remove a second class name.
        objTestObject.removeClassName( 'listitem1', 'classname2' );
        fireunit.ok( !objElement1.hasClassName( 'classname2' ), 'test2: listitem1 does not have classname2' );
        
        // test3 - test to see if we can remove an a classname not added by addClassName
        objTestObject.removeClassName( 'listitem1', 'testclassname' );
        fireunit.ok( objElement1.hasClassName( 'testclassname' ), 'test3: listitem1 still has testclassname' );
        
        // test4 - see if removing a classname from an item that does not have it blows up.
        objTestObject.removeClassName( 'listitem2', 'classname1' );

        // test5 - see if we can adding a classname to an invalid item blows us up.
        objTestObject.removeClassName( 'listitem3', 'classname3' );
    },
    
    testRemoveAll: function()
    {
        var objTestObject = this.getTestObject();
        
        fireunit.ok( TypeCheck.Function( objTestObject.removeAllClassNames ), 'removeAll function exists' );

        var objElement1 = fireunit.id( 'listitem1' );
        fireunit.ok( !!objElement1, 'listitem1 found' );

        var objElement2 = fireunit.id( 'listitem2' );
        fireunit.ok( !!objElement2, 'listitem2 found' );
    
        objTestObject.addClassName( 'listitem1', 'classname1' );
        objTestObject.addClassName( 'listitem1', 'classname2' );
        objTestObject.addClassName( 'listitem2', 'classname3' );
        objTestObject.addClassName( 'listitem2', 'classname4' );

        // test1/2 - See if we removed all the class names we added from listitem1
        objTestObject.removeAllClassNames( 'listitem1' );
        fireunit.ok( !objElement1.hasClassName( 'classname1' ), 'test1: classname1 removed from listitem1' );
        fireunit.ok( !objElement1.hasClassName( 'classname2' ), 'test2: classname2 removed from listitem1' );
        
        // test3/4 - make sure listitem2 is unaffected.
        fireunit.ok( objElement2.hasClassName( 'classname3' ), 'test3: classname3 still has listitem2' );
        fireunit.ok( objElement2.hasClassName( 'classname4' ), 'test4: classname4 still has listitem2' );

        objTestObject.addClassName( 'listitem1', 'classname1' );
        objTestObject.addClassName( 'listitem1', 'classname2' );

        // tests 5/6/7/8 - make sure all items actually removed 
        objTestObject.removeAllClassNames();
        fireunit.ok( !objElement1.hasClassName( 'classname1' ), 'test5: classname1 removed from listitem1' );
        fireunit.ok( !objElement1.hasClassName( 'classname2' ), 'test6: classname2 removed from listitem1' );
        fireunit.ok( !objElement2.hasClassName( 'classname3' ), 'test7: classname3 removed from listitem2' );
        fireunit.ok( !objElement2.hasClassName( 'classname4' ), 'test8: classname4 removed from listitem2' );
        

    }
    
} );