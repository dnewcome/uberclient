function NoteBarPlugin( in_objNoteDisplay )
{
    NoteBarPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteBarPlugin, Plugin );

Object.extend( NoteBarPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'childinitialization', 
	            listener: this.OnChildInitialization, context: this } );

        NoteBarPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnChildInitialization: function()
    {
        var objPlugged = this.getPlugged();
        var objOldNoteBar = objPlugged.$( 'NoteBar' );
	    
		var objNewNoteBar = TemplateManager.GetTemplate( 'NoteBar' );
    	objOldNoteBar.parentNode.replaceChild( objNewNoteBar, objOldNoteBar );
        
	    // update the NoteBar item in the cache.
        objPlugged.attachHTMLElement( 'NoteBar', objNewNoteBar );
    }
} );    
