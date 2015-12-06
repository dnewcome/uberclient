function NoteTitlePopupPlugin( in_objNoteDisplay )
{
    return NoteTitlePopupPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteTitlePopupPlugin, Plugin );

Object.extend( NoteTitlePopupPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteTitlePopupPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objPopup: { type: 'object', bRequired: true }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'notededittitle', this.OnEditTitle, this );
        
        NoteTitlePopupPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnRegisterChildMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'textinputcancelled', 
            from: this.m_objPopup.m_strMessagingID, 
            listener: this.OnUnRegisterChildMessageHandlers,
            context: this } );
        this.RegisterListenerObject( { message: 'textinputsubmit', 
            from: this.m_objPopup.m_strMessagingID, 
            listener: this.OnTitleChange,
            context: this } );
    },

    OnUnRegisterChildMessageHandlers: function()
    {
        var objPlugged = this.getPlugged();
        var objContainer = this.m_objPopup.$();
        objContainer.removeClassName( 'titlepopup' );

        this.UnRegisterListener( 'textinputcancelled', this.m_objPopup.m_strMessagingID )
            .UnRegisterListener( 'textinputsubmit', this.m_objPopup.m_strMessagingID );
        this.m_objPopup.hide();
        
        objPlugged.Raise( 'titleedithide' );
    },
    
    OnEditTitle: function()
    {
        var objElement = this.getPlugged().$( 'elementTitle' );
        
        var objPopupLocation = {x: 20, y: ( Element.getHeight( objElement )/2 - 3 ) };
	    var objOffset = Element.viewportOffset( objElement );

        objPopupLocation.x += objOffset[ 0 ];
        objPopupLocation.y += objOffset[ 1 ];
        
        this.OnRegisterChildMessageHandlers();
        
		this.m_objPopup.setOKText( _localStrings.RENAME_NOTE );
		this.m_objPopup.setHeader( _localStrings.RENAME_NOTE );
        this.m_objPopup.setValue( this.getPlugged().m_objExtraInfo.Title );
        
        var objContainer = this.m_objPopup.$();
        objContainer.addClassName( 'titlepopup' );
        this.m_objPopup.show( objPopupLocation );
    },

    /**
    * OnTitleChange - Called when the title is edited and the inline edit closed.
    * @param {String} in_strNewTitle (optional) - New title text.  Will be empty if
    *   the input box did not changed but user hit OK.
    */
	OnTitleChange: function( in_strNewTitle )
	{
	    Util.Assert( TypeCheck.UString( in_strNewTitle ) );
	    
	    // Use TypeCheck.String because it could be an empty string.
	    if( TypeCheck.String( in_strNewTitle ) )
	    {
            //Replace all double spaces and replace with a single and strip leading/trailing whitespace.
	        var strTitle = in_strNewTitle.replace( /\s+/gi, ' ' ).strip(); 
            
		    this.RaiseForAddress( 'requesttitleedit', this.getPlugged().m_strNoteID, [ strTitle ] );
		} // end if
		
		this.OnUnRegisterChildMessageHandlers();
	}
} );    
