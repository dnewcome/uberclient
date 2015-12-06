/**
* NotesPagingViewsPlugin object.
*/
function NotesPagingViewsPlugin()
{
    this.m_strCurrentViewID = undefined;
    this.m_objCurrentDisplay = undefined;
    
    NotesPagingViewsPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingViewsPlugin, Plugin );

Object.extend( NotesPagingViewsPlugin.prototype, {
    loadConfigParams: function()
    {
        NotesPagingViewsPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objViews: { type: 'object', bRequired: true },
            m_strDefaultView: { type: 'string', bRequired: true },
            m_strSingleNoteView: { type: 'string', bRequired: true },
            m_strMultipleNoteView: { type: 'string', bRequired: true },
            type: { type: 'string', bReqired: false, default_value: 'NotesPagingViewsPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        NotesPagingViewsPlugin.Base.RegisterMessageHandlers.apply( this );

        this.RegisterListenerObject( { message: 'childinitialization', 
	            listener: this.OnChildInitialization, context: this } );
        this.RegisterListenerObject( { message: 'setview', 
                listener: this.OnSetView, context: this,
                from: Messages.all_publishers_id } );
        this.RegisterListener( 'beforeconfigchange', this.OnBeforeConfigChange, this );
        this.RegisterListener( 'configchange', this.OnConfigChange, this );
        this.RegisterListener( 'displaynotes', this.OnDisplayNotes, this );
    },


    /**
    * childInitialization - Take care of child initializatiopn.
    */
    OnChildInitialization: function()
    {
        var objPlugged = this.getPlugged();
        for( strKey in this.m_objViews )
        {
            var objView = this.m_objViews[ strKey ].display;
            Util.Assert( TypeCheck.Display( objView ) );
            objView.attachDom( objPlugged.$( 'NotePane' ), objPlugged.$( 'PageSelectionBottom' ) );
        } // end for
    },
    
    /**
    * OnBeforeConfigChange 
    */
    OnBeforeConfigChange: function( in_objNewConfig )
    {
        if( this.m_strCurrentViewID )
        {   // Save this off before we update the page variable.
            this.m_objViews[ this.m_strCurrentViewID ].lastdisplayedpage = 
                this.getPlugged().m_objConfig.page;
        } // end if
    },

    /**
    * OnConfigChange - takes care of updating the UI based on the new config.
    */
    OnConfigChange: function()
    {
        var objPlugged = this.getPlugged();
        var objConfig = objPlugged.m_objConfig;
        objConfig.view = objConfig.noteids ? this.m_strMultipleNoteView : objConfig.view || this.m_strDefaultView;
        
        this._updateViewName( objConfig.view );
        this._updateVisibleClassNames( this.m_strCurrentViewID, 'removeClassName' );
        this._updateVisibleClassNames( objConfig.view, 'addClassName' );
        
        this.m_strCurrentViewID = objConfig.view;
        this.m_objCurrentDisplay = this.m_objViews[ objConfig.view ].display;
        objConfig.maxrows = this.m_objViews[ objConfig.view ].notesperpage;
    },

    
    /**
    * OnSetView - Called when the user selects a new view or the 'setview' command
    *   is issued - sets the view, calls the plugged object's OnDisplayNotes.
    * @param {String} in_strViewID - ID of the view.  Should be one
    *   of the collections in the m_objViews configuration object.
    */
    OnSetView: function( in_strViewID )
    {
        Util.Assert( TypeCheck.String( in_strViewID ) );
        
        this.logFeature( 'setview', in_strViewID );
        
        this.getPlugged().OnDisplayNotes( { view: in_strViewID, 
            page: this.m_objViews[ in_strViewID ].lastdisplayedpage || 0 } );
    },
    
    /**
    * OnDisplayNotes - actually takes care of displaying the notes in the current 
    *   display
    * @Param {Object} in_objConfig - config that should hold the noteIDs to display.
    */
    OnDisplayNotes: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        this.m_objCurrentDisplay.displayNotes( in_objConfig.noteids );
    },
    
    /**
    * _updateViewName - update the strings.
    * @param {String} in_strViewID - the new view ID.
    */
    _updateViewName: function( in_strViewID )
    {
        Util.Assert( TypeCheck.String( in_strViewID ) );

        var strViewType = Util.AssignIfDefined( _localStrings[ in_strViewID.toUpperCase() ],
            _localStrings.UNDEFINED );
        this.getPlugged().$( 'elementViewType' ).innerHTML = strViewType;
    },
    
    /**
    * _updateVisibleClassNames - add/remove the class names on specified in the 
    *   visibleclassnames of the given view
    * @param {String} in_strView (optional) - ViewID to do the update for.  
    *   If not given, function does nothing.
    * @param {String} in_strFunction - the add/remove function name
    */
    _updateVisibleClassNames: function( in_strViewID, in_strFunction )
    {
        Util.Assert( TypeCheck.UString( in_strViewID ) );
        Util.Assert( TypeCheck.String( in_strFunction ) );
        
        var strClassnames = in_strViewID && this.m_objViews[ in_strViewID ] 
                && this.m_objViews[ in_strViewID ].visibleclassnames;
                
        if( strClassnames )
        {
            this.getPlugged().$()[ in_strFunction ]( strClassnames );
        } // end if
    }
} );
