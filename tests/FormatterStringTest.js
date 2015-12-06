function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'FormatterStringTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create a random object, we don't need to create anything.
        return new UberObject();
    },
    
    getExpectedListeners: function()
    {
        return {};
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testURL();
        this.testMultilineFormat();

    },
    
    
    testURL: function()
    {
        var fncTest = ExtraInfoDataPlugin.getFormatter( 'string' );
        
        // test1 - no URL
        var strFormatted = fncTest( 'teststring1 testword2' );
        fireunit.compare( 'teststring1 testword2', strFormatted, 'test1: no URL, no transform' );
        
        // test2 - plain http:// url
        var strFormatted = fncTest( 'http://www.ubernote.com' );
        fireunit.compare( '<a target="_blank" href="http://www.ubernote.com">http://www.ubernote.com</a>', strFormatted, 'test2 basic http:// URL' );
        
        // test3 - a www. url
        var strFormatted = fncTest( 'www.ubernote.com' );
        fireunit.compare( '<a target="_blank" href="http://www.ubernote.com">www.ubernote.com</a>', strFormatted, 'test3 www. URL' );

        // test4 - a www.xyz.co.uk url
        var strFormatted = fncTest( 'www.xyz.co.uk' );
        fireunit.compare( '<a target="_blank" href="http://www.xyz.co.uk">www.xyz.co.uk</a>', strFormatted, 'test4 www.xyz.co.uk URL' );

        // test5 - https:// url
        var strFormatted = fncTest( 'https://www.xyz.co.uk' );
        fireunit.compare( '<a target="_blank" href="https://www.xyz.co.uk">https://www.xyz.co.uk</a>', strFormatted, 'test5 https://www.xyz.co.uk URL' );

    },
    
	testMultilineFormat: function()
	{
		var objTestObject = this.getTestObject();
		var fncFormatter = ExtraInfoDataPlugin.getFormatter( 'multiline' );
		
		// test1 - single line.
		fireunit.compare( 'testline1', fncFormatter( 'testline1' ), 'test1: a single line' );

		// test2 - test a double line
		fireunit.compare( 'testline1<br />testline2', fncFormatter( 'testline1\ntestline2' ), 'test2: a double line' );
		
		// test3 - test a triple line
		fireunit.compare( 'testline1<br />testline2<br />testline3', fncFormatter( 'testline1\ntestline2\ntestline3' ), 'test3: a triple line' );
		
		// test4 - test a single line with trailing \n
		fireunit.compare( 'testline1', fncFormatter( 'testline1\n' ), 'test4: a single line with trailing \n' );

	}    
} );



