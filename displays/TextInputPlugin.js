
function TextInputPlugin()
{
    this.m_strSavedInputValue = undefined;
    this.m_eFocusBehavior = undefined;
    this.m_bFocusOnShow = undefined;
    this.m_bPreventDefaultOnMouseUp = undefined;
    
    TextInputPlugin.Base.constructor.apply( this );
}
UberObject.Base( TextInputPlugin, Plugin );

/**
* focus behaviors
*/
TextInputPlugin.eFocusBehavior = new Enum( "FB_DEFAULT", "FB_CLEAR", "FB_SELECT" );

Object.extend( TextInputPlugin.prototype, {
    /**
    * init - do our init.
    */
    init: function()
    {
        TextInputPlugin.Base.init.apply( this, arguments );
        /*
        *   Firefox 2,3, Chrome 2, and Webkit all suffer from if the user
        *   clicks the input box really fast, the browser tries to put
        *   the cursor at the clicked position, but only after a small
        *   delay.  This happens AFTER the select already happened in the
        *   'OnFocus', so we have to check whether to do it again.  If
        *   we need to do the focus here, we prevent the default action
        *   of the event, which is to put the caret at the position.  This
        *   keeps any flicker from happening as well.  We use this to keep
        *   track of whether we should focus on the mouse up.
        */
        this.m_bPreventDefaultOnMouseUp = true;
    },
  
    loadConfigParams: function()
    {
        TextInputPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_eFocusBehavior: { type: 'string', bRequired: false, default_value: TextInputPlugin.eFocusBehavior.FB_DEFAULT },
            m_strSetValueFunctionName: { type: 'string', bRequired: false, default_value: 'setValue' },
            m_strGetValueFunctionName: { type: 'string', bRequired: false, default_value: 'getValue' },
            m_strInputSelector: { type: 'string', bRequired: true },
            m_bFocusOnShow: { type: 'boolean', bRequired: false, default_value: false },
            m_strFocusMessage: { type: 'string', bRequired: false, default_value: 'textinputfocus' },
            m_strSubmitMessage: { type: 'string', bRequired: false, default_value: 'textinputsubmit' },
			m_bSubmitOnEnter: { type: 'boolean', bRequired: false, default_value: true },
            m_strCancelMessage: { type: 'string', bRequired: false, default_value: 'textinputcancelled' },
            m_strChangedMessage: { type: 'string', bRequired: false, default_value: 'textinputchanged' },
            m_strSetValueMessage: { type: 'string', bRequired: false, default_value: 'setvaluetextinput' },
            m_bStopClickPropagation: { type: 'boolean', bRequired: false, default_value: false },
            m_bClearOnSubmit: { type: 'boolean', bRequired: false, default_value: false }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
        this.RegisterListenerObject( { message: 'onshow', 
	            listener: this.OnShow, context: this } );
        this.RegisterListenerObject( { message: this.m_strSetValueMessage, 
                from: Messages.all_publishers_id, to: this.getPlugged().m_strMessagingID, 
                listener: this.setValue, context: this } );
        this.RegisterListener( this.m_strSetValueMessage, this.setValue, this );
        
        
        // Probably should find a new place to do this.
        this.extendPlugged( this.m_strSetValueFunctionName, this );
        this.extendPlugged( this.m_strGetValueFunctionName, this );
	    
	    TextInputPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objPlugged = this.getPlugged();
        var objInputElement = objPlugged.$( this.m_strInputSelector );

        objPlugged.RegisterListener( 'onkeydown', objInputElement, this.OnKeyDown, undefined, this )
                  .RegisterListener( 'onkeyup', objInputElement, this.OnKeyUp, undefined, this )
                  .RegisterListener( 'onfocus', objInputElement, this.OnFocus, undefined, this )
                  .RegisterListener( 'onblur', objInputElement, this.OnBlur, undefined, this )
                  .RegisterListener( 'mouseup', objInputElement, this.OnMouseUp, undefined, this )
                  .RegisterListener( 'click', objInputElement, this.OnClick, undefined, this );
    },
    
    teardown: function()
    {
        Timeout.clearTimeout( this.m_objFocusTimeout );
        Timeout.clearTimeout( this.m_objSelectTimeout );
        
        TextInputPlugin.Base.teardown.apply( this );
    },

    clear: function()
    {
        this.m_bChanged = false;
        this.getPlugged().$( this.m_strInputSelector ).value = '';
    },

    /**
    * focus - set the focus in the edit box
    */
    focus: function()
    {
        this.getPlugged().$( this.m_strInputSelector ).focus();
    },

    /**
    * saveState - Take a snapshot of the current input value.
    */
    saveState: function()
    {
        this.m_strSavedInputValue = this.getPlugged().$( this.m_strInputSelector ).value;    
    },

    /**
    * restoreState - Restore the input value to the saved state.
    */
    restoreState: function()
    {
        this.getPlugged().$( this.m_strInputSelector ).value = this.m_strSavedInputValue;
    },

    /**
    * setValue - sets the value of the input element.  
    *       Does NOT save the previous state.
    * @param {String} in_strValue - string to set input value.
    * @param {Boolean} in_bReturnable (optional) - Assumed false, set to true
    *   if this value can be returned using "getValue".
    */
    setValue: function( in_strValue, in_bReturnable )
    {
        Util.Assert( TypeCheck.String( in_strValue ) );
        this.m_bChanged = ( true === in_bReturnable );
        this.getPlugged().$( this.m_strInputSelector ).value = Util.unescapeTags( in_strValue );
    },

    /**
    * getValue - returns the current value of the input box.
    * @returns {String} current value of the input box, undefined if not changed.
    */
    getValue: function()
    {
        var strRetVal = undefined;
        
        if( true === this.m_bChanged )
        {
            strRetVal = Util.escapeTags( this.getPlugged().$( this.m_strInputSelector ).value );
        } // end if
        
        return strRetVal;
    },

    /**
    * getSavedValue - returns the saved value of the input box.
    * @returns {String} saved value of the input box.
    */
    getSavedValue: function()
    {
        return this.m_strSavedInputValue;
    },

    /**
    * OnKeyDown - keydown handler - Handles key presses.
    *   Checks for an enter and escape.  
    *   An enter raises a message 'textinputsubmit' with the value of the input.
    *   An escape raises a message 'textinputcancelled' with the CANCELLED VALUE and 
    *       restores the state.
    *   Both keys raise a 'textinputclosed' with the value of the input.
    *   Any other key will raise a message 'textinputchanged' with the value of the input.
    * @param {Object} in_objEvent - Event with the key
    */
    OnKeyDown: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        var objPlugged = this.getPlugged();
        
	    if( ( ( in_objEvent.keyCode == KeyCode.ENTER ) 
		   && ( this.m_bSubmitOnEnter ) )
		 || ( in_objEvent.keyCode == KeyCode.ESC ) )
	    {
            var strValue = this.getValue();

            if ( in_objEvent.keyCode == KeyCode.ENTER )
            {   // send messages only to who we are plugging that way
                objPlugged.Raise( this.m_strSubmitMessage, [ strValue ] );
                if( this.m_bClearOnSubmit )
                {
                    this.clear();
                } // end if
            } // end if
	        else if ( in_objEvent.keyCode == KeyCode.ESC )
	        {
                objPlugged.Raise( this.m_strCancelMessage, [ strValue ] );
	            this.restoreState();
	        } // end if-else if

	        in_objEvent.cancelEvent();
	    } // end if
    	else
    	{
    	    this.m_bChanged = true;
    	} // end if
    	
	    in_objEvent.stopPropagation();
    },

    /**
    * OnKeyUp - keyup handler - Handles key presses.
    *   Raises a message 'textinputchanged' with the value of the input.
    * @param {Object} in_objEvent - Event with the key
    */
    OnKeyUp: function( in_objEvent )
    {
        Util.Assert( in_objEvent );

        var strValue = this.getValue();
        this.getPlugged().Raise( this.m_strChangedMessage, [ strValue ] );

	    in_objEvent.cancelEvent();
    },

    /**
    * OnFocus - Handles focus.
    * @param {Object} in_objEvent - Event
    */
    OnFocus: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        
        var objPlugged = this.getPlugged();
        
        this.saveState();
        
        switch( this.m_eFocusBehavior )
        {
            case TextInputPlugin.eFocusBehavior.FB_CLEAR:
                this.clear();
                break;
            case TextInputPlugin.eFocusBehavior.FB_SELECT:
                objPlugged.$( this.m_strInputSelector ).select();
                break;
            case TextInputPlugin.eFocusBehavior.FB_DEFAULT:
            default:
                break;
        } // end switch
        
        objPlugged.$( this.m_strInputSelector ).addClassName( 'focused' );
        objPlugged.Raise( this.m_strFocusMessage );
    },

    /**
    * OnBlur - Handles blur.
    * @param {Object} in_objEvent - Event
    */
    OnBlur: function( in_objEvent )
    {
        this.getPlugged().$( this.m_strInputSelector ).removeClassName( 'focused' );
        this.m_bPreventDefaultOnMouseUp = true;
    },

    /**
    * OnShow - of setting the focus.
    */
    OnShow: function()
    {
        if( true === this.m_bFocusOnShow )
        {   // We have to blur the element here so that we can refocus it.  Unless
            //  we blur the element, the browsers will not try to re-focus, 
            //  and if there is no refocus, the text will not select.
            this.getPlugged().$( this.m_strInputSelector ).blur();
            // If we are focusing now, do not interfere with the first mouseup event
            //  or else we have to click twice to place the cursor.
            this.m_bPreventDefaultOnMouseUp = false;
            // Give IE6 some time to show its stuff before we put in the focus.
            this.m_objFocusTimeout = Timeout.setTimeout( this.focus, 100, this );
        } // end if
    },
    
    /**
    * OnClick - if this.m_bStopClickPropagation is true, stop the propagation of the event.
    * @param {Object} in_objEvent - Event to stop the propagation of.
    */
    OnClick: function( in_objEvent )
    {
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        if( true === this.m_bStopClickPropagation )
        {
            in_objEvent.stopPropagation();
        } // end if
    },
    
    /**
    * OnMouseUp - Handle OnMouseUp - 
    *   Firefox 2,3, Chrome 2, and Webkit all suffer from if the user
    *   clicks the input box really fast, the browser tries to put
    *   the cursor at the clicked position, but only after a small
    *   delay.  This happens AFTER the select already happened in the
    *   'OnFocus', so we have to check whether to do it again.  If
    *   we need to do the focus here, we prevent the default action
    *   of the event, which is to put the caret at the position.  This
    *   keeps any flicker from happening as well.
    * @param {Object} in_objEvent - Event to stop the propagation of.
    */
    OnMouseUp: function( in_objEvent )
    {
        if( ( TextInputPlugin.eFocusBehavior.FB_SELECT === this.m_eFocusBehavior )
         && ( true === this.m_bPreventDefaultOnMouseUp ) )
        {
            in_objEvent.preventDefault();
            this.m_bPreventDefaultOnMouseUp = false;
        } // end if
    }
} );
