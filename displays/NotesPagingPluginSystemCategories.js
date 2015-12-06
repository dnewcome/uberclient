/**
* NotesPagingSystemCategoriesPlugin object.
*/
function NotesPagingSystemCategoriesPlugin()
{
    this.m_strMetaTagName = undefined;
    NotesPagingSystemCategoriesPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingSystemCategoriesPlugin, Plugin );

Object.extend( NotesPagingSystemCategoriesPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        NotesPagingSystemCategoriesPlugin.Base.RegisterMessageHandlers.apply( this );
        var objPlugged = this.getPlugged();
        
        this.RegisterListener( 'configchange', this.OnConfigChange, this );
    },

    OnConfigChange: function()
    {
        var objPlugged = this.getPlugged();
        
        objPlugged.$().removeClassName( this.m_strMetaTagName );
        if( 'systemcategories' === objPlugged.m_objConfig.collectionid )
        {
            this.m_strMetaTagName = objPlugged.m_objConfig.metatagid;
            objPlugged.$().addClassName( this.m_strMetaTagName );
        } // end if
    }
} );
