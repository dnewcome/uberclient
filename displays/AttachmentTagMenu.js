
function AttachmentTagMenu()
{
    AttachmentTagMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( AttachmentTagMenu, MetaTagMenu );

Object.extend( AttachmentTagMenu.prototype, {
    loadConfigParams: function()
    {
        AttachmentTagMenu.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.DOWNLOAD, callback: this.requestDownload },
                    { string: _localStrings.REMOVE_TAG, callback: this.requestRemove }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'AttachmentTagMenu' }
        } );
    },

    /**
    * requestDownload - Request a download of an attachment.
    */
    requestDownload: function()
    {
        var strMetaTagID = this.getMetaTagID();
        this.RaiseForAddress( 'request' + this.type + 'download', strMetaTagID );
    },
    
    /**
    * requestRemove - Request the removal of an attachment.  First
    *   ask the user if they are sure they want to do it.
    */
    requestRemove: function()
    {
        var bRetVal = window.confirm( _localStrings.ATTACH_REMOVE_CONFIRM );
        if( bRetVal )
        {
            AttachmentTagMenu.Base.requestRemove.apply( this );
        } // end if
    }
} );
