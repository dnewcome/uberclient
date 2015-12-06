
function CommentMenu()
{
    CommentMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( CommentMenu, ListMenuPlugin );

Object.extend( CommentMenu.prototype, {
    loadConfigParams: function()
    {
        CommentMenu.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.REMOVE_TAG, callback: this.requestRemove }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'CommentMenu' }
        } );
    },

    /**
    * requestRemove - Request a delete of the Tag.  
    */
    requestRemove: function()
    {
        var strMetaTagID = this.getMetaTagID();
        this.RaiseForAddress( 'request' + this.type + 'delete', strMetaTagID, [ strMetaTagID ] );
    }    
} );
