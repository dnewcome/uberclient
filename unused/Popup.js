/**
* Popup - A popup HTML box.  Can be used to show an item 
*   using a timer, used for mousein/out showing/hiding, or
*   just shown forever.
*/
function Popup()
{
    // The hide timer.  Used for HideDelayMS and NoEnterDelayMS.        
	this.m_objHideTimer = undefined;
    // Limited time, nullifies HideDelayMS and NoEnterDelayMS
    this.m_bLimitedTime = false;
    
    Popup.Base.constructor.apply( this );
    
    // Must do this after the Display constructor.  By default, 
    //  we do not attach on Init.
    this.m_bAttachDomOnInit = false;
}
UberObject.Base( Popup, Display );

Popup.prototype.loadConfigParams = function()
{
     var ConfigParams = {
        m_objInsertionPoint: { type: 'object', bRequired: false },
        m_bGracefulReposition: { type: 'boolean', bRequired: false, default_value: true },
        m_nHideDelayMS: { type: 'number', bRequired: false, default_value: undefined },
        m_nNoEnterDelayMS: { type: 'number', bRequired: false, default_value: undefined },
        type: { type: 'string', bRequired: false, default_value: 'Popup' }
    };
    Popup.Base.loadConfigParams.apply( this );
    Util.union( this.m_objConfigParams, ConfigParams, true );
};

/**
* init - Initialize ourselves
* @param {Object} in_objConfig - Configuration.
* @returns {bool} true if template successfully loaded and attached, false otw.
*/
Popup.prototype.init = function( in_objConfig )
{
    if( in_objConfig.m_objInsertionPoint )
    {
        this.m_bAttachDomOnInit = true;
    } // end if

    // apply our parent constructor which does the initial setup
    bRetVal = Popup.Base.initWithConfigObject.apply( this, [ in_objConfig ] );

    // Allows us to tab nicely.
    this.m_objDomContainer.tabIndex = '-1';
    
    return bRetVal;
};

Popup.prototype.teardownDom = function()
{
    // if we teardown the DOM, we want to make 
    //  sure active timers aren't fired later.
    this.clearHideTimer();
    
    Popup.Base.teardownDom.apply( this );
};

/**
* setMouseoutHideDelay - sets the hide delay after a mouseout 
*   if there is no new mouseover on the element
* @param {Number} in_nWaittimeMS - Milliseconds to wait.  
*   undefined clears timer.
*/
Popup.prototype.setMouseoutHideDelay = function( in_nWaittimeMS )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nWaittimeMS, 0 ) );

	this.m_nHideDelayMS = in_nWaittimeMS;
};


/**
* setNoMouseoverHideDelay - sets the hide delay if there is no 
*   mouseover on the element
* @param {Number} in_nWaittimeMS - Milliseconds to wait.
*   undefined clears timer.
*/
Popup.prototype.setNoMouseoverHideDelay = function( in_nWaittimeMS )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nWaittimeMS, 0 ) );

	this.m_nNoEnterDelayMS = in_nWaittimeMS; 
};

/**
* show - Show the popup.  Will start the noEnter timer 
*   if it has been previously set.
* @param {Object} in_objPosition (optional) - Position where to place the menu
*   If not positioned, puts in the default location
*/
Popup.prototype.show = function( in_objPosition )
{
    Util.Assert( true == this.isInitialized() );
    
	Popup.Base.show.apply( this, [ in_objPosition ] );
	
	if( this.m_nNoEnterDelayMS )
	{
	    var me=this;
        this.m_objHideTimer = window.setTimeout( function() { me.hide(); }, this.m_nNoEnterDelayMS );
    } // end if
};

/**
* show - Show the popup for the specified number of milliseconds.
*   This will cause mouseout and mouseover timeouts to be ignored.
* @param {Number} in_nShowtimeMS - milliseconds to show popup for.
* @param {Object} in_objPosition (optional) - Position where to place the menu
*   If not positioned, puts in the default location
*/
Popup.prototype.showTimed = function( in_nShowtimeMS, in_objPosition )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nShowtimeMS, 0 ) );

    this.m_bLimitedTime = true;
    this.show( in_objPosition );
    var me=this;
    window.setTimeout( function() { me.hide(); me.m_bLimitedTime = false; }, in_nShowtimeMS );
};

