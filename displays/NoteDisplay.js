
function NoteDisplay()
{
    this.m_objExtraInfo = undefined;
    this.m_strNoteID = undefined;
    
    NoteDisplay.Base.constructor.apply( this );
}
UberObject.Base( NoteDisplay, DisplayAltConfig );

Object.extend( NoteDisplay.prototype, {
    loadConfigParams: function()
    {
        NoteDisplay.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strNoteID: { type: 'string', bReqired: false, default_value: '' },
            m_eLoadLevel: { type: 'number', bReqired: false, default_value: Notes.eLoadLevels.FULL },
            m_bAddIDToClasses: { type: 'boolean', bReqired: false, default_value: false },
            type: { type: 'string', bReqired: false, default_value: 'NoteDisplay' }
        } );
    },

    init: function()
    {
	    NoteDisplay.Base.init.apply( this, arguments );
	    this.$().id = this.m_strMessagingID;

        if( this.m_strNoteID )
        {
            this.m_bAddIDToClasses && this.$().addClassName( this.m_strNoteID );
        
    	    this.requestLoad();
    	} // end if
    },
  
    configurationReady: function()
    {
        if( this.m_strNoteID )
        {
            this.m_strNoteID = Util.convertSQLServerUniqueID( this.m_strNoteID );
        } // end if

        NoteDisplay.Base.configurationReady.apply( this, arguments );
    },
  
    RegisterMessageHandlers: function()
    {
	    this.RegisterListener( 'noteload', this.m_strNoteID, this.loadNote );
        
	    NoteDisplay.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * loadNote - Loads the display with the data from a note model.
    * @in_objNote {object} - NoteModel to load.
    */
    loadNote: function( in_objNote )
    {
        Util.Assert( TypeCheck.Note( in_objNote ) );
        
        this.m_objNote = in_objNote;
        this._loadData( in_objNote.m_objExtraInfo );
        this.$().removeClassName( 'initializing' );
    },
           
    /**
    * _loadData - loads data into Display from model
    * @param {Object} in_objNoteInfo (optional) - Note info to load.  If not
    *   given, does nothing.
    */
    _loadData: function( in_objNoteInfo )
    {
        Util.Assert( TypeCheck.UObject( in_objNoteInfo ) );
        
        if( in_objNoteInfo )
        {
            this.m_objExtraInfo = in_objNoteInfo;
            this.m_bLoaded = true;
            
            this.Raise( 'loaddataobject', arguments, true );
        } // end if
    },

    /**
    * setNoteModelID - sets the note model ID and re-register all DOM/Messaging events.  Will not
    *   update if new ID is the same as the old ID.
    *   returns the replaced ID if successful, undefined otw.
    * @in_strNoteModelID {string} - Model ID
    * @in_bForceReload {Boolean} (optional)- Force reload of Note information.
    * @in_bSkipLoad {Boolean} (optional)- If true, does not load fake data into note display while waiting.
    */
    setNoteModelID: function( in_strNoteModelID, in_bForceReload, in_bSkipLoad )
    {
        Util.Assert( TypeCheck.String( in_strNoteModelID ) );
        Util.Assert( TypeCheck.UBoolean( in_bForceReload ) );
        Util.Assert( TypeCheck.UBoolean( in_bSkipLoad ) );
        
        var strRetVal = undefined;
        in_strNoteModelID = Util.convertSQLServerUniqueID( in_strNoteModelID );
        
        if( this.m_strNoteID != in_strNoteModelID )
        {
            strRetVal = this.m_strNoteID;
            
            this.setNoteModelIDPre.apply( this, arguments );
            
            this.UnRegisterMessageHandlers();
            this.$().addClassName( 'initializing' );

            this.Raise( 'onsetnotemodelid', arguments, true );
            
            this.m_bAddIDToClasses && this.$().removeClassName( this.m_strNoteID );
            this.m_strNoteID = in_strNoteModelID;
            this.m_bAddIDToClasses && this.$().addClassName( this.m_strNoteID );
            
            this.RegisterMessageHandlers();
            this.RegisterChildMessageHandlers();
            this.RegisterDomEventHandlers();
            
            // Update the buttons/heading
            if( true == in_bForceReload )
            {
                this.requestLoad();
            } // end if
            
            this.setNoteModelIDPost.apply( this, arguments );
        } // end if
        
        return strRetVal;
    },

    setNoteModelIDPre: function()
    {
        this.Raise( 'setnotemodelidpre', arguments, true );
    },

    setNoteModelIDPost: function()
    {
        this.Raise( 'setnotemodelidpost', arguments, true );
    },
    
    /**
    * requestLoad - raises a 'requestload' message to load our stuffs.
    */
    requestLoad: function()
    {
        this.m_bLoaded = false;
        
        this.Raise( 'requestnoteload', [ this.m_strNoteID, undefined, undefined, this.m_eLoadLevel ] );
    },
    
    /**
    * heightChanged - means one of our child containers has either appeared or dissappeared
    *   and other containers may want to know (ie, the NoteText in standalone editor mode)
    */
    heightChanged: function()
    {
        this.Raise( 'onheightchanged' );
    }
} );
