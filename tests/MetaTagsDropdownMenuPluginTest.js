function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'MetaTagsDropdownMenuPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new MetaTagsDropdownMenuPlugin();
    },
    
	initTestObject: function()
	{
        var objTestObject = this.getTestObject();
		var objCollection = new MetaTagsCollection();
		objCollection.init( { m_aobjItems: {
			'FIRST': 'firstitemid',
			'SECOND': 'seconditemid'
		} } );
		objCollection.m_strModelType = 'tagged';
		
		objPlugged = new Display();
		objTestObject.m_objPlugged = objPlugged;
		objPlugged.m_objCollection = objCollection;

		UnitTestHarness.Base.initTestObject.apply( this, [ { m_strCollectionID: 'tagged', m_bAutoCompleteAttached: true,
            m_strInputText: _localStrings.ADD_TAGS } ] );
		
		objContext = objTestObject.getContext();

		objPlugged.setValue = function( in_strValue ) { this.m_bSetValueCalled = true; strInputText = in_strValue; };
		objPlugged.selectItem = function( in_strID ) { this.m_bSelectItemCalled = true; };
		objPlugged.unselectAll = function( in_bSuppress ) { this.m_bSupress = in_bSuppress; this.m_bRemoveAllCalled = true; };
		objPlugged.removeAllClassNames = function() { this.m_bRemoveAllClassNamesCalled = true; };
		objPlugged.clearState = function()
		{
			this.m_bRemoveAllClassNamesCalled = false;
			this.m_bRemoveAllCalled = false;
			this.m_bSelectItemCalled = false;
			this.m_bSupress = undefined;
			this.m_bSetValueCalled = false;
		};

		// The menu doesn't have this by unless we add the inputplugin, so we have to add it.
		objTestObject.setValue = function( in_strValue ) { strInputText = in_strValue; };
		
		objTestObject.setValue( 'NEW TEXT2' );
		fireunit.compare( strInputText, 'NEW TEXT2', 'testing objTestObject.setValue' );
		
		objPlugged.addMetaTagFromModel = function( in_objModel, in_bBoolean ) { this.nMetaTagAddCount++; }.bind( this );

		strMenuID = objTestObject.m_strMessagingID;
		strPluggedID = objPlugged.m_strMessagingID;
		strContextID = objContext.m_strMessagingID;
	},
	
	getExpectedListeners: function()
	{
		return {
			onbeforeshow: null,
			onhide: null,
			listitemselected: null,
			listitemunselected: null,
			autocompletematch: null,
			autocompletestart: null,
			autocompleteselect: null,
			applyclosedropdown: null,
			newtagcancel: null,
            taggedadd: null,
            textinputfocus: null
		};
	},
	
    test: function()
    {
        var objTestObject = this.getTestObject();
        //var objMessages, objPlugged, objContext;
        //var strMenuID, strPluggedID, strContextID;
        var strInputText = 'NEW NOTE';
        this.nMetaTagAddCount = 0;
        
        testConfiguration();
        
        this.testOnListItemSelectedFirst();
        
        this.testInitMenuItems();
      
        this.testOnAutoCompleteMatch();
        this.testOnAutoCompleteStart();
        this.testOnAutoCompleteSelect();
        this.testOnListItemSelected();
        this.testOnListItemUnSelected();
        this.testOnApplyCloseDropdown();
        this.testOnNewTagCancel();
        this.testOnTextInputFocus();
                
        function testConfiguration()
        {
            var bHasObject = TypeCheck.Defined( objTestObject.m_aobjMenuItems );
            fireunit.ok( bHasObject, 'configuration has menu items object' );
            if( bHasObject )
            {
                fireunit.ok( !Util.objectHasProperties( objTestObject.m_aobjTestObjectItems ), 'menu items object is empty' );
            } // end if
        };
        
        function testExpectedListeners()
        {
			// test1 - try with tagged.
			var objMessages = this.getExpectedListeners();
			objPlugged.m_objCollection.m_strModelType = 'tagged';
			objMessages.taggedadd = { from: Messages.all_publishers_id, test: testTaggedAdd };
            objTestObject.testExpectedListeners( objMessages );
			
			// test2 - try with contact.
			delete objMessages.taggedadd;
			objPlugged.m_objCollection.m_strModelType = 'contact';
			objMessages.contactadd = { from: Messages.all_publishers_id, test: testTaggedAdd };
            objTestObject.testExpectedListeners( objMessages );
        };
        
        function raiseMessage( in_strCausingMessage, in_aArguments )
        {
            var objConfig = objTestObject.getMessages()[ in_strCausingMessage ];
            if( objConfig )
            {
                var fncCallback = objConfig.listener, objContext = objConfig.context;
                
                objTestObject.resetRaisedMessages();
                objPlugged.resetRaisedMessages();
                objPlugged.clearState();
                fncCallback.apply( objContext, in_aArguments || [] );
            } // end if
        };

        function testOnBeforeShow( in_strMessage )
        {
            objPlugged.clearState();
            raiseMessage( in_strMessage, [ objPlugged ] );
            objPlugged.testRaisedMessages( {}, 'testOnBeforeShow' );
            fireunit.ok( objPlugged.m_bSetValueCalled, 'testOnBeforeShow: setValue called' );
            objPlugged.clearState();
        };
        
        function testOnHide( in_strMessage )
        {
            objPlugged.clearState();
            raiseMessage( in_strMessage, [ objPlugged ] );
            objPlugged.testRaisedMessages( {}, 'testOnHide' );
            fireunit.ok( objPlugged.m_bRemoveAllCalled, 'testOnHide: unselectAll called' );
            fireunit.ok( objPlugged.m_bSupress, 'testOnHide: unselectAll called with supress message' );
            fireunit.ok( objPlugged.m_bRemoveAllClassNamesCalled, 'testOnHide: removeAllClassNames called' );
            objPlugged.clearState();
        };

        function testTaggedAdd( in_strMessage )
        {
            // at first, keep us from raising messages.
            objTestObject.m_nTagsToAdd = 0;

            // test1 - make sure one meta tag can be added
            this.nMetaTagAddCount = 0;
            objTestObject.OnMetaTagAdd( { m_strID: 'dude' } );
            fireunit.ok( 1 == this.nMetaTagAddCount, in_strMessage + ' test1: number of meta tags added: ' + this.nMetaTagAddCount.toString() );
            
            // test2 - make sure two consecutive ones can be added
            this.nMetaTagAddCount = 0;
            objTestObject.OnMetaTagAdd( { m_strID: 'dude' } );
            objTestObject.OnMetaTagAdd( { m_strID: 'dudette' } );
            fireunit.ok( 2 == this.nMetaTagAddCount, in_strMessage + ' test2: number of meta tags added: ' + this.nMetaTagAddCount.toString() );
        };
    },


    testInitMenuItems: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        fireunit.ok( TypeCheck.Function( objTestObject.initMenuItems ), 'initMenuItems override function check' );
        
        this.nMetaTagAddCount = 0;
        objTestObject.initMenuItems();
        fireunit.ok( 2 == this.nMetaTagAddCount, 'number of meta tags added: ' + this.nMetaTagAddCount.toString() );
        
        this.nMetaTagAddCount = 0;
        objPlugged.m_objCollection.m_aobjItems = { one: {}, two: {}, three: {}, four: {} };
        objTestObject.initMenuItems();
        fireunit.ok( 4 == this.nMetaTagAddCount, 'number of meta tags added: ' + this.nMetaTagAddCount.toString() );
    },

    
    testOnAutoCompleteMatch: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - make sure collapselist and resizelist are raised.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteMatch( [] );
        objPlugged.testRaisedMessages( { collapselist: null, resizelist: null }, 'test1' );
    },

    testOnAutoCompleteSelect: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - make sure collapselist and resizelist are raised.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { name: 'fakename' } );
        objPlugged.testRaisedMessages( { addnewtag: null, createrequest: null }, 'test1' );
        
        // test2 - see if selectitem is raised if we pass in an entry with an ID.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { id: 'someid', name: 'fakename' } );
        objPlugged.testRaisedMessages( { tagrequest: null, selectlistitem: null }, 'test2' );
        
        // test3 - make sure if only an empty name is given, no messages are raised.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { name: '' } );
        objPlugged.testRaisedMessages( {}, 'test3' );
        
        // test4 - make sure that we do not do a create on the "Enter Tags" text
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { name: _localStrings.ADD_TAGS } );
        objPlugged.testRaisedMessages( {}, 'test4' );
    },
    
    testOnAutoCompleteStart: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - make sure collapselist and resizelist are raised.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteStart();
        objPlugged.testRaisedMessages( { uncollapselist: null, resizelist: null }, 'test1' );
    },
    
    testOnListItemSelected: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        objPlugged.resetRaisedMessages();
        objTestObject.m_bIgnoreNextListItemSelected = false;
        try
        {
            objTestObject.OnListItemSelected( 'id1' );
        } catch ( e )
        {
            fireunit.ok( false, 'test1 - don\'t forget about error: ' + e.toString() );
        } // end try-catch
        objPlugged.testRaisedMessages( { insertlastautocomplete: null, tagrequest: null }, 'test1' );
    },
    
    testOnListItemUnSelected: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        objPlugged.resetRaisedMessages();
        try
        {
            objTestObject.OnListItemUnSelected( 'id1' );
        } catch ( e )
        {
            fireunit.ok( false, 'test1 - don\'t forget about error: ' + e.toString() );
        } // end try-catch
        objPlugged.testRaisedMessages( { untagrequest: null }, 'test1' );
    },
    
    testOnApplyCloseDropdown: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - test the sequence of raise 'selectlastautocomplete', once the 
        //  'autocompleteselect' message is gotten, raise the 'tagrequest', 'applyrequests' and the 'close'
        objPlugged.resetRaisedMessages();
        objTestObject.OnApplyCloseDropdown();
        objPlugged.testRaisedMessages( { selectlastautocomplete: null }, 'test1' );
        
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { id: 'id1' } );
        objPlugged.testRaisedMessages( { selectlistitem: null, tagrequest: null, applyrequests: null, close: null }, 'test1 part 2' );

        // test1 part 3 - make sure it resets after the first one.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { id: 'id1' } );
        objPlugged.testRaisedMessages( { selectlistitem: null, tagrequest: null }, 'test1 part 3' );


        // test2 - test the sequence of raise 'selectlastautocomplete', once the 
        //  'autocompleteselect' message is gotten, raise the 'tagrequest', 'applyrequests' and the 'close'
        objPlugged.resetRaisedMessages();
        objTestObject.OnApplyCloseDropdown();
        objPlugged.testRaisedMessages( { selectlastautocomplete: null }, 'test2 part1' );

       // test2 part2 - it was a non matching request, make sure name comes in.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { name: 'name' } );
        objPlugged.testRaisedMessages( { addnewtag: null, createrequest: null, applyrequests: null, close: null }, 'test2 part2' );

        // test2 part3 - make sure it resets after the first one.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { id: 'id2' } );
        objPlugged.testRaisedMessages( { selectlistitem: null, tagrequest: null }, 'test2 part3' );

        
        // test3 - test the sequence of 'selectlastautocomplete', no tag or create because empty non-match,
        //  and then an 'applyrequests', and 'close'
        objPlugged.resetRaisedMessages();
        objTestObject.OnApplyCloseDropdown();
        objPlugged.testRaisedMessages( { selectlastautocomplete: null }, 'test3 part1' );

       // test3 part2 - an empty non matching request, make sure name comes in.
        objPlugged.resetRaisedMessages();
        objTestObject.OnAutoCompleteSelect( { name: '' } );
        objPlugged.testRaisedMessages( { applyrequests: null, close: null }, 'test3 part2' );
    },
    
    testOnListItemSelectedFirst: function()
    {
        // test1 - test the situation where OnListItemSelected is called 
        //  before anything else is done, it was not raising the 
        //  insertlastautocomplete or tagrequest messages
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - test the sequence of raise 'selectlastautocomplete', once the 
        //  'autocompleteselect' message is gotten, raise the 'tagrequest', 'applyrequests' and the 'close'
        objPlugged.resetRaisedMessages();
        objTestObject.OnListItemSelected( 'testid1' );
        objPlugged.testRaisedMessages( { tagrequest: null, insertlastautocomplete: null }, 'test1' );
    },
    
    testOnNewTagCancel: function()
    {
    
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - Make sure we cancel the request and resize the list.
        objPlugged.resetRaisedMessages();
        objTestObject.OnNewTagCancel( 'testid1' );
        objPlugged.testRaisedMessages( { cancelrequest: null, resizelist: null }, 'test1' );
    },
    
    testOnTextInputFocus: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();

        // test1 - The first request, we do nothing.
        // the second time through, raise the 'suspendmouse' message.
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( {}, 'test1: no messages raised first time through' );
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( { suspendmouse: null }, 'test1: suspendmouse raised second time through' );
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( { suspendmouse: null }, 'test1: suspendmouse raised third time through' );

        // test2 - close, reshow, The first request, we do nothing.
        // the second time through, raise the 'suspendmouse' message.
        objTestObject.OnBeforeShow();
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( {}, 'test2: no messages raised first time through' );
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( { suspendmouse: null }, 'test1: suspendmouse raised second time through' );
        objPlugged.resetRaisedMessages();
        objTestObject.OnTextInputFocus();
        objPlugged.testRaisedMessages( { suspendmouse: null }, 'test1: suspendmouse raised third time through' );
        
    }
} );
