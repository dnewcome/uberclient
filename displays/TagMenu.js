
function MetaTagMenu()
{
    MetaTagMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( MetaTagMenu, ListMenuPlugin );

Object.extend( MetaTagMenu.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.REMOVE_TAG, callback: this.requestRemove }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'MetaTagMenu' }
        };
        
        MetaTagMenu.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    /**
    * requestRemove - Request a delete of the Tag.  
    * @returns {bool} true request successfully sent, false otw.
    */
    requestRemove: function()
    {
        var strMetaTagID = this.getMetaTagID();
        var objBindingInfo = this.getBindingInfo();
        var bRetVal = this.RaiseForAddress( 'requestnote' + this.type + 'remove', objBindingInfo.Note_ID, [ strMetaTagID ] );
        
        return bRetVal;
    }    
} );
