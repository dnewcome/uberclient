/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ExternalSourceIframeTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new ExternalSourceIframeDisplay();
    },
    
    getExpectedListeners: function()
    {
        return {
            setheader: null,
            setsource: null,
            focus: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testSetHeader();
        this.testSetSource();
        this.testGetSource();
        this.testShow();
    },

    testSetHeader: function()
    {
        var objTestObject = this.getTestObject();
        var objHeaderElement = fireunit.id( 'elementHeader' );
        
        objTestObject.setHeader( 'testSetHeader' );
        fireunit.compare( objHeaderElement.innerHTML, 'testSetHeader', 'test1: header set correctly' );    
    },
    
    testSetSource: function()
    {
        var objTestObject = this.getTestObject();
        var objIFrame = fireunit.id( 'elementContents' );
        
        objTestObject.setSource( 'javascript:"testSetSource"' );
        fireunit.compare( objIFrame.src, 'javascript:"testSetSource"', 'test1: source set correctly' );
    },
    
    testGetSource: function()
    {
        var objTestObject = this.getTestObject();
    
        objTestObject.setSource( 'javascript:"testGetSource"' );
        var strSource = objTestObject.getSource();
        
        fireunit.compare( strSource, 'javascript:"testGetSource"', 'test1: source get correct' );
    },
    
    testShow: function()
    {
        var objTestObject = this.getTestObject();
        var objIFrame = fireunit.id( 'elementContents' );
        var objHeaderElement = fireunit.id( 'elementHeader' );
        
        objTestObject.show( 'javascript:"testShow"', 'testShowHeader' );
        
        fireunit.compare( objHeaderElement.innerHTML, 'testShowHeader', 'test1: header set correctly' );
        fireunit.compare( objIFrame.src, 'javascript:"testShow"', 'test2: source set correctly' );
    }
} );



