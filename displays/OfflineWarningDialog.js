function OfflineWarningDialog()
{
    OfflineWarningDialog.Base.constructor.apply( this );
}
UberObject.Base( OfflineWarningDialog, UberObject );

Object.extend( OfflineWarningDialog.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_objWarningDialog: { type: 'object', bRequired: true },
            type: { type: 'string', bRequired: false, default_value: 'OfflineWarningDialog' }
        };

        OfflineWarningDialog.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    /**
    * init - do some initialization.
    * @param {Object} in_objConfig - configuration object.
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        this.initWithConfigObject( in_objConfig );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'offline', Messages.all_publishers_id, this.OnOffline )
            .RegisterListener( 'online', Messages.all_publishers_id, this.OnOnline );
    },
        
    OnOffline: function()
    {
        this.m_objWarningDialog.show();
    },
    
    OnOnline: function()
    {
        this.m_objWarningDialog.hide();
    }
} );    