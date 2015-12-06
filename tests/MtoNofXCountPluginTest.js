/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'MtoNofXCountPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new MtoNofXCountPlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        objTestObject.m_objPlugged = new Display();
        objTestObject.m_objPlugged.init();
        
        UnitTestHarness.Base.initTestObject.apply( this, [ {
            m_strFirstSelector: 'first',
            m_strLastSelector: 'last',
            m_strTotalSelector: 'total'
        } ] );
        
        
    },
    
    getExpectedConfig: function()
    {
        return {
            m_strFirstSelector: null,
            m_strLastSelector: null,
            m_strTotalSelector: null,
            m_strUpdateMessage: null
        };
    },
    
    getExpectedListeners: function()
    {
        return {
            updatecounts: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnUpdateCounts();
    },
    
    testOnUpdateCounts: function()
    {
        var objTestObject = this.getTestObject();
        var objFirst = fireunit.id( 'first' );
        var objLast = fireunit.id( 'last' );
        var objTotal = fireunit.id( 'total' );
        var objContainer = fireunit.id( 'container' );
        
        // test1, set to 1 to 2 of 5
        objTestObject.OnUpdateCounts( 1, 2, 5 );
        fireunit.compare( '1', objFirst.innerHTML, 'test1: first correct' );
        fireunit.compare( '2', objLast.innerHTML, 'test1: last correct' );
        fireunit.compare( '5', objTotal.innerHTML, 'test1: total correct' );
        fireunit.ok( objContainer.hasClassName( 'differentfirstlast' ), 'test1: differentfirstlast classname on container' );
        
        // test2, set to 1, 1 of 5, we want, 1, 1, and 5
        objTestObject.OnUpdateCounts( 1, 1, 5 );
        fireunit.compare( '1', objFirst.innerHTML, 'test2: first correct' );
        fireunit.compare( '1', objLast.innerHTML, 'test2: last correct' );
        fireunit.compare( '5', objTotal.innerHTML, 'test2: total correct' );
        fireunit.ok( !objContainer.hasClassName( 'differentfirstlast' ), 'test2: differentfirstlast classname not on container' );
               
    }
} );



