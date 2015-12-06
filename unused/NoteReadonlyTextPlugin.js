function NoteReadonlyTextPlugin( in_objNoteDisplay )
{
    return NoteReadonlyTextPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteReadonlyTextPlugin, Plugin );

Object.extend( NoteReadonlyTextPlugin.prototype, {
    loadConfigParams: function()
    {
         var objConfigParams = {
            m_strDataFieldName: { type: 'string', bRequired: true },
            m_strElementSelector: { type: 'string', bRequired: true },
            type: { type: 'string', bRequired: false, default_value: 'NoteReadonlyTextPlugin' }
        };
        NoteReadonlyTextPlugin.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },
        
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData, this );
        this.RegisterListener( 'onshow', this.OnShow, this );

        NoteReadonlyTextPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnLoadData - take care of loading the data into ourselves.
    */
    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );
        
        this.getPlugged().$( this.m_strElementSelector ).update( in_objNoteData[ this.m_strDataFieldName ] );
    },
    
    /**
    * OnShow - Checks to see if the data we are requesting is available.  
    *   If not, request the load of the note.
    */ 
    OnShow: function()
    {
        var objPlugged = this.getPlugged();
        if( ( objPlugged.m_objExtraInfo )
         && ( false === TypeCheck.Defined( objPlugged.m_objExtraInfo[ this.m_strDataFieldName ] ) ) )
        {
           objPlugged.requestLoad();
        } // end if
    }
} );    
