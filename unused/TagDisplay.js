/*
* Object for clickable tags in the note bars
* This class is inherited from MetaTagDisplay.  This means all of the CategoryDisplay 
*   functionality is available here.
*/
function TagDisplay()
{
    TagDisplay.Base.constructor.apply( this );
}
UberObject.Base( TagDisplay, MetaTagDisplay );

Object.extend( TagDisplay.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_strNoteID: { type: 'string', bRequired: true },
            m_objTagMenu: { type: 'object', bRequired: false },
            type: { type: 'string', bRequired: false, default_value: 'TagDisplay' }
        };

        TagDisplay.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, objConfigParams, true );
    },

    /*
    * init - initialize ourselves!
    * @param {Object} in_objInsertionPoint (optional) - Parent DOM element to attach to.  Can 
    * @param {Object} in_objMetaTag - MetaTag to make the display for
    * @param {String} in_strNoteID - MetaTag to make the display for
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        TagDisplay.Base.init.apply( this, [ in_objConfig ] );

        this.$()._disabled = !this.m_objTagMenu;
    },

    RegisterDomEventHandlers: function()
    {
        if( this.m_objTagMenu )
        {   // Only do this if we initialize the menu
            this.attachButton( this.$(), this.OnContextMenu, this, false );
        } // end if
        
        TagDisplay.Base.RegisterDomEventHandlers.apply( this );
    },

    OnContextMenu: function( in_objEvent )
    {
        this.m_objTagMenu.show( in_objEvent, this );
    }
} );