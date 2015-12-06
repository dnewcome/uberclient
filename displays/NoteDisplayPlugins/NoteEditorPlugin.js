
function NoteEditorPlugin( in_objNoteDisplay )
{
    return NoteEditorPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteEditorPlugin, Plugin );

Object.extend( NoteEditorPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteEditorPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_bCreateEditorOnInit: { type: 'boolean', bRequired: false, default_value: false },
            m_strNoteID: { type: 'string', bRequired: false },
            type: { type: 'string', bRequired: false, default_value: 'NoteEditorPlugin' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
		var me=this, register=me.RegisterListener.bind(me);
		
        me.extendPlugged( 'playWellWithOthers' );

        register( 'childinitialization', me.OnChildInitialization, me );
        register( 'loaddataobject', me.OnLoadData );
        register( 'registerchildmessagehandlers', me.OnRegisterChildMessageHandlers, me );
        register( 'onsetnotemodelid', me.OnSetNoteModelID, me );
        register( 'seteditable', me.OnSetEditable );
        register( 'focus', me.OnFocus, me );
        register( 'menuhide', me.OnFocusEvent, me );
        register( 'titleedithide', me.OnFocusEvent, me );
        register( 'unfocus', me.OnUnfocus, me );
        register( 'onheightchanged', me.OnHeightChanged );
        register( 'onsavecomplete', me.OnSaveComplete );
        me.RegisterListenerObject( {
            message: 'documentresize', 
            from: Messages.all_publishers_id,
            listener: me.OnHeightChanged
        } );
        
        NoteEditorPlugin.Base.RegisterMessageHandlers.apply( me, arguments );
    },

    OnSetNoteModelID: function( in_strNewNoteID )
    {
        var objPlugged = this.getPlugged();

        this._saveNoteXML();

        this.m_strNoteID = in_strNewNoteID;
        objPlugged.m_objNoteText.setID( in_strNewNoteID );
    },
    
    /**
    * teardown - run in the context of the plugin itself.
    */
    teardown: function()
    {
        this.getPlugged().m_astrNoteXML = null;
        
        NoteEditorPlugin.Base.teardown.apply( this );
    },
    
    OnRegisterChildMessageHandlers: function()
    {
        var objPlugged = this.getPlugged();
	    this.RegisterListenerObject( { message: 'noteEditorEdited', 
	        from: objPlugged.m_objNoteText.m_strMessagingID, 
	        listener: this.OnNoteTextEdited } );
	    this.RegisterListenerObject( { message: 'noteEditorLinkOpen', 
	        from: objPlugged.m_objNoteText.m_strMessagingID, 
	        listener: this.OnNoteTextLinkOpen, context: this } );
    },

    OnChildInitialization: function()
    {
        var objPlugged = this.getPlugged();

        Util.Assert( objPlugged.$( 'elementBody' ) );

        objPlugged.m_astrNoteXML = {};
    
        // NoteText Editor
	    objPlugged.m_objNoteText = this.createInitUberObject( NoteTextFactory, {
	        type: 'NoteText',
	        config: {
	            m_bEditable: objPlugged.m_bEditable,
	            m_objInsertionPoint: objPlugged.$( 'elementBody' ),
	            m_bCreateEditorOnInit: this.m_bCreateEditorOnInit,
	            m_bCreateEditorOnClick: !this.m_bCreateEditorOnInit
	        }
	    } );

	    // update the body item in the cache.
        objPlugged.attachHTMLElement( 'elementBody', objPlugged.m_objNoteText.$() );
	    
	    if( objPlugged.m_strNoteID )
	    {
            objPlugged.m_objNoteText.setID( objPlugged.m_strNoteID );
        } // end if
    },
    
    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );
        
	    if( this.m_objNoteText )
	    {
	        this.m_objNoteText.setXML( in_objNoteData.Body || '', this.m_bFocused );
	        Timeout.setTimeout ( NoteEditorPlugin.prototype.OnHeightChanged, 100, this );
	    } // end if
    },

    /**
    * OnSetEditable - Handler for the 'seteditable' message.
    * @param {Boolean} in_bEditable - says whether the note is editable.
    */
    OnSetEditable: function( in_bEditable )
    {
        Util.Assert( TypeCheck.Boolean( in_bEditable ) );
        
        if( this.m_objNoteText )
        {
            this.m_objNoteText.setEditable( in_bEditable );
        } // end if
    },

	/**
	* OnFocusEvent - called whenever we have an event that needs the entire
	*	editor focused.  Calls "focus" of the editor, which raises the 'onfocus'
	*	for us eventually.
	*/
	OnFocusEvent: function()
	{
		this.getPlugged().focus( true );
	},	
	
    /**
    * OnFocus - Handler for the 'focus' message.
    * @param in_bFocusText {boolean} (optional) - if true, focus the text.
    */
    OnFocus: function( in_bFocusText )
    {
        Util.Assert( TypeCheck.UBoolean( in_bFocusText ) );
        
        this.RegisterListenerObject( { message: 'insertnotelink', 
            from: Messages.all_publishers_id,
            listener: this.OnInsertNoteLink,
            context: this
        } );
        
        this.m_bFocused = true;
        
        if( false !== in_bFocusText )
        {
            this.getPlugged().m_objNoteText.focus();
        } // end if    
    },

    /**
    * OnUnfocus - Handler for the 'unfocus' message.
    */
    OnUnfocus: function()
    {
        this.UnRegisterListener( 'insertnotelink', Messages.all_publishers_id, this.OnInsertNoteLink );
    
        this.getPlugged().m_objNoteText.cancelFocus();
    },
        
    /**
    * OnNoteTextEdited - Handler for the 'noteEditorEdited' message.  Tells the model
    *   it needs to save itself.
    */
    OnNoteTextEdited: function()
    {
        Util.Assert( this.m_objNoteText );
        
        // Only raise the edited if we are loaded, are not trashed, and are set to editable.
        var bRetVal = ( ( true == this.m_bLoaded ) 
                     && ( false == this.m_objExtraInfo.Trash )
                     && ( true == this.m_bEditable ) );
        
        if( true === bRetVal )
        {
            this.Raise( 'notetextedited' );
    	    this.m_bNotSaved = true;
            this.RaiseForAddress( 'requestnotesetbody', this.m_strNoteID, 
                [ { callback: NoteEditorPlugin.prototype.getXML, 
                     context: this } ] );
	    } // end if
        
    },

    /**
    * OnNoteTextLinkOpen - If the given event clicked on is part of an anchor,
    *   open it.  We are passing this on to the NoteLinkNotePlugin for processing.
    * @param {Object} in_objEvent - event causing this.
    */
    OnNoteTextLinkOpen: function( in_objEvent )
    {
        this.getPlugged().Raise( 'notelinkopenevent', [ in_objEvent ], true );
    },
    
    /**
    * OnSaveComplete - called when the note is saved.  Disables
    *   the "save" button
    */
    OnSaveComplete: function( in_objModel )
    {
        if( this.m_objNoteText )
        {
            this.m_objNoteText.OnSaveComplete();
        } // end if
    },
    
    /**
    * OnHeightChanged - process when a delta height is set.
    */
    OnHeightChanged: function()
    {
        var me=this;
        if( me.$() && me.m_objNoteText && me.m_objNoteText.$() )
        {
            var strNoteDisplay = me.$().getStyle( 'display' );
            var strNoteTextDisplay = me.m_objNoteText.$().getStyle( 'display' );
            
            if( strNoteDisplay != 'none' && strNoteTextDisplay != 'none' )
            {   // Only do the resize if our elements are shown and we can do it!
                var nDifference = me.$().getHeight() - me.m_objNoteText.$().getHeight();
                me.m_objNoteText.setDeltaHeight( nDifference );
            } // end if
        } // end if
    },
    
    /**
    * getXML - get the XML of the note.  We use this in case we changed noteID's 
    *   for this note but have not yet saved the note data.  We save the note text on
    *   setNoteModelID and then can get it again here.
    * @param {String} in_strNoteModelID (optional) - NoteID to get the XML for.  
    *   If not given, use the current note.
    * @returns {String} - Note text.
    */
    getXML: function( in_strNoteModelID )
    {
        Util.Assert( TypeCheck.UString( in_strNoteModelID ) );
        
        var strRetVal = '';
        
        this.m_bNotSaved = false;
        
        if( in_strNoteModelID === this.m_strNoteID )
        {
            strRetVal = this.m_objNoteText.getXML();
        } // end if
        else
        {
            strRetVal = this.m_astrNoteXML[ in_strNoteModelID ];
            this.m_astrNoteXML[ in_strNoteModelID ] = null;
        } // end if-else
        
        return strRetVal;
    },

    _saveNoteXML: function()
    {
        var objPlugged = this.getPlugged();
        
        if( true === objPlugged.m_bNotSaved )
        {   // Save the XML in case we have not yet saved.
            var objOrigContents = objPlugged.m_astrNoteXML[ this.m_strNoteID ];
            try {
                objPlugged.m_astrNoteXML[ this.m_strNoteID ] = objPlugged.m_objNoteText.getXML();
            } // end try
            catch( e )
            {   // sometimes FF2 blows up here because the note is hidden.  Log it.  
                // Set the contents back to the original
                objPlugged.m_astrNoteXML[ this.m_strNoteID ] = objOrigContents;
            } // end try-catch
        } // end if
    },
    
    /**
    * playWellWithOthers - sets whether this note is allowed to take up as much
    *   screen as possible or not.  If set to false, takes up as much screen real estate
    *   as is possible, if set to true, resize nicely.
    * @param {Boolean} in_bPlayWellWithOthers - says whether to play well with others.
    */
    playWellWithOthers: function( in_bPlayWellWithOthers )
    {
        Util.Assert( TypeCheck.Boolean( in_bPlayWellWithOthers ) );
        
        this.m_objNoteText.playWellWithOthers( in_bPlayWellWithOthers );
    },
    
    /**
    * OnInsertNoteLink - insert a link to another note.
    * @param {String} in_strNoteID - NoteID we want to insert
    * @param {String} in_strTitle - title of note.
    */
    OnInsertNoteLink: function( in_strNoteID, in_strTitle )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        Util.Assert( TypeCheck.String( in_strTitle ) );
        
        this.getPlugged().m_objNoteText.m_objEditor.execCommand( 'mceLinkNote', false, 
            { noteid: in_strNoteID, title: in_strTitle } );
    }
    
} );
