

function TextInput()
{
    this.m_strSavedInputValue = undefined;
    this.m_nFocusBehavior = TextInput.eFocusBehavoir.FB_DEFAULT;
    this.m_bFocusOnShow = undefined;
        
    TextInput.Base.constructor.apply( this );
}
// Inherit from Display
UberObject.Base( TextInput, Display );

/**
* focus behaviors
*/
TextInput.eFocusBehavoir = new Enum( "FB_DEFAULT", "FB_CLEAR", "FB_SELECT" );

/**
* init - Initialize ourselves
*   returns true if template successfully loaded and attached, false otw.
* @param {Object} in_objInsertionPoint - Parent DOM Element to attach to.
* @param {String} in_strTemplate - Name of the template to use for collection.
* @param {Enum} in_eFocusBehavior (optional) - Behavior to choose on focus.
*/
TextInput.prototype.init = function( in_objInsertionPoint, in_strTemplate, in_eFocusBehavior )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( in_objInsertionPoint );
    Util.Assert( TypeCheck.String( in_strTemplate ) );

    if( in_eFocusBehavior )
    {
        this.m_nFocusBehavior = in_eFocusBehavior;
    } // end if
    
    // apply our parent constructor which does the initial setup
    TextInput.Base.init.apply( this, [ in_objInsertionPoint, in_strTemplate ] );
};


TextInput.prototype.teardown = function()
{
    Timeout.clearTimeout( this.objTimeout );
    
    TextInput.Base.teardown.apply( this );
};

/**
* findDomElements - populate local variables for individual DOM elements
*/
TextInput.prototype.findDomElements = function()
{
    TextInput.Base.findDomElements.apply( this );

    this.attachButton( 'elementActionIcon', this.OnActionIconClick );
};


/**
* public interface functionality.
*/

TextInput.prototype.clear = function()
{
    this.$( 'elementInput' ).value = '';
};

/**
* focus - set the focus in the edit box
*/
TextInput.prototype.focus = function()
{
    this.$( 'elementInput' ).focus();
};

/**
* saveState - Take a snapshot of the current input value.
*/
TextInput.prototype.saveState = function()
{
    this.m_strSavedInputValue = this.$( 'elementInput' ).value;    
};

/**
* restoreState - Restore the input value to the saved state.
*/
TextInput.prototype.restoreState = function()
{
    this.$( 'elementInput' ).value = this.m_strSavedInputValue;
};

/**
* setValue - sets the value of the input element.  
*       Does NOT save the previous state.
* @param {String} in_strValue - string to set input value.
*/
TextInput.prototype.setValue = function( in_strValue )
{
    Util.Assert( TypeCheck.String( in_strValue ) );
    
    this.$( 'elementInput' ).value = Util.unescapeTags( in_strValue );
};

/**
* getValue - returns the current value of the input box.
* @returns {String} current value of the input box.
*/
TextInput.prototype.getValue = function()
{
    return Util.escapeTags( this.$( 'elementInput' ).value );
};

/**
* getSavedValue - returns the saved value of the input box.
* @returns {String} saved value of the input box.
*/
TextInput.prototype.getSavedValue = function()
{
    return this.m_strSavedInputValue;
};



/**
* DomEvent Handlers
*/
TextInput.prototype.RegisterDomEventHandlers = function()
{
    TextInput.Base.RegisterDomEventHandlers.apply( this );
    
    var objInputElement = this.$( 'elementInput' );
    this.RegisterListener( 'onkeydown', objInputElement, this.OnKeyDown )
        .RegisterListener( 'onkeyup', objInputElement, this.OnKeyUp )
        .RegisterListener( 'onfocus', objInputElement, this.OnFocus )
        .RegisterListener( 'onblur', objInputElement, this.OnBlur );
};

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
TextInput.prototype.OnKeyDown = function( in_objEvent )
{
    Util.Assert( in_objEvent );
    
	if( ( in_objEvent.keyCode == KeyCode.ENTER ) || ( in_objEvent.keyCode == KeyCode.ESC ) )
	{
        var strValue = this.getValue();

        if ( in_objEvent.keyCode == KeyCode.ENTER )
        {
            this.Raise( 'textinputsubmit', [ strValue ] );
        } // end if
	    else if ( in_objEvent.keyCode == KeyCode.ESC )
	    {
            this.Raise( 'textinputcancelled', [ strValue ] );
	        this.restoreState();
	    } // end if-else if

        this.Raise( 'textinputclosed', [ strValue ] );

	    in_objEvent.cancelEvent();
	} // end if
	
	in_objEvent.stopPropagation();
};

/**
* OnKeyUp - keyup handler - Handles key presses.
*   Raises a message 'textinputchanged' with the value of the input.
* @param {Object} in_objEvent - Event with the key
*/
TextInput.prototype.OnKeyUp = function( in_objEvent )
{
    Util.Assert( in_objEvent );

    var strValue = this.getValue();
    this.Raise( 'textinputchanged', [ strValue ] );

	in_objEvent.cancelEvent();
};


/**
* OnActionIconClick - click handler - Handles clicks on the action button.
*   Raises a message 'textinputactioniconclick' with the value of the input.
* @param {Object} in_objEvent - mouse event
*/
TextInput.prototype.OnActionIconClick = function( in_objEvent )
{
    var strValue = this.getValue();
    this.Raise( 'textinputactioniconclick', [ strValue ] );
};

/**
* OnFocus - Handles focus.
* @param {Object} in_objEvent - Event
*/
TextInput.prototype.OnFocus = function( in_objEvent )
{
    Util.Assert( in_objEvent );
    
    this.saveState();
    
    switch( this.m_nFocusBehavior )
    {
        case TextInput.eFocusBehavoir.FB_CLEAR:
            this.clear();
            break;
        case TextInput.eFocusBehavoir.FB_SELECT:
            // Have to put a delay here because sometimes the 
            //  focus does not finish before the select starts.
            //  And then we lose our focus and mozilla blows up.
            var fncCall = function() { this.$( 'elementInput' ).select(); };
            this.objTimeout = Timeout.setTimeout( fncCall, 100, this );
            break;
        case TextInput.eFocusBehavoir.FB_DEFAULT:
        default:
            break;
    } // end switch
    
    this.$( 'elementInput' ).addClassName( 'focused' );
};

/**
* OnBlur - Handles blur.
* @param {Object} in_objEvent - Event
*/
TextInput.prototype.OnBlur = function( in_objEvent )
{
    this.$( 'elementInput' ).removeClassName( 'focused' );
};

/**
* show - take care of showing.
*/
TextInput.prototype.show = function()
{
    TextInput.Base.show.apply( this, arguments );

    if( true === this.m_bFocusOnShow )
    {   // Give IE6 some time to show its stuff before we put in the focus.
        this.m_objFocusTimeout = Timeout.setTimeout( this.focus, 100, this );
    } // end if
};

function TextInputAltConfig()
{
    TextInputAltConfig.Base.constructor.apply( this );
}
UberObject.Base( TextInputAltConfig, TextInput );

Object.extend( TextInputAltConfig.prototype, {
    loadConfigParams: function()
    {
        var ConfigParams = {
            m_bFocusOnShow: { type: 'boolean', bRequired: false, default_value: false },
            type: { type: 'string', bReqired: false, default_value: 'TextInputAltConfig' }
        };
        
        TextInputAltConfig.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, ConfigParams, true );
    },

    init: function( in_objConfig )
    {
        this.initWithConfigObject( in_objConfig );
    }
} );