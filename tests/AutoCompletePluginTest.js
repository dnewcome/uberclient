/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    this.m_astrMatches = [];
    this.m_objInputBox = fireunit.id( 'testInputBox' );
    this.m_objInputBox.setSelectionRange = function( in_nBegin, in_nEnd ) {
        this.m_nBegin = in_nBegin;
        this.m_nEnd = in_nEnd;
    };
    
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'AutoCompletePluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new AutoCompletePlugin();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var me=this;
        objPlugged.$ = function(){ return me.m_objInputBox; };
        
        objTestObject.m_fncMatchFinder = this.getMatches.bind( this );
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testUpDownArrowBeforeKeypress();
        this.testKeyUpNoMatches();
        this.testKeyUpMatch();
        this.testKeyUpMultipleMatchesDownArrow();
        this.testNoEffectKeys();
        this.testUpDownArrowAfterBackspace();
        this.testCommaTabWithMatches();
        this.testOnInsertLast();
        this.testBackSpace();
        this.testEnter();
        this.testSelectNonmatchCloseSelectMatch();
    },
    
    getExpectedConfig: function()
    {
        return {
            m_strInputSelector: null,
            m_fncMatchFinder: null,
        };
    },
    
    setMatches: function( in_astrMatches )
    {
        this.m_astrMatches = in_astrMatches;
    },
    
    getMatches: function()
    {
        return this.m_astrMatches;
    },
    
    getExpectedListeners: function()
    {   // make sure we get the dom events too.
        this.getTestObject().OnRegisterDomEventHandlers();
        return {
            registerdomeventhandlers: null,
            onkeydown: null,
            onkeyup: null,
            insertlastautocomplete: null,
            selectlastautocomplete: null
        };
    },

    /**
    * testUpDownArrowBeforeKeypress - tests the up/down arrow but we have 
    *   not pressed any alphanumeric keys yet.  See if it blows up/gets any results
    */ 
    testUpDownArrowBeforeKeypress: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [] );
        this.m_objInputBox.value = 'testinput';
        
        // Comma is handled by the OnKeyDown 
        objEvent.setKeyCode( KeyCode.COMMA );
        objTestObject.OnKeyDown( objEvent );
        fireunit.compare( 'testinput, ', this.m_objInputBox.value, 'test1: value remained the same, no matches, insert ", "' );

        this.m_objInputBox.value = 'testinput';
        objEvent.setKeyCode( KeyCode.UP_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinput', this.m_objInputBox.value, 'test2: value remained the same, no matches' );

        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.ok( 'testinput', this.m_objInputBox.value, 'test3: value remained the same, no matches' );

    },
    
    
    /**
    * testKeyUpNoMatches - tests a key up but no matches.
    */ 
    testKeyUpNoMatches: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [] );
        objEvent.setKeyCode( KeyCode.M );
        this.m_objInputBox.value = 'testinput';
                
        objTestObject.OnKeyUp( objEvent );
        fireunit.ok( 'testinput' == this.m_objInputBox.value, 'test1: value remained the same, no matches' );

        this.m_objInputBox.value = 'testinput1, testinput2';
                
        objTestObject.OnKeyUp( objEvent );
        fireunit.ok( 'testinput1, testinput2' == this.m_objInputBox.value, 'test2: value remained the same, no matches, with comma' );
    },

    testKeyUpMatch: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [ { name: 'testinputmatch1' } ] );
        this.m_objInputBox.value = 'testinputm';

        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch1', this.m_objInputBox.value, 'test1: value matched, value testinputmatch1' );
    },

    testKeyUpMultipleMatchesDownArrow: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [ { name: 'testinputmatch1' }, { name: 'testinputmatch2' }, { name: 'testinputmatch3' } ] );
        this.m_objInputBox.value = 'testinputm';
                
        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch1', this.m_objInputBox.value, 'test1: value matched, value testinputmatch1' );
        fireunit.ok( 10 == this.m_objInputBox.m_nBegin, 'test2: beginning of selection set to ' + this.m_objInputBox.m_nBegin.toString() + 'th character' );
        fireunit.ok( 15 == this.m_objInputBox.m_nEnd, 'test3: end of selection set to ' + this.m_objInputBox.m_nEnd.toString() + 'th character' );
        
        // we have to reset the value to simulate a selection erasure.
        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch2', this.m_objInputBox.value, 'test4: value matched, value testinputmatch2' );

        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch3', this.m_objInputBox.value, 'test5: value matched, value testinputmatch3' );

        // Should wrap back around to the first match
        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch1', this.m_objInputBox.value, 'test6: value matched, value testinputmatch1 - wrap around' );

        // Test UP Arrow now!
        // we have to reset the value to simulate a selection erasure.
        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.UP_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch3', this.m_objInputBox.value, 'test4: value matched, value testinputmatch3' );

        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.UP_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch2', this.m_objInputBox.value, 'test5: value matched, value testinputmatch2' );

        // Should wrap back around to the first match
        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.UP_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch1', this.m_objInputBox.value, 'test6: value matched, value testinputmatch1 - wrap around' );

    },
    
    testNoEffectKeys: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [] );
        this.m_objInputBox.value = 'testinputm';
        objEvent.setKeyCode( KeyCode.SHIFT );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test1: shift key, no effect' );

        objEvent.setKeyCode( KeyCode.ALT );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test2: alt key, no effect' );

        objEvent.setKeyCode( KeyCode.CTL );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test3: control key, no effect' );

        objEvent.setKeyCode( KeyCode.HOME );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test4: home key, no effect' );

        objEvent.setKeyCode( KeyCode.END );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test5: end key, no effect' );

        /** I know it changes in reality, but for testing purposes it shouldn't because we aren't using
        *    a real input box.  It should though reset the matches.
        */
        objEvent.setKeyCode( KeyCode.BACKSPACE );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test6: backspace key, no effect' );

        objEvent.setKeyCode( KeyCode.LEFT_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test7: left arrow key, no effect' );

        objEvent.setKeyCode( KeyCode.RIGHT_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputm', this.m_objInputBox.value, 'test8: right arrow key, no effect' );

    },
    
    testUpDownArrowAfterBackspace: function()
    {
        var objTestObject = this.getTestObject();
        var objEvent = new DOMEvent();
        
        this.setMatches( [ { name: 'testinputmatch1' }, { name: 'testinputmatch2' }, { name: 'testinputmatch3' } ] );

        this.m_objInputBox.value = 'testinput';

        /** I know it changes in reality, but for testing purposes it shouldn't because we aren't using
        *    a real input box.  It should though reset the matches.
        */
        objEvent.setKeyCode( KeyCode.BACKSPACE );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinput', this.m_objInputBox.value, 'test1: backspace key, no effect' );

        // Now, simulate the backspace by setting the value
        this.m_objInputBox.value = 'testinput';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch1', this.m_objInputBox.value, 'test1: down arrow, finds match' );

        this.m_objInputBox.value = 'testinput';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch2', this.m_objInputBox.value, 'test2: down arrow, finds match' );

        this.m_objInputBox.value = 'testinput';
        objEvent.setKeyCode( KeyCode.DOWN_ARROW );
        objTestObject.OnKeyUp( objEvent );
        fireunit.compare( 'testinputmatch3', this.m_objInputBox.value, 'test3: down arrow, finds match' );
    
    },
    
    testCommaTabWithMatches: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        var objEvent = new DOMEvent();
        
        this.setMatches( [ { name: 'testinputmatch1' }, { name: 'testinputmatch2' }, { name: 'testinputmatch3' } ] );

        this.m_objInputBox.value = 'testinput';

        // test1 - set up so there are matches with comma
        // test2 - set up so there are matches with tab
        // test3 - set up so there are no matches with tab.
        // test4 - set up so there are no matches with comma.

        // set up test1 - with comma, first get matches.
        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );

        objPlugged.resetRaisedMessages();
        objEvent.setKeyCode( KeyCode.COMMA );
        objTestObject.OnKeyDown( objEvent );
        fireunit.compare( 'testinputmatch1, ', this.m_objInputBox.value, 'test1: match with comma, comma and space added' );
        fireunit.ok( this.m_objInputBox.m_nBegin == 'testinputmatch1, '.length, 'test1a: cursor beginning placed in right place' );
        fireunit.ok( this.m_objInputBox.m_nEnd == 'testinputmatch1, '.length, 'test1b: cursor end placed in right place' );
        objPlugged.testRaisedMessages( { autocompleteselect: null, autocompletestart: null }, 'test1' );
        
        // test2 - with tab.
        this.m_objInputBox.value = 'testinput';

        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );

        objPlugged.resetRaisedMessages();
        objEvent.setKeyCode( KeyCode.TAB );
        objTestObject.OnKeyDown( objEvent );
        fireunit.compare( 'testinputmatch1, ', this.m_objInputBox.value, 'test2: match with tab, comma and space added' );
        fireunit.ok( this.m_objInputBox.m_nBegin == 'testinputmatch1, '.length, 'test2a: cursor beginning placed in right place' );
        fireunit.ok( this.m_objInputBox.m_nEnd == 'testinputmatch1, '.length, 'test2b: cursor end placed in right place' );
        objPlugged.testRaisedMessages( { autocompleteselect: null, autocompletestart: null }, 'test2' );

        // test3 - test with no matches with tab
        this.setMatches( [] );
        this.m_objInputBox.value = 'testinput';
        
        // type key to reset object's matches, but this won't actually put the m in the input box.
        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );

        objPlugged.resetRaisedMessages();
        objEvent.setKeyCode( KeyCode.TAB );
        objTestObject.OnKeyDown( objEvent );
        fireunit.compare( 'testinput', this.m_objInputBox.value, 'test3: no matches tab, input not changed.' );
        objPlugged.testRaisedMessages( {}, 'test3' );

        // test4 - test with no matches with comma, should insert comma and space
        objEvent.setKeyCode( KeyCode.COMMA );
        objTestObject.OnKeyDown( objEvent );
        fireunit.compare( 'testinput, ', this.m_objInputBox.value, 'test4: no matches, comma, comma and space added' );
        objPlugged.testRaisedMessages( { autocompleteselect: null, autocompletestart: null }, 'test4' );
        
    },
    
    testOnInsertLast: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        
        this.m_objInputBox.value = '';
        
        // test1: insert into a blank box
        objPlugged.resetRaisedMessages();
        objTestObject.OnInsertLast( 'testitem1' );
        fireunit.compare( 'testitem1, ', this.m_objInputBox.value, 'test1: item1 inserted correctly' );
        objPlugged.testRaisedMessages( { autocompletestart: null }, 'test1' );        
        
        // test2: insert into fresh start
        objTestObject.OnInsertLast( 'testitem2' );
        fireunit.compare( 'testitem1, testitem2, ', this.m_objInputBox.value, 'test2: item2 inserted correctly' );
        
        // test3: insert into partial match
        this.m_objInputBox.value += 'test';
        objTestObject.OnInsertLast( 'testitem3' );
        fireunit.compare( 'testitem1, testitem2, testitem3, ', this.m_objInputBox.value, 'test3: item3 inserted correctly' );

        // test4: insert into non-match
        this.m_objInputBox.value += 'mismatch';
        objTestObject.OnInsertLast( 'testitem4' );
        fireunit.compare( 'testitem1, testitem2, testitem3, testitem4, ', this.m_objInputBox.value, 'test4: item4 inserted correctly' );
        
        // test5: after former partial match, insert a different match.  should
        //  cause an autocompletestart, with the message raised with no id.
        // We have to cause a match first.
        this.m_objInputBox.value = 'test';
        this.setMatches( [ { id: 'testid1', name: 'testinputmatch1' }, { id: 'testid2', name: 'testinputmatch2' } ] );
        objEvent.setKeyCode( KeyCode.I );
        objTestObject.OnKeyUp( objEvent );
        objPlugged.resetRaisedMessages();
        objTestObject.OnInsertLast( 'testinputmatch2' );
        objPlugged.testRaisedMessages( { autocompletestart: null } );
    },
    
    testBackSpace: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        objEvent.setKeyCode( KeyCode.BACKSPACE );

        // test1, test an empty box
        objPlugged.resetRaisedMessages();
        this.m_objInputBox.value = '';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( { autocompletestart: null }, 'test1: autocompletestart raised' );
        fireunit.compare( '', this.m_objInputBox.value, 'test1: nothing inserted' );
        
        // test2, test a non-empty box, with no match, but we erased the first character of an item
        //  essentially restarting the match process.
        objPlugged.resetRaisedMessages();
        this.setMatches( [] );
        this.m_objInputBox.value = 'testvalue, ';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( { autocompletestart: null }, 'test2: autocompletestart raised' );
        fireunit.compare( 'testvalue, ', this.m_objInputBox.value, 'test2: nothing inserted' );

        // test3, test a non-empty box, with no match, but there are characters in this word.        
        objPlugged.resetRaisedMessages();
        this.setMatches( [] );
        this.m_objInputBox.value = 'testvalue';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( {}, 'test3: no messages raised' );
        fireunit.compare( 'testvalue', this.m_objInputBox.value, 'test3: nothing inserted' );

        // test4, test a non-empty box, but with match
        objPlugged.resetRaisedMessages();
        this.setMatches( [ { name: 'testinputmatch1' } ] );
        this.m_objInputBox.value = 'test';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( { autocompletematch: null }, 'test4: autocompletematch raised' );
        fireunit.compare( 'test', this.m_objInputBox.value, 'test4: backspace, no match inserted' );
        
        // test5, deleted all text, after a match.
        objPlugged.resetRaisedMessages();
        this.setMatches( [ { name: 'testinputmatch1' } ] );
        this.m_objInputBox.value = '';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( { autocompletestart: null }, 'test5' );
        fireunit.compare( '', this.m_objInputBox.value, 'test5: backspace, all text deleted, none inserted' );
    },
    
    testEnter: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();
        objEvent.setKeyCode( KeyCode.BACKSPACE );

        // test1, test an empty box
        objPlugged.resetRaisedMessages();
        this.m_objInputBox.value = '';
        objTestObject.OnKeyUp( objEvent );
        objPlugged.testRaisedMessages( { autocompletestart: null }, 'test1: autocompletestart raised' );
        fireunit.compare( '', this.m_objInputBox.value, 'test1: nothing inserted' );
    },
    
    testSelectNonmatchCloseSelectMatch: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objEvent = new DOMEvent();

        // test1 - we have to start by inputting a non-match, close the menu (OnSelectEntry), re-open, 
        //  and then do a 'insertlastautocomplete'.  It will not select the one
        //  just inserted, but instead the non-match from before.
        objPlugged.resetRaisedMessages();
        this.setMatches( [] );
        this.m_objInputBox.value = 'testinput';
        objEvent.setKeyCode( KeyCode.M );
        objTestObject.OnKeyUp( objEvent );
        
        // no matches so far, so we are good, do an insert last, simulate the close.
        objTestObject.OnSelectEntry();
        
        // now do the insertlast, simulates a click in the menu.
        objTestObject.OnInsertLast( 'testname2' );
        
        // now do the final select, see what our output is.
        objTestObject.OnSelectEntry();
        
        // now, since we have already inserted the testname2 into the last position, it should be clear.
        var objParams = objPlugged.getRaisedMessage( 'autocompleteselect' ).arguments[ 0 ];
        fireunit.ok( !Util.objectHasProperties( objParams ), 'test1: object has no properties' );
    }
} );



