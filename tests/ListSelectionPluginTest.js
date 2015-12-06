/**
* ListSelectionPluginTest - tests the list selection plguin
*/
function UnitTestHarness()
{
    this.m_bGetElementOverride = undefined;
    
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListSelectionPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ListSelectionPlugin();
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this );

        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        this.m_bGetElementOverride = false;
        var me=this;
        objPlugged.getElementByID = function( in_strID ) {
            return me.m_bGetElementOverride ? undefined: fireunit.id( in_strID );
        };
        this.m_objIDToIndexTable = {
            listitem1: 0,
            listitem2: 1,
            listitem3: 2
        };
        objPlugged.getIndexByID = function( in_strID ) {
            return me.m_objIDToIndexTable[ in_strID ];
        };        
        
        objPlugged.getIDByIndex = function( in_nIndex ) {
            var strRetVal = undefined;
            for( var strKey in me.m_objIDToIndexTable )
            {
                if( in_nIndex === me.m_objIDToIndexTable[ strKey ] )
                {
                    strRetVal = strKey;
                    break;
                } // end if
            } // end for
            
            return strRetVal;
        };
    },
    
    
    getExpectedListeners: function()
    {
        return {
            selectall: null,
            unselectall: null,
            listitemclick: null,
            listitemremove: null,
            selectlistitem: null
        };
    },
        
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );

        this.testSelectItem();   
        this.testUnselectItem();

        this.testGetSelected();
        
        this.testOnRemoveItem();
        this.testSelectItemAddItemGetSelected();
    },
    
    testSelectItem: function()
    {
        var objTestObject = this.getTestObject();
        var objElement1 = fireunit.id( 'listitem1' );
        var objElement2 = fireunit.id( 'listitem2' );
        var objElement3 = fireunit.id( 'listitem3' );
        
        // test1 - test to see whether selectitem works and gets the right item.
        objTestObject.selectItem( 'listitem1' );
        fireunit.ok( objElement1.hasClassName( 'selected' ), 'test1: listitem1 has selected classname');
        fireunit.ok( !objElement2.hasClassName( 'selected' ), 'test1: listitem2 does not have selected classname');
        fireunit.ok( !objElement3.hasClassName( 'selected' ), 'test1: listitem3 does not have selected classname');

        // test2 - check to see if we can select the third item correctly
        objTestObject.selectItem( 'listitem3' );
        fireunit.ok( objElement1.hasClassName( 'selected' ), 'test2: listitem1 has selected classname');
        fireunit.ok( !objElement2.hasClassName( 'selected' ), 'test2: listitem2 does not have selected classname');
        fireunit.ok( objElement3.hasClassName( 'selected' ), 'test2: listitem3 has selected classname');
        
        // test3 - check to see if we can select an item, but keep the 
        //  'listitemselected' message from being raised.
        
    },
    
    testUnselectItem: function()
    {
        var objTestObject = this.getTestObject();
        var objElement1 = fireunit.id( 'listitem1' );
        var objElement2 = fireunit.id( 'listitem2' );
        var objElement3 = fireunit.id( 'listitem3' );

        // test1 - check to see if unselect works correctly
        objTestObject.unselectItem( 'listitem1' );
        fireunit.ok( !objElement1.hasClassName( 'selected' ), 'test1: listitem1 does not have selected classname');
        fireunit.ok( !objElement2.hasClassName( 'selected' ), 'test2: listitem2 does not have selected classname');
        fireunit.ok( objElement3.hasClassName( 'selected' ), 'test3: listitem3 has selected classname');
        
        objTestObject.unselectItem( 'listitem3' );
        fireunit.ok( !objElement1.hasClassName( 'selected' ), 'test4: listitem1 does not have selected classname');
        fireunit.ok( !objElement2.hasClassName( 'selected' ), 'test5: listitem2 does not have selected classname');
        fireunit.ok( !objElement3.hasClassName( 'selected' ), 'test6: listitem3 does not have selected classname');
        
        // Check to see that we don't blow up if we have a missing element (element removed)
        objTestObject.selectItem( 'listitem1' );
        // force the element to be not found.
        this.m_bGetElementOverride = true;
        objTestObject.unselectItem( 'listitem1' );
        fireunit.ok( objElement1.hasClassName( 'selected' ), 'test7: listitem1 has selected classname');
    },
    
    testGetSelected: function()
    {   
        this.m_bGetElementOverride = false;

        var objTestObject = this.getTestObject();
        objTestObject.unselectItem( 'listitem1' );
        objTestObject.unselectItem( 'listitem2' );
        objTestObject.unselectItem( 'listitem3' );
        
        // Test1 - see if the function exists
        fireunit.ok( TypeCheck.Function( objTestObject.getSelected ), 'test1: getSelected function exists' );
        
        // test2 - see if the return value is correct.
        var objSelectedItems = Object.clone( objTestObject.getSelected() );
        fireunit.ok( TypeCheck.Object( objSelectedItems ), 'test2: getSelectedItems returns an object' );
        
        // test3 - see if we get the items back, and in order 1,3
        objTestObject.selectItem( 'listitem1' );
        objTestObject.selectItem( 'listitem3' );
        var objExpected = { listitem1: true, listitem3: true };
        testSelected( objExpected, 'test3' );

        objTestObject.unselectItem( 'listitem1' );
        objTestObject.unselectItem( 'listitem3' );
        
        // test4 - see if we get the items back, and in order 1,3, but select them as item3, item1
        objTestObject.selectItem( 'listitem3' );
        objTestObject.selectItem( 'listitem1' );
        var objExpected = { listitem1: true, listitem3: true };
        testSelected( objExpected, 'test4' );
        objTestObject.unselectItem( 'listitem1' );
        objTestObject.unselectItem( 'listitem3' );

        // test5 - see if we can unselect all the old items, and if we select a new item, nothing blows up.
        objTestObject.selectItem( 'listitem2' );
        objTestObject.selectItem( 'listitem1' );
        var objExpected = { listitem1: true, listitem2: true };
        testSelected( objExpected, 'test5' );
        objTestObject.unselectItem( 'listitem1' );
        objTestObject.unselectItem( 'listitem2' );


        function testSelected( in_objExpected, in_strTestHeading ) 
        {
            var bPass = true;
            var objSelectedItems = Object.clone( objTestObject.getSelected() );
            
            var astrSelectedKeys = Object.keys( objSelectedItems );
            var astrExpectedKeys = Object.keys( in_objExpected );

            for( var nIndex = 0, strKey; strKey = astrExpectedKeys[ nIndex ]; ++nIndex )
            {
                if( strKey != astrSelectedKeys[ nIndex ] )
                {
                    fireunit.ok( false, in_strTestHeading + ': out of expected order item item: ' + strKey );
                } // end if
            } // end if
            
            for( var strKey in in_objExpected )
            {
                if( ! TypeCheck.Defined( objSelectedItems[ strKey ] ) )
                {
                    fireunit.ok( false, in_strTestHeading + ': Missing expected item: ' + strKey );
                    bPass = false;
                }
                delete objSelectedItems[ strKey ];
            } // end for

            for( var strKey in objSelectedItems )
            {
                fireunit.ok( false, in_strTestHeading + ': Extra expected item: ' + strKey );
                bPass = false;
            } // end for
            
            if( bPass )
            {
                fireunit.ok( true, in_strTestHeading + ': getSelectedItems pass' );
            }
        } // end function
    },

    testOnRemoveItem: function()
    {
        this.m_bGetElementOverride = false;

        var objTestObject = this.getTestObject();
        objTestObject.unselectItem( 'listitem1' );
        objTestObject.unselectItem( 'listitem2' );
        objTestObject.selectItem( 'listitem3' );

        // test1 - remove an item that is not selected
        objTestObject.OnRemoveItem( 'listitem1' );
        fireunit.ok( 1 === objTestObject.m_nNumSelected, 'test1: 1 item selected' );
        fireunit.ok( true === objTestObject.isSelected( 'listitem3' ), 'test1: listitem3 selected' );
        
        // test2 - remove an item that is selected
        objTestObject.OnRemoveItem( 'listitem3' );
        fireunit.ok( 0 === objTestObject.m_nNumSelected, 'test2: 0 items selected' );
        fireunit.ok( false === objTestObject.isSelected( 'listitem3' ), 'test1: listitem3 not selected, removed' );
    },
    
    testSelectItemAddItemGetSelected: function()
    {
        this.m_bGetElementOverride = false;

        var objTestObject = this.getTestObject();
        objTestObject.unselectItem( 'listitem0' );

        this.m_objIDToIndexTable = {
            listitem1: 0,
            listitem2: 1,
            listitem3: 2
        };

        objTestObject.selectItem( 'listitem1' );
        objTestObject.selectItem( 'listitem2' );
        objTestObject.selectItem( 'listitem3' );
    
        // test1 - we select 3 items, then we add 1 more which is inserted into the index of listitem1
        //  list items 1,2,3's indexes are each incremented one.  Make sure we can select listitem0.
        // increment the indexes to simulate an add.
        this.m_objIDToIndexTable = {
            listitem0: 0,   // this index was previously already selected
            listitem1: 1,
            listitem2: 2,
            listitem3: 3
        };
        
        fireunit.ok( true === objTestObject.selectItem( 'listitem0' ), 'test1 - listitem0 can be selected even if added after selection' );
    }
} );



