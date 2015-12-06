function UnitTestHarness()
{
    this.m_objPlugin = undefined;
    this.m_objExpected = undefined;
    
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteDisplayCollectionPluginCommandsTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {
        return new NoteDisplayCollectionCommandsPlugin();
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var me=this;
        this.m_objSelected = undefined;
        objPlugged.getSelected = function() { return me.m_objSelected || {} };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.setup();
        // give the below some data to work with.
        this.m_objSelected = { note1: null, note2: null, note3: null };   
        this.simulateActionMessages();
        this.testOnRequestShowSelected();
        this.testOnUnHiddenSelectedNotes();
        this.testOnHiddenSelectedNotes();
        this.testOnTrashSelectedNotes();
        this.testOnUnTrashSelectedNotes();
        this.testOnDeleteSelectedNotes();
        this.testOnCreateTagged();
    },
    
    getExpectedListeners: function() {
        this.m_objPlugin = this.getTestObject();
        var strPluggedID = this.m_objPlugin.getPlugged().m_strMessagingID;
        var strPluginID = this.m_objPlugin.m_strMessagingID;
        
        return {
            /**
            * XXX for expected, we should make that a from/to as well because they are not the same.  
            *   We need a better way of testing what is registered vs what is expected to be raised.
            */
            requestnoteids: { from: Messages.all_publishers_id, expected: 'unselectall', test: this.testListener },
            selectallnotes: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'selectall', test: this.testListener },
            unselectallnotes: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'unselectall', test: this.testListener },
            trashselectednotes: { to: strPluggedID, from: Messages.all_publishers_id },
            deleteselectednotes: { to: strPluggedID, from: Messages.all_publishers_id },
            untrashselectednotes: { to: strPluggedID, from: Messages.all_publishers_id },
            hiddenselectednotes: { to: strPluggedID, from: Messages.all_publishers_id },
            unhiddenselectednotes: { to: strPluggedID, from: Messages.all_publishers_id },
            starselectednotes: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotesstar', test: this.testListener },
            unstarselectednotes: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotesunstar', test: this.testListener },
            addtaggedbinding: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotestagged', test: this.testListener, arguments: [ 'test1' ] },
            removetaggedbinding: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotesuntagged', test: this.testListener, arguments: [ 'test1' ] },
            createtagged: null,
			addsharedbyperuserbinding: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotessharedbyperuser', test: this.testListener, arguments: [ 'test1' ] },
			removesharedbyperuserbinding: { to: strPluggedID, from: Messages.all_publishers_id, expected: 'requestnotesunsharedbyperuser', test: this.testListener, arguments: [ 'test1' ] },
            createsharedbyperuser: null,
            showselectednotes: { to: strPluggedID, from: Messages.all_publishers_id } // we do this test separately
            
        };
    },
    
    setup: function()
    {
        this.m_objExpected = this.getExpectedListeners();
    },
    
    testListItemSelected: function( in_strListenerName, in_strCausingMessage, in_strRaisedMessage )
    {
        var objSelecting = {
            testid1: null,
            testid2: null
        };
        
        for( var strKey in objSelecting )
        {
            this.raiseMessage( in_strCausingMessage, [ strKey ] );
        } // end for
        
        var objSelected = this.m_objPlugin.m_objSelectedItems;

        for( var strKey in objSelected )
        {
            delete objSelecting[ strKey ];
        } // end for

        var bError = false;
        for( var strKey in objSelecting )
        {
            fireunit.ok( false, 'item not selected: ' + strKey );
            bError = true;
        } // end for
        
        if( !bError )
        {
            fireunit.ok( true, 'correct list items selected' );
        } // end if
    },
    
    testListItemUnSelected: function( in_strListenerName, in_strCausingMessage, in_strRaisedMessage )
    {   // The selected items should already be there if testListItemSelected passed.
        for( var strKey in this.m_objPlugin.m_objSelectedItems )
        {
            this.raiseMessage( in_strCausingMessage, [ strKey ] );
        } // end for

        var bError = false;
        for( var strKey in this.m_objPlugin.m_objSelectedItems )
        {
            fireunit.ok( false, 'item not unselected: ' + strKey );
            bError = true;
        } // end for

        if( !bError )
        {
            fireunit.ok( true, 'all list items unselected' );
        } // end if
    },
    
    simulateActionMessages: function()
    {
        for( var strKey in this.m_objExpected )
        {
            var objConfig = this.m_objExpected[ strKey ];
            if( objConfig )
            {
                var fncTest = objConfig.test;
                if( fncTest )
                {
                    fncTest.apply( this, [ strKey, strKey, objConfig.expected, objConfig.arguments ] );
                } // end if
            } // end if
        } // end for
    },

    testConfirmListener: function( in_strListenerName, in_strCausingMessage, in_strRaisedMessage, in_aArguments )
    {
        var bConfirmVal = false;
        var bError = false;
        window.confirm = function() { return bConfirmVal; };
        this.raiseMessage( in_strCausingMessage, in_aArguments );

        /** the confirm value is false, should not be raised **/
        bPass = this.m_objPlugin.testRaisedMessages( {}, in_strRaisedMessage );

        /** the confirm value is true, should be raised **/
        bConfirmVal = true;
        this.raiseMessage( in_strCausingMessage );
        
        var objMessages = {};
        objMessages[ in_strRaisedMessage ] = {};
        bPass = this.m_objPlugin.testRaisedMessages( objMessages, in_strRaisedMessage ) && bPass;
        
        if( bPass )
        {
            fireunit.ok( true, in_strListenerName + ': all tests passed' );
        } // end if
    },

    testListener: function( in_strListenerName, in_strCausingMessage, in_strRaisedMessage, in_aArguments )
    {
        var bError = false;

        this.raiseMessage( in_strCausingMessage, in_aArguments );
        
        var objMessages = {};
        objMessages[ in_strRaisedMessage ] = {};
        bError = !this.m_objPlugin.testRaisedMessages( objMessages, in_strRaisedMessage );
        
        if( !bError )
        {
            fireunit.ok( true, in_strListenerName + ': all tests passed' );        
        } // end if
    },

    raiseMessage: function( in_strCausingMessage, in_aArguments ) 
    {
        var objConfig = this.m_objPlugin.getMessages()[ in_strCausingMessage ];
        this.m_objPlugin.resetRaisedMessages();
        if( objConfig )
        {
            var fncCallback = objConfig.listener, objContext = objConfig.context;
            fncCallback.apply( objContext, in_aArguments || [] );
        } // end if
    },
    
    testOnRequestShowSelected: function()
    {
        this.testMessageNeedsSelection( 'OnRequestShowSelected', 'requestdisplaynotes' );
    },

    testOnUnHiddenSelectedNotes: function()
    {
        this.testMessageNeedsSelection( 'OnUnHiddenSelectedNotes', 'requestnotesunhidden' );
    },

    testOnHiddenSelectedNotes: function()
    {
        this.testMessageNeedsSelection( 'OnHiddenSelectedNotes', 'requestnoteshidden' );
    },

    testOnDeleteSelectedNotes: function()
    {
        this.testMessageNeedsSelection( 'OnDeleteSelectedNotes', 'requestnotesdelete' );
    },

    testOnUnTrashSelectedNotes: function()
    {
        this.testMessageNeedsSelection( 'OnUnTrashSelectedNotes', 'requestnotesuntrash' );
    },

    testOnTrashSelectedNotes: function()
    {
        this.testMessageNeedsSelection( 'OnTrashSelectedNotes', 'requestnotestrash' );
    },
    
    testMessageNeedsSelection: function( in_strFunction, in_strMessage )
    {
        var objTestObject = this.getTestObject();
        window.confirm = function() { return true; };
        
        // test1 - an empty set, do not raise any messages.
        this.m_objSelected = {};   
        objTestObject.resetRaisedMessages();
        objTestObject[ in_strFunction ]();
        objTestObject.testRaisedMessages( {}, 'test1: no messages raised' );

        // test2 - non empty set, raise messages.
        this.m_objSelected = { note1: null, note2: null, note3: null };   
        objTestObject.resetRaisedMessages();
        objTestObject[ in_strFunction ]();
        var objMessage = {};
        objMessage[ in_strMessage ] = null;
        objTestObject.testRaisedMessages( objMessage, 'test2: raising ' + in_strMessage );
    },
    
    testOnCreateTagged: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - an empty set, raise message to create tag
        this.m_objSelected = {};   
        objTestObject.resetRaisedMessages();
        objTestObject.OnCreateTagged( 'testid1' );
        objTestObject.testRaisedMessages( { requesttaggedadd: null }, 'test1: requesttaggedadd raised' );

        // test2 - non empty set, raise message to create tag
        this.m_objSelected = { note1: null, note2: null, note3: null };   
        objTestObject.resetRaisedMessages();
        objTestObject.OnCreateTagged( 'testid1' );
        objTestObject.testRaisedMessages( { requesttaggedadd: null }, 'test2: requesttaggedadd raised' );
    }
    
} );
