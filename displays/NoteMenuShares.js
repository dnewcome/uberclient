
function NoteMenuShares()
{
    NoteMenuShares.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteMenuShares, ListMenuPlugin );

Object.extend( NoteMenuShares.prototype, {
    loadConfigParams: function()
    {
        NoteMenuShares.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.SHARE_WITH, callback: 'requestsharing',
                        displaycheck: this._shareCheck },
                    { string: _localStrings.EMAIL_TO_SELF, callback: 'requestemail' }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'NoteMenuShares' }
        } );
    },

    _shareCheck: function()
    {
        return ! this.m_objExtraInfo.Share_Owner;
    }
} );