/**
* hide - Hide the popup.
*/
Popup.prototype.hide = function()
{
    Util.Assert( true == this.isInitialized() );

    this.clearHideTimer();
    Popup.Base.hide.apply( this );
};

/**
* clearHideTimer - Clears the hide timer.
*/
Popup.prototype.clearHideTimer = function()
{
    Util.Assert( true == this.isInitialized() );

	if( this.m_objHideTimer )
	{
	    window.clearTimeout( this.m_objHideTimer );
	} // end if
};

/**
* delayHide - Sets the delay hide timer.  Will be ignored if
*   popup was called with showTimed.  If m_nHideDelayMS has
*   been set, timer will take effect.  Otherwise will immediately
*   hide.
*/
Popup.prototype.delayHide = function( in_objEvent )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( in_objEvent );
    
    if( ( DOMEvent.checkMouseoutContainer( in_objEvent ) )
     && ( false == this.m_bLimitedTime ) )
    {
        if( this.m_nHideDelayMS )
        {   // delayed hide.
            var me=this;
            var fncHide = function() { me.hide(); };
            this.m_objHideTimer = window.setTimeout( fncHide, this.m_nHideDelayMS );
        } // end if
        else
        {
            this.hide();
        } // end if
    } // end if
};

/**
* findDomElements - populate local variables for individual DOM elements
*/
Popup.prototype.findDomElements = function()
{
    // Let the close button behavior be done at a higher level
    this.attachButton( 'elementCloseButton', this.OnCloseButtonClick );
    this.attachButton( 'elementOKButton', this.OnOKButtonClick );
    this.attachButton( 'elementCancelButton', this.OnCancelButtonClick );
    
    Popup.Base.findDomElements.apply( this );
};

/**
* Message handlers
*/
Popup.prototype.RegisterMessageHandlers = function()
{
    this.RegisterListener( 'showtimed', Messages.all_publishers_id, this.showTimed );
    
    Popup.Base.RegisterMessageHandlers.apply( this );
};

Popup.prototype.RegisterDomEventHandlers = function()
{
    this.RegisterListener( 'onmouseover', this.m_objDomContainer, this.OnMouseOver );
    this.RegisterListener( 'onmouseout', this.m_objDomContainer, this.OnMouseOut );

    Popup.Base.RegisterDomEventHandlers.apply( this );
};

/**
* OnMouseOver - calls clearHideTimer.
*/
Popup.prototype.OnMouseOver = function( in_objEvent )
{
    Util.Assert( true == this.isInitialized() );
    this.clearHideTimer();
};

/**
* OnMouseOut - calls delayHide if we have a timer set.  
*   Otherwise has no effect
*/
Popup.prototype.OnMouseOut = function( in_objEvent )
{
    Util.Assert( true == this.isInitialized() );
    if( this.m_nHideDelayMS )
    {   // Only hide if we have a timer set.
        this.delayHide( in_objEvent );    
    } // end if
};

Popup.prototype._doClose = function( in_strMessage, in_aArguments )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strMessage ) );
    
    this.Raise( this.type + in_strMessage, in_aArguments );
    this.Raise( this.type + 'closed', in_aArguments );
    this.hide();
};

/**
* OnCloseButtonClick - Hides ourselves
*/
Popup.prototype.OnCloseButtonClick = function( in_objEvent, in_aArguments )
{
    this._doClose( 'close', in_aArguments );
};

/**
* OnOKButtonClick - Hides ourselves
*/
Popup.prototype.OnOKButtonClick = function( in_objEvent, in_aArguments )
{
    this._doClose( 'submit', in_aArguments );
};

/**
* OnCancelButtonClick - Hides ourselves
*/
Popup.prototype.OnCancelButtonClick = function( in_objEvent, in_aArguments )
{
    this._doClose( 'cancelled', in_aArguments );
};

/**
* setHeader - set the contents of the element 
*   selected by elementHeader, if available
* @param {String} in_strHeader - Header text
*/
Popup.prototype.setHeader = function( in_strHeader )
{
    Util.Assert( TypeCheck.String( in_strHeader ) );
    
    this.setChildHTML( 'elementHeader', in_strHeader );
};

/**
* setFooter - set the contents of the element 
*   selected by elementFooter, if available
* @param {String} in_strFooter - Footer text
*/
Popup.prototype.setFooter = function( in_strFooter )
{
    Util.Assert( TypeCheck.String( in_strFooter ) );
    
    this.setChildHTML( 'elementFooter', in_strFooter );
};
