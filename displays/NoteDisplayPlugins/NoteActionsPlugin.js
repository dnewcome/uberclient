NoteActionsPlugin = (function() {
	"use strict";
	
	var ManagementPages = {
		FOLDERS: [ 'movenote.aspx', _localStrings.NOTE_FOLDERS ],
		SHARES: [ 'share.aspx', _localStrings.NOTE_SHARES ],
		TAGS: [ 'tagnote.aspx', _localStrings.NOTE_TAGS ],
		UPLOAD: [ 'upload.aspx', _localStrings.NOTE_UPLOAD ],
		REVISIONS: [ 'revisions.aspx', _localStrings.REVISIONS ],
        DELETE: [ 'deletenote.aspx', _localStrings.DELETE ]
	};
	
	var NoteActionsPlugin = function( in_objNoteDisplay )
	{
		return NoteActionsPlugin.Base.constructor.apply( this, arguments );
	};
	UberObject.Base( NoteActionsPlugin, Plugin );

	Object.extend( NoteActionsPlugin.prototype, {
		loadConfigParams: function()
		{
			NoteActionsPlugin.Base.loadConfigParams.apply( this );
			this.extendConfigParams( {
				type: { type: 'string', bReqired: false, default_value: 'NoteActionsPlugin' }
			} );
		},

		RegisterMessageHandlers: function()
		{
			var strPluggedID = this.getPlugged().m_strMessagingID, me=this, all=Messages.all_publishers_id;
			
			// These can come from externally
			me.RegisterListenerObject( { message: 'addtaggedbinding', listener: me.addTaggedBinding, 
					from: all, to: strPluggedID } )
				 .RegisterListenerObject( { message: 'removetaggedbinding', listener: me.removeTaggedBinding,
					from: all, to: strPluggedID } )
				 .RegisterListenerObject( { message: 'createtagged', listener: me.createTagged, 
					from: all, to: strPluggedID } );

			me.RegisterListenerObject( { message: 'addsharedbyperuserbinding', listener: me.addSharedByPerUserBinding, 
					from: all, to: strPluggedID } )
				 .RegisterListenerObject( { message: 'removesharedbyperuserbinding', listener: me.removeSharedByPerUserBinding,
					from: all, to: strPluggedID } )
				 .RegisterListenerObject( { message: 'createsharedbyperuser', listener: me.createSharedByPerUser, 
					from: all, to: strPluggedID } )
				 .RegisterListenerObject( { message: 'shownewnotecommentinput', listener: me.showNewNoteCommentInput, 
					from: all, to: strPluggedID } );                
		
			me.RegisterListener( 'registermessagehandlers', me.OnRegisterMessageHandlers )
				.RegisterListener( 'addtaggedbinding', me.addTaggedBinding )
				.RegisterListener( 'removetaggedbinding', me.removeTaggedBinding )
				.RegisterListener( 'createtagged', me.createTagged )
				.RegisterListener( 'addsharedbyperuserbinding', me.addSharedByPerUserBinding )
				.RegisterListener( 'removeunsharedbyperuserbinding', me.removeSharedByPerUserBinding )
				.RegisterListener( 'createsharedbyperuser', me.createSharedByPerUser )
				.RegisterListener( 'requestsharing', me.requestShare )
				.RegisterListener( 'requestprint', me.requestPrint )
				.RegisterListener( 'requestrevisions', me.requestRevisions )
				.RegisterListener( 'requestemail', me.requestEmailToSelf )
				.RegisterListener( 'requestpublish', me.requestPublish )
				.RegisterListener( 'requestattachfile', me.requestAttachFile )
				.RegisterListener( 'requesttrash', me.requestTrash )
				.RegisterListener( 'requestuntrash', me.requestUnTrash )
				.RegisterListener( 'requestdelete', me.requestDelete )
				.RegisterListener( 'requestexternal', me.requestExternal )
				.RegisterListener( 'requesthide', me.requestHide )        // XXX Make separate?
				.RegisterListener( 'requestunhide', me.requestHide )      
				.RegisterListener( 'requeststar', me.requestStar )        // XXX Make separate?
				.RegisterListener( 'requestunstar', me.requestStar )      
				.RegisterListener( 'requestminimize', me.requestMinimize )
				.RegisterListener( 'requestmaximize', me.requestMaximize )
				.RegisterListener( 'requestclose', me.requestClose )
				.RegisterListener( 'requesttagsmenu', me.requestTagsMenu )
				.RegisterListener( 'requestshowonlyme', me.requestShowOnlyThis )
				.RegisterListener( 'requestnotecomment', me.requestNoteComment )
				.RegisterListener( 'requestnotetags', me.requestTags )
				.RegisterListener( 'requestnotefolders', me.requestFolders )
				.RegisterListener( 'requestnoteshare', me.requestShare );

			NoteActionsPlugin.Base.RegisterMessageHandlers.apply( me, arguments );
		},

		OnRegisterMessageHandlers: function()
		{
			/**
			* while most plugin commands are assumed to come from the NoteDisplay,
			*   these can come from anybody.
			*/
			this.RegisterListener( 'noteminimize', Messages.all_publishers_id, 
					NoteActionsPlugin.prototype.requestMinimize )
				.RegisterListener( 'notemaximize', Messages.all_publishers_id, 
					NoteActionsPlugin.prototype.requestMaximize );
		},
			
		/**
		* addTaggedBinding - request a tag of the note.
		* @param {String} in_strMetaTagID - ID of MetaTag to add.
		*/
		addTaggedBinding: function( in_strMetaTagID )
		{    
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
		
			raiseIfLoaded.call( this, 'requestnotetaggedadd', 
				[ in_strMetaTagID ] );
		},

		/**
		* removeTaggedBinding - request an untag of the note.
		* @param {String} in_strMetaTagID - ID of MetaTag to remove.
		*/
		removeTaggedBinding: function( in_strMetaTagID )
		{
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			
			raiseIfLoaded.call( this, 'requestnotetaggedremove', 
				[ in_strMetaTagID ] );
		},

		/**
		* addSharedByPerUserBinding - request a sharedbyperuser to be added of the note.
		* @param {String} in_strMetaTagID - ID of MetaTag to add.
		*/
		addSharedByPerUserBinding: function( in_strMetaTagID )
		{
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			
			raiseIfLoaded.call( this, 'requestnotesharedbyperuseradd', 
				[ in_strMetaTagID, Notes.eShareLevels.read ] );
		},
		
		/**
		* removeSharedByPerUserBinding - request a sharedbyperuser to be removed from the note.
		* @param {String} in_strMetaTagID - ID of MetaTag to remove.
		*/
		removeSharedByPerUserBinding: function( in_strMetaTagID )
		{
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			
			raiseIfLoaded.call( this, 'requestnotesharedbyperuserremove', 
				[ in_strMetaTagID ] );
		},
		
		/**
		* createTagged - request a new tag and to tag the note with it.
		* @param {String} in_strName - new tag name
		*/
		createTagged: function( in_strName )
		{
			Util.Assert( TypeCheck.String( in_strName ) );
			
			this.Raise( 'requesttaggedadd', [ in_strName, [ this.m_strNoteID ] ] );
		},

		/**
		* createSharedByPerUser - request a new contact and to tag the note with it.
		* @param {String} in_strName - new tag name
		*/
		createSharedByPerUser: function( in_strName )
		{
			Util.Assert( TypeCheck.String( in_strName ) );
			
			this.Raise( 'requestcontactadd', [ in_strName, [ this.m_strNoteID ], Notes.eShareLevels.read ] );
		},
		
		/**
		* requestPrint - request that the note is printed.
		*/
		requestPrint: function()
		{
			if( true == this.m_bLoaded )
			{
				Util.openWindow( '../clientpages/print.aspx?noteID=' + this.m_strNoteID );
			} // end if
		},

		/**
		* requestRevisions - request that the note revisions are shown.
		*/
		requestRevisions: function()
		{
			showExternalPageDisplay.call( this, ManagementPages.REVISIONS );
		},
		
		/**
		* requestEmailToSelf - request that the note be emailed.
		*/
		requestEmailToSelf: function()
		{
			raiseIfLoaded.call( this, 'requestnoteemailtoself' );
		},

		/**
		* requestEmail - request a new file attachment.
		*/
		requestAttachFile: function()
		{
			showManagementDisplay.call( this, ManagementPages.UPLOAD );
		},
		
		/**
		* requestPublish - request that the note be published.
		*/
		requestPublish: function()
		{
			window.alert( 'requestPublish' );
		},

		/**
		* requestTrash - request that the note be trashed.
		*/
		requestTrash: function()
		{
			if( true == this.m_bLoaded )
			{
				var bAsk = app.userpreferences.m_bAskOnTrash;
				var strTitle = this.m_objExtraInfo.Title || _localStrings.EMPTY_TITLE_CONFIRM;

				var bRetVal = ( false == bAsk ) || 
					window.confirm( _localStrings.TRASH_CONFIRM 
					+ strTitle + '?' );

				if( bRetVal )
				{
					this.RaiseForAddress( 'requestnotetrash', this.m_strNoteID );
					if( true === this.m_bHideOnTrash )
					{
						this.hide();
					} // end if
				} // end if
			} // end if
		},
			
		/**
		* requestUnTrash - request that the note be untrashed.
		*/
		requestUnTrash: function()
		{
			raiseIfLoaded.call( this,'requestnoteuntrash' );
		},

		/**
		* requestDelete - request that the note be deleted.
		*/
		requestDelete: function()
		{
		    showManagementDisplay.call(this, ManagementPages.DELETE);
		    
        /*
			if( true == this.m_bLoaded )
			{
				var strTitle = this.m_objExtraInfo.Title || _localStrings.EMPTY_TITLE_CONFIRM;
				var bRetVal = window.confirm( _localStrings.DELETE_CONFIRM 
					+ ' : ' + strTitle + '?' );

				if( bRetVal )
				{
					this.RaiseForAddress( 'requestnotedelete', this.m_strNoteID );
				} // end if
			} // end if*/
		},
		
		/**
		* requestExternal - request that the note be opened in the standalone editor.
		*/
		requestExternal: function()
		{
			this.Raise( 'requestnoteexternal', [ this.m_strNoteID ] );
		},
		
		/**
		* requestHide - request that the note be hidden.
		*/
		requestHide: function()
		{
			if( ! this.m_objExtraInfo.Trash )
			{
				var strRequest = this.m_objExtraInfo.Hidden ? 'requestnoteunhidden' : 'requestnotehidden';
				raiseIfLoaded.call( this, strRequest );
			} // end if
		},
		
		/**
		* requestStar - request that the note be starred.
		*/
		requestStar: function()
		{
			if( ! this.m_objExtraInfo.Trash )
			{
				var strRequest = this.m_objExtraInfo.Star ? 'requestnoteunstar' : 'requestnotestar';
				raiseIfLoaded.call( this, strRequest );
			} // end if
		},
		
		/**
		* requestMinimize - request that the note display be minimized.
		* @param {Object} in_objEvent (optional) - Event that triggered this call.
		*/
		requestMinimize: function( in_objEvent )
		{
			Util.Assert( TypeCheck.UObject( in_objEvent ) );
			
			if( true == this.m_bLoaded )
			{
				this.Raise( 'OnNoteMinimize' );
				this.$().removeClassName( 'maximize' );
				this.$().addClassName( 'minimize' );
			} // end if
		},

		/**
		* requestMaximize - request that the note display be maximized.
		*/
		requestMaximize: function()
		{
			if( true == this.m_bLoaded )
			{
				this.Raise( 'onmaximize' );
				this.$().removeClassName( 'minimize' );
				this.$().addClassName( 'maximize' );
			} // end if
		},

		/**
		* requestClose - request that the note display be closed.
		*/
		requestClose: function()
		{
			this.hide();
		},

		/**
		* requestTagsMenu - request that the note display's Tags menu.
		* @param {Object} in_objEvent (optional) - Event that triggered this call.
		*/
		requestTagsMenu: function( in_objEvent )
		{
			this.Raise( 'tagsdropdownclick', [ in_objEvent ], true );
		},


		/**
		* requestShowOnlyThis - Only show this note.
		*/
		requestShowOnlyThis: function()
		{
			if( true == this.m_bLoaded )
			{
				this.Raise( 'requestdisplaynotes', [ { noteids: [ this.m_strNoteID ] } ] );
			} // end if
		},

		/**
		* showNewNoteCommentInput - show the new note comment input.
		*/
		showNewNoteCommentInput: function( in_objEvent )
		{
			this.Raise( 'addcommentshow', [ this.m_strNoteID, in_objEvent ] );
		},
		
		/**
		* requestNoteComment - Takes a comment that was submitted and sends it off to 
		*   the model to be created
		* @param {String} in_strComment (optional) - Comment to create in note.  If empty
		*   or non-existent, do not create a comment.
		*/
		requestNoteComment: function( in_strComment ) 
		{
			Util.Assert( TypeCheck.UString( in_strComment ) );
			
			if( in_strComment && true === this.m_bLoaded )
			{
				this.Raise( 'requestcommentadd', [ in_strComment, this.m_strNoteID ] );
			} // end if
		},
		
		requestTags: function() {
			showManagementDisplay.call( this, ManagementPages.TAGS );
		},
		
		requestFolders: function() {
			showManagementDisplay.call( this, ManagementPages.FOLDERS );
		},
		
		requestShare: function() {
			showExternalPageDisplay.call( this, ManagementPages.SHARES );
		}	
	} );
	
	/**
	* raiseIfLoaded - Raise a message if the note display is fully loaded.
	* @param {String} in_strMessage - message to raise.
	* @param {String} in_strMessagingID (optional) - optional messaging ID to send to,
	*   if not given, send to the display's noteID.
	* @param {Array} in_aArguments (optional) - optional arguments to send.
	*/
	function raiseIfLoaded( in_strMessage, in_aArguments, in_strMessagingID )
	{
		Util.Assert( TypeCheck.String( in_strMessage ) );
		Util.Assert( TypeCheck.UString( in_strMessagingID ) );
		Util.Assert( TypeCheck.UArray( in_aArguments ) );
		
		if( true === this.m_bLoaded )
		{
			this.RaiseForAddress( in_strMessage, in_strMessagingID || this.m_strNoteID, in_aArguments );
		} // end if
	}    
		
	function showManagementDisplay( config ) {
		app.lightbox.show( getURL.call( this, config ), config[ 1 ] );
	}
	
	function showExternalPageDisplay( config ) {
		raiseIfLoaded.call( this, 'show', [ getURL.call( this, config ) ], 'externalpage' );
	}
	
	function getURL( config ) {
		return '../clientpages/' + config[ 0 ] + '?noteID=' + this.m_strNoteID;
	}
	
	return NoteActionsPlugin;
}() );