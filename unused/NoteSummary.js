
function NoteSummary()
{
    NoteSummary.Base.constructor.apply( this );
};

UberObject.Base( NoteSummary, Display );

NoteSummary._localStrings = {
    MODIFIED_DATE_HEADING: 'Modified: ',
    NO_TITLE: 'No Title'
};

Object.extend( NoteSummary.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_strNoteID: { type: 'string', bRequired: true },       // Initial noteID
            Tags: { type: 'object', bRequired: true },              // Tags configuration
            type: { type: 'string', bRequired: false, default_value: 'notesummary' }
        };

        NoteSummary.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, objConfigParams, true );
    },
    
    init: function( in_objConfig )
    {
        Util.Assert( in_objConfig );
        // Save this because we use it for tags configuration later.
        this.m_objConfig = in_objConfig;
        var vRetVal = this.initWithConfigObject( in_objConfig );
        return vRetVal;
    },
    
    /**
    *
    */
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'noteload', this.m_strNoteID, this.OnNoteLoad );
        this.RegisterListener( 'notesave', this.m_strNoteID, this.OnSaveComplete );
        this.RegisterListener( 'notetaggedadd', this.m_strNoteID, this.OnNoteTag );
        this.RegisterListener( 'noterefreshupdatedate', Messages.all_publishers_id, this.OnRefreshUpdateDate );
        
        NoteSummary.Base.RegisterMessageHandlers.apply( this );
    },
    
    /**
    * childInitialization - Initialize our children.
    */
    childInitialization: function()
    {    
/*		this.m_strTags = new Tags();
		var objConfig = Util.objectShallowCopy( this.m_objConfig.Tags );
		objConfig.m_objInsertionPoint = this.$( 'elementTags' );

		this.m_strTags.init( objConfig );
		this.attachDisplay( this.m_strTags.m_strMessagingID, this.m_strTags, true );
*/
	    this.attachButton( 'elementMinimize', this.OnMinimizeButton );
		
        this.setChildHTML( 'elementHeading', NoteSummary._localStrings.MODIFIED_DATE_HEADING );
	
        NoteSummary.Base.childInitialization.apply( this );
    },
    
    /**
    * OnNoteLoad - Set the contents of the summary using the loaded note.
    * @param {Object} in_objNote - Note to load.
    */    
    OnNoteLoad: function( in_objNote )
    {
        Util.Assert( in_objNote instanceof Note );
        
        this.setChildHTML( 'elementTitle', in_objNote.m_strTitle || NoteSummary._localStrings.NO_TITLE );
        this.setChildHTML( 'elementCreateDate', Util.FormatDate( in_objNote.m_strCreateDT ) );
        
        /* Get the date ready to fuzify.  Display will be taken care of on a timer */
        this.m_dtUpdateDT = in_objNote.m_strUpdateDT;
        this.OnRefreshUpdateDate();
    },

    /**
    * OnNoteTag - Adds the "NoteTagged" class to the summary container element.  Used to 
    *   notify children/CSS whether we have tags.
    */
    OnNoteTag: function( in_strCategoryID )
    {
        this.$().addClassName( 'NoteTagged' );
    },

    /**
    * OnRefreshUpdateDate - updates the modified date using fuzzy on the system timer.
    */
    OnRefreshUpdateDate: function()
    {
        if( this.m_dtUpdateDT )
        {
            this.setChildHTML( 'elementUpdateDate', Util.FuzzyDate( this.m_dtUpdateDT ) );
        } // end if
    },
    
    /**
    * OnSaveComplete - Used to update the summary display anytime we do a save
    * @param {String} in_strNoteID - NoteID
    * @param {Date} in_dtUpdateDt - Update date
    * @param {Object} in_objNote - Updated Note
    */
    OnSaveComplete: function( in_strNoteID, in_dtUpdateDt, in_objNote )
    {   /* Just call the OnNoteLoad with the note we get - easiest */
        this.OnNoteLoad( in_objNote ); 
    },
    
    /**
    * OnMinimizeButton - Take the button press and pass the message along.  
    *   Cancels the event.
    */
    OnMinimizeButton: function( in_objEvent )
    {   
        this.Raise( 'onminimizebutton' );
        in_objEvent.cancelEvent();
    },
    
    /**
    * setNoteID - reset the noteID of the object with a new noteID - 
    *   causes a complete reset of the object including losing all tags.
    * @param {String} in_strNoteID - new noteID
    */
    setNoteID: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        
        if( in_strNoteID != this.m_strNoteID )
        {
            this.UnRegisterMessageHandlers();
            this.m_strNoteID = in_strNoteID;
            //this.m_strTags.setNoteID( in_strNoteID );
            this.$().removeClassName( 'NoteTagged' );
            this.RegisterMessageHandlers();
        } // end if
    }
} );