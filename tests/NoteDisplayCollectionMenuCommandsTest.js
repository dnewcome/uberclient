function UnitTestHarness()
{
    this.m_objSelectedNotes = undefined;

    this.m_objTestClassNames = {};
    this.m_objTestContext = {};
    this.m_objDisplayChecks = undefined;

    this.m_objNote1 = undefined;
    this.m_objNote2 = undefined;
    this.m_objNote3 = undefined;
        
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteDisplayCollectionMenuCommands';
}
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NotesDisplayCollectionMenuCommands();
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this );

        var objTestObject = this.getTestObject();
        this.m_objTestClassNames = {};
        this.m_objTestContext = objTestObject;
        var me=this;
        var objNoteDisplayCollection = objTestObject.getContext();
        objNoteDisplayCollection.$ = function()
        {   /** Mock a fake $ that returns a mocked element that has an up **/
            function Element() {};
            Element.prototype.up = function( in_strCSSRule ) { return me.m_objTestClassNames[ in_strCSSRule ]; };
            return new Element();
        };
        
        this.m_objDisplayChecks = {};

        this.m_objNotesCollection = new ModelCollection();
        this.m_objNotesCollection.init( 'notes' );
        
        this.m_objTestContext.m_objNotesCollection = this.m_objNotesCollection;
        
        var me=this;    
        objNoteDisplayCollection.getSelected = function()
        {
            return me.m_objSelectedNotes || {};
        };

                
        
        // Note1 has two bindings, tag1, tag2
        this.m_objNote1 = new Note();
        this.m_objNote1.init( 'testnote1' );
        
        // Note2 has no bindings
        this.m_objNote2 = new Note();
        this.m_objNote2.init( 'testnote2' );

        // Note3 has three bindings, tag2, tag3, tag4
        this.m_objNote3 = new Note();
        this.m_objNote3.init( 'testnote3' );

        this.m_objNotesCollection.add( this.m_objNote1 );
        this.m_objNotesCollection.add( this.m_objNote2 );
        this.m_objNotesCollection.add( this.m_objNote3 );
        
    },
    
    setTrashed: function( in_bTrashed )
    {
        var objTestObject = this.getTestObject();
        objTestObject.m_bTrashed = in_bTrashed;
    },
    
    getExpectedListeners: function()
    {
        return {
            displaypollpre: null
        };
    },
    
    test: function()
    {
        this.testFunctions();
        this.fillExpectedMenuItems();

        this.testExpectedMenuItems();
        this.testMissingMenuItems();
        
        this.testOnDisplayPollPre();
        
        this.testTrashDisplayCheck();
        this.testUnTrashDisplayCheck();
        this.testHiddenDisplayCheck();
        this.testUnHiddenDisplayCheck();
        this.testStarredDisplayCheck();
        this.testUnStarredDisplayCheck();
        
        this.testInvalidNote();
    },

    testOnDisplayPollPre: function()
    {
        var objTestObject = this.getTestObject();

        // test1 - we are not in trash, flag should be false.
        this.m_objTestClassNames[ '.trashed' ] = false;
        objTestObject.OnDisplayPollPre();
        
        fireunit.ok( false === objTestObject.m_bTrashed, 'test1: m_bTrashed is false' );
 
        // test2 - we are in trash, set trash flag.
        this.m_objTestClassNames[ '.trashed' ] = true;
        objTestObject.OnDisplayPollPre();
        
        fireunit.ok( true === objTestObject.m_bTrashed, 'test2: m_bTrashed is true' );
         
    },
    
    testFunctions: function()
    {
        /** Needed to get the menu items **/
        fireunit.ok( TypeCheck.Function( NotesDisplayCollectionMenuCommands.prototype.loadConfigParams ), 
            'loadConfigParams exists' );
    },

    fillExpectedMenuItems: function()
    {
        /** Check to make sure we have the following messages raised **/
        /** key column is the message, value is a displaycheck callback **/
        this.m_objExpectedMenuItems = {
            starselectednotes: true,
            unstarselectednotes: true,
            hiddenselectednotes: true,
            unhiddenselectednotes: true,
            trashselectednotes: true,
            untrashselectednotes: true,
            deleteselectednotes: false
        };
    },
    
    testExpectedMenuItems: function()
    {
        /** 
        * Check to make sure we have all the expected menu items
        *   Use above this.m_objExpectedMenuItems as a holder, delete the menu items that go
        *   with the configuration want it to have, afterwards, see if any 
        *   expected menu items remain.
        **/
        var bExtra = false;
        var objMenu = this.getTestObject();
        for( var nIndex = 0, objMenuItem; objMenuItem = objMenu.m_aobjMenuItems[ nIndex ]; ++nIndex )
        {
            var strKey = objMenuItem.callback;
            if( this.m_objExpectedMenuItems.hasOwnProperty( strKey ) )
            {
                if( this.m_objExpectedMenuItems[ strKey ] )
                {   // save this off for later
                    if( TypeCheck.Function( objMenuItem.displaycheck ) )
                    {
                        this.m_objDisplayChecks[ strKey ] = objMenuItem.displaycheck;
                    } // end if
                    else
                    {   /** FAIL, missing a display check **/
                        fireunit.ok( false, 'missing or invalid displaycheck for: ' + strKey );
                    } // end if
                } // end if
                else
                {
                    if( objMenuItem.hasOwnProperty( 'displaycheck' ) )
                    {
                        fireunit.ok( false, 'unexpected displaycheck for: ' + strKey );
                    } // end if
                }
                delete this.m_objExpectedMenuItems[ strKey ];
            } // end if
            else
            {
                fireunit.ok( false, 'unexpected menu item: ' + strKey );
                bExtra = true;
            } // end if-else
        } // end for
        fireunit.ok( !bExtra, 'looking for extra menu items' );
    },

    testMissingMenuItems: function()
    {
        var bMissing = false;
        for( var strKey in this.m_objExpectedMenuItems )
        {
            fireunit.ok( false, 'missing menu item: ' + strKey );
            bMissing = true;
        } // end for
        
        fireunit.ok( !bMissing, 'looking for missing menu items' );
    },

    testTrashDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.trashselectednotes;
        
        if( fncDisplayCheck )
        {
            this.setTrashed( false );
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'trashselectednotes display check should be true' );
            
            this.setTrashed( true );
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'trashselectednotes display check should be false' );
        } // end if
    },

    testUnTrashDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.untrashselectednotes;
        
        if( fncDisplayCheck )
        {
            this.setTrashed( false );
            /** Should evaluate to false since we are in the trash **/
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'untrashselectednotes display check should be false' );
            
            this.setTrashed( true );
            /** Should evaluate to true since we are not in the trash **/
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'untrashselectednotes display check should be true' );
        } // end if
    },
    
    testHiddenDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.hiddenselectednotes;
        
        if( fncDisplayCheck )
        {
            // test1 - one note hidden, only note selected, should not show up.
            this.m_objNote1.resetTestStatus();
            this.m_objNote1.setHidden( true );
            this.setTrashed( false );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test1: hiddenselectednotes display check should be false' );
            
            // test2 - two notes hidden, both selected, should not show up.
            this.m_objNote2.resetTestStatus();
            this.m_objNote2.setHidden( true );
            this.m_objSelectedNotes = { testnote1: true, testnote2: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test2: hiddenselectednotes display check should be false' );

            // test3 - two notes hidden, one not, all selected, should show up.
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test3: hiddenselectednotes display check should be true' );

            // test4 - one not hidden, only one selected, should show up.
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test4: hiddenselectednotes display check should be true' );

            // test5 - no notes selected - should show up.
            this.m_objSelectedNotes = { };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test5: hiddenselectednotes display check should be true' );

            // test6 - one not hidden, only one selected, but we are now in the trash, should not show up.
            this.setTrashed( true );
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( !fncDisplayCheck.apply( this.m_objTestContext ), 'test6: hiddenselectednotes display check should be false' );
        } // end if
    },

    testUnHiddenDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.unhiddenselectednotes;
        
        if( fncDisplayCheck )
        {
            // test1 - one note unhidden, only note selected, should not show up.
            this.m_objNote1.resetTestStatus();
            this.setTrashed( false );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test1: unhiddensselectednotes display check should be false' );

            // test2 - two notes unhidden, both selected, should not show up.
            this.m_objNote2.resetTestStatus();
            this.m_objSelectedNotes = { testnote1: true, testnote2: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test2: unhiddensselectednotes display check should be false' );

            // test3 - one note hidden, selected, should show up.
            this.m_objNote1.setHidden( true );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test3: unhiddensselectednotes display check should be true' );

            // test4 - one note hidden, three selected, should show up.
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test4: unhiddensselectednotes display check should be true' );

            // test5 - two notes note hidden, three selected, should show up.
            this.m_objNote3.setHidden( true );
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test5: unhiddensselectednotes display check should be true' );

            // test6 - no notes selected - should show up.
            this.m_objSelectedNotes = { };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test6: unhiddensselectednotes display check should be true' );

            // test7 - one not hidden, only one selected, but we are now in the trash, should not show up.
            this.setTrashed( true );
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( !fncDisplayCheck.apply( this.m_objTestContext ), 'test7: unhiddensselectednotes display check should be false' );
            
        } // end if
    },
    
    testStarredDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.starselectednotes;
        
        if( fncDisplayCheck )
        {
            // test1 - one note starred, only note selected, should not show up.
            this.m_objNote1.resetTestStatus();
            this.m_objNote1.setStar( true );
            this.setTrashed( false );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test1: starselectednotes display check should be false' );
            
            // test2 - two notes starred, both selected, should not show up.
            this.m_objNote2.resetTestStatus();
            this.m_objNote2.setStar( true );
            this.m_objSelectedNotes = { testnote1: true, testnote2: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test2: starselectednotes display check should be false' );

            // test3 - two notes starred, one not, all selected, should show up.
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test3: starselectednotes display check should be true' );

            // test4 - one not starred, only one selected, should show up.
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test4: starselectednotes display check should be true' );

            // test5 - no notes selected - should show up.
            this.m_objSelectedNotes = { };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test5: starselectednotes display check should be true' );

            // test6 - one not starred, only one selected, but we are now in the trash, should not show up.
            this.setTrashed( true );
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( !fncDisplayCheck.apply( this.m_objTestContext ), 'test6: starselectednotes display check should be false' );
        } // end if
    },

    testUnStarredDisplayCheck: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.unstarselectednotes;
        
        if( fncDisplayCheck )
        {
            // test1 - one note unstarred, only note selected, should not show up.
            this.m_objNote1.resetTestStatus();
            this.setTrashed( false );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test1: unstarselectednotes display check should be false' );

            // test2 - two notes unstarred, both selected, should not show up.
            this.m_objNote2.resetTestStatus();
            this.m_objSelectedNotes = { testnote1: true, testnote2: true };
            fireunit.ok( ! fncDisplayCheck.apply( this.m_objTestContext ), 'test2: unstarselectednotes display check should be false' );

            // test3 - one note starred, selected, should show up.
            this.m_objNote1.setStar( true );
            this.m_objSelectedNotes = { testnote1: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test3: unstarselectednotes display check should be true' );

            // test4 - note note starred, three selected, should show up.
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test4: unstarselectednotes display check should be true' );

            // test5 - two notes note starred, three selected, should show up.
            this.m_objNote3.setStar( true );
            this.m_objSelectedNotes = { testnote1: true, testnote2: true, testnote3: true };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test5: unstarselectednotes display check should be true' );

            // test6 - no notes selected - should show up.
            this.m_objSelectedNotes = { };
            fireunit.ok( fncDisplayCheck.apply( this.m_objTestContext ), 'test6: unstarselectednotes display check should be true' );

            // test7 - one not starred, only one selected, but we are now in the trash, should not show up.
            this.setTrashed( true );
            this.m_objSelectedNotes = { testnote3: true };
            fireunit.ok( !fncDisplayCheck.apply( this.m_objTestContext ), 'test7: unstarselectednotes display check should be false' );
        } // end if
    },
    
    testInvalidNote: function()
    {
        var fncDisplayCheck = this.m_objDisplayChecks.unstarselectednotes;
        
        if( fncDisplayCheck )
        {
            // test1 - one invalid note
            this.m_objTestClassNames[ '.trashed' ] = false;
            this.m_objSelectedNotes = { testnote666: true };
            fireunit.ok( false === fncDisplayCheck.apply( this.m_objTestContext ), 'test1: 1 invalid note, should be false' );
        } // end if    
    }

} );
