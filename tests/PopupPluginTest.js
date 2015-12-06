function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'PopupPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new PopupPlugin();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
                
        var objDisplay = new Display();
        objDisplay.init();
        objTestObject.setPlugged( objDisplay );

        UnitTestHarness.Base.initTestObject.apply( this, arguments );
    },
    
    getExpectedListeners: function()
    {
        this.getTestObject().OnRegisterDomEventHandlers();
            
        return {
            registerdomeventhandlers: null,
            showtimed: null,
            starthidetimer: null,
            close: null,
            onshow: null,
            onhide: null,
            cancelmouseout: null,
			startmouseout: null,
            onmouseover: null,
            onmouseout: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testClearHideTimer();
        this.testOnHide();
        this.testOnMouseOver();
        this.testOnMouseOut();
        this.testStartHideTimer();
        this.testOnStartHideTimer();
        this.testOnShow();
    },
    
    testClearHideTimer: function()
    {
        var objTestObject = this.getTestObject();
        // test1 - call without the force, timer set.  We want the timer
        //  cleared and to see if it has been nulled.  simulates call with OnShow or show
        Timeout.reset();
        Timeout.createTimeout( 'testhidetimer' );
        objTestObject.setHideTimer( 'testhidetimer' );
        objTestObject.clearHideTimer();
        
        fireunit.ok( !Timeout.getTimeout( 'testhidetimer' ), 'test1 - timeout.clearTimeout called' );
        fireunit.ok( null === objTestObject.getHideTimer(), 'test1 - timeout cleared' );
        
        // test2 - simulate call with showTimed, without the force
        Timeout.reset();
        Timeout.createTimeout( 'testhidetimer' );
        objTestObject.setHideTimer( 'testhidetimer' );
        objTestObject.m_nExplicitTime = 1;
        objTestObject.clearHideTimer();
        
        fireunit.ok( Timeout.getTimeout( 'testhidetimer' ), 'test2 - timeout.clearTimeout not called' );
        fireunit.ok( 'testhidetimer' === objTestObject.getHideTimer(), 'test2 - timeout not cleared' );
        
        // test3 - simulate call with showTimed, with force
        Timeout.reset();
        Timeout.createTimeout( 'testhidetimer' );
        objTestObject.setHideTimer( 'testhidetimer' );
        objTestObject.m_nExplicitTime = 1;
        objTestObject.clearHideTimer( true );
        
        fireunit.ok( !Timeout.getTimeout( 'testhidetimer' ), 'test3 - timeout.clearTimeout called' );
        fireunit.ok( null === objTestObject.getHideTimer(), 'test3 - timeout cleared' );
    },
    
    testOnHide: function()
    {
        var objTestObject = this.getTestObject();
        var fncOrigClearHideTimer = objTestObject.clearHideTimer;
        var bForce = undefined;
        objTestObject.clearHideTimer = function( in_bForce ) { bForce = in_bForce; };
        
        // test1 - we want it to force clear the hide timer, set shown to false can clear the explicit time.
        objTestObject.m_nExplicitTime = 1;
        objTestObject.m_bShown = true;
        
        objTestObject.OnHide();
        fireunit.ok( true === bForce, 'test1: - clearTimeout called with force' );
        fireunit.ok( !objTestObject.m_nExplicitTime, 'test1: - explicit time cleared' );
        fireunit.ok( !objTestObject.m_bShown, 'test1: - shown set to false' );
        
        objTestObject.clearHideTimer = fncOrigClearHideTimer;
    },
    
    testOnMouseOver: function()
    {
        // test to make sure that the clearHideTimer was called without the force option.
        var objTestObject = this.getTestObject();
        var fncOrigClearHideTimer = objTestObject.clearHideTimer;
        var bForce = undefined;
        objTestObject.clearHideTimer = function( in_bForce ) { bForce = ( true === in_bForce ); };
        
        // test1 - we want it to force clear the hide timer, set shown to false can clear the explicit time.
        objTestObject.OnMouseOver();
        fireunit.ok( false === bForce, 'test1: - clearTimeout called without force' );
        
        objTestObject.clearHideTimer = fncOrigClearHideTimer;
    },
    
    testOnMouseOut: function()
    {
        var objTestObject = this.getTestObject();
        var fncOrigStartHideTimer = objTestObject.startHideTimer;
        var nTimeout = undefined;
        objTestObject.startHideTimer = function( in_nTimeout ) { nTimeout = in_nTimeout; };
        objTestObject.m_nHideDelayMS = 1566;
        
        // test1 - we want it to force clear the hide timer, set shown to false can clear the explicit time.
        DOMEvent.setMouseLeave( true );
        objTestObject.m_nExplicitTime = 0;
        objTestObject.OnMouseOut();
        fireunit.ok( 1566 === nTimeout, 'test1: - startHideTimer set to 1566' );

        // test2 - mouseout returns false, do nothing.
        DOMEvent.setMouseLeave( false );
        nTimeout = null;
        objTestObject.m_nExplicitTime = 0;
        objTestObject.OnMouseOut();
        fireunit.ok( null === nTimeout, 'test2: - mouseout false, do nothing' );

        // test3 - explicit time set, do nothing
        DOMEvent.setMouseLeave( true );
        nTimeout = null;
        objTestObject.m_nExplicitTime = 1;
        objTestObject.OnMouseOut();
        fireunit.ok( null === nTimeout, 'test3: - explicit time set, do nothing' );

        // test4 - hide delay not set, do nothing.
        objTestObject.m_nHideDelayMS = undefined;
        DOMEvent.setMouseLeave( true );
        nTimeout = null;
        objTestObject.m_nExplicitTime = 0;
        objTestObject.OnMouseOut();
        fireunit.ok( null === nTimeout, 'test4: - hide delay not set, do nothing' );
        
		// test5 - cancel mouse out set, do nothing.
        objTestObject.m_nHideDelayMS = 5;
		objTestObject.m_bCancelMouseOut = true;
        DOMEvent.setMouseLeave( true );
        nTimeout = null;
        objTestObject.m_nExplicitTime = 0;
        objTestObject.OnMouseOut();
        fireunit.ok( null === nTimeout, 'test5: - cancel mouseout set, do nothing' );

		// test6 - cancel mouse out not set, do it.
        objTestObject.m_nHideDelayMS = 5;
		objTestObject.m_bCancelMouseOut = false;
        DOMEvent.setMouseLeave( true );
        nTimeout = null;
        objTestObject.m_nExplicitTime = 0;
        objTestObject.OnMouseOut();
        fireunit.ok( 5 === nTimeout, 'test6: - all systems GO' );
		
        objTestObject.startHideTimer = fncOrigStartHideTimer;
    },

    testStartHideTimer: function()
    {
        var objTestObject = this.getTestObject();
        
        var fncOrigClearHideTimer = objTestObject.clearHideTimer;
        var fncOrigSetHideTimer = objTestObject.setHideTimer;
        var bForce = undefined;
        var objTimer = undefined;
        objTestObject.clearHideTimer = function( in_bForce ) { bForce = ( true === in_bForce ); };
        objTestObject.setHideTimer = function( in_objTimer ) { objTimer = in_objTimer; };
        
        // test1 - check to make sure the old timers were force cleared,
        //  and whether the new timer was set.
        objTestObject.startHideTimer( 1566 );
        
        fireunit.ok( bForce === true, 'test1: old timeout force cleared' );
        fireunit.ok( undefined != typeof( objTimer ), 'test1: new timeout created' );
        
        objTestObject.clearHideTimer = fncOrigClearHideTimer;
        objTestObject.setHideTimer = fncOrigSetHideTimer;
    },
    
    testOnShow: function()
    {
        var objTestObject = this.getTestObject();
        
        var fncOrigClearHideTimer = objTestObject.clearHideTimer;
        var fncOrigStartHideTimer = objTestObject.startHideTimer;
        var bForce = undefined;
        var nTimeout = undefined;
        objTestObject.clearHideTimer = function( in_bForce ) { bForce = ( true === in_bForce ); };
        objTestObject.startHideTimer = function( in_nTimeout ) { nTimeout = in_nTimeout; };
        
        objTestObject.m_bStartHideTimerOnShow = true;
        // test1 - check to make sure the old timers were force cleared,
        //  and whether the new timer was set with explicit time.
        objTestObject.m_nExplicitTime = 1533;
        objTestObject.m_nNoEnterDelayMS = 366;
        objTestObject.OnShow();
        
        fireunit.ok( true === bForce, 'test1: old timer force cleared' );
        fireunit.ok( 1533 === nTimeout, 'test1: timeout started with explict time value' );

        // test2 - check to make sure the old timers were force cleared,
        //  and whether the new timer was set with the NoEnterDelay.
        objTestObject.m_nExplicitTime = 0;
        objTestObject.m_nNoEnterDelayMS = 366;
        objTestObject.OnShow();
        
        fireunit.ok( true === bForce, 'test2: old timer force cleared' );
        fireunit.ok( 366 === nTimeout, 'test2: timeout started with explict time value' );

        // test3 - check to make sure the old timers were force cleared,
        //  no new timers set, m_bStartHideTimerOnShow is false.
        objTestObject.m_bStartHideTimerOnShow = false;
        objTestObject.m_nNoEnterDelayMS = 366;
        nTimeout = null;
        objTestObject.OnShow();
        
        fireunit.ok( true === bForce, 'test3: old timer force cleared' );
        fireunit.ok( null === nTimeout, 'test3: new timeout not started' );
        
        // test4 - check to make sure no hide timer is started if there 
        //  is no explicit time set or there is no enter delay.  Should stay
        //  open forever.
        objTestObject.m_bStartHideTimerOnShow = true;
        objTestObject.m_nExplicitTime = 0;
        objTestObject.m_nNoEnterDelayMS = 0;
        nTimeout = null;
        objTestObject.OnShow();
        fireunit.ok( true === bForce, 'test4: old timer force cleared' );
        fireunit.ok( null === nTimeout, 'test4: new timeout not started' );
        
        objTestObject.clearHideTimer = fncOrigClearHideTimer;
        objTestObject.startHideTimer = fncOrigStartHideTimer;
    },
    
    testOnStartHideTimer: function()
    {
        var objTestObject = this.getTestObject();
        
        // the first 3 tests with the m_bStartHideTimerOnShow set to false, enabling us to act.
        objTestObject.m_bStartHideTimerOnShow = false;
        var fncOrigStartHideTimer = objTestObject.startHideTimer;
        var nTimeout = undefined;
        objTestObject.startHideTimer = function( in_nTimeout ) { nTimeout = in_nTimeout; };

        objTestObject.m_bShown = true;

        // test1 - shown, make sure startHideTimer set to m_nExplicitTime
        objTestObject.m_nExplicitTime = 1533;
        objTestObject.m_nNoEnterDelayMS = 366;
        objTestObject.OnStartHideTimer();
        fireunit.ok( 1533 == nTimeout, 'test1: timeout started with explict time value' );

        // test2 - shown, make sure startHideTimer set to m_nExplicitTime
        objTestObject.m_nExplicitTime = 0;
        objTestObject.m_nNoEnterDelayMS = 366;
        objTestObject.OnStartHideTimer();
        fireunit.ok( 366 == nTimeout, 'test2: timeout started with no enter time value' );

        // test3 - not shown, do nothing.
        objTestObject.m_bShown = false;
        objTestObject.m_nNoEnterDelayMS = 366;
        nTimeout = null;
        objTestObject.OnStartHideTimer();
        fireunit.ok( null == nTimeout, 'test3: not shown, do nothing' );
        
        // test4 - m_bStartHideTimerOnShow set to true, do nothing.  We do not want 
        //  to restart the timer if it is already set.
        objTestObject.m_bShown = true;
        objTestObject.m_bStartHideTimerOnShow = true;
        objTestObject.m_nNoEnterDelayMS = 366;
        nTimeout = null;
        objTestObject.OnStartHideTimer();
        fireunit.ok( null == nTimeout, 'test4: start timer already started on show, do nothing' );
        
        objTestObject.startHideTimer = fncOrigStartHideTimer;
    }
} );



