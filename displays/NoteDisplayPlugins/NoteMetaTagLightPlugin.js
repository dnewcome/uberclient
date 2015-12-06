function NoteMetaTagLightPlugin()
{
    this.m_strNoteID = undefined;
    this.m_objCollectionsConfig = undefined;
    
    return NoteMetaTagLightPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteMetaTagLightPlugin, Plugin );

Object.extend( NoteMetaTagLightPlugin.prototype, {
    loadConfigParams: function()
    {
         var objConfigParams = {
            m_strNoteID: { type: 'string', bRequired: true },
            /* Array of configurations. 
            * Each item should have: 
            * collection - MetaTagsCollection
            * hastagsclass - Has tags class name.
            */
            m_objCollectionsArray: { type: 'object', bRequired: true }, 
            type: { type: 'string', bRequired: false, default_value: 'NoteMetaTagLightPlugin' }
        };
        NoteMetaTagLightPlugin.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    configurationReady: function()
    {
        this.m_objCollectionsConfig = {};
        
        var fncIterator = function( in_objCollection ) {
            Util.Assert( TypeCheck.Object( in_objCollection ) );
            Util.Assert( TypeCheck.Object( in_objCollection.collection ) );
            Util.Assert( TypeCheck.String( in_objCollection.hastagsclass ) );
            
            this.m_objCollectionsConfig[ in_objCollection.collection.m_strModelType ] = 
                in_objCollection.hastagsclass;
        };
        
        this.m_objCollectionsArray.each( fncIterator, this );
        
        NoteMetaTagLightPlugin.Base.configurationReady.apply( this, arguments );
    },
       
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'onsetnotemodelid', 
	            listener: this.OnSetNoteID, context: this } )
            .RegisterListenerObject( { message: 'loaddataobject', 
	            listener: this.OnLoadDataObject, context: this } );

        this.RegisterNoteMessageHandlers();

        NoteMetaTagLightPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    RegisterNoteMessageHandlers: function()
    {
        for( var strType in this.m_objCollectionsConfig )
        {
	        this.RegisterListenerObject( { message: 'note' + strType + 'add', 
	                from: this.m_strNoteID, listener: this.OnLoadDataObject, context: this } )
                .RegisterListenerObject( { message: 'note' + strType + 'remove', 
	                from: this.m_strNoteID, listener: this.OnLoadDataObject, context: this } );
	    } // end for
    },
    
    UnRegisterNoteMessageHandlers: function()
    {
        for( var strType in this.m_objCollectionsConfig )
        {
            this.UnRegisterListener( 'note' + strType + 'add', this.m_strNoteID, this.OnLoadDataObject )
                .UnRegisterListener( 'note' + strType + 'remove', this.m_strNoteID, this.OnLoadDataObject );
	    } // end for
    },
    
    /**
    * OnSetNoteID - handles the change of a NoteID
    * @param {String} in_strNoteID - new note ID.
    */
    OnSetNoteID: function( in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        
        this.UnRegisterNoteMessageHandlers();    
        this.m_strNoteID = in_strNoteID;
        this.RegisterNoteMessageHandlers();
        
        for( var strType in this.m_objCollectionsConfig )
        {
            this.getPlugged().$().removeClassName( this.m_objCollectionsConfig[ strType ] );
        } // end for
    },
    
    /**
    * OnLoadDataObject - handles the loading of the data object.
    */
    OnLoadDataObject: function()
    {
        for( var strType in this.m_objCollectionsConfig )
        {
            this.OnMetaTagChange( strType );
        } // end for
    },
    
    /**
    * OnMetaTagChange - handles changes to the note's meta tags
    */
    OnMetaTagChange: function( in_strType )
    {
        var nLength = this.getPlugged().m_objNote.getBindings( in_strType ).length;
        var strFunction = nLength ? 'addClassName' : 'removeClassName';
        
        this.getPlugged().$()[ strFunction ]( this.m_objCollectionsConfig[ in_strType ] );
    } 
} );