
function UnitTestHarness()
{
    this.m_objBaseObject = undefined;

    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'PluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    test: function()
    {
        this.testExtend();
        this.testExtendContext();
        this.testGetReplaced();
    },

    createTestObject: function()
    {
        var objTestObject = new Plugin();

        this.m_objBaseObject = new UberObject();
        this.m_objBaseObject.testExtend = function() { return 'replaced'; };
        this.m_objBaseObject.m_strRetVal = 'baseobject';

        objTestObject.m_objPlugged = this.m_objBaseObject;
    
        return objTestObject;
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_objPlugged: this.m_objBaseObject } ] );
        var objTestObject = this.getTestObject();
        
        objTestObject.testExtend = this.fncTestExtendFunction;
        objTestObject.testExtendContext = this.fncTestExtendFunction;
        objTestObject.m_strRetVal = 'plugin';
        
    },

    testExpectedFunctions: function()
    {
        fireunit.ok( TypeCheck.Function( Plugin.prototype.init ), 'init exists' );
        fireunit.ok( TypeCheck.Function( Plugin.prototype.RegisterListener ), 'RegisterListener exists' );
        fireunit.ok( TypeCheck.Function( Plugin.prototype.RegisterListenerObject ), 'RegisterListenerObject exists' );
        fireunit.ok( TypeCheck.Function( Plugin.prototype.getPlugged ), 'getPlugged exists' );
        fireunit.ok( TypeCheck.Function( Plugin.prototype.extendPlugged ), 'extendPlugged exists' );
        fireunit.ok( TypeCheck.Function( Plugin.prototype.getReplaced ), 'getReplaced exists' );
    },
    
    fncTestExtendFunction: function()
    {   // will be run in the context of the plugged object.
        return this.m_strRetVal;
    },

    testExtend: function()
    {
        /** Attach to run in the context of the base object **/
        this.getTestObject().extendPlugged( 'testExtend' );
        var bTestValue = TypeCheck.Function( this.m_objBaseObject.testExtend );
        
        if( bTestValue )
        {
            var strRetVal = this.m_objBaseObject.testExtend();
            fireunit.compare( this.m_objBaseObject.m_strRetVal, strRetVal, 'testExtend gets correct value' );
        } // end if
        
        fireunit.ok( bTestValue, 'testExtend OK' );
        
    },

    testExtendContext: function()
    {
        var bTestValue = !TypeCheck.Function( this.m_objBaseObject.testExtendContext );
        
        if( bTestValue )
        {   /** Attach to run in the context of the plugin **/
            this.getTestObject().extendPlugged( 'testExtendContext', this.getTestObject() );
            bTestValue = TypeCheck.Function( this.m_objBaseObject.testExtendContext );
        } // end if
        
        if( bTestValue )
        {
            var strRetVal = this.m_objBaseObject.testExtendContext();
            fireunit.compare( this.getTestObject().m_strRetVal, strRetVal, 'testExtendContext gets correct value' );
        } // end if
        fireunit.ok( bTestValue, 'testExtendContext OK' );
    },
    
    testGetReplaced: function()
    {
        /** Try to get an existing replaced function **/
        var fncReplaced = this.getTestObject().getReplaced( 'testExtend' );
        fireunit.ok( TypeCheck.Function( fncReplaced ), 'replaced function returned' );
        fireunit.compare( fncReplaced(), 'replaced', 'replaced function return value' );
        
        /** Try to get a non-existent replaced function **/
        var fncReplaced = this.getTestObject().getReplaced( 'testExtendContext' );
        fireunit.ok( TypeCheck.Undefined( fncReplaced ), 'get non existent replaced function' );
    }
    
} );

function Display(){};
Display.prototype.UnRegisterDomEventHandlers = function(){};