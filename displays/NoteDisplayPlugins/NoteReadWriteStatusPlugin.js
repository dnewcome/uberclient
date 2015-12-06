function NoteReadWriteStatusPlugin()
{
    return NoteReadWriteStatusPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteReadWriteStatusPlugin, Plugin );

Object.extend( NoteReadWriteStatusPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData );
        this.RegisterListener( 'settrash', this.OnLoadData );
        this.RegisterListener( 'unsettrash', this.OnLoadData );
        
        NoteReadWriteStatusPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnLoadData: function()
    {
        var objExtraInfo = this.m_objExtraInfo;
        
        var bEditable = ( ( false === objExtraInfo.Trash )
                       && ( Notes.eShareLevels.read !== objExtraInfo.Share_Level ) );


        this.setEditable( bEditable );
        
        if( true === bEditable )
        {
            this.$().removeClassName( 'read' ).addClassName( 'write' );
        } // end if
        else
        {
            this.$().addClassName( 'read' ).removeClassName( 'write' );
        } // end if-else
    }
} );
