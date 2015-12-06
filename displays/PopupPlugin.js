/**
* PopupPlugin - A PopupPlugin HTML box.  Can be used to show an item 
*   using a timer, used for mousein/out showing/hiding, or
*   just shown forever.
*/
function PopupPlugin()
{
    // The hide timer.  Used for HideDelayMS and NoEnterDelayMS.        
	this.m_objHideTimer = undefined;
    // Explicit time, nullifies HideDelayMS and NoEnterDelayMS
    this.m_nExplicitTime = undefined;
    
    PopupPlugin.Base.constructor.apply( this );
}
UberObject.Base( PopupPlugin, Plugin );

Object.extend( PopupPlugin.prototype, {
    loadConfigParams: function()
    {
        PopupPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            // if set to false, the starthidetimer message must be raised to start the 
            //  initial hide timer.
            m_bStartHideTimerOnShow: { type: 'boolean', bRequired: false, default_value: true },
            m_strSuspendMouseOutMessage: { type: 'string', bRequired: false, default_value: 'cancelmouseout' },
            m_strEnableMouseOutMessage: { type: 'string', bRequired: false, default_value: 'startmouseout' },
            m_nHideDelayMS: { type: 'number', bRequired: false },
            m_nNoEnterDelayMS: { type: 'number', bRequired: false },
            m_bRaiseCloseOnShow: { type: 'boolean', bRequired: false, default_value: false }
        } );
    },

    /**
    * Message handlers
    */
    RegisterMessageHandlers: function()
    {
        var objPlugged = this.getPlugged();
        
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } )
            .RegisterListenerObject( { message: 'showtimed', from: Messages.all_publishers_id,
                to: objPlugged.m_strMessagingID, listener: this.OnShowTimed, context: this } )
            .RegisterListenerObject( { message: 'starthidetimer', from: Messages.all_publishers_id,
                to: objPlugged.m_strMessagingID, listener: this.OnStartHideTimer, context: this } )
            .RegisterListenerObject( { message: 'onshow', 
	            listener: this.OnShow, context: this } )                
            .RegisterListenerObject( { message: 'onhide', 
	            listener: this.OnHide, context: this } )
            .RegisterListenerObject( { message: this.m_strSuspendMouseOutMessage, 
	            listener: this.OnSuspendListen, context: this } )
            .RegisterListenerObject( { message: this.m_strEnableMouseOutMessage, 
	            listener: this.OnEnableListen, context: this } );
    
        this.extendPlugged( 'show', this );
        this.extendPlugged( 'showTimed', this );
        
        PopupPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objContainer = this.getPlugged().$();

        this.RegisterListenerObject( { message: 'onmouseover', from: objContainer, 
            listener: this.OnMouseOver, context: this } );
        this.RegisterListenerObject( { message: 'onmouseout', from: objContainer, 
            listener: this.OnMouseOut, context: this } );
        this.RegisterListenerObject( { message: 'click', from: objContainer, 
            listener: this.OnClick, context: this } );
                
    },

    teardown: function()
    {
        // if we teardown the DOM, we want to make 
        //  sure active timers aren't fired later.
        this.clearTimeouts( true );
            
        PopupPlugin.Base.teardown.apply( this );
    },

    /**
    * OnShow - Clears any old hide timers and starts the new hide timer
    *   if the config option m_bStartHideTimerOnShow is true and if
    *   this is called via showTimed or if the config option m_nNoEnterDelayMS
    *   has a value.
    */
    OnShow: function()
    {
        this.m_bSuspendMouseOut = false;
        this.m_bCancelMouseOut = false;
        this.m_bShown = true;
        this.clearTimeouts( true );
        if( ( true === this.m_bStartHideTimerOnShow )
         && ( this.m_nExplicitTime || this.m_nNoEnterDelayMS ) )
        {
            this.startHideTimer( this.m_nExplicitTime || this.m_nNoEnterDelayMS );
        } // end if
    },
    
    /**
    * OnShowTimed - Show the PopupPlugin for the specified number of milliseconds.
    *   This will cause mouseout and mouseover timeouts to be ignored.
    * @param {Number} in_nShowtimeMS - milliseconds to show PopupPlugin for.
    * @param {Object} in_objPosition (optional) - Position where to place the menu
    *   If not positioned, puts in the default location
    */
    OnShowTimed: function( in_nShowtimeMS, in_objPosition )
    {
        Util.Assert( TypeCheck.Number( in_nShowtimeMS, 0 ) );

        this.m_nExplicitTime = in_nShowtimeMS;
        this.getPlugged().show( in_objPosition );
    },

    /**
    * OnStartHideTimer - starts the hide timer if the menu is shown
    *   and m_bStartHideTimerOnShow is false.
    */
    OnStartHideTimer: function()
    {
        if( ( true === this.m_bShown ) 
         && ( false === this.m_bStartHideTimerOnShow ) )
        {   // only start the hide timer if we are actually shown.
            this.startHideTimer( this.m_nExplicitTime || this.m_nNoEnterDelayMS );
        } // end if
    },
        
    /**
    * OnHide - Hide the PopupPlugin.
    */
    OnHide: function()
    {
        this.m_nExplicitTime = undefined;
        this.clearTimeouts( true );
        this.m_bShown = false;
        /* We have to unregister these on the plugged object because they were registered
        *   on the plugged object
        */
        var objPlugged = this.getPlugged();
        objPlugged.UnRegisterListener( 'close', Messages.all_publishers_id, objPlugged.hide );
    },

    /** 
    * OnClick - stop the propagation of the event so that the popup is
    *   not closed whenever we select something in it.
    * @param {Object} in_objEvent - event to stop the propagation of.
    */
    OnClick: function( in_objEvent )
    {
        in_objEvent.stopPropagation();
    },
    
    /**
    * OnMouseOver - calls clearTimeouts.
    */
    OnMouseOver: function( in_objEvent )
    {
        this.clearTimeouts();
    },

    /**
    * OnMouseOut - calls delayHide if we have a timer set.  
    *   Otherwise has no effect
    */
    OnMouseOut: function( in_objEvent )
    {
        if( ( ! this.m_bCancelMouseOut )
         && ( this.m_nHideDelayMS )
         && ( ! this.m_nExplicitTime )
         && ( DOMEvent.checkMouseLeave( in_objEvent ) ) )
        {   // We could have hidetimer already going, so if we do, clear it.
            this.startHideTimer( this.m_nHideDelayMS );
        } // end if
    },

    /**
    * OnSuspendListen - Give us the ability to cancel the mouse out close.  
    *   But if we mouse back in, it resets this variable.
    */
    OnSuspendListen: function()
    {
        this.m_bCancelMouseOut = true;
        this.clearTimeouts();
    },

    /**
    * OnEnableListen - Enable the mouse out timer again.
    */
    OnEnableListen: function()
    {
        this.m_bCancelMouseOut = false;
    },

    show: function()
    {
        /*
        * We override show for popups because if we click the body, it tells all
        *   popups to close.  This timeout makes sure we are shown after all other
        *   popups close.  If we try to do this before the 'close' message is raised,
        *   it closes the popup that opens right now.
        */
        function _doShow()
        {
            var objPlugged = this.getPlugged();
            
            if( true === this.m_bRaiseCloseOnShow )
            {   // force a close of other popups
                this.Raise( 'close', undefined, true );
            } // end if
            
            objPlugged.RegisterListener( 'close', Messages.all_publishers_id, objPlugged.hide );

            this.applyReplaced( 'show', arguments );
        };
        
        this.m_objShowTimer = Timeout.setTimeout( _doShow, 0, this, arguments );
    },
    
    /**
    * showTimed - see OnShowTimed, extends the plugged object with the 'showTimed' function.
    */
    showTimed: function()
    {
        this.OnShowTimed.apply( this, arguments );
    },

    /**
    * startHideTimer - starts the hide timer.  Clears any old timers
    * @param {Number} in_nDelayMS - the delay to hide after.  
    */
    startHideTimer: function( in_nDelayMS )
    {
        Util.Assert( TypeCheck.Number( in_nDelayMS ) );
        
        // We could have hidetimer already going, so if we do, clear it.
        this.clearTimeouts( true );
        var objPlugged = this.getPlugged();
        var objTimer = Timeout.setTimeout( objPlugged.hide, in_nDelayMS, objPlugged );
        
        this.setHideTimer( objTimer );
    },
    
    /**
    * clearTimeouts - Clears the show timer always and the hide timer if 
    *   the timer was set via show(OnShow) or if forced.
    * @param {bool} in_bForce (optional) - force the clearing - will clear a timer
    *   started via showTimed.
    */
    clearTimeouts: function( in_bForce )
    {
        Util.Assert( TypeCheck.UBoolean( in_bForce ) );
        
        if( ( true === in_bForce )
         || ( ! this.m_nExplicitTime ) )
        {
            Timeout.clearTimeout( this.m_objHideTimer );
            this.setHideTimer( null );
        } // end if
        
        Timeout.clearTimeout( this.m_objShowTimer );
    },
    
    /**
    * setHideTimer - sets the hide timer
    * @param {Object} - Timeout to set as the hide timeout.
    */
    setHideTimer: function( in_objTimer )
    {
        Util.Assert( TypeCheck.Defined( in_objTimer ) );
        
        this.m_objHideTimer = in_objTimer;
    },
    
    /**
    * getHideTimer - gets the hide timer
    * @returns {Object} - Timer that is currently set.
    */
    getHideTimer: function()
    {
        return this.m_objHideTimer;
    }
    
} );
