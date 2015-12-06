/**
* NoteDisplayCollectionCommandsPlugin object.
*/
function NoteDisplayCollectionCommandsPlugin()
{
    NoteDisplayCollectionCommandsPlugin.Base.constructor.apply( this );
};
UberObject.Base( NoteDisplayCollectionCommandsPlugin, Plugin );

Object.extend( NoteDisplayCollectionCommandsPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        NoteDisplayCollectionCommandsPlugin.Base.RegisterMessageHandlers.apply( this );
        
        // Not sure if this really belongs here.
        this.RegisterListenerObject( { message: 'requestnoteids', 
            from: Messages.all_publishers_id,
            listener: this.OnUnSelectAllNotes, context: this } );

        this.RegisterListenerObject( { message: 'selectallnotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnSelectAllNotes, context: this } );

        this.RegisterListenerObject( { message: 'unselectallnotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnUnSelectAllNotes, context: this } );

        this.RegisterListenerObject( { message: 'trashselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnTrashSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'untrashselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnUnTrashSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'deleteselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnDeleteSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'hiddenselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnHiddenSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'unhiddenselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnUnHiddenSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'starselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnStarSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'unstarselectednotes', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnUnStarSelectedNotes, context: this } );

        this.RegisterListenerObject( { message: 'addtaggedbinding', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnAddTaggedBinding, context: this } );

        this.RegisterListenerObject( { message: 'removetaggedbinding', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnRemoveTaggedBinding, context: this } );

        this.RegisterListenerObject( { message: 'createtagged', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnCreateTagged, context: this } );

		this.RegisterListenerObject( { message: 'addsharedbyperuserbinding', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnAddSharedByPerUserBinding, context: this } );

        this.RegisterListenerObject( { message: 'removesharedbyperuserbinding', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnRemoveSharedByPerUserBinding, context: this } );

		this.RegisterListenerObject( { message: 'createsharedbyperuser', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnCreateSharedByPerUser, context: this } );

        this.RegisterListenerObject( { message: 'showselectednotes',
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnRequestShowSelected, context: this } );
    },

    /**
    * OnSelectedAllNotes - 
    */
    OnSelectAllNotes: function()
    {
        this.RaiseForAddress( 'selectall', this.getPlugged().m_strMessagingID );
    },
        
	/**
	* OnUnSelectedAllNotes - 
	*/
	OnUnSelectAllNotes: function( in_strItemID )
	{	
        this.RaiseForAddress( 'unselectall', this.getPlugged().m_strMessagingID );
 	},

 	/**
 	* OnTrashSelectedNotes - Trash the selected notes
 	*/
    OnTrashSelectedNotes: function()
    {
        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            var bConfirm = window.confirm( _localStrings.TRASH_NOTES_CONFIRM );

            if( bConfirm )
            {        
                this.Raise( 'requestnotestrash', [ objSelected ] );
            } // end if
        } // end if
    },

 	/**
 	* OnTrashSelectedNotes - Trash the selected notes
 	*/
    OnUnTrashSelectedNotes: function()
    {
        this._raiseIfSelectedNotes( 'requestnotesuntrash' );
    },

 	/**
 	* OnDeleteSelectedNotes - Delete the selected notes
 	*/
    OnDeleteSelectedNotes: function()
    {
        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            var bConfirm = window.confirm( _localStrings.DELETE_NOTES_CONFIRM );

            if( bConfirm )
            {        
                this.Raise( 'requestnotesdelete', [ objSelected ] );
            } // end if
        } // end if
    },
    
 	/**
 	* OnHiddenSelectedNotes - Hide the selected notes
 	*/
    OnHiddenSelectedNotes: function()
    {   
        this._raiseIfSelectedNotes( 'requestnoteshidden' );
    },

 	/**
 	* OnHiddenSelectedNotes - Hide the selected notes
 	*/
    OnUnHiddenSelectedNotes: function()
    {
        this._raiseIfSelectedNotes( 'requestnotesunhidden' );
    },
 	
 	/**
 	* OnStarSelectedNotes - Star the selected notes
 	*/
    OnStarSelectedNotes: function()
    {
        this._raiseIfSelectedNotes( 'requestnotesstar' );
    },

 	/**
 	* OnStarSelectedNotes - Star the selected notes
 	*/
    OnUnStarSelectedNotes: function()
    {
        this._raiseIfSelectedNotes( 'requestnotesunstar' );
    },
    
 	/**
 	* OnAddTaggedBinding - Tag the selected notes with the given meta tag
 	* @param {String} in_strMetaTagID - Meta Tag ID to tag notes with.
 	*/
    OnAddTaggedBinding: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        
        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            this.Raise( 'requestnotestagged', [ objSelected, in_strMetaTagID ] );
        } // end if
    },
    
 	/**
 	* OnAddTaggedBinding - Remvoe the tag from selected notes
 	* @param {String} in_strMetaTagID - Meta Tag ID to remove tag from notes.
 	*/
    OnRemoveTaggedBinding: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );

        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            this.Raise( 'requestnotesuntagged', [ objSelected, in_strMetaTagID ] );
        } // end if
    },
    
    /**
    * OnCreateTagged - requests a new tag with the given name
    * @param {String} in_strName - name to give the tag.
    */
    OnCreateTagged: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );

        var objSelected = this.getPlugged().getSelected();
        var astrNoteIDs = undefined;
        
        if( Util.objectHasProperties( objSelected ) )
        {
            astrNoteIDs = Object.keys( objSelected );
        } // end if
        
        this.Raise( 'requesttaggedadd', [ in_strName, astrNoteIDs ] );
    },
    
 	/**
 	* OnAddSharedByPerUserBinding - Add a share to the selected notes.
 	* @param {String} in_strMetaTagID - Meta Tag ID to tag notes with.
 	*/
    OnAddSharedByPerUserBinding: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        
        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            this.Raise( 'requestnotessharedbyperuser', [ objSelected, in_strMetaTagID, Notes.eShareLevels.read ] );
        } // end if
    },
    
 	/**
 	* OnRemoveSharedByPerUserBinding - Remove a share from selected notes
 	* @param {String} in_strMetaTagID - Meta Tag ID to remove tag from notes.
 	*/
    OnRemoveSharedByPerUserBinding: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );

        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            this.Raise( 'requestnotesunsharedbyperuser', [ objSelected, in_strMetaTagID ] );
        } // end if
    },

	/**
    * OnCreateSharedByPerUser - requests a new tag with the given name
    * @param {String} in_strName - name to give the tag.
    */
    OnCreateSharedByPerUser: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );

        var objSelected = this.getPlugged().getSelected();
        var astrNoteIDs = undefined;
        
        if( Util.objectHasProperties( objSelected ) )
        {
            astrNoteIDs = Object.keys( objSelected );
        } // end if
        
        this.Raise( 'requestcontactadd', [ in_strName, astrNoteIDs, Notes.eShareLevels.read ] );
    },

    /**
    * OnRequestShowSelected - request that we show the selected notes.  
    *   If no notes selected, raise no message
    */
    OnRequestShowSelected: function()
    {
        var objPlugged = this.getPlugged();
        var aItems = Object.keys( objPlugged.getSelected() );
        if( aItems )
        {
            if( aItems.length  > 1 )
            {
                this.Raise( 'requestdisplaynotes', 
                    [ { noteids: aItems } ] );
            } // end if
            else if( 1 == aItems.length )
            {   // if we only have one display selected, for consistency, put
                //      it in the single not view.
                var nIndex = objPlugged.getIndexByID( aItems[ 0 ] );
                this.Raise( 'requestsinglenoteview', [ nIndex ] );
            } // end if-else if
        } // end if
    },
    
    /**
    * @private
    * _raiseIfNotesSelected - raise a message if there are some notes selected 
    * @param {String} in_strMessage - message to raise
    */
    _raiseIfSelectedNotes: function( in_strMessage )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        
        var objSelected = this.getPlugged().getSelected();
        if( Util.objectHasProperties( objSelected ) )
        {
            this.Raise( in_strMessage, [ objSelected ] );
        } // end if
    }
} );
