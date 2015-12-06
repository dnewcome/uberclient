
function NoteMetaTagListPlugin()
{
    this.m_strNoteID = undefined;
    
    return NoteMetaTagListPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteMetaTagListPlugin, Plugin );

Object.extend( NoteMetaTagListPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteMetaTagListPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strInsertionPointSelector: { type: 'string', bRequired: true },
            m_strHasTagsClassName: { type: 'string', bRequired: false },
            m_objListDisplayFactory: { type: 'object', bRequired: true },
            m_bDeltaHeight: { type: 'boolean', bRequired: false, default_value: false },
            m_strNoteID: { type: 'string', bRequired: false },
			m_strBindingType: { type: 'string', bRequired: false }
        } );
    },
    
    configurationReady: function()
    {
        if( this.m_strNoteID )
        {
            this._setListDisplayFactoryNoteID( this.m_strNoteID );
        } // end if
        
        this.m_strBindingType = this.m_strBindingType || this.m_objListDisplayFactory.config.m_objCollection.m_strModelType;
        
        NoteMetaTagListPlugin.Base.configurationReady.apply( this, arguments );
    },
   
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'childinitialization', 
	            listener: this.OnChildInitialization, context: this } )
            .RegisterListenerObject( { message: 'registerchildmessagehandlers', 
	            listener: this.OnRegisterChildMessageHandlers, context: this } )
	        .RegisterListenerObject( { message: 'onsetnotemodelid', 
	            listener: this.OnSetNoteID, context: this } )
            .RegisterListenerObject( { message: 'loaddataobject', 
	            listener: this.OnLoadDataObject, context: this } );

        this.RegisterNoteMessageHandlers();

        NoteMetaTagListPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnRegisterChildMessageHandlers: function()
    {
	    this.RegisterListenerObject( { message: 'listhasitems', 
	            from: this.m_obListDisplay.m_strMessagingID, 
	            listener: this.OnHasBindings, context: this } )
	        .RegisterListenerObject( { message: 'listempty', 
	            from: this.m_obListDisplay.m_strMessagingID, 
	            listener: this.OnNoBindings, context: this } )
	        .RegisterListenerObject( { message: 'listitemadd', 
	            from: this.m_obListDisplay.m_strMessagingID, 
	            listener: this.OnBindingsChanged, context: this } )
	        .RegisterListenerObject( { message: 'listitemremove', 
	            from: this.m_obListDisplay.m_strMessagingID, 
	            listener: this.OnBindingsChanged, context: this } )
	        .RegisterListenerObject( { message: 'listheightchange', 
	            from: this.m_obListDisplay.m_strMessagingID, 
	            listener: this.OnBindingsChanged, context: this } );
    },

    RegisterNoteMessageHandlers: function()
    {
	    this.RegisterListenerObject( { message: 'note' + this.m_strBindingType + 'add', 
	            from: this.m_strNoteID, listener: this.OnBindingAdd, context: this } )
            .RegisterListenerObject( { message: 'note' + this.m_strBindingType + 'remove', 
	            from: this.m_strNoteID, listener: this.OnBindingDelete, context: this } )
            .RegisterListenerObject( { message: 'note' + this.m_strBindingType + 'update', 
	            from: this.m_strNoteID, listener: this.OnBindingUpdate, context: this } );
    },
    
    UnRegisterNoteMessageHandlers: function()
    {
        if( this.m_strNoteID )
        {
            this.UnRegisterListener( 'note' + this.m_strBindingType + 'add', this.m_strNoteID, this.OnBindingAdd )
                .UnRegisterListener( 'note' + this.m_strBindingType + 'remove', this.m_strNoteID, this.OnBindingDelete )
                .UnRegisterListener( 'note' + this.m_strBindingType + 'update', this.m_strNoteID, this.OnBindingUpdate );
        } // end if
    },
    
    
    OnChildInitialization: function()
    {
        var objPlugged = this.getPlugged();
        
        var objInsertionPoint = objPlugged.$( this.m_strInsertionPointSelector );
        if( objInsertionPoint )
        {
            this.m_objListDisplayFactory.config.m_objInsertionPoint = objInsertionPoint;

            this.m_obListDisplay = this.createInitUberObject( this.m_objListDisplayFactory );
        } // end if
        else
        {
            this.teardown();
        } // end if
    },
    
    OnSetNoteID: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        
        this.UnRegisterNoteMessageHandlers();    
        this.m_obListDisplay.removeTeardownAll();
        
        this._setListDisplayFactoryNoteID( in_strNoteID );
        
        this.m_strNoteID = in_strNoteID;
        this.RegisterNoteMessageHandlers();

        this.OnNoBindings();
    },
    
    OnHasBindings: function()
    {
        if( this.m_strHasTagsClassName )
        {
            this.getPlugged().$().addClassName( this.m_strHasTagsClassName );
        } // end if
    },

    OnNoBindings: function()
    {
        if( this.m_strHasTagsClassName )
        {
            this.getPlugged().$().removeClassName( this.m_strHasTagsClassName );
        } // end if
    },
    
    OnBindingsChanged: function()
    {
        if( this.m_bDeltaHeight )
        {
            this.getPlugged().heightChanged();
        } // end if
    },

    /**
    * OnBindingAdd - addTags message handler
    */
    OnBindingAdd: function( in_strNoteID, in_strMetaTagID, in_objBindingInfo )
    {
        this.m_obListDisplay.addMetaTagFromID( in_strMetaTagID, in_objBindingInfo );
    },

    /**
    * OnBindingDelete - deleteTags message handler
    */
    OnBindingDelete: function( in_strNoteID, in_strMetaTagID )
    {
        this.m_obListDisplay.removeTeardownItem( in_strMetaTagID );
    },
    
    /**
    * OnBindingUpdate - 'binding' + type + 'update' message handler
    */
    OnBindingUpdate: function( in_strNoteID, in_strMetaTagID )
    {
    
    },
    
    /**
    * OnLoadDataObject handles the loading of the data object.
    */
    OnLoadDataObject: function( in_objNoteInfo )
    {
        if( this.getPlugged().m_objNote )
        {
            var astrBindings = this.getPlugged().m_objNote.getBindingsObject( this.m_strBindingType );
	        for( var strMetaTagID in astrBindings )
	        {  
	            // we do this to simulate a note tag so we can let children take care of
	            //  their own adding of tags.  If children are listening for the 'notecategoryadd' message, 
	            //  we should never have to add another thing here.
	            var objBinding = astrBindings[ strMetaTagID ];
	            this.OnBindingAdd( this.m_strNoteID, strMetaTagID, objBinding );
	        } // end for	
	    } // end if
    },

    /**
    * _setListDisplayFactoryNoteID - set the note ID of the list display factory.
    * @param {String} in_strNoteID - NoteID the factory should be set for.
    */
    _setListDisplayFactoryNoteID: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );

        this.m_objListDisplayFactory.config.m_strNoteID = in_strNoteID;
    }    
} );