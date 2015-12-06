
function UnitTest()
{
    var objTest = new NotesTest();
    objTest.run();
};

function NotesTest()
{
    NotesTest.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'Notes';
};
UberObject.Base( NotesTest, UberUnitTest );

Object.extend( NotesTest.prototype, {
    getExpectedListeners: function() {
        return {
            requestnoteadd: undefined,
            requestnotenew: undefined,
            requestnotedelete: undefined,
            requestnotesdelete: undefined,
	        requestnotesemptytrash: undefined,
	        requestnotestrash: undefined,
	        requestnotesuntrash: undefined,
	        requestnotesstar: undefined,
	        requestnotesunstar: undefined,
	        requestnoteshidden: undefined,
	        requestnotesunhidden: undefined,
	        requestnotestagged: undefined,
	        requestnotesuntagged: undefined,
	        requestnotessharedbyperuser: undefined,
	        requestnotesunsharedbyperuser: undefined,
	        requestnoteids: undefined,
	        activityupdatepre: undefined,
	        activityupdatepost: undefined,
        };
    },
    
    createTestObject: function()
    {
        return new Notes();
    },
    
    test: function()
    {
        this.testNotesTagged();
        this.testNotesUnTagged();
        
        this.testNotesStar();
        this.testNotesUnStar();

        this.testNotesDelete();

        NotesTest.Base.test.apply( this );
    },
    
    testNotesTagged: function()
    {
        var objNotes = this.getTestObject();
        objNotes.removeAll();
        var objDBCall;
                        
        /** test1 - We are tagging no notes, no call should be made to DB **/
        Util.resetLastDBCall();
        objNotes.notesTagged( {}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test1: No call made to DB - no input' );

        /** test2 - We are tagging two notes, neither note exists **/
        Util.resetLastDBCall();
        objNotes.notesTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test2: No call made to DB - invalid notes' );

        /** test3 - We are tagging two notes, both exist but not tagged **/
        Util.resetLastDBCall();
        var objNote1 = new Note();
        objNote1.init( '1' );
        objNotes.add( objNote1 );
        var objNote2 = new Note();
        objNote2.init( '2' );
        objNotes.add( objNote2 );
        
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test3: Call correctly made to DB - two notes needing tagged' );
        fireunit.compare( objDBCall.method, 'NoteCategoryTag', 'test3: NoteCategoryTag the service called' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test3: categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test3: both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_bOnTagComplete, 'test3: OnTagComplete called note1' );
        fireunit.ok( objNote2.m_bOnTagComplete, 'test3: OnTagComplete called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test3: OnSaveComplete called note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test3: OnSaveComplete called note2' );

        
        /** test4 - Trying on three notes, only 1,2 exist **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesTagged( {'1': undefined, '2': undefined, '3': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test4 - Call correctly made to DB - two notes exist' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test4 - categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test4 - both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_bOnTagComplete, 'test4 - OnTagComplete called note1' );
        fireunit.ok( objNote2.m_bOnTagComplete, 'test4 - OnTagComplete called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test4 - OnSaveComplete called note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test4 - OnSaveComplete called note2' );
   
   
        /** test5 - Trying two notes, note 1 already tagged, note 2 needs tagged **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote1.hasBinding = function(){ return true; };
        objNotes.notesTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test5 - Call correctly made to DB - two notes exist' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test5 - categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '2', 'test5 - only note 2 added to noteID' );
        fireunit.ok( !objNote1.m_bOnTagComplete, 'test5 - OnTagComplete not called note1' );
        fireunit.ok( objNote2.m_bOnTagComplete, 'test5 - OnTagComplete called note2' );
        fireunit.ok( !objNote1.m_bOnSaveResponseComplete, 'test5 - OnSaveComplete note called note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test5 - OnSaveComplete called note2' );
        
        /** test6 - Trying two notes, both already tagged **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote2.hasBinding = objNote1.hasBinding;
        objNotes.notesTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test6 - both notes tagged, no DB call should be made' );
        fireunit.ok( !objNote1.m_bOnTagComplete, 'test6 - OnTagComplete not called note1' );
        fireunit.ok( !objNote2.m_bOnTagComplete, 'test6 - OnTagComplete not called note2' );
        fireunit.ok( !objNote1.m_bOnSaveResponseComplete, 'test6 - OnSaveComplete not called note1' );
        fireunit.ok( !objNote2.m_bOnSaveResponseComplete, 'test6 - OnSaveComplete not called note2' );

        /** test7 - Trying three notes, note 1 needs tagged, note 2 already tagged, note 3 does not exist **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote1.hasBinding = function(){ return false; };
        objNotes.notesTagged( {'1': undefined, '2': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test7 - 1 note needs tagged, good DB call' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test7 - categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1', 'test7 - only note 1 added to noteID' );
        fireunit.ok( objNote1.m_bOnTagComplete, 'test7 - OnTagComplete called note1' );
        fireunit.ok( !objNote2.m_bOnTagComplete, 'test7 - OnTagComplete not called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test7 - OnSaveComplete called note1' );
        fireunit.ok( !objNote2.m_bOnSaveResponseComplete, 'test7 - OnSaveComplete not called note2' );
        
    },

    testNotesUnTagged: function()
    {
        var objNotes = this.getTestObject();
        objNotes.removeAll();
        var objDBCall;
                        
        /** test1 We are tagging no notes, no call should be made to DB **/
        Util.resetLastDBCall();
        objNotes.notesUnTagged( {}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test1: No call made to DB - no input' );

        /** test2 We are tagging two notes, neither note exists **/
        Util.resetLastDBCall();
        objNotes.notesUnTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test2: No call made to DB - invalid notes' );

        /** test3 We are tagging two notes, both exist but not tagged **/
        Util.resetLastDBCall();
        var objNote1 = new Note();
        objNote1.init( '1' );
        objNotes.add( objNote1 );
        var objNote2 = new Note();
        objNote2.init( '2' );
        objNotes.add( objNote2 );
        
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesUnTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test3: Call correctly skipped to database' );
        fireunit.ok( !objNote1.m_bOnUntagComplete, 'test3: OnUntagComplete not called note1' );
        fireunit.ok( !objNote2.m_bOnUntagComplete, 'test3: OnUntagComplete not called note2' );
        fireunit.ok( !objNote1.m_bOnSaveResponseComplete, 'test3: OnSaveComplete not called note1' );
        fireunit.ok( !objNote2.m_bOnSaveResponseComplete, 'test3: OnSaveComplete not called note2' );

        
        /** test4 Trying two notes, note 1 already tagged, note 2 not - note 1 should be untagged **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote1.hasBinding = function(){ return true; };
        objNotes.notesUnTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test4: Call correctly made to DB - one exist' );
        fireunit.compare( objDBCall.method, 'NoteCategoryUnTag', 'test4: NoteCategoryUnTag the service called' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test4: categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1', 'test4: only note 1 added to noteID' );
        fireunit.ok( objNote1.m_bOnUntagComplete, 'test4: OnUntagComplete called note1' );
        fireunit.ok( !objNote2.m_bOnUntagComplete, 'test4: OnUntagComplete not called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test4: OnSaveComplete called note1' );
        fireunit.ok( !objNote2.m_bOnSaveResponseComplete, 'test4: OnSaveComplete not called note2' );
        
        /** test5 Trying two notes, both already tagged, both should be untagged **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote2.hasBinding = objNote1.hasBinding;
        objNotes.notesUnTagged( {'1': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test5: both notes tagged, DB call should be made' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test5: categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test5: both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_bOnUntagComplete, 'test5: OnUntagComplete called note1' );
        fireunit.ok( objNote2.m_bOnUntagComplete, 'test5: OnUntagComplete called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test5: OnSaveCompletecalled note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test5: OnSaveCompletecalled note2' );

        /** test6 Trying on three notes, only 1,2 exist **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesUnTagged( {'1': undefined, '2': undefined, '3': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test6: Call correctly made to DB - two notes exist' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test6: categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test6: both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_bOnUntagComplete, 'test6: OnUntagComplete called note1' );
        fireunit.ok( objNote2.m_bOnUntagComplete, 'test6: OnUntagComplete called note2' );
        fireunit.ok( objNote1.m_bOnSaveResponseComplete, 'test6: OnSaveComplete called note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test6: OnSaveComplete called note2' );
   
   
        /** test7 Trying three notes, note 1 not tagged, note 2 needs untagged, note 3 does not exist **/
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNote1.hasBinding = function(){ return false; };
        objNotes.notesUnTagged( {'1': undefined, '2': undefined, '2': undefined}, 'metatestid' );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall,'test7: 1 note needs untagged, good DB call' );
        fireunit.compare( objDBCall.input.categoryID, 'metatestid', 'test6: categoryID set to metatestid correctly' );
        fireunit.compare( objDBCall.input.noteID, '2', 'test7: only note 2 added to noteID' );
        fireunit.ok( !objNote1.m_bOnUntagComplete, 'test7: OnUntagComplete not called note1' );
        fireunit.ok( objNote2.m_bOnUntagComplete, 'test7: OnUntagComplete called note2' );
        fireunit.ok( !objNote1.m_bOnSaveResponseComplete, 'test7: OnSaveComplete not called note1' );
        fireunit.ok( objNote2.m_bOnSaveResponseComplete, 'test7: OnSaveComplete called note2' );
    },

    /**
    * testNotesDelete - tests that notesDelete function
    */
    testNotesDelete: function()
    {
        var objNotes = this.getTestObject();
        
        objNotes.removeAll();
        var objNote1 = new Note();
        objNote1.init( '1' );
        objNotes.add( objNote1 );
        var objNote2 = new Note();
        objNote2.init( '2' );
        objNotes.add( objNote2 );

        // 1 note needs deleted
        Util.resetLastDBCall();
        objNotes.notesDelete( {'1': undefined } );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test1: 1 note needs deleted, good DB call' );
        fireunit.ok( objDBCall.method, 'NoteRemove', 'test2: NoteRemove is the method called' );
        fireunit.ok( objNote1.m_bDeleteMe, 'test3: deleteMe called on note' );
        fireunit.ok( objNote1.m_bSkipDBDelete, 'test4: skip DB Delete' );

        // 2 notes to be deleted
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesDelete( {'1': undefined, '2': undefined } );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test5: 2 note needs deleted, good DB call' );
        fireunit.ok( objDBCall.method, 'NoteRemove', 'test6: NoteRemove is the method called' );
        fireunit.ok( objNote1.m_bDeleteMe, 'test7: deleteMe called on note' );
        fireunit.ok( objNote1.m_bSkipDBDelete, 'test8: skip DB Delete' );
        fireunit.ok( objNote2.m_bDeleteMe, 'test7: deleteMe called on note' );
        fireunit.ok( objNote2.m_bSkipDBDelete, 'test8: skip DB Delete' );
        
        // 0 notes selected for deletion, no db call made
        Util.resetLastDBCall();
        objNotes.notesDelete( {} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test9: no notes selected for deletion, no DB call' );

        // invalid note to delete, no DB call made
        Util.resetLastDBCall();
        objNotes.notesDelete( { '3': undefined } );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test10: invalid note selected for deletion, no DB call' );

       // one valid, one invalid note to delete, DB call made
        Util.resetLastDBCall();
        objNote1.resetTestStatus();
        objNote2.resetTestStatus();
        objNotes.notesDelete( { '1': undefined, '3': undefined } );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test11: one valid note selected for deletion, DB call' );
        fireunit.ok( objDBCall.method, 'NoteRemove', 'test12: NoteRemove is the method called' );
        fireunit.ok( objNote1.m_bDeleteMe, 'test13: deleteMe called on note' );
        fireunit.ok( objNote1.m_bSkipDBDelete, 'test14: skip DB Delete' );
        fireunit.ok( !objNote2.m_bDeleteMe, 'test15: deleteMe called on note' );
        fireunit.ok( !objNote2.m_bSkipDBDelete, 'test16: skip DB Delete' );
    
    },
    
    /**
    * testNotesStar - test the notesStar function
    */    
    testNotesStar: function()
    {
        this.testNotesMetaSetTrue( 'notesStar', 'Star', Note.eMetaUpdates.star, 'setStar' );
    },

    /**
    * testNotesUnStar - test the notesUnStar function
    */    
    testNotesUnStar: function()
    {
        this.testNotesMetaSetFalse( 'notesUnStar', 'Star', Note.eMetaUpdates.unstar, 'setStar' );
    },

    /**
    * testNotesTrash - test the notesTrash function
    */    
    testNotesTrash: function()
    {
        this.testNotesMetaSetTrue( 'notesTrash', 'Trash', Note.eMetaUpdates.trash, 'setTrash' );
    },

    /**
    * testNotesUnTrash - test the notesUnTrash function
    */    
    testNotesUnTrash: function()
    {
        this.testNotesMetaSetFalse( 'notesUnTrash', 'Trash', Note.eMetaUpdates.untrash, 'setTrash' );
    },
    
    testNotesMetaSetTrue: function( in_strFunction, in_strField, in_strAction, in_strResetFunction )
    {
        var objNotes = this.getTestObject();
        objNotes.removeAll();
        var objDBCall;
                        
        /** test1 - We are tagging no notes, no call should be made to DB **/
        Util.resetLastDBCall();
        objNotes[ in_strFunction ]( {} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test1: No call made to DB - no input' );

        /** test2 - We are tagging two notes, neither note exists **/
        Util.resetLastDBCall();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test2: No call made to DB - invalid notes' );

        /** test3 - We are doing two notes, both exist flag is false **/
        var objNote1 = new Note();
        objNote1.init( '1' );
        objNotes.add( objNote1 );
        var objNote2 = new Note();
        objNote2.init( '2' );
        objNotes.add( objNote2 );
        
        resetTestValues();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test3: Call correctly made to DB - two notes needing starred' );
        fireunit.compare( objDBCall.method, 'NoteMetaUpdate', 'test3: NoteMetaUpdate the service called' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test3: action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test3: both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_objExtraInfo[ in_strField ], 'test3 - Field correctly set for note1' );
        fireunit.ok( objNote2.m_objExtraInfo[ in_strField ], 'test3 - Field correctly set for note2' );

        
        /** test4 - Trying on three notes, only 1,2 exist **/
        resetTestValues();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined, '3': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test4 - Call correctly made to DB - two notes exist' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test4 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test4 - both note 1 and 2 added to noteID' );
        fireunit.ok( objNote1.m_objExtraInfo[ in_strField ], 'test4 - Field correctly set for note1' );
        fireunit.ok( objNote2.m_objExtraInfo[ in_strField ], 'test4 - Field correctly set for note2' );
   
   
        /** test5 - Trying two notes, note 1 already tagged, note 2 needs tagged **/
        resetTestValues();
        objNote1[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test5 - Call correctly made to DB - two notes exist' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test5 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '2', 'test5 - only note 2 added to noteID' );
        fireunit.ok( objNote1.m_objExtraInfo[ in_strField ], 'test5 - Field value stayed the same for note1' );
        fireunit.ok( objNote2.m_objExtraInfo[ in_strField ], 'test5 - Field correctly set for note2' );
        
        /** test6 - Trying two notes, both already tagged **/
        resetTestValues();
        objNote1[ in_strResetFunction ]( true );
        objNote2[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test6 - both notes starred, no DB call should be made' );
        fireunit.ok( objNote1.m_objExtraInfo[ in_strField ], 'test6 - Field value stayed the same for note1' );
        fireunit.ok( objNote2.m_objExtraInfo[ in_strField ], 'test6 - Field value stayed the same for note2' );

        /** test7 - Trying three notes, note 1 needs tagged, note 2 already tagged, note 3 does not exist **/
        Util.resetLastDBCall();
        resetTestValues();
        objNote2[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test7 - 1 note needs starred, good DB call' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test7 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '1', 'test7 - only note 1 added to noteID' );
        fireunit.ok( objNote1.m_objExtraInfo[ in_strField ], 'test7 - Field correctly set for note1' );
        fireunit.ok( objNote2.m_objExtraInfo[ in_strField ], 'test7 - Field value stayed the same for note2' );
    
        function resetTestValues()
        {
            Util.resetLastDBCall();
            objNote1.resetTestStatus();
            objNote2.resetTestStatus();
            objNote1[ in_strResetFunction ]( false );
            objNote2[ in_strResetFunction ]( false );
        }    
    },
    
    testNotesMetaSetFalse: function( in_strFunction, in_strField, in_strAction, in_strResetFunction )
    {
        var objNotes = this.getTestObject();
        objNotes.removeAll();
        var objDBCall;
                        
        /** test1 - We are tagging no notes, no call should be made to DB **/
        Util.resetLastDBCall();
        objNotes[ in_strFunction ]( {} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test1: No call made to DB - no input' );

        /** test2 - We are tagging two notes, neither note exists **/
        Util.resetLastDBCall();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test2: No call made to DB - invalid notes' );

        /** test3 - We are doing two notes, both exist flag is false **/
        var objNote1 = new Note();
        objNote1.init( '1' );
        objNotes.add( objNote1 );
        var objNote2 = new Note();
        objNote2.init( '2' );
        objNotes.add( objNote2 );
        
        resetTestValues();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test3: Call correctly skipped for DB - neither note needs updated' );
        fireunit.ok( !objNote1.m_objExtraInfo[ in_strField ], 'test3 - Field not changed for note1' );
        fireunit.ok( !objNote2.m_objExtraInfo[ in_strField ], 'test3 - Field not changed for note2' );

        
        /** test4 - Trying on three notes, only 1,2 exist **/
        resetTestValues();
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined, '3': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( !objDBCall, 'test4: Call correctly skipped for DB - neither note needs updated' );
        fireunit.ok( !objNote1.m_objExtraInfo[ in_strField ], 'test4 - Field not changed for note1' );
        fireunit.ok( !objNote2.m_objExtraInfo[ in_strField ], 'test4 - Field not changed for note2' );
   
   
        /** test5 - Trying two notes, note 1 set to true, note 2 not **/
        resetTestValues();
        objNote1[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test5 - Call correctly made to DB' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test5 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '1', 'test5 - only note 1 added to noteID' );
        fireunit.ok( !objNote1.m_objExtraInfo[ in_strField ], 'test5 - Field value correctly set for note1' );
        fireunit.ok( !objNote2.m_objExtraInfo[ in_strField ], 'test5 - Field correctly remains the same for note2' );
        
        /** test6 - Trying two notes, both already set to true **/
        resetTestValues();
        objNote1[ in_strResetFunction ]( true );
        objNote2[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test6 - Call correctly made to DB' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test6 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '1,2', 'test6 - both note 1 and 2 added to noteID' );
        fireunit.ok( !objNote1.m_objExtraInfo[ in_strField ], 'test6 - Field value correctly set for note1' );
        fireunit.ok( !objNote2.m_objExtraInfo[ in_strField ], 'test6 - Field value correctly set for note2' );

        /** test7 - Trying three notes, note 1 needs tagged, note 2 already tagged, note 3 does not exist **/
        Util.resetLastDBCall();
        resetTestValues();
        objNote2[ in_strResetFunction ]( true );
        objNotes[ in_strFunction ]( {'1': undefined, '2': undefined, '2': undefined} );
        objDBCall = Util.getLastDBCall();
        fireunit.ok( objDBCall, 'test7 - 1 note needs set, good DB call' );
        fireunit.ok( in_strAction === objDBCall.input.action, 'test7 - action set correctly' );
        fireunit.compare( objDBCall.input.noteID, '2', 'test7 - only note 2 added to noteID' );
        fireunit.ok( !objNote1.m_objExtraInfo[ in_strField ], 'test7 - Field value stayed the same for note1' );
        fireunit.ok( !objNote2.m_objExtraInfo[ in_strField ], 'test7 - Field correctly set for note2' );
    
        function resetTestValues()
        {
            Util.resetLastDBCall();
            objNote1.resetTestStatus();
            objNote2.resetTestStatus();
            objNote1[ in_strResetFunction ]( false );
            objNote2[ in_strResetFunction ]( false );
        }    
    }    
    
    
    
} );