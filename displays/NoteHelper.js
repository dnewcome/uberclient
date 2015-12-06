function NoteHelper()
{
    NoteHelper.Base.constructor.apply( this, arguments );
};

UberObject.Base( NoteHelper, DisplayAltConfig );

Object.extend( NoteHelper.prototype, {
    loadConfigParams: function()
    {
        NoteHelper.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strBaseURL: { type: 'string', bRequired: true },
            m_strUpdateMessage: { type: 'string', bRequired: false, default_value: 'updatead' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        NoteHelper.Base.RegisterMessageHandlers.apply( this, arguments );
        
        this.RegisterListener( this.m_strUpdateMessage, Messages.all_publishers_id, this.update );
    },

    /**
    * update - update the panel.
    * @param {Object} in_objNoteIDs - object whose keys are the noteids we want to display
    * 
    */    
    update: function( in_objNoteIDs )
    {
        Util.Assert( TypeCheck.Object( in_objNoteIDs ) );
        
        var objIframe = this.$( 'elementnotehelp' );
        var astrNoteIDs = Object.keys( in_objNoteIDs );
        var strNoteIDs = astrNoteIDs.join( ',' );
        
        objIframe.src = this.m_strBaseURL + '?noteids=' + strNoteIDs;
    }
} );