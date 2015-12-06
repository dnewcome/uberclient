/**
* TextInputPopup - a popup that has a TextInput.
*/
function TextInputPopup()
{
    this.m_objTextInput = undefined;
    
    Popup.apply( this );
}
// Inherit from Popup
TextInputPopup.prototype = new Popup;

/**
* init - Initialize ourselves
*   returns true if template successfully loaded and attached, false otw.
* @param {Object} in_objInsertionPoint (optional) - Parent DOM Element to attach to.  If 
*    none given, will attach to the body.
* @param {String} in_strTemplate - Name of the template to use for collection.
* @param {String} in_strTextInputTemplate - Name of the template to use for text input.
* @param {enum} in_eFocusBehavior (optional) - Behavior to choose on focus.
*/
TextInputPopup.prototype.init = function( in_objInsertionPoint, in_strTemplate, in_strTextInputTemplate, in_eFocusBehavior )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strTemplate ) );
    Util.Assert( TypeCheck.String( in_strTextInputTemplate ) );
    var bRetVal = false;
    
    var objConfig = {
        m_objInsertionPoint: in_objInsertionPoint,
        m_strTemplate: in_strTemplate
    };
   
    // Temporary, we delete these in childInitialization.
    this.m_strTextInputTemplate = in_strTextInputTemplate;
    this.m_eFocusBehavior = in_eFocusBehavior;
    Popup.prototype.init.apply( this, [ objConfig ] );
    
    this.type = 'textinput';
};

/**
* childInitialization - Initialize our children.
*/
TextInputPopup.prototype.childInitialization = function()
{    
    this.m_objTextInput = new TextInput();
    this.m_objTextInput.init( this.$( 'elementTextInput' ), this.m_strTextInputTemplate, this.m_eFocusBehavior );
    this.attachDisplay( this.m_objTextInput.m_strMessagingID, this.m_objTextInput, true );

    delete this.m_strTextInputTemplate;
    delete this.m_eFocusBehavior;
    
    Popup.prototype.childInitialization.apply( this );
};

/*
* the following functions are imported from the m_objTextInput object
*   and when somebody calls us with one of these functions it is redirected
*   to the child function
*/
( function() {
    var importRule = {
        importfrom: TextInput.prototype,
        importto: TextInputPopup.prototype,
        scope: 'm_objTextInput'
    };

    UberObject.ImportDefinedChildAccessors( importRule );
})();

/**
* show - Show the popup.  Places focus into the text input
* @param {Object} in_objPosition (optional) - Position where to place the menu
*   If not positioned, puts in the default location
*/

TextInputPopup.prototype.show = function( in_objPosition )
{
    Popup.prototype.show.apply( this, [ in_objPosition ] );

    var me=this;
    // Give IE6 some time to show its stuff before we put in the focus.
    setTimeout( function() { me.m_objTextInput.focus(); }, 100 );
};

TextInputPopup.prototype.RegisterChildMessageHandlers = function()
{
    // we are overriding the default registered relays
    this.RegisterRelay( 'textinputsubmit', this.m_objTextInput.m_strMessagingID, this.hide );
    this.RegisterRelay( 'textinputcancelled', this.m_objTextInput.m_strMessagingID, this.hide );
    this.RegisterRelay( 'textinputclosed', this.m_objTextInput.m_strMessagingID, this.hide );

    Popup.prototype.RegisterChildMessageHandlers.apply( this );
};

/**
* OnCloseButtonClick - Called when the close button is clicked.
*   Raises a textinputclosed message with the value of the input box.
* OnOKButtonClick - Called when the close button is clicked.
*   Raises a textinputclosed message with the value of the input box.
* OnCancelButtonClick - Called when the cancel button is clicked.
*   Raises a textinputclosed message with the value of the input box.
*/
TextInputPopup.prototype.OnCloseButtonClick = function( in_objEvent )
{
    Popup.prototype.OnCloseButtonClick.apply( this, [ in_objEvent, [ this.getValue() ] ] );
};

TextInputPopup.prototype.OnOKButtonClick = function( in_objEvent )
{
    Popup.prototype.OnOKButtonClick.apply( this, [ in_objEvent, [ this.getValue() ] ] );
};

TextInputPopup.prototype.OnCancelButtonClick = function( in_objEvent )
{
    Popup.prototype.OnCancelButtonClick.apply( this, [ in_objEvent, [ this.getValue() ] ] );
};
