
function NoteSummaryPlugin()
{
    return NoteSummaryPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteSummaryPlugin, Plugin );

Object.extend( NoteSummaryPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'onminimize', this.OnMinimize )
            .RegisterListener( 'onmaximize', this.OnMaximize )
            .RegisterListener( 'onmouseover', this.OnMouseOver )
            .RegisterListener( 'onsetnotemodelid', this.OnSetNoteModelID );

        NoteSummaryPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnSetNoteModelID: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        
        if( this.m_objNoteSummary )
        {
            this.m_objNoteSummary.setNoteID( in_strNoteID );
        } // end if
    },
    
    OnMinimize: function()
    {
        if( ! this.m_objNoteSummary )
        {
            NoteSummaryPlugin.prototype._initNoteSummary.apply( this );
        } // end if
        
        this.$().removeClassName( 'summary' );
    },

    OnMinimizeButton: function()
    {   // Yes, this is right!
        this.Raise( 'requestmaximize' );
    },
    
    OnMaximize: function()
    {
        this.$().removeClassName( 'summary' );
    },
    
    OnMouseOver: function()
    {
        if( this.$().hasClassName( 'minimize' ) )
        {
            if( ! this.m_bSummaryShown )
            {
                this.RegisterListener( 'removesummary', Messages.all_publishers_id, 
                    NoteSummaryPlugin.prototype.OnRemoveSummaryShown );
                this.$().addClassName( 'summary' );
            } // end if
            this.m_bSummaryShown = true;
        } // end if

        this.Raise( 'removesummary', [ this ], true );    // do this blocking.
    },

    /**
    * OnRemoveSummaryShown - Remove the summary flag in case we were minimized.
    */
    OnRemoveSummaryShown: function( in_objNewNote )
    { 
        if( this != in_objNewNote )
        {
            this.UnRegisterListener( 'removesummary', Messages.all_publishers_id, 
                NoteSummaryPlugin.prototype.OnRemoveSummaryShown );
            this.$().removeClassName( 'summary' );
            this.m_bSummaryShown = false;
        } // end if
    },

    
    _initNoteSummary: function()
    {
        this.m_objNoteSummary = this.createInitUberObject( NoteSummary, {
            m_strTemplate: 'NoteSummary',
            m_objInsertionPoint: this.$( 'elementNoteSummary' ),
            m_strNoteID: this.m_strNoteID,
		    Tags: {
                m_objMetaTagCollection: app.usercategories,
		        m_strTemplate: 'tags',
		        m_strNoteID: this.m_strNoteID,
		        Tag: 
		            {
		                m_strTemplate: 'Tag',
		                m_bMenuInitialization: false
		            }
		    }
        } );
       NoteSummaryPlugin.prototype.OnRegisterChildMessageHandlers.apply( this );
       
       this.requestLoad();
    },
    
    OnRegisterChildMessageHandlers: function()
    {
        this.RegisterListener( 'onminimizebutton', this.m_objNoteSummary.m_strMessagingID, 
            NoteSummaryPlugin.prototype.OnMinimizeButton );
    }
} );    
