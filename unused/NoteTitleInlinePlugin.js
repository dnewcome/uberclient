function NoteTitleInlinePlugin( in_objNoteDisplay )
{
    return NoteTitleInlinePlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteTitleInlinePlugin, Plugin );

Object.extend( NoteTitleInlinePlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'childinitialization', this.OnChildInitialization );
        this.RegisterListener( 'loaddataobject', this.OnLoadData );
        this.RegisterListener( 'registerchildmessagehandlers', this.OnRegisterChildMessageHandlers );
        this.RegisterListener( 'seteditable', this.OnSetEditable );
        this.RegisterListener( 'onsavecomplete', this.OnLoadData );

        NoteTitleInlinePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnRegisterChildMessageHandlers: function()
    {
		this.RegisterListener( 'inlineeditchanged', this.m_objTitle.m_strMessagingID, 
		        NoteTitleInlinePlugin.prototype.OnTitleChange )
		    .RegisterListener( 'inlineeditclose', this.m_objTitle.m_strMessagingID, 
		        NoteTitleInlinePlugin.prototype.OnTitleEditClose );
    },
    
    OnChildInitialization: function()
    {
		this.m_objTitle = this.createInitUberObject( InlineEdit, {
		    m_objInsertionPoint: this.$( 'elementTitle' ),
		    m_strTemplate: 'InlineEdit',
		    m_strTooltip: _localStrings.CLICK_TO_EDIT,
		    m_bEditable: !this.m_bTrash
		} );
		NoteTitleInlinePlugin.prototype.titleWriteText.apply( this, [ _localStrings.LOADING ] );

	    // update the title item in the cache.
        this.attachHTMLElement( 'elementTitle', this.m_objTitle.$() );
    },
    
    /**
    * OnSetEditable - handle the 'seteditable' message.
    * @param {Boolean} in_bEditable - if true, title is editable, false otw.
    */
    OnSetEditable: function( in_bEditable )
    {
        Util.Assert( TypeCheck.Boolean( in_bEditable ) );
        
        this.m_objTitle && this.m_objTitle.SetEditable( in_bEditable );
    },

    /**
    * OnTitleChange - Called when the title is edited and the inline edit closed.
    * @param {String} in_strNewTitle - New title text.
    */
	OnTitleChange: function( in_strNewTitle )
	{
	    Util.Assert( TypeCheck.String( in_strNewTitle ) );
	    
	    var strTitle = in_strNewTitle.replace( /  /gi, ' ' ); //Replace all double spaces and replace with a single
        strTitle = strTitle.replace( /  /gi, ' ' ); //Replace all double spaces and replace with a single
        strTitle = strTitle.replace( /^\s+/gi, '' ); //Replace all leading whitespace
        strTitle = strTitle.replace( /\s+$/gi, '' ); //Replace all trailing whitespace
        
	    if ( strTitle == Note.blank_title_text )
	    {   // set it to blank for the DB.
	        strTitle = '';
	    } // end if
        NoteTitleInlinePlugin.prototype.titleWriteText.apply( this, [ strTitle ] );
		
		this.RaiseForAddress( 'requesttitleedit', this.m_strNoteID, [ strTitle ] );
	},
    
    /**
    * OnTitleEditClose - takes care of closing the title.
    * @param {Boolean} in_bClickedOut - true if the user "clicked" out and has put
    *   the cursor somewhere else, false otw.
    */
    OnTitleEditClose: function( in_bClickedOut )
    {
        Util.Assert( TypeCheck.UBoolean( in_bClickedOut ) );
        
        if( true != in_bClickedOut )
        {
            this.forceFocusWithText();
        } // end if
    },
    
    /**
    * OnLoadData - take care of loading the data into ourselves.
    */
    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );
        
        NoteTitleInlinePlugin.prototype.titleWriteText.apply( this, [ in_objNoteData.Title ] );
    },
    
    /**
    * titleWriteText - write some text to the inline edit.  If not given,
    *   use default as defined by Note.blank_title_text.
    * @param {String} in_strNewTitle (optional) - title text.
    */            
	titleWriteText: function( in_strNewTitle )
	{
	    Util.Assert( TypeCheck.UString( in_strNewTitle ) );
	    
        this.m_objTitle.SetValue( in_strNewTitle || Note.blank_title_text );
	}    
} );    
