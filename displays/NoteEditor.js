
/**
* the the UI of a note.
*/
function NoteEditor()
{
	this.m_bFocused = false;

	NoteEditor.Base.constructor.apply( this );
}
UberObject.Base( NoteEditor, NoteDisplay );

Object.extend( NoteEditor.prototype, {
    loadConfigParams: function()
    {
        NoteEditor.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_bEditable: { type: 'boolean', bRequired: false, default_value: false },
            type: { type: 'string', bReqired: false, default_value: 'NoteEditor' }
        } );
    },

    RegisterDomEventHandlers: function()
    {
   	    this.RegisterListener( 'onscroll', this.m_objDomContainer, this.focusWithoutText );

        this.setNoteModelIDPost();
        
	    NoteEditor.Base.RegisterDomEventHandlers.apply( this );
    },

    /**
    * sets whether this note display is editable
    * @param {boolean} in_bEditable flag whether the note display is editable
    */
    setEditable: function( in_bEditable )
    {
        this.m_bEditable = in_bEditable;
        
        this.Raise( 'seteditable', [ in_bEditable ] );
    },

    setNoteModelIDPre: function()
    {
        this.UnRegisterListener( 'forcefocus', Messages.all_publishers_id, 
            this.forceFocusWithText, this.m_strNoteID );
            
        NoteEditor.Base.setNoteModelIDPre.apply( this, arguments );
    },

    setNoteModelIDPost: function()
    {
        if( this.m_strNoteID )
        {
            this.RegisterListener( 'forcefocus', Messages.all_publishers_id, 
                this.forceFocusWithText, undefined, undefined, this.m_strNoteID );
        } // end if-else

        NoteEditor.Base.setNoteModelIDPost.apply( this, arguments );
    },

    _RegisterFocusedNoteHandlers: function()
    {
	    // We now register ourselves to listen for a message telling us we lost focus.
        this.RegisterListener( 'onnewnotefocus', Messages.all_publishers_id, this.unFocus );
    },		

    _UnRegisterFocusedNoteHandlers: function()
    {
        // We unregister our listener on what is the 'old' window
        this.UnRegisterListener( 'onnewnotefocus', Messages.all_publishers_id, this.unFocus );
    },		

    /**
    * unFocus - unregisters a ton of listeners that are only applicable if we are focused.
    */		
    unFocus: function()
    {
        this._UnRegisterFocusedNoteHandlers();
        
        this.$().removeClassName( 'focused' );
        this.m_bFocused = false;

        this.Raise( 'unfocus', arguments, true );
        
        Timeout.clearTimeout( this.m_objFocusTimeout );
    },

    /**
    * focus - Give focus to the current note.  Do some checking up on whether the note is already focused
    * and if there  are any previously focused notes and whether focus is allowed here.
    * @param {Boolean} in_bFocusText (optional) - if true, attempts to focus the text.  Must be editable 
    *   to do so.
    */
    focus: function( in_bFocusText )
    {	
        Util.Assert( TypeCheck.UBoolean( in_bFocusText ) );
        
        if( false == this.m_bFocused )
        {
            in_bFocusText = in_bFocusText && this.m_bEditable;
            this._doFocus( in_bFocusText );
        } // end if

    },

    /**
    * focusWithoutText - do a focus, but do not focus the text.
    */
    focusWithoutText: function()
    {
        this.focus( false );
    },

    /**
    * forceFocusWithText - force a focus and focus the text.
    */
    forceFocusWithText: function()
    {
        this._doFocus( true );
    },

    /**
    * _doFocus - Give focus to note.
    * @param {Variant} in_bFocusText (optional) - Says whether to focus the text.
    */
    _doFocus: function( in_bFocusText )
    {	
        Util.Assert( TypeCheck.UBoolean( in_bFocusText ) );
        
        // tell some note that it has lost its focus.  Keep this outside of the
        //  below 'if' so that we update the screen is updated as soon as it is shown
        //  and not after a delay.
        if( false == this.m_bFocused )
        {
            this.Raise( 'onnewnotefocus', undefined, true );
        } // end if
        
        this._RegisterFocusedNoteHandlers();
        this.$().addClassName( 'focused' ); 	
        
        /**
        * firefox has a fairly substantial bug where if the container is hidden,
        *   an editible iframe cannot be set to be focused.  So, we wait until we
        *   are visible to actually do the focus.
        */
        if( 'none' != this.$().getStyle( 'display' ) )
        {
            this.Raise( 'focus', [ in_bFocusText ], true );
        } // end if
        else
        {
            this.m_objFocusTimeout = Timeout.setTimeout( this._doFocus, 50, this, arguments );
        } // end if

        this.m_bFocused = true;
    },

    show: function()
    {
        NoteEditor.Base.show.apply( this, arguments );

        // We have to do this in case two notes in two separate collections have
        //  the same note ID.  Whichever is shown second will always steal the messages
        //  even though this current display may be the one that is displayed.
        this.setNoteModelIDPost();

        // forcing an unfocus so we don't have menus around.
        this.unFocus();
    }
} );