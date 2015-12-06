
function NoteUpdateUserPlugin( in_objNoteDisplay )
{
    return NoteUpdateUserPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteUpdateUserPlugin, Plugin );

Object.extend( NoteUpdateUserPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData, this );
        this.RegisterListener( 'onsavecomplete', this.OnLoadData, this );
        
        NoteUpdateUserPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );
        
        this.setUpdateUser( in_objNoteData.Update_User );
    },
    
    setUpdateUser: function( in_strUpdateUser )
    {
        Util.Assert( TypeCheck.UString( in_strUpdateUser ) );
        
        var objPlugged = this.getPlugged();
        var objUpdateUser = objPlugged.$( 'elementUpdateUser' );
        if( objUpdateUser )
        {
            if( ( in_strUpdateUser )
             /*&& ( Ubernote.m_strUserName != in_strUpdateUser ) */)
            {
                objPlugged.$( 'elementUpdateUserContainer' ).addClassName( 'hasupdateuser' );
                objUpdateUser.update( in_strUpdateUser );
            } // end if
            else
            {
                objPlugged.$( 'elementUpdateUserContainer' ).removeClassName( 'hasupdateuser' );
            } // end if-else
        } // end if
    }
} );

