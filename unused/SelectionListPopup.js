/**
* SelectionListPopup - a popup that has a SelectionList.
*/
function SelectionListPopup()
{
    this.m_objSelectionList = undefined;
    this.length = undefined;
    
    Popup.apply( this );
}
// Inherit from Popup
SelectionListPopup.prototype = new Popup;

SelectionListPopup.ConfigParams = {
    SelectionListConfig: { type: 'object', bRequired: true },
    type: { type: 'string', bRequired: false, default_value: 'selectionlistpopup' }
};

/*
* the following functions are imported from the m_objSelectionList object
*   and when somebody calls us with one of these functions it is redirected
*   to the child function
*/
( function() {
    var importRule = {
        importfrom: SelectionList.prototype,
        importto: SelectionListPopup.prototype,
        scope: 'm_objSelectionList'
    };

    UberObject.ImportDefinedChildAccessors( importRule );
})();

Object.extend( SelectionListPopup.prototype, {
    loadConfigParams: function()
    {
        Popup.prototype.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, SelectionListPopup.ConfigParams, true );
    },

    init: function()
    {
        this.length = 0;
        Popup.prototype.init.apply( this, arguments );
    },
    
    /**
    * childInitialization - Initialize our children.
    */
    childInitialization: function()
    {    
        Util.Assert( this.$( 'elementSelectionList' ) );

        this.SelectionListConfig.m_objInsertionPoint = this.$( 'elementSelectionList' );
        
        this.m_objSelectionList = new SelectionList();
        this.m_objSelectionList.init( this.SelectionListConfig );
        this.attachDisplay( this.m_objSelectionList.m_strMessagingID, this.m_objSelectionList, true );
        
        Popup.prototype.childInitialization.apply( this );
    },
    
    RegisterChildMessageHandlers: function()
    {
        this.RegisterListener( 'listitemadd', this.m_objSelectionList.m_strMessagingID, this.OnItemAdd );
        this.RegisterListener( 'listitemremove', this.m_objSelectionList.m_strMessagingID, this.OnItemRemove );
    },
    
    /**
    * OnItemAdd - Increment the length
    */
    OnItemAdd: function()
    {
        this.length++;
    },
    
    /**
    * OnItemRemove - Decrement the length
    */
    OnItemRemove: function()
    {
        this.length--;
    }
    
} );