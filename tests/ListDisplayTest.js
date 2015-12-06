/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListDisplayTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ListDisplay();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this );
        
        var objTestObject = this.getTestObject();
        objTestObject.setDomContainer( fireunit.id( 'list' ) );

        objTestObject.addHTMLItem( 'listitem1', fireunit.id( 'listitem1' ) );
        objTestObject.addHTMLItem( 'listitem2', fireunit.id( 'listitem2' ) );
        objTestObject.addHTMLItem( 'listitem3', fireunit.id( 'listitem3' ) );
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testGetElementForItem();
        this.testGetElementByIndex();
        this.testGetElementById();
        this.testHideAll();
        this.testShowItems();
    },
    
    testGetElementForItem: function()
    {
        var objTestObject = this.getTestObject();
        
        var objElementListItem1 = fireunit.id( 'listitem1' );
        var objItem = {};
        objItem.$ = function() { return objElementListItem1; };
        
        // test1 - find the container element
        var objElement = objTestObject.getElementForItem( objItem );
        fireunit.compare( 'listitem1', objElement && objElement.id, 'test1: go the right container element' );
        
        // test2 - find the sub-element
        var objElement = objTestObject.getElementForItem( objItem, '#subitem1' );
        fireunit.compare( 'subitem1', objElement && objElement.id, 'test2: find the subelement' );
    },
    
    testGetElementByIndex: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - try for index 0
        var objElement = objTestObject.getElementByIndex( 0 );
        fireunit.compare( 'listitem1', objElement && objElement.id, 'test1: get index 0' );

        // test2 - try for index 2
        var objElement = objTestObject.getElementByIndex( 2 );
        fireunit.compare( 'listitem3', objElement && objElement.id, 'test2: get index 2' );
    },
    
    testGetElementById: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - try for listitem1
        var objElement = objTestObject.getElementByID( 'listitem1' );
        fireunit.compare( 'listitem1', objElement && objElement.id, 'test1: get listitem1' );

        // test2 - try for listitem3
        var objElement = objTestObject.getElementByID( 'listitem3' );
        fireunit.compare( 'listitem3', objElement && objElement.id, 'test2: get listitem3' );
    },
    
    testHideAll: function()
    {
        var objTestObject = this.getTestObject();

        for( var nIndex = 0, objElement; objElement = objTestObject.getElementByIndex( nIndex ); ++nIndex )
        {   // ensure all elements are shown.
            objElement.show();
        } // end for
        
        // test whether all items are hidden
        objTestObject.hideAll();

        for( var nIndex = 0, objElement; objElement = objTestObject.getElementByIndex( nIndex ); ++nIndex )
        {
            fireunit.ok( !objElement.visible(), 'test' + ( nIndex + 1 ).toString() + ': Element hidden' );
        } // end for
    },

    testShowItems: function()
    {
        var objTestObject = this.getTestObject();

        for( var nIndex = 0, objElement; objElement = objTestObject.getElementByIndex( nIndex ); ++nIndex )
        {   // ensure all elements are shown.
            objElement.show();
        } // end for
        
        /*objTestObject.showItems( [ 'listitem1', 'listitem3' ] );
        
        // test to see the specified items are shown and the listitem2 is hidden.
        fireunit.ok( objTestObject.getElementByID( 'listitem1' ).visible(), 'test1: listitem1 shown' );
        fireunit.ok( !objTestObject.getElementByID( 'listitem2' ).visible(), 'test1: listitem2 not shown' );
        fireunit.ok( objTestObject.getElementByID( 'listitem3' ).visible(), 'test1: listitem3 shown' );
        */
    }    
    
} );



