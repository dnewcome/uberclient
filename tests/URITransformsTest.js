/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'URITransformsTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new UberObject();
    },
    
    initTestObject: function()
    {
        this.m_strProxyBaseURL = 'https://www.proxy.com/url=?';
        UnitTestHarness.Base.initTestObject.apply( this );
    },
    
    getExpectedListeners: function()
    {
        return {};
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        // Perform any tests below here
        this.testProxyURIs();
        this.testUnproxyURIs();
    },
    
    testProxyURIs: function()
    {
        // test1 - no change - no IMG with a SRC.
        var strInput = 'Some String';
        var strOutput = URITransforms.proxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strOutput, strInput, 'test1: strings are the same, no IMG' );
        
        // test2 - change - IMG with a SRC, in HTTPS Mode
        strInput = '<IMG SRC="http://www.fakeurl.com/fakepic.gif" />';
        strExpectedOutput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" />';
        strOutput = URITransforms.proxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test2: IMG SRCs converted correctly' );

        // test3 - change - IMG with a SRC, but with following class name, in HTTPS Mode
        strInput = '<IMG SRC="http://www.fakeurl.com/fakepic.gif" class="fakeclass" />';
        strExpectedOutput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" class="fakeclass" />';
        strOutput = URITransforms.proxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test3: IMG SRCs converted correctly' );

        // test2 - two IMGs with SRCs, in HTTPS mode.
        strInput = '<IMG SRC="http://www.fakeurl.com/fakepic.gif" class="fakeclass" />'
            + '<IMG SRC="http://www.fakeurl.com/fakepic2.gif" class="fakeclass" />';
        strExpectedOutput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" class="fakeclass" />'
            + '<IMG src="'+ this.m_strProxyBaseURL 
            + 'http://www.fakeurl.com/fakepic2.gif" class="fakeclass" />';;
        strOutput = URITransforms.proxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test2: IMG SRCs converted correctly' );

        // test5 - change - IMG with a SRC, but already a proxied URL, in HTTPS Mode
        strInput = '<IMG SRC="' + this.m_strProxyBaseURL + 'http://www.fakeurl.com/fakepic.gif" />';
        strExpectedOutput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" />';
        strOutput = URITransforms.proxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test5: IMG SRC stays the same, already proxied' );
        
        // test6 - no change, we aren't in HTTPS mode.
    },
    
    testUnproxyURIs: function()
    {
        // test1 - change - IMG with a SRC, in HTTPS Mode
        strInput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" />';
        strExpectedOutput = '<IMG src="http://www.fakeurl.com/fakepic.gif" />';
        strOutput = URITransforms.unproxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test1: IMG SRCs unproxied correctly' );

        // test2 - two IMGs with SRCs, in HTTPS mode.
        strInput = '<IMG src="' + this.m_strProxyBaseURL
            + 'http://www.fakeurl.com/fakepic.gif" class="fakeclass" />'
            + '<IMG src="'+ this.m_strProxyBaseURL 
            + 'http://www.fakeurl.com/fakepic2.gif" class="fakeclass" />';;
         strExpectedOutput = '<IMG src="http://www.fakeurl.com/fakepic.gif" class="fakeclass" />'
            + '<IMG src="http://www.fakeurl.com/fakepic2.gif" class="fakeclass" />';
        strOutput = URITransforms.unproxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test2: IMG SRCs unproxied correctly' );

        // test3 - No change.
        strInput = '<IMG src="http://www.fakeurl.com/fakepic.gif" />';
        strExpectedOutput = '<IMG src="http://www.fakeurl.com/fakepic.gif" />';
        strOutput = URITransforms.unproxySrcURIs( strInput, this.m_strProxyBaseURL );
        fireunit.compare( strExpectedOutput, strOutput, 'test3: IMG SRCs correctly kept in tact' );
        
    }
} );



