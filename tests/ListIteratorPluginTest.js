/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListIteratorPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ListIteratorPlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = new ListDisplay();
        objTestObject.setPlugged( objPlugged );

        objPlugged.init();
        
        UnitTestHarness.Base.initTestObject.apply( this );
        
        objPlugged.addElement( 'listitem1', fireunit.id( 'listitem1' ) );
        objPlugged.addElement( 'listitem2', fireunit.id( 'listitem2' ) );
        objPlugged.addElement( 'listitem3', fireunit.id( 'listitem3' ) );
    },
    
    getExpectedListeners: function()
    {
        return {
            clicknextlistitem: null,
            clickpreviouslistitem: null,
            clickcurrentlistitem: null,
            listitemclick: null,
            onshow: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        this.testOnListItemSet();
        this.testSetNext();
        this.testSetPrevious();
    },
    
    testOnListItemSet: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - set to listitem1
        objTestObject.OnListItemSet( 'listitem1' );
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test1: m_nCurrItemIndex set to 0' );
        
        // test2 - set back to -1
        objTestObject.OnListItemSet();
        fireunit.ok( -1 == objTestObject.m_nCurrItemIndex, 'test2: m_nCurrItemIndex set to -1' );
    },
    
    testSetNext: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - nothing has been set yet, should go to item 1.
        objTestObject.setNext();
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test1: no item previously set, going to 0' );
        
        // test2 - go to item2
        objTestObject.setNext();
        fireunit.ok( 1 == objTestObject.m_nCurrItemIndex, 'test2: going to item2' );

        // test3 - go to item3
        objTestObject.setNext();
        fireunit.ok( 2 == objTestObject.m_nCurrItemIndex, 'test3: going to item3' );

        // test4 - stay at item3
        objTestObject.setNext();
        fireunit.ok( 2 == objTestObject.m_nCurrItemIndex, 'test4: staying at item3' );
        
        // test5 - test whether we go to item 2 or 3 if item 2 is hidden.
        objTestObject.OnListItemSet( 'listitem1' );  // resets the iterator.
        fireunit.id( 'listitem2' ).style.display = 'none';
        objTestObject.setNext();
        fireunit.ok( 2 == objTestObject.m_nCurrItemIndex, 'test5: going it item3' );

        fireunit.id( 'listitem2' ).style.display = 'block';
    },
    
    testSetPrevious: function()
    {
        // We are assuming testSetNext has been run before this and we
        //  are at listitem3 already.
        
        var objTestObject = this.getTestObject();
        
        // test1 - go to item2.  
        objTestObject.setPrevious();
        fireunit.ok( 1 == objTestObject.m_nCurrItemIndex, 'test1: going to item2' );

        // test2 - go to item1
        objTestObject.setPrevious();
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test1: going to item1' );

        // test3 - stay at item1        
        objTestObject.setPrevious();
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test1: staying at item1' );

        // test4 - nothing has been set yet, should go to item 1.
        objTestObject.OnListItemSet();  // resets the iterator.
        objTestObject.setPrevious();
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test1: going to item0, nothing previously set' );

        // test5 - test whether we go to item 2 or 1 if item 2 is hidden.
        objTestObject.OnListItemSet( 'listitem3' );  // resets the iterator.
        fireunit.id( 'listitem2' ).style.display = 'none';
        objTestObject.setPrevious();
        
        fireunit.ok( 0 == objTestObject.m_nCurrItemIndex, 'test5: going it item1' );

        fireunit.id( 'listitem2' ).style.display = 'block';
    }
    
} );



