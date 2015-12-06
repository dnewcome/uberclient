function NoteAddCommentPopupDisplay() 
{
    NoteAddCommentPopupDisplay.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteAddCommentPopupDisplay, UberObject );

Object.extend( NoteAddCommentPopupDisplay.prototype, {
    init: function()
    {
        this.initWithConfigObject.apply( this, arguments );
    },
    
    loadConfigParams: function()
    {
        NoteAddCommentPopupDisplay.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objPopup: { type: 'object', bRequired: true }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'addcommentshow', Messages.all_publishers_id, this.OnAddCommentShow );
        
        NoteAddCommentPopupDisplay.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnShow: function()
    {
        this.RegisterListener( 'textinputcancelled', 
            this.m_objPopup.m_strMessagingID, this.OnHide );
        this.RegisterListener( 'textinputsubmit', 
            this.m_objPopup.m_strMessagingID, this.OnCommentAdd );
        
    },
    
    OnHide: function()
    {
        this.UnRegisterListener( 'textinputcancelled', 
            this.m_objPopup.m_strMessagingID, this.OnHide );
        this.UnRegisterListener( 'textinputsubmit', 
            this.m_objPopup.m_strMessagingID, this.OnCommentAdd );
        
		// force the note to re-focus.  Is this really needed here?
		this.RaiseForAddress( 'forcefocus', this.m_strNoteID );
		
        this.m_objPopup.hide();
        this.m_objPopup.$().removeClassName( 'commentpopup' );
    },
    
    /**
    * OnAddCommentShow - Shows the comment popup box
    * @param {String} in_strNoteID - NoteID to show the comment for.
    * @param {Object} in_objEvent - Event that triggered the show.
    */
    OnAddCommentShow: function( in_strNoteID, in_objEvent )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        this.m_strNoteID = in_strNoteID;
        this.m_objPopup.setOKText( _localStrings.ADD_COMMENT );
        this.m_objPopup.setHeader( _localStrings.ADD_COMMENT );
        this.m_objPopup.setValue( '' );
        
        this.OnShow();

        this.m_objPopup.$().addClassName( 'commentpopup' );
        var objPopupLocation = this._findLocation( in_objEvent );
        this.m_objPopup.show( objPopupLocation );
    },
    
    /**
    * OnCommentAdd - add the comment to the note.
    * @param {String} in_strComment (optional) - comment to add.
    */
    OnCommentAdd: function( in_strComment )
    {
        Util.Assert( TypeCheck.UString( in_strComment ) );
        
        if( in_strComment )
        {
            this.Raise( 'requestcommentadd', [ in_strComment, this.m_strNoteID ] );
        } // end if
        
        this.OnHide();
    },
    
    /**
    * @private
    * _findLocation - find the location to display the popup at.
    * @param {Object} in_objEvent - Event that triggered display
    * @returns {Object} Object with x/y that say where to display
    */
    _findLocation: function( in_objEvent )
    {
        var objElement = in_objEvent.target;
	    var objOffset = Element.viewportOffset( objElement );
        var objRetVal = {x: 20, y: ( Element.getHeight( objElement )/2 - 3 ) };

        objRetVal.x += objOffset[ 0 ];
        objRetVal.y += objOffset[ 1 ];
        
        return objRetVal;
    }
} );