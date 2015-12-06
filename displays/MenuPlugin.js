/*
* MenuPlugin - attaches a menu to a display.
*/
function MenuPlugin()
{
    MenuPlugin.Base.constructor.apply( this );
}
UberObject.Base( MenuPlugin, Plugin );

Object.extend( MenuPlugin.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_objMenu: { type: 'object', bRequired: true },
            /** 
             * What the options mean:
             * m_bButtonBehavior - whether to attach the menu using button behavior.
             * m_strButtonAttachmentSelector - allows us to specify to attach to a certain element, otherwise 
             *   attaches to the container 
             * m_bContextBehavior - open menu on contextmenu event.
             * m_bCotnextAttachmentSelector - allow attachment to specified element.
             */
            m_bButtonBehavior: { type: 'boolean', bRequired: false, default_value: true },
            m_strButtonAttachmentSelector: { type: 'string', bRequired: false, default_value: '' },
            m_strShowMenuMessage: { type: 'string', bRequired: false, default_value: '' },
            type: { type: 'string', bRequired: false, default_value: 'MenuPlugin' }
        };

        MenuPlugin.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } );
	            
	    if( this.m_strShowMenuMessage )
	    {   
            this.RegisterListenerObject( { message: this.m_strShowMenuMessage, 
	                listener: this.OnMenuShow, context: this } );
	    } // end if
	    
        this.RegisterListenerObject( { message: 'onhide', 
                from: this.m_objMenu.m_strMessagingID,
                listener: this.OnMenuHide, context: this } );
	    
	    MenuPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDOMEventHandlers: function()
    {
        var objPlugged = this.getPlugged();
        
        if( true === this.m_bButtonBehavior )
        {
            var objButton = objPlugged.$( this.m_strButtonAttachmentSelector );
            objPlugged.attachButton( objButton, this.OnMenuShow, this, false );
            
            this.RegisterListenerObject( { message: 'mouseout', from: objButton,
                listener: this.OnMouseOut, context: this } );
        } // end if
    },

    /**
    * OnMenuShow - show the menu.
    * @param {Object} in_objEvent (optional) - event that caused the event.
    */
    OnMenuShow: function( in_objEvent )
    {
        var objPlugged = this.getPlugged();
        
        
        if( in_objEvent )
        {   // Raise this in case the drag plugin is also attached to this display.
            this.Raise( 'canceldrag', [ in_objEvent ], true, objPlugged.m_strMessagingID );
        } // end if
        
        /*
        * There may be some other objects/plugins that want to know about this.  Let
        *   any objects listening for messages from the menu itself have first go
        *   at things.
        */
        this.m_objMenu.Raise( 'menushow', [ this.m_objMenu ] );
        objPlugged.Raise( 'menushow', [ this.m_objMenu ] );

        var objPosition = this._findPosition( in_objEvent );
            
        /* We want to run the menu in the context of the plugged object so the 
         *   menu's have access to the plugged objects internals.
         */
        this.m_objMenu.show( objPosition, objPlugged );

        this.m_bShown = true;
    },
 
    /**
    * OnMenuHide - called when the menu gets hidden.
    */   
    OnMenuHide: function()
    {
        // We keep track of whether we are shown or not because our m_objMenu 
        //  can be attached to many objects.
        if( this.m_bShown )
        {
            this.m_objMenu.Raise( 'menuhide' ); 
            this.getPlugged().Raise( 'menuhide' );
            this.m_bShown = false;
        } // end if
    },
    
    /**
    * OnMouseOut - If mousing out of the container, raise the
    *   'starthidetimer' message for the menu in case it has
    *   it has its m_bStartHideTimerOnShow set to false.
    */
    OnMouseOut: function( in_objEvent )
    {
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        if( true == DOMEvent.checkMouseLeave( in_objEvent ) )
        {
            this.RaiseForAddress( 'starthidetimer', this.m_objMenu.m_strMessagingID, [], true );
        } // end if
    },

    /**
    * @private
    * _findPosition - find position to put the menu at.
    * @param {Object} in_objEvent (optional) - event that triggered the show.
    * @returns {Object} returns a position just below the element this menu is
    *   anchored to, if possible, if not, find the position of the event (if 
    *   passed in), if not found, return undefined.
    */    
    _findPosition: function( in_objEvent )
    {
        var objRetVal = undefined;
        var objElement = this.m_bButtonBehavior ? 
            this.getPlugged().$( this.m_strButtonAttachmentSelector ) : in_objEvent._currentTarget;
        
        if( objElement )
        {
            objPosition = Element.viewportOffset( objElement );
            var nButtonBuffer = Element.getHeight( objElement ) + 2;
            objPosition[1] += nButtonBuffer;
            objPosition.top += nButtonBuffer;
        } // end if
        else if( in_objEvent )
        {
            objPosition = Event.pointer( in_objEvent );
        } // end if-else
        
        return objPosition;
    }
} );