/**
* Main application object.  Instantiates the other toplevel objects in the application.
*/
function StandaloneEditorApp()
{
    this.notedisplay = undefined;
    
    StandaloneEditorApp.Base.constructor.apply( this );
};
UberObject.Base( StandaloneEditorApp, Application );

Object.extend( StandaloneEditorApp.prototype, {
    init: function()
    {
        StandaloneEditorApp.Base.init.apply( this );

        this.initExternalPage();
        this.categoriesloader.loadAll();

        // Masquerade as the window and raise a resize to get the sizes right.
        this.Raise( 'resize', undefined, undefined, window.m_strElementID );

        this.notedisplay = this.notedisplayfactory.create( 'standaloneeditor', Ubernote.m_strNoteID );

        this.startIntervals();
    },


    RegisterMessageHandlers: function()
    {
    	this.RegisterListener( 'notetrash', Ubernote.m_strNoteID, this.noteTrash )
    	    .RegisterListener( 'notedelete', Ubernote.m_strNoteID, this.noteDelete )
    	    .RegisterListener( 'noteload', Ubernote.m_strNoteID, this.noteLoad )
    	    .RegisterListener( 'notesave', Ubernote.m_strNoteID, this.noteSave );
    	
	    StandaloneEditorApp.Base.RegisterMessageHandlers.apply( this );
    },
    
    /**
    * noteDelete - called on note delete to tear us down.
    */
    noteDelete: function()
    {
        // Close this window if the note we are displaying gets deleted.
        if( window.opener )
        {
            alert( _localStrings.DELETED_NOTE_POPUP_CLOSE );
            this.teardown();
        } // end if
        else
        {
            alert( _localStrings.DELETED_NOTE_PREVIOUS_PAGE );
            history.go( -1 );
        } // end if-else
    },

    /**
    * noteTrash - called on note trash to tear us down.
    */
    noteTrash: function()
    {
        if( window.opener )
        {
            // Close this window if the note we are displaying gets deleted.
            alert( _localStrings.TRASH_NOTE_POPUP_CLOSE );
            this.teardown();
        } // end if
    },
    
    /**
    * noteLoad - called on note load to set the title.
    * @param {Object} in_objNote - Note model.
    */
    noteLoad: function( in_objNote )
    {
        Util.Assert( TypeCheck.Object( in_objNote ) );
        
        this.notedisplay.focus( true );
        
        document.title = _localStrings.TITLE_PREFIX 
            + ( in_objNote.m_objExtraInfo.Title || _localStrings.UNTITLED )
            + _localStrings.TITLE_POSTFIX;
        
        // Hide the loading screen if it is shown.
        this.dialogs.loadingscreen.hide();
    },
    
    /**
    * noteSave - called on note save to set the title with updated title.
    * @param {String} in_strNoteID - ignored.
    * @param {Date} in_dtUpdate - ignored.
    * @param {Object} in_objNote - Note model.
    */
    noteSave: function( in_strNoteID, in_dtUpdate, in_objNote )
    {
        Util.Assert( TypeCheck.Object( in_objNote ) );

        this.noteLoad( in_objNote );
    },
    
    /**
    * teardown - called to tear the app down and close the window..
    */
    teardown: function()
    {
        StandaloneEditorApp.Base.teardown.apply( this, arguments );
        window.close();
    }
    
} );


/**
* InitStandaloneEditorApp - create and initialize the standalone editor app.
*/
function InitStandaloneEditorApp()
{
    Ubernote.m_bStandaloneEditor = true;
    window.app = new StandaloneEditorApp();    
    window.app.init();
};
