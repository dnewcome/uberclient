/**
* NewNoteMenu - A new note menu, shows options for creating new notes in various methods.
*/
function NewNoteMenu()
{
    NewNoteMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( NewNoteMenu, ListMenuPlugin );

Object.extend( NewNoteMenu.prototype, {
    loadConfigParams: function()
    {
        NewNoteMenu.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.INLINE, callback: 'requestnewnote' },
                    { string: _localStrings.EXTERNAL, callback: 'requestnoteexternal', 
                        arguments: [ 'NEW_NOTE' ] }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'NewNoteMenu' }
        } );
    }
} );
