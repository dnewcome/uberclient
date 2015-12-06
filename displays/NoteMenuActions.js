
function NoteMenuActions()
{
    NoteMenuActions.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteMenuActions, ListMenuPlugin );

Object.extend( NoteMenuActions.prototype, {
    loadConfigParams: function()
    {
        NoteMenuActions.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.PRINT, callback: 'requestprint' },
                    { string: _localStrings.HISTORY, callback: 'requestrevisions' },
           /*         { string: _localStrings.HIDE, callback: 'requesthide', 
                        displaycheck: this._hideCheck },
                    { string: _localStrings.UNHIDE, callback: 'requestunhide',
                        displaycheck: this._unhideCheck },
						*/
                    { string: _localStrings.ATTACH_FILE, callback: 'requestattachfile',
                        displaycheck: this._attachFileCheck },
                    { string: _localStrings.EMAIL_TO_SELF, callback: 'requestemail',
                        displaycheck: this._attachFileCheck }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'NoteMenuActions' }
        } );
    },

    _hideCheck: function()
    {
        return !this.m_objExtraInfo.Hidden && !this.m_objExtraInfo.Trash;
    },

    _unhideCheck: function()
    {
        return this.m_objExtraInfo.Hidden && !this.m_objExtraInfo.Trash;
    },
    
    _attachFileCheck: function()
    {
        return !this.m_objExtraInfo.Trash && this.m_bEditable;
    },
    
    _showOnlyThisCheck: function()
    {
        return Ubernote.m_bFullApp;
    }
} );
