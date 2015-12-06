
function UnitTestHarness()
{
    this.m_objTagsMenu = undefined;
    this.m_objSelectedNotes = undefined;
    
    this.m_objClassNamesAddedTags = undefined;
    this.m_objSelectedTags = undefined;

    this.m_nNumClassNamesAdded = undefined;
    this.m_nNumSelectedTags = undefined;
    
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteDisplayCollectionTagsDropdownPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NoteDisplayCollectionTagsDropdownPlugin();
    },

    initTestObject: function()
    {
        this.resetTagsDropdown();
                
        this.m_objTagsMenu = new UberObject();
        this.m_objTagsMenu.init();
        this.m_objTagsMenu.m_strMessagingID = 'testmenu1';
        var me=this;
        
        // the code makes use of these, so mock them up with test versions.
        this.m_objTagsMenu.addClassName = function( in_strID, in_strClassName ) {
            me.m_nNumClassNamesAdded++;
            me.m_objClassNamesAddedTags[ in_strID ] = in_strClassName;
        };

        this.m_objTagsMenu.removeClassName = function( in_strID, in_strClassName ) {
            if( in_strClassName == me.m_objClassNamesAddedTags[ in_strID ] )
            {
                me.m_nNumClassNamesAdded--;
                delete( me.m_objClassNamesAddedTags[ in_strID ] );
            } // end if
        };

        this.m_objTagsMenu.selectItem = function( in_strID ) {
            me.m_nNumSelectedTags++;
            me.m_objSelectedTags[ in_strID ] = true;
        };

        this.m_objTagsMenu.unselectAll = this.m_objTagsMenu.removeAllClassNames = function() {
            me.resetTagsDropdown();
        };
        
        this.m_objNotesCollection = new ModelCollection();
        this.m_objNotesCollection.init( 'notes' );
        
        var objTestObject = this.getTestObject();
        objTestObject.init.apply( objTestObject, [ { 
            m_objTagsMenu: this.m_objTagsMenu,
            m_objNotesCollection: this.m_objNotesCollection
         } ] );
        
        var me=this;    
        objTestObject.getPlugged().getSelected = function()
        {
            return me.m_objSelectedNotes || {};
        };
        
        // Note1 has two bindings, tag1, tag2
        var objNote1 = new Note();
        objNote1.init( 'testnote1' );
        objNote1.addBinding( 'tagged', 'tag1' );
        objNote1.addBinding( 'tagged', 'tag2' );
        
        // Note2 has no bindings
        var objNote2 = new Note();
        objNote2.init( 'testnote2' );

        // Note3 has three bindings, tag2, tag3, tag4
        var objNote3 = new Note();
        objNote3.init( 'testnote3' );
        objNote3.addBinding( 'tagged', 'tag2' );
        objNote3.addBinding( 'tagged', 'tag3' );
        objNote3.addBinding( 'tagged', 'tag4' );

        this.m_objNotesCollection.add( objNote1 );
        this.m_objNotesCollection.add( objNote2 );
        this.m_objNotesCollection.add( objNote3 );
    },
    
    getExpectedConfig: function()
    {
        return { 
            m_objTagsMenu: null,
            m_objNotesCollection: null
        };
    },
    
    getExpectedListeners: function()
    {
        return {
            menushow: null,
            listitemselected: null
        };
    },
        
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnMenuShow();   
        this.testOnListItemSelected();
    },
    
    testOnMenuShow: function()
    {
        var objTestObject = this.getTestObject();
        
        // Pass a random object to it to see if anything happens.
        objTestObject.OnMenuShow( {} );
        
        // test1/2 - pass our menu, but with no selected items.
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 0 == this.m_nNumClassNamesAdded, 'test1: no class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test2: no selected tags' );

        // test3/4 - try with invalid invalid selected.  nothing should get set
        this.m_objSelectedNotes = { invalid: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 0 == this.m_nNumClassNamesAdded, 'test3: no class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test4: no selected tags' );

        // test5/6 - try with valid testnote1 selected.  two selected tags
        //  (only one note selected)
        this.m_objSelectedNotes = { testnote1: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 0 == this.m_nNumClassNamesAdded, 'test5: no class names' );
        fireunit.ok( 2 == this.m_nNumSelectedTags, 'test6: 2 selected tags' );

        this.resetTagsDropdown();
        // test7/8 - try with valid testnote1/testnote2 selected.  two class names 
        //  (only one note selected).  testnote2 has no bindings.
        this.m_objSelectedNotes = { testnote1: true, testnote2: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 2 == this.m_nNumClassNamesAdded, 'test7: 2 class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test8: no selected tags' );

        this.resetTagsDropdown();
        // test9/10 - try with valid testnote1/testnote3 selected.  3 class names, 1 selected
        this.m_objSelectedNotes = { testnote1: true, testnote3: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 3 == this.m_nNumClassNamesAdded, 'test9: 3 class names' );
        fireunit.ok( 1 == this.m_nNumSelectedTags, 'test10: 1 selected tags' );

        this.resetTagsDropdown();
        // test11/12 - try with valid testnote1/testnote2/testnote3 selected.  4 class names
        this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 4 == this.m_nNumClassNamesAdded, 'test11: 4 class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test12: no selected tags' );

        this.resetTagsDropdown();
        // test12/13 - try with valid testnote1/testnote2/testnote3 and invalid selected.  
        //  4 class names
        this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true, invalid: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 4 == this.m_nNumClassNamesAdded, 'test12: 4 class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test13: no selected tags' );

        this.resetTagsDropdown();
        // test14/15 - try with valid testnote3 selected.  3 selected.
        this.m_objSelectedNotes = { testnote3: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 0 == this.m_nNumClassNamesAdded, 'test14: no class names' );
        fireunit.ok( 3 == this.m_nNumSelectedTags, 'test15: 3 selected tags' );

        this.resetTagsDropdown();
        // test16/17 - try with valid testnote2 selected.  nothing happens, note2 has no bindings
        this.m_objSelectedNotes = { testnote2: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );

        fireunit.ok( 0 == this.m_nNumClassNamesAdded, 'test16: no class names' );
        fireunit.ok( 0 == this.m_nNumSelectedTags, 'test17: no selected tags' );
    },

    /**
    * resetTagsDropdown - reset/initialize the tags dropdown test information
    */    
    resetTagsDropdown: function()
    {
        this.m_objClassNamesAddedTags = {};
        this.m_objSelectedTags = {};

        this.m_nNumClassNamesAdded = 0;
        this.m_nNumSelectedTags = 0;
    },
    
    testOnListItemSelected: function()
    {
        var objTestObject = this.getTestObject();

        this.resetTagsDropdown();

        // Have to select two notes so that tag3 is partially selected on testnote3
        this.m_objSelectedNotes = { testnote1: true, testnote3: true };
        objTestObject.OnMenuShow( this.m_objTagsMenu );
        objTestObject.OnListItemSelected( 'tag3' );

        fireunit.ok( !this.m_objClassNamesAddedTags[ 'tag3' ], 'tag3 has the class name removed' );
    }
} );



