
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'ListResizePluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   
        return new ListResizePlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        objTestObject.m_objPlugged = new ListDisplay();
        
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_bResizeOnShow: true } ] );
    },
    
    getExpectedConfig: function()
    {
        return { m_bResizeOnShow: null };
    },
    
    getExpectedListeners: function()
    {
        return {
            onbeforeshow: null,
            onshow: null,
            resizelist: null        
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnBeforeShow();
        this.testOnShow();
    },
    
    testOnBeforeShow: function()
    {
        var objTestObject = this.getTestObject();
        var objPluggedObject = objTestObject.getPlugged();
        var objListElement = fireunit.id( 'container' );
        var objListAreaElement = fireunit.id( 'listarea' );
        
        var objPosition = [ 0, 100 ];
        objPluggedObject.m_strListItemAreaSelector = 'listarea';

        // test1 - make sure the container has its height set to auto, 
        //  that the list container's height is set to auto,
        //  and that it is positioned off the screen.
        objListElement.style.height = '150px';
        objListAreaElement.style.height = '160px';
        objTestObject.OnBeforeShow( objPosition );

        fireunit.ok( null === objListElement.getStyle( 'height' ), 'test1: list container height set to auto' );
        fireunit.ok( null === objListAreaElement.getStyle( 'height' ), 'test1: list area height set to auto' );
        fireunit.ok( -100 > parseInt( objPosition[ 1 ], 10 ), 'test1: position set correctly well off the screen' );
        
        // test2 - call OnBeforeShow with no position, make sure it doesn't die
        //  and that the list container's height is set to auto, and that
        //  the list height is set to auto.
        objListElement.style.height = '150px';
        objListAreaElement.style.height = '200px';
        objTestObject.OnBeforeShow();

        fireunit.ok( null === objListElement.getStyle( 'height' ), 'test2: list container height set to auto' );
        fireunit.ok( null === objListAreaElement.getStyle( 'height' ), 'test2: list area height set to auto' );
    },
    
    testOnShow: function()
    {
        var objTestObject = this.getTestObject();
        var objListElement = fireunit.id( 'container' );
        var objListAreaElement = fireunit.id( 'listarea' );

        // test1 - make sure the container has a real height;
        objListElement.style.position = 'absolute';
        objTestObject.OnBeforeShow( [ 0, 10 ] );
        // Display's OnShow places the display off screen, have to simultate this.
        objListElement.style.top = '-2000px';
        objTestObject.OnShow();
        fireunit.ok( null !== objListElement.getStyle( 'height' ), 'test1: list container has a height' );
        fireunit.ok( null !== objListAreaElement.getStyle( 'height' ), 'test1: list area has a height' );
        fireunit.compare( '10px', objListElement.style.top, 'test1: list container placed back at 10px' );

        // test2 - OnBeforeShow not called with a position, it is resize in place, 
        //  make sure list element does not move.
        objListElement.style.position = 'absolute';
        objTestObject.OnBeforeShow();
        // Display's OnShow places the display off screen, have to simultate this.
        objListElement.style.top = '200px';
        objTestObject.OnShow();
        fireunit.ok( null !== objListElement.getStyle( 'height' ), 'test2: list container has a height' );
        fireunit.ok( null !== objListAreaElement.getStyle( 'height' ), 'test2: list area has a height' );
        fireunit.compare( '200px', objListElement.style.top, 'test2: list container kept at 200px' );
    }
    
} );

