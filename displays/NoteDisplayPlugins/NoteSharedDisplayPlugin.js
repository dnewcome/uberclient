
function NoteSharedDisplayPlugin( in_objNoteDisplay )
{
    return NoteSharedDisplayPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteSharedDisplayPlugin, Plugin );

Object.extend( NoteSharedDisplayPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteSharedDisplayPlugin.Base.loadConfigParams.apply( this, arguments );
        this.extendConfigParams( {
            m_nShowDelay: { type: 'number', bRequired: true }
        } );
    },
    
    configurationReady: function()
    {
        this.extendPlugged( 'show', this );

        NoteSharedDisplayPlugin.Base.configurationReady.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( {
            message: 'cancelshow',
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnCancelShow, context: this 
        } );
        
        NoteSharedDisplayPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    teardown: function()
    {
        Timeout.clearTimeout( this.m_objTimeout );
        NoteSharedDisplayPlugin.Base.teardown.apply( this, arguments );
    },
      
    /**
    * show - show the note display based off another note display
    * @param {Object} in_objPosition - position to show note at.
    * @param {Object} in_objCopied - NoteDisplay to base off of.
    */
    show: function( in_strNoteModelID, in_objEvent, in_objCopied )
    {
        Util.Assert( TypeCheck.String( in_strNoteModelID ) );
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        Util.Assert( TypeCheck.UObject( in_objCopied ) );
        
        // Clear any old timeouts so it isn't all jerky like.
        Timeout.clearTimeout( this.m_objTimeout );
        
        this.m_objTimeout = Timeout.setTimeout( function() {
            var objPlugged = this.getPlugged();
            var objCopiedContainer = in_objCopied.$();
            var objPosition = Element.viewportOffset( objCopiedContainer );
            objPosition[0] += 75;
            //objPosition[1] += Element.getHeight( objCopiedContainer );
      
            if( in_strNoteModelID != objPlugged.m_strNoteID )
            {
                objPlugged.setNoteModelID( in_strNoteModelID, !in_objCopied, true );
                if( in_objCopied && in_objCopied.m_objNote )
                {   // only load if we have the note, otherwise have to wait
                    // for the noteload message.
                    objPlugged.loadNote( in_objCopied.m_objNote );
                } // end if
            } // end if
            this.applyReplaced( 'show', [ objPosition ] );
        }, this.m_nShowDelay, this );
    },
    
    OnCancelShow: function()
    {
        // Keeps us from showing if we hide before we show.
        Timeout.clearTimeout( this.m_objTimeout );
    }
} );

