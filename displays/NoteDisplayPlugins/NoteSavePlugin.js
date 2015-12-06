/**
* NoteSavePlugin - used basically as a relay of the 'notesave' message from the model
*   the note is currently associated with to our plugins.  We use this plugin
*   so each plugin that is listening for a save does not have to unregister messages on one noteID,
*   then re-register messages on a noteID when the noteID for the NoteDisplay changes.  This
*   way the only one unregistering/reregistring is the NoteSavePlugin.
*/
function NoteSavePlugin()
{
    return NoteSavePlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteSavePlugin, Plugin );

Object.extend( NoteSavePlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'registermessagehandlers', this.OnRegisterMessageHandlers, this );
        this.RegisterListener( 'setnotemodelidpre', this.OnSetNoteModelIDPre, this );
        this.RegisterListener( 'setnotemodelidpost', this.OnSetNoteModelIDPost, this );

        NoteSavePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterMessageHandlers: function()
    {
        if( this.getPlugged().m_strNoteID )
        {
            this.OnSetNoteModelIDPost();
	    } // end if
    },
    
    OnSetNoteModelIDPre: function()
    {
        var strNoteID =  this.getPlugged().m_strNoteID;
        if( strNoteID )
        {
            this.UnRegisterListener( 'notesave', strNoteID, this.OnSaveComplete );
        } // end if
    },

    OnSetNoteModelIDPost: function()
    {
        this.RegisterListenerObject( { message: 'notesave', from: this.getPlugged().m_strNoteID, 
            listener: this.OnSaveComplete } );
    },

    /**
    * OnSaveComplete - called when the note is saved.  Pass the message along to our
    *   plugins.
    */
    OnSaveComplete: function( in_strNoteID, in_dtSaveTime, in_objModel )
    {
	    this.Raise( 'onsavecomplete', [ in_objModel.m_objExtraInfo ] );
    }
} );
