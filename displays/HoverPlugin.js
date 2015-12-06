/*
* HoverPlugin - attaches a menu to a display.
*/
function HoverPlugin()
{
    this.m_bDisplayed = undefined;
    this.m_objShowDelayTimer = undefined;
    HoverPlugin.Base.constructor.apply( this );
}
UberObject.Base( HoverPlugin, Plugin );

/**
* HoverPlugin.Positions
*   Assumed to be below/left.  Override
*   m_nDisplayPosition using BITWISE OR.
*/
HoverPlugin.Positions = {
    BELOW: 1,
    LEFT: 2
};

Object.extend( HoverPlugin.prototype, {
    loadConfigParams: function()
    {
        HoverPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objDisplay: { type: 'object', bRequired: true },
            m_strHoverSelector: { type: 'string', bRequired: false, default_value: '' },
            m_nPluggedYOffset: { type: 'number', bRequired: false, default_value: 2 },
            m_nPluggedXOffset: { type: 'number', bRequired: false, default_value: 2 },
            m_nDisplayPosition: { type: 'number', bRequired: false, default_value: 0 },
            m_nShowDelay: { type: 'number', bRequired: false, default_value: 250 },
            type: { type: 'string', bRequired: false, default_value: 'HoverPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
	            
	    HoverPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    teardown: function()
    {
        this._doHide();
        Timeout.clearTimeout( this.m_objShowDelayTimer );
        HoverPlugin.Base.teardown.apply( this, arguments );
    },
    
    OnRegisterDomEventHandlers: function()
    {
        var objElement = this.getPlugged().$( this.m_strHoverSelector );
        
        this.RegisterListenerObject( { message: 'onmouseover', from: objElement, 
            listener: this.OnMouseOver, context: this } );
        this.RegisterListenerObject( { message: 'onmouseout', from: objElement, 
            listener: this.OnMouseOut, context: this } );
    },

    /**
    * OnMouseOver - opens up the display this plugin is attached to.  Calls 
    *   the display's show with the event and the plugged into object.  Will
    *   not re-open if already open.
    * @param {Object} in_objEvent - Event triggering this.
    */
    OnMouseOver: function( in_objEvent )
    {
        if( ! this.m_bDisplayed )
        {   
    	    var objPosition = Event.pointer( in_objEvent );
            this.m_objShowDelayTimer = Timeout.setTimeout( this._doShow, 
                this.m_nShowDelay, this, [ objPosition ] );
    	} // end if
    },

    /**
    * OnMouseOut - Closes the display
    * @param {Object} in_objEvent - Event triggering this.
    */
    OnMouseOut: function( in_objEvent )
    {
        this._doHide();
    },
    
    _doShow: function( in_objPosition )
    {
        var objPlugged = this.getPlugged();
	    var objPluggedPosition = objPlugged.$().viewportOffset();
        
        // We have to show the display in case it was not previously attached
        //  so that we can get its dimensions.
        this.m_objDisplay.show( in_objPosition, objPlugged );
        
        if( this.m_nDisplayPosition & HoverPlugin.Positions.BELOW )
        {   // Display below
            in_objPosition.y += this.m_nPluggedYOffset;
        }
        else
        {   // Display above
            var objDimensions = this.m_objDisplay.$().getDimensions();

            in_objPosition.y = objPluggedPosition.top - ( this.m_nPluggedYOffset + objDimensions.height );
            if( 0 > in_objPosition.y )
            {   // If we are scrolled off the screen, put it back on.
                in_objPosition.y = this.m_nPluggedYOffset;
            } // end if
            
        } // end if

        if( !( this.m_nDisplayPosition & HoverPlugin.Positions.LEFT ) )
        {   // Display to the right
            in_objPosition.x += this.m_nPluggedXOffset;
        }
        else
        {   // Display to the left
            var objDimensions = this.m_objDisplay.$().getDimensions();

            in_objPosition.x = objPluggedPosition.left - ( this.m_nPluggedXOffset + objDimensions.width );
            if( 0 > in_objPosition.x )
            {   // If we are scrolled off the screen, put it back on.
                in_objPosition.x = this.m_nPluggedXOffset;
            } // end if
            
        } // end if
        
        this.m_objDisplay.show( in_objPosition, objPlugged );
        
        this.m_bDisplayed = true;
    },

    /**
    * _doHide - hide the display.
    */    
    _doHide: function()
    {
        if( this.m_bDisplayed )
        {
            this.m_objDisplay.hide();
            
            this.m_bDisplayed = false;
        } // end if
        // must make sure to clear the timer even if we are not displayed so
        //  that we do not mousein/out before the timer expires and we show.
        Timeout.clearTimeout( this.m_objShowDelayTimer );
    }

} );