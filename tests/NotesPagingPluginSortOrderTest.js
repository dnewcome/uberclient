/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NotesPagingPluginSortOrderTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NotesPagingSortOrderPlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.m_objPlugged = new Display();
        objTestObject.m_objPlugged.m_objConfig = {};
        
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
    },
    
    getExpectedListeners: function()
    {
        return {
            displaynotes: null,
            configchange: null,
            childinitialization: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testSortOrderClassNames();
        this.testSortOrderEnabled();
    },
    
    testSortOrderClassNames: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        // test1 - make sure that initial classname is added
        objPlugged.m_objConfig.sortorder = 'classname1';
        objTestObject.OnDisplayNotes( {} );
        fireunit.ok( fireunit.id( 'container' ).hasClassName( 'classname1' ), 'test1: has classname1' );

        // test2 - update, make sure old classname is taken off and new one put on.
        objPlugged.m_objConfig.sortorder = 'classname2';
        objTestObject.OnDisplayNotes( {} );
        fireunit.ok( ! fireunit.id( 'container' ).hasClassName( 'classname1' ), 'test2: classname1 removed' );
        fireunit.ok( fireunit.id( 'container' ).hasClassName( 'classname2' ), 'test2: has classname2' );
    },
    
    testSortOrderEnabled: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test0 - sort order is disabled if there is no noteids
        objTestObject.OnConfigChange( {} );
        objTestObject.OnDisplayNotes( {} );
        fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'sortorderenabled' ), 'test0: has not sort order enabled' );
        
        // test1 - single note view does not have it.
        objTestObject.OnConfigChange( {} ); // enable first
        objTestObject.OnConfigChange( { noteid: 'noteid1' } );
        objTestObject.OnDisplayNotes( { noteid: 'noteid1' } );
        fireunit.ok( ! fireunit.id( 'container' ).hasClassName( 'sortorderenabled' ), 'test1: does not have sortorder enabled' );

        // test2 - selected notes view does not have it.
        objTestObject.OnConfigChange( {} ); // enable first
        objTestObject.OnConfigChange( { noteids: [ 'noteid', 'noteid2' ] } );
        objTestObject.OnDisplayNotes( { noteids: [ 'noteid', 'noteid2' ] } );
        fireunit.ok( ! fireunit.id( 'container' ).hasClassName( 'sortorderenabled' ), 'test2: does not have sortorder enabled' );

        // test3 - if there is a total count that is <= 1.
        objTestObject.OnDisplayNotes( {} ); // enable first
        objTestObject.OnConfigChange( { totalcount: 1 } ); // enable first
        objTestObject.OnDisplayNotes( { totalcount: 1 } );
        fireunit.ok( ! fireunit.id( 'container' ).hasClassName( 'sortorderenabled' ), 'test3: does not have sortorder enabled' );

        // test4 - if there is a total count that is <= 1.
        objTestObject.OnDisplayNotes( {} ); // enable first
        objTestObject.OnConfigChange( { totalcount: 0 } ); // enable first
        objTestObject.OnDisplayNotes( { totalcount: 0 } );
        fireunit.ok( ! fireunit.id( 'container' ).hasClassName( 'sortorderenabled' ), 'test4: does not have sortorder enabled' );

    }
    
} );



