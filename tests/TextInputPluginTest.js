/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'TextInputPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new TextInputPlugin();
    },
    
	initTestObject: function()
	{
		var objTestObject = this.getTestObject();
		objTestObject.m_objPlugged = new Display();
		
		UnitTestHarness.Base.initTestObject.apply( this );
	},
	
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        // Perform any tests below here
        this.testGetValue();
		
		this.testSubmitOnEnter();
    },
    
    testGetValue: function() 
    {
        var objTestObject = this.getTestObject();
		var objInput = fireunit.id( 'input' );

		objTestObject.m_strInputSelector = 'input';
		objTestObject.m_bChanged = true;
		
		// test1 - input box set the text and then see if we can get it back.
		objInput.value = 'testvalue1';
		fireunit.compare( 'testvalue1', objTestObject.getValue(), 'test1: plaintext value gotten' );
		
		// test2 - input box set with value with html characters
		objInput.value = '<testvalue2>';
		fireunit.compare( '&lt;testvalue2&gt;', objTestObject.getValue(), 'test2: html characters escaped' );

		// test3 - input box set with value with newlines - newlines should be converted to space
		objInput.value = 'testvalue6\nsomething';
		fireunit.compare( 'testvalue6 something', objTestObject.getValue(), 'test3: newlines converted to space' );
		
		// test4 - textarea box set with text and see if we can get it back.
		var objInput = fireunit.id( 'textarea' );
		objTestObject.m_strInputSelector = 'textarea';
		objInput.value = 'testvalue4';
		fireunit.compare( 'testvalue4', objTestObject.getValue(), 'test4: plaintext value gotten' );
		
		// test5 - textarea set with value with newlines
		objInput.value = 'testvalue5\nsomething';
		fireunit.compare( 'testvalue5\nsomething', objTestObject.getValue(), 'test5: newlines kept' );

		// test6 - textarea set with value with html characters
		objInput.value = '<testvalue6>\n<testvalue6a>';
		fireunit.compare( '&lt;testvalue6&gt;\n&lt;testvalue6a&gt;', objTestObject.getValue(), 'test6: html characters escaped, newline kept' );
    },
	
	testSubmitOnEnter: function()
	{
        var objTestObject = this.getTestObject();
		var objPlugged = objTestObject.getPlugged();
		var objInput = fireunit.id( 'input' );
		var objEvent = new DOMEvent();
		
		objTestObject.m_strInputSelector = 'input';
		objTestObject.m_bChanged = true;
		objInput.value = 'testvalue1';
		
		// test1 - enter pressed with m_bSubmitOnEnter true, expect a message.
		objTestObject.m_bSubmitOnEnter = true;
		objEvent.setKeyCode( KeyCode.ENTER );
		objPlugged.resetRaisedMessages();
		objTestObject.OnKeyDown( objEvent );
		objPlugged.testRaisedMessages( { textinputsubmit: null }, 'test1: textinputsubmit raised on enter' );
		
		// test2 - enter pressed with m_bSubmitOnEnter false, no message expected.
		objTestObject.m_bSubmitOnEnter = false;
		objEvent.setKeyCode( KeyCode.ENTER );
		objPlugged.resetRaisedMessages();
		objTestObject.OnKeyDown( objEvent );
		objPlugged.testRaisedMessages( {}, 'test1: textinputsubmit not raised on enter, m_bSubmitOnEnter is false' );
		
	}
} );



