function NoteShareInfoPlugin()
{
    return NoteShareInfoPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteShareInfoPlugin, Plugin );

Object.extend( NoteShareInfoPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData );
        
        NoteShareInfoPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );
        
        var objContainer = this.$();        
        if( Notes.eShareLevels.none != in_objNoteData.Share_Level )
        {
            objContainer.addClassName( 'sharedwithme' );
            objContainer.removeClassName( 'noteowner' );
        } // end if
        else 
        {   
            objContainer.removeClassName( 'sharedwithme' );
			objContainer.addClassName( 'noteowner' );
        } // end if-else            
    }
} );
