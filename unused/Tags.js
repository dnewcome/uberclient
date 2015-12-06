function Tags()
{
    Tags.Base.constructor.apply( this );
}
UberObject.Base( Tags, MetaTagsList );

Object.extend( Tags.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_strNoteID: { type: 'string', bRequired: true }
        };
        
        Tags.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, objConfigParams, true );
    },

    configurationReady: function()
    {
        this.m_objDisplayFactory.config.m_objExtraInfo = this.m_objDisplayFactory.config.m_objExtraInfo || {};
        this.m_objDisplayFactory.config.m_objExtraInfo.Note_ID = this.m_strNoteID;

        Tags.Base.configurationReady.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterNoteMessageHandlers();
        Tags.Base.RegisterMessageHandlers.apply( this );    
    },

    RegisterNoteMessageHandlers: function()
    {
        this.RegisterListener( 'note' + this.type + 'add', this.m_strNoteID, this.OnTagAdd );
        this.RegisterListener( 'note' + this.type + 'remove', this.m_strNoteID, this.OnTagDelete );
    },
    
    UnRegisterNoteMessageHandlers: function()
    {
        this.UnRegisterListener( 'note' + this.type + 'add', this.m_strNoteID, this.OnTagAdd );
        this.UnRegisterListener( 'note' + this.type + 'remove', this.m_strNoteID, this.OnTagDelete );
    },
    
    /**
    * setNoteID - Sets the noteID of this container.  If we already have a noteID, it 
    *   reinitializes the object to an empty state.
    * @param {String} in_strNoteID (optional) - ID of the note we are attaching to.
    */
    setNoteID: function( in_strNoteID )
    {
        this.UnRegisterNoteMessageHandlers();    
        this.removeTeardownAll();

        this.m_strNoteID = in_strNoteID;
        this.RegisterNoteMessageHandlers();
    },

    /**
    * addTag - addTags message handler
    */
    OnTagAdd: function( in_strNoteID, in_strMetaTagID, in_objBindingInfo )
    {
        this.addMetaTagFromID( in_strMetaTagID, in_objBindingInfo );
    },

    /**
    * OnTagDelete - deleteTags message handler
    */
    OnTagDelete: function( in_strNoteID, in_strMetaTagID )
    {
        return this.removeTeardownItem( in_strMetaTagID );
    }
} );