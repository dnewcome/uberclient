
/* SelectionListInputPopup
*   A selection list popup with an input! 
*/
function SelectionListInputPopup()
{
    this.m_objTextInput = undefined;
    
    SelectionListPopup.apply( this );
}
SelectionListInputPopup.prototype = new SelectionListPopup;

SelectionListInputPopup.ConfigParams = {
    TextInputConfig: { type: 'object', bRequired: true },
    type: { type: 'string', bRequired: false, default_value: 'selectionlistinputpopup' }
};

/*
* the following functions are imported from the m_objSelectionList object
*   and when somebody calls us with one of these functions it is redirected
*   to the child function
*/
( function() {
    var importRule = {
        importfrom: TextInput.prototype,
        importto: SelectionListInputPopup.prototype,
        scope: 'm_objTextInput'
    };

    UberObject.ImportDefinedChildAccessors( importRule );
})();

Object.extend( SelectionListInputPopup.prototype, {
    loadConfigParams: function()
    {
        SelectionListPopup.prototype.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, SelectionListInputPopup.ConfigParams, true );
    },

    /**
    * childInitialization - Initialize our children.
    */
    childInitialization: function()
    {    
        this.m_objTextInput = new TextInput();
        this.m_objTextInput.init( this.$( 'elementTextInput' ), 
            this.TextInputConfig.m_strTemplate, this.TextInputConfig.m_eFocusBehavior );
        this.attachDisplay( this.m_objTextInput.m_strMessagingID, this.m_objTextInput, true );
        
        SelectionListPopup.prototype.childInitialization.apply( this );
    },
    
    RegisterChildMessageHandlers: function()
    {
        // Override this one.
        this.UnRegisterListener( 'textinputcancelled', this.m_objTextInput.m_strMessagingID );
        this.RegisterRelay( 'textinputcancelled', this.m_objTextInput.m_strMessagingID, this.hide );
        SelectionListPopup.prototype.RegisterChildMessageHandlers.apply( this );
    }
} ); 
