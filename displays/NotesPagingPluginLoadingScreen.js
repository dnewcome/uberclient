/**
* NotesPagingLoadingScreenPlugin - This object takes care of 
*   displaying the loading screen when we are doing network
*   traffic.  Lets the user know there is activity going on
*   and we aren't just leaving them hanging.
*
*
* The list of messages registered below usually start a screen 
*   update.  We try to show the screen update as fast as possible 
*   to eliminate possible user interaction and then hide it as 
*   soon as we know no more notes are coming back, being requested
*   from the DB.  
* The list of messages below with the listener _showScreen almost
*   always trigger a screen update.  If we get a displaynotespost 
*   message and no 'requestnoteload's occurred, this means the
*   screen did not need updated and we can hide the loading 
*   screen.  If a 'requestnoteload' happened during this time, 
*   save off the list of notes requested.  If we get 'noteload's 
*   for all of the notes, that means all the notes were in cache 
*   and have been loaded, remove the hide screen.  If we did not
*   get all the notes back, at least one invalid note was 
*   requested, and we don't want to hide forever, so we listen 
*   for the notesdecoded message.  This means that the notes 
*   that can be requested from the DB have been requested and 
*   the screen is as up to date as it can be, remove the loading 
*   screen.
*/
function NotesPagingLoadingScreenPlugin()
{
    this.m_objRequests = {};
    NotesPagingLoadingScreenPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingLoadingScreenPlugin, Plugin );

Object.extend( NotesPagingLoadingScreenPlugin.prototype, {
    loadConfigParams: function()
    {
        NotesPagingLoadingScreenPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objScreenToShow: { type: 'object', bRequired: true },
            type: { type: 'string', bReqired: false, default_value: 'NotesPagingLoadingScreenPlugin' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        NotesPagingLoadingScreenPlugin.Base.RegisterMessageHandlers.apply( this );
		var me=this, all=Messages.all_publishers_id, showScreen = me._showScreen;
		
        me.RegisterListenerObject( { message: 'requestnoteload', 
	            listener: me.OnRequestNoteLoad, context: me,
	            from: all } );
        me.RegisterListenerObject( { message: 'noteload', 
                listener: me.OnNoteLoad, context: me,
                from: all } );
        me.RegisterListenerObject( { message: 'requestnoteids', 
	            listener: showScreen, context: me,
	            from: all } );
        /*me.RegisterListenerObject( { message: 'noteids', 
                listener: me.OnNoteLoad, context: me,
                from: all } );
                */
        me.RegisterListenerObject( { message: 'notesdecoded', 
                listener: me._hideScreen, context: me,
                from: all } );
        me.RegisterListener( 'notespagingredisplayinplace', showScreen, me );
        me.RegisterListener( 'beforeconfigchange', showScreen, me );
        // These are the actions on a single note.
	    me.RegisterListenerObject( { message: 'requestnotetrash', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnotedelete', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnoteuntrash', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnotehidden', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnoteunhidden', 
	        from: all, listener: showScreen, context: me } );
	    // These are the actions on multiple notes.
	    me.RegisterListenerObject( { message: 'requestnotestrash', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnotesdelete', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnotesuntrash', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnoteshidden', 
	        from: all, listener: showScreen, context: me } );
	    me.RegisterListenerObject( { message: 'requestnotesunhidden', 
	        from: all, listener: showScreen, context: me } );
        me.RegisterListener( 'displaynotespost', me.OnDisplayNotesPost, me );
    },

    /**
    * OnRequestNoteLoad - takes care of 'requestnoteload' message.
    *   Adds to the list of notes being requested, shows the
    *   loading screen until all notes are done loading.
    * @param {String} in_strNoteID - can be an empty string
    */
    OnRequestNoteLoad: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        
        if( in_strNoteID )
        {
            this._showScreen();
            this.m_objRequests[ in_strNoteID ] = null;
        } // end if
    },
    
    /**
    * OnNoteLoad - Note has been loaded, see if all notes
    *   are loaded and hide screen if no notes left in loading list.
    * @param {Object} in_objModel - ignored.
    * @param {String} in_strNoteID - NoteID being loaded.
    */
    OnNoteLoad: function( in_objModel, in_strNoteID )
    {
        Util.Assert( TypeCheck.UString( in_strNoteID ) );
        
        if( in_strNoteID )
        {
            delete( this.m_objRequests[ in_strNoteID ] );
        } // end if
        
        if( false === Util.objectHasProperties( this.m_objRequests ) )
        {
            this._hideScreen();
        } // end if
    },
    
    OnDisplayNotesPost: function()
    {
        // At this point, all the messages for requestnoteload should
        //  have happened.  If there are no notes requested, then we 
        //  redisplayed the same note set, hide the screen.
        if( false === Util.objectHasProperties( this.m_objRequests ) )
        {
            this._hideScreen();
        } // end if
    },
    
    _showScreen: function()
    {
        this.m_objScreenToShow.show();
    },
    
    _hideScreen: function()
    {
        this.m_objScreenToShow.hide();
        // reset this when we do a hide screen so that we can check it and never get out of sync.
        this.m_objRequests = {};
    }
} );
