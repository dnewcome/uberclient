/**
* Note model class: Based on Shane's idea of a model continuation of the proof of concept.
*/
Note = (function() {
	"use strict";
	
	var Note = function() {
		this.m_bEdited = undefined;    
		this.m_nLoadLevel = undefined;
		
		this.m_objMetaTagCollections = undefined;   

		Note.Base.constructor.call( this );
	};
	UberObject.Base( Note, Model );

	TypeCheck.createForObject( 'Note' );

	/**
	* enumeration for note types
	*/
	Note.eNoteType = new Enum( 'Text' );

	/**
	* enum used to hold the commands that are sent to the DB
	*   to do meta type updates.  Used in NoteMetaUpdate.
	*/
	Note.eMetaUpdates = {
		star: 0,
		unstar: 1,
		trash: 2,
		untrash: 3,
		hide: 4,
		unhide: 5,
		'public': 6,
		unpublic: 7
	};

	(function() {
		/**
		* Set up a callback for each collection.  Not sure if I like this yet.
		*/
		var strID;
		for( strID in MetaTags.eCollections ) {
			createFunc( strID );
		}
		
		function createFunc( in_strID ) {   // put it in the self modifying function so we create a binding.
			Note.prototype[ 'On' + in_strID + 'Delete' ] = function( in_strMetaTagID ) {
				this.OnUntagComplete( in_strID, in_strMetaTagID, true );
			};
		}
		
	}());

	/**
	* new_note_id - ID of a new note that has not been saved.
	*/
	Note.new_note_id = 'NEWNOTE';
	Object.extend( Note.prototype, {
		init: function( in_objNoteInfo )
		{
			// here be data
			this.m_strMessagingID = in_objNoteInfo.Note_ID;
			this.m_objMetaTagCollections = {};
			var strID;
			for( strID in MetaTags.eCollections ) {
				this.m_objMetaTagCollections[ strID ] = {};
			}
			
			return Note.Base.init.apply( this, [ 'note', in_objNoteInfo.Note_ID ] );
		},


		/**
		* Register our message handlers 
		*/
		RegisterMessageHandlers: function() {
			var me=this, all=Messages.all_publishers_id;
			me/*.RegisterListener( 'requestnotetrash', all, me.OnTrash )
				.RegisterListener( 'requestnoteuntrash', all, me.OnUnTrash )
				*/.RegisterListener( 'requestnotesave', all, me.OnSave )
				.RegisterListener( 'requesttitleedit', all, me.OnTitleEdit )
				.RegisterListener( 'requestnotetaggedadd', all, me.OnTag)
				.RegisterListener( 'requestnotefolderedadd', all, me.OnFolder)
				.RegisterListener( 'requestnotetaggedremove', all, me.OnUnTag )
				.RegisterListener( 'requestnotetogglestar', all, me.OnToggleStar )
				.RegisterListener( 'requestnotestar', all, me.OnStar )
				.RegisterListener( 'requestnoteunstar', all, me.OnUnStar )
			/*	.RegisterListener( 'requestnotehidden', all, me.OnHidden )
				.RegisterListener( 'requestnoteunhidden', all, me.OnUnHidden )
				*/.RegisterListener( 'requestnotesetbody', all, me.OnSetBody ) 
				.RegisterListener( 'requestnoteemailtoself', all, me.OnEmailToSelf )  
				.RegisterListener( 'requestnoteattachmentremove', all, me.OnUnAttachment )
				.RegisterListener( 'requestnotesharedbyperuseradd', all, me.OnSharedByPerUserAdd )
				.RegisterListener( 'requestnotesharedbyperuserread', all, me.OnSharedByPerUserRead )
				.RegisterListener( 'requestnotesharedbyperuserwrite', all, me.OnSharedByPerUserWrite )
				.RegisterListener( 'requestnotesharedbyperuserremove', all, me.OnSharedByPerUserRemove )
				.RegisterListener( 'requestnotecommentadd', all, me.OnCommentAdd );

			Note.Base.RegisterMessageHandlers.apply( me );
		},

		/**
		* reinit - reinitialize a note - updates note model with note new values.  forces removal
		*   of all tags.
		*/
		reinit: function( in_objNoteInfo ) {
			// here be data
			var me=this, oldFolder = me.m_objExtraInfo.Folder, newFolder = in_objNoteInfo.Folder;
			if( oldFolder != newFolder ) {
				var oldCollectionID = getCollectionID( oldFolder ), 
					oldBindingID = getFolderID( oldFolder ),
					newCollectionID = getCollectionID( newFolder ), 
					newBindingID = getFolderID( newFolder );
					
				me.m_objExtraInfo.Folder = in_objNoteInfo.Folder;
				
				me.OnRemoveBindingComplete( oldCollectionID, oldBindingID, true );
				me.OnAddBindingComplete( newCollectionID, newBindingID, true );
			}
			
			function getCollectionID( oldFolder ) {
				return oldFolder ? 'folders' : 'systemcategories';
			}
			
			function getFolderID( newFolder ) {
				return newFolder || 'nofolder';
			}
		},

		/**
		* getBindingsObject - get the category IDs that this note belongs to.
		* @returns {Object of Strings} category IDs.
		*/
		getBindingsObject: function( in_eCollectionID ) {
			Util.Assert( TypeCheck.EnumKey( in_eCollectionID, MetaTags.eCollections ) );
			
			var objRetVal = this.m_objMetaTagCollections[ in_eCollectionID ];
			return objRetVal;
		},

		/**
		* getBindings - get the category IDs that this note belongs to.
		* @param {Enum Key} in_eCollectionID (optional) - CollectionID to get, 
		*   defined in MetaTags.eCollections - if not given, uses 'tagged'.
		* @returns {Array of Strings} category IDs.
		*/
		getBindings: function( in_eCollectionID ) {
			Util.Assert( TypeCheck.Undefined( in_eCollectionID ) || 
				TypeCheck.EnumKey( in_eCollectionID, MetaTags.eCollections ) );
			
			var objIDs = this.getBindingsObject( in_eCollectionID || MetaTags.eCollections.tagged );
			var aRetVal = Object.keys( objIDs );
			
			return aRetVal;
		},


		/*
		* hasBinding - Check to see if a note already has a meta tag.
		* @param {String} in_strCollectionID - CollectionID to add category to.
		* @param {String} in_strMetaTagID - MetaTagID to add.
		* @returns {Boolean} - true if already has it, false otw.
		*/
		hasBinding: function( in_strCollectionID, in_strMetaTagID ) {
			var objCollection = this.m_objMetaTagCollections[ in_strCollectionID ];
			var bRetVal = !!( objCollection && objCollection[ in_strMetaTagID ] );
			
			return bRetVal;
		},

		/*
		* getBinding - Get the meta tag value
		* @param {String} in_strCollectionID - CollectionID to add category to.
		* @param {String} in_strMetaTagID - MetaTagID to add.
		* @returns {Variant} - Whatever was stored at the meta tag, undefined if does not exist
		*/
		getBinding: function( in_strCollectionID, in_strMetaTagID ) {
			var objCollection = this.m_objMetaTagCollections[ in_strCollectionID ];
			var vRetVal = objCollection && objCollection[ in_strMetaTagID ];
			
			return vRetVal;
		},


		/*
		* addBinding - Add a category ID to the cateogry IDs list
		* @param {String} in_strCollectionID - CollectionID to add category to.
		* @param {String} in_strMetaTagID - MetaTagID to add.
		* @param {Variant} in_vValue - Value to store.  If not given, stores "true"
		*/
		addBinding: function( in_strCollectionID, in_strMetaTagID, in_vValue ) {
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );

			var objCollection = this.m_objMetaTagCollections[ in_strCollectionID ];
			if( objCollection ) {   
				// We are only going to keep track of meta tags we actually have.
				this.RegisterListener( in_strCollectionID + 'delete', in_strMetaTagID, 
					this[ 'On' + in_strCollectionID + 'Delete' ] );
			
				objCollection[ in_strMetaTagID ] = Util.AssignIfDefined( in_vValue, true );
			}
		},

		/*
		* removeBinding - If possible, remove a category ID from the cateogry IDs list
		* @param {String} in_strCollectionID - CollectionID to remove category from.
		* @param {String} in_strMetaTagID - MetaTagID to try to remove.
		*/
		removeBinding: function( in_strCollectionID, in_strMetaTagID ) {
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			
			var objCollection = this.m_objMetaTagCollections[ in_strCollectionID ];
			if( objCollection && objCollection[ in_strMetaTagID ] ) {
				objCollection[ in_strMetaTagID ] = null;
				delete objCollection[ in_strMetaTagID ];
			}
		},

		/**
		* Save the note
		*/
		OnSave: function() {	
			if( this.m_objNoteGetBodyFC ) {   // get the function container.
				this.m_objExtraInfo.Body = this.m_objNoteGetBodyFC.callFunctionFast( [ this.m_strID ] );
				this.m_objNoteGetBodyFC = null;
			}
			
			// highlight changes if note is shared
			/*
			if ( ( Notes.eShareLevels.write === this.m_eShareLevel ) 
			  && ( true === Config.bEnableCommentHighlighting ) ) {
				this.m_objExtraInfo.Body = Comments.highlightChanges( Comments.m_strSavedXML, this.m_objExtraInfo.Body );
			}
*/
			var strTitle = this.m_objExtraInfo.Title;
				
			var objInput = {
				ID: this.m_strID,
				title: strTitle,
				// body: this.m_objExtraInfo.Body
				body: URITransforms.unproxySrcURIs( this.m_objExtraInfo.Body, Config.strProxyURL )
					
			};
			
			var objOutput = {
				Update_Dt: Util.convertSQLServerTimestamp,
				Summary: undefined,
				Title: undefined
			};
			
			var bRetVal = false;
			if( TypeCheck.String( objInput.body ) ) {   // make sure there is a body to save.
				bRetVal = Util.callDBActionAsync( 'NoteSave', objInput, objOutput, 
					this.OnSaveResponse, this );
			}
			else {   // We have been getting errors of the note body not being defined.
				this.Raise( 'raiseerror', [ 'Note.js:OnSave', ErrorLevels.eErrorType.WARNING,
						ErrorLevels.eErrorLevel.HIGH, 'Note body not defined, save cancelled.' ] );
			}
			
			// set editing flag false
			//Comments.m_bEditorOn = false;
				/*
				XXX Commenting this out, it was put in for comments, to make the display reload after
				modifying the contents
			// if shared note, reload the note after save to display changes    
			if ( Notes.eShareLevels.write === this.m_eShareLevel ) 
			{
				this.Raise( 'noteload', [ this ] );
			}
			   */
			return bRetVal;
		},

		/**
		* OnSaveResponse - Called on save to a note to update note information.
		* @param {Object} in_objNewInfo (optional) - DB values to save to 
		*   this.m_objExtraInfo.  if not given, assume direct update to m_objExtraInfo.
		*/
		OnSaveResponse: function( in_objNewInfo ) {
			var bRetVal = true;
			this.m_bEdited = false;
			
			// Save the DB date so we can do activity updates across time zones easily.
			//  This has to be done before we update the extra info so that we do not 
			//  keep the old date.
			this.m_dtDBUpdate_Dt = ( in_objNewInfo && in_objNewInfo.Update_Dt ) 
				? in_objNewInfo.Update_Dt : new Date();

			// for the display update date, ALWAYS use it based on the local system time.
			this.m_objExtraInfo.Update_Dt = new Date();
			
			in_objNewInfo = in_objNewInfo || this.m_objExtraInfo;

			if( this.m_objExtraInfo !== in_objNewInfo ) {
				this._updateExtraInfo( in_objNewInfo );
			}
			
			//Use the current system time so the fuzzy dates stay good.
			this.Raise( 'notesave', [ this.m_strID, this.m_objExtraInfo.Update_Dt, this ] );
			
			return bRetVal;
		},

		/**
		* _updateExtraInfo - take care of updating the extra info.
		* @param {Object} in_objNewInfo - the new info to do the updating.
		*/
		_updateExtraInfo: function( in_objNewInfo )
		{
			Util.Assert( TypeCheck.Object( in_objNewInfo ) );
			var t=this;
			
			if( TypeCheck.Defined( in_objNewInfo.Title ) ) {
				t.m_objExtraInfo.Title = in_objNewInfo.Title;
			}  

			if( TypeCheck.Defined( in_objNewInfo.Summary ) ) {
				t.m_objExtraInfo.Summary = in_objNewInfo.Summary;
				t.m_nLoadLevel = t.m_nLoadLevel | Notes.eLoadLevels.SUMMARY;
			}  
			else {
				t.m_nLoadLevel = t.m_nLoadLevel & ( ~Notes.eLoadLevels.SUMMARY );
			}
		},

		/**
		* OnSetBody - Set the body of the note.  Note, this does NOT set to the database immediately, only to our
		*   collection.  It DOES set our timer to save at a later point
		* @in_strBody {string} - Body of the note.
		*   raises "notesetbody" for any notes displays listening to us, and returns true.
		*/
		OnSetBody: function( in_objConfig ) {
			var bRetVal = true, t=this;

			t.m_objExtraInfo.Update_User = Ubernote.m_strUserName;
			
			// Only create a new function container if we either do not already have one
			//  OR what we are passing in is different than what we were storing before.
			if( ! t.m_objNoteGetBodyFC 
			|| ( ( t.m_objNoteGetBodyFC.m_fncFunction != in_objConfig.callback ) 
			  && ( t.m_objNoteGetBodyFC.m_objContext != in_objConfig.context ) ) ) {
				t.m_objNoteGetBodyFC = new FunctionContainer( in_objConfig.callback, in_objConfig.context );
			}
			
			t.m_bEdited = true;
			t.setNoteSaveTimer();
			
			return bRetVal;
		},

      
		/**
		* OnBindingAction - generalized DB interface to a NoteCategory relation action.
		* @param {String} in_strDBAction - the DB Action to do.
		* @param {String} in_strMetaTagID - the MetaTagID operated on.
		* @param {Function} in_fncCompletionCallback - the callback to call when db action complete.
		*   Called with the context of this note model with the MetaTagID as the first parameter, 
		*   true as the second, and the in_objCollection as the third.
		* @param {String} in_strCollectionID - CollectionID that category is in.
		* @param {Object} in_objInput (optional) - input parameters to go to DB.
		* @param {Object} in_objExtraInfo (optional) - Extra info to attach to binding.
		*/
		OnBindingAction: function( in_strDBAction, in_strCollectionID, 
			in_strMetaTagID, in_fncCompletionCallback, in_objInput, in_objExtraInfo ) {
			Util.Assert( TypeCheck.String( in_strDBAction ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.Function( in_fncCompletionCallback ) );
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.UObject( in_objInput ) );
			Util.Assert( TypeCheck.UObject( in_objExtraInfo ) );
			
			var OnComplete = function( in_objOutput ) {}, objInput,t=this;

			if (in_strCollectionID == "folders") {
				objInput = Object.extend(in_objInput || {}, {
					noteID: t.m_strID,
					folderID: in_strMetaTagID,
					displayOrder: ""
				});
			}
			else {
				objInput = Object.extend(in_objInput || {}, {
					noteID: t.m_strID,
					categoryID: in_strMetaTagID
				});
			}
			var objExtraInfo = Object.extend(in_objExtraInfo || {}, {
				Note_ID: t.m_strID,
				Category_ID: in_strMetaTagID
			});
            
			var objOutput = {
				Update_Dt: Util.convertSQLServerTimestamp
			};
            
			in_fncCompletionCallback.apply(t, [in_strCollectionID, in_strMetaTagID, true,
				objExtraInfo]);
            
			var bRetVal = Util.callDBActionAsync(in_strDBAction, objInput, objOutput,
				OnComplete, t);
                
			return bRetVal;
		},


		/**
		* OnAddBindingComplete - called when DB actions to add a category to a note are complete.  
		*   Removes category from local store, as well as optionally 'requestcategorydeletenote'.
		* @param {String} in_strCollectionID - CollectionID to add category to.
		* @param {String} in_strMetaTagID - MetaTagID to add to note.
		* @param {Boolean} in_bCategoryUpdate (optional) - Indicates whether to raise the 
		*   'requestcategoryaddnote' message.
		* @param {Object} in_objBindingInfo (optional) - Binding info to attach.
		*/
		OnAddBindingComplete: function( in_strCollectionID, in_strMetaTagID, 
			in_bCategoryUpdate, in_objBindingInfo ) {
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.UBoolean( in_bCategoryUpdate ) );
			Util.Assert( TypeCheck.UObject( in_objBindingInfo ) );
			
			this.addBinding( in_strCollectionID, in_strMetaTagID, in_objBindingInfo );

			if( in_bCategoryUpdate ) {
				this.Raise( 'note' + in_strCollectionID + 'add', [ this.m_strID, in_strMetaTagID, in_objBindingInfo ] );
				this.RaiseForAddress( 'request' + in_strCollectionID + 'addnote', in_strMetaTagID, [ this.m_objExtraInfo.Trash ] );
			}
		},

		/**
		* OnRemoveBindingComplete - called when DB actions to remove a category from a note are complete.  
		*   Removes category from local store, as well as optionally 'requestcategorydeletenote'.
		* @param {String} in_strCollectionID - CollectionID to remove category from.
		* @param {String} in_strMetaTagID - MetaTagID to add to note.
		* @param {Boolean} in_bCategoryUpdate (optional) - Indicates whether to raise the 
		*   'requestcategorydeletenote' message.
		*/
		OnRemoveBindingComplete: function( in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate ) {
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.UBoolean( in_bCategoryUpdate ) );
			
			this.removeBinding( in_strCollectionID, in_strMetaTagID );
			
			if( in_bCategoryUpdate ) {
				this.Raise( 'note' + in_strCollectionID + 'remove', [ this.m_strID, in_strMetaTagID, this.m_objExtraInfo.Trash ] );
				this.RaiseForAddress( 'request' + in_strCollectionID + 'deletenote', in_strMetaTagID, [ this.m_objExtraInfo.Trash ] );
			}
		},

		/**
		* OnTag - 'Tag' the note
		* @in_strMetaTagID {string} - ID of the category to tag this note with.  
		*   if successful, raises "categorytag" for any notes displays listening to us, and returns true.
		*   returns false otw.
		*/
		OnTag: function( in_strMetaTagID ) {
			var bRetVal = !this.hasBinding( 'tagged', in_strMetaTagID );
			
			if( bRetVal ) {
				bRetVal = this.OnBindingAction( 'NoteCategoryTag', 
					'tagged', in_strMetaTagID, this.OnTagComplete );
			}
			
			return bRetVal;
		},

		/**
		* OnTagComplete - called when DB actions to add tag to note are complete.  
		*   Adds category to local store, calls notetag message, as well as 
		*   optionally 'requestcategoryaddnote'.
		* @param {String} in_strCollectionID - CollectionID to MetaTagID to
		* @param {String} in_strMetaTagID - MetaTagID to add to note.
		* @param {Boolean} in_bCategoryUpdate (optional) - Indicates whether to raise the 
		*   'requestcategoryaddnote' message.
		* @param {Object} in_objBindingInfo (optional) - Binding info to attach.
		*/
		OnTagComplete: function( in_strCollectionID, in_strMetaTagID, 
			in_bCategoryUpdate, in_objBindingInfo ) {
			Util.Assert( TypeCheck.String( in_strCollectionID ) );
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.UBoolean( in_bCategoryUpdate ) );
			Util.Assert( TypeCheck.UObject( in_objBindingInfo ) );
			
			this.OnAddBindingComplete( in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate, in_objBindingInfo );

			if( ( 'tagged' == in_strCollectionID )
			 && ( in_bCategoryUpdate )
			 && ( 1 == this.getBindings( in_strCollectionID ).length ) ) {   // Means it was formerly empty
				this.RaiseForAddress( 'requestsystemcategoriesdeletenote', 
					SystemCategories.Categories.untagged, [ this.m_objExtraInfo.Trash ] );
			}
		},

		/**
		* OnFolder - 'Folder' the note
		* @in_strMetaTagID {string} - ID of the folder to tag this note with.  
		*   if successful, raises "categorytag" for any notes displays listening to us, and returns true.
		*   returns false otw.
		*/
		OnFolder: function (in_strMetaTagID) {
			var bRetVal = !this.hasBinding('folders', in_strMetaTagID);
            
			if (bRetVal) {
				bRetVal = this.OnBindingAction('NoteMove',
					'folders', in_strMetaTagID, this.OnFolderComplete);
			}
            
			return bRetVal;
		},

		/**
		* OnFolderComplete - called when DB actions to move note are complete.  
		*   Adds folder to local store, calls ?notetag? message, as well as 
		*   optionally '?requestcategoryaddnote?'.
		* @param {String} in_strCollectionID - CollectionID to MetaTagID to
		* @param {String} in_strMetaTagID - MetaTagID to add to note.
		* @param {Boolean} in_bCategoryUpdate (optional) - Indicates whether to raise the 
		*   'requestcategoryaddnote' message.
		* @param {Object} in_objBindingInfo (optional) - Binding info to attach.
		*/
		OnFolderComplete: function (in_strCollectionID, in_strMetaTagID,
			in_bCategoryUpdate, in_objBindingInfo) {

			this.OnAddBindingComplete(in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate, in_objBindingInfo);

			if (('folders' == in_strCollectionID)
			 && (in_bCategoryUpdate)
			 && (1 == this.getBindings(in_strCollectionID).length)) {   // Means it was formerly empty
				this.RaiseForAddress('requestsystemcategoriesdeletenote', // djn-not sure about this message
					SystemCategories.Categories.nofolder, [this.m_objExtraInfo.Trash]);
			}
		},

		/**
		* `Untag' a note
		*/
		OnUnTag: function( in_strMetaTagID ) {
			var bRetVal = this.OnBindingAction( 'NoteCategoryUnTag', 
				'tagged', in_strMetaTagID, this.OnUntagComplete );

			return bRetVal;
		},

		/**
		* OnUntagComplete - called when DB actions to remove tag from note are complete.  
		*   Removes category from local store, calls noteuntag message, as well as 
		*   optionally 'requestcategorydeletenote'.
		* @param {String} in_strMetaTagID - MetaTagID to add to note.
		* @param {Boolean} in_bCategoryUpdate (optional) - Indicates whether to raise the 
		*   'requestcategorydeletenote' message.
		*/
		OnUntagComplete: function( in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.UBoolean( in_bCategoryUpdate ) );

			this.OnRemoveBindingComplete( in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate );

			if( ( 'tagged' == in_strCollectionID )
			 && ( in_bCategoryUpdate )
			 && ( 0 == this.getBindings( in_strCollectionID ).length ) )
			{   // Means it is now empty
				this.RaiseForAddress( 'requestsystemcategoriesaddnote', 
					SystemCategories.Categories.untagged, [ this.m_objExtraInfo.Trash ] );
			}
		},


		/**
		* OnUnAttachment - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		*/
		OnUnAttachment: function( in_strMetaTagID ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			
			this.RaiseForAddress( 'requestattachmentdelete', in_strMetaTagID, [ this.m_strID ] );
		},

		/**
		* OnSharedByPerUserRead - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		* @param {String} in_strShareLevel - the share level
		*/
		OnSharedByPerUserAdd: function( in_strMetaTagID, in_strShareLevel ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.String( in_strShareLevel ) );

			var bRetVal = !this.hasBinding( 'sharedbyperuser', in_strMetaTagID );
			
			if( bRetVal )
			{
				bRetVal = this.OnBindingAction( 'NoteShareAdd', 
					'sharedbyperuser', in_strMetaTagID, this.OnTagComplete,
					{ shareLevel: in_strShareLevel, personalMessage: '' },
					{ Share_Level: in_strShareLevel } );
			}
			
			return bRetVal;
		},


		/**
		* OnSharedByPerUserRead - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		*/
		OnSharedByPerUserRead: function( in_strMetaTagID ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );

			return this.OnSharedByPerUserChange( in_strMetaTagID, 'read' );
		},


		/**
		* OnSharedByPerUserWrite - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		*/
		OnSharedByPerUserWrite: function( in_strMetaTagID ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );

			return this.OnSharedByPerUserChange( in_strMetaTagID, 'write' );
		},


		/**
		* OnSharedByPerUserChange - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		* @param {String} in_strLevel - Share level to set to
		*/
		OnSharedByPerUserChange: function( in_strMetaTagID, in_strLevel ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );
			Util.Assert( TypeCheck.String( in_strLevel ) );
			
			var fncCallback = function( in_strCollectionID, in_strMetaTagID, in_bCategoryUpdate ) {
				this.getBinding( 'sharedbyperuser', in_strMetaTagID ).Share_Level = in_strLevel;
			},

			bRetVal = this.OnBindingAction( 'NoteShareLevelUpdate', 
				'sharedbyperuser', in_strMetaTagID, fncCallback, { shareLevel: in_strLevel } );

			return bRetVal;
		},

		/**
		* OnSharedByPerUserRemove - Handler for 'requestnoteattachmentremove'
		* @param {String} in_strMetaTagID - Attachment ID of attachment to delete.
		*/
		OnSharedByPerUserRemove: function( in_strMetaTagID ) {
			Util.Assert( TypeCheck.String( in_strMetaTagID ) );

			var bRetVal = this.OnBindingAction( 'NoteShareRemove', 
				'sharedbyperuser', in_strMetaTagID, this.OnRemoveBindingComplete );
		},

		/**
		* OnCommentAdd - Add a comment to a note.
		* @param {String} in_strComment - comment.
		*/
		OnCommentAdd: function( in_objModel ) {
			Util.Assert( TypeCheck.Object( in_objModel ) );
			
			this.addBinding( 'comment', in_objModel.m_strID, in_objModel );

			this.Raise( 'notecommentadd', [ this.m_strID, in_objModel.m_strID, in_objModel.m_objExtraInfo ] );
				
			return bRetVal;
		},


		/**
		* OnTitleEdit - Edit the note's title
		* @param {String} in_strTitle - title to set.
		* @returns {Boolean} true if successful, false otw.
		*/
		OnTitleEdit: function( in_strTitle ) {   
			Util.Assert( TypeCheck.UString( in_strTitle ) );
			
			var strTitle = in_strTitle || '';
			var bRetVal = false;
			
			if( strTitle != this.m_objExtraInfo.Title )   {
				var OnComplete = function( in_objResponse ) {
					this.m_objExtraInfo.Title = strTitle;
					this.m_objExtraInfo.Update_User = Ubernote.m_strUserName;
					this.OnSaveResponse( in_objResponse );
				},

				objInput = {
					ID: this.m_strID,
					title: strTitle,
					body: null
				},
				
				objOutput = {
					Update_Dt: Util.convertSQLServerTimestamp
				};
				
				bRetVal = Util.callDBActionAsync( 'NoteSave', objInput, objOutput, 
					OnComplete, this );
			}
			
			return bRetVal;
		},


		/**
		* OnTrashComplete - Called when DB Action is complete for trash.  Sends
		*   out required housekeeping messages to everybody.
		*//*
		OnTrashComplete: function() {
			// We set the trash flag AFTER because because the category update handler only updates 
			//  counts if the trash flag is false.
			this._processTags( 'deletenote' );
			this.m_objExtraInfo.Trash = true;
			
			if( true == this.m_objExtraInfo.Star ) {
				this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.starred );
			}

			if( true == this.m_objExtraInfo.Hidden ) {
				this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.hidden );
			}
			
			if( 0 == this.getBindings( 'tagged' ).length ) {
				this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.untagged );
			}
			this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.all );
			this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.trashed );
			this.OnSaveResponse();
		},

*/		/**
		* OnUntrashComplete - Called when DB Action is complete for untrash.  Sends
		*   out required housekeeping messages to everybody.
		*//*
		OnUntrashComplete: function() {
			// We set the trash flag false because because the category update handler only updates 
			//  counts if the trash flag is false.
			this.m_objExtraInfo.Trash = false;
			this._processTags( 'addnote' );
			
			if( 0 === this.getBindings( 'tagged' ).length ) {
				this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.untagged );
			}

			if( true == this.m_objExtraInfo.Star ) {
				this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.starred );
			}

			if( true == this.m_objExtraInfo.Hidden ) {
				this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.hidden );
			}
			
			this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.all );
			this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.trashed );
			this.OnSaveResponse();
		},

	*/	/**
		* OnHiddenComplete - Called when DB Action is complete for hidden.  Sends
		*/   /*
		OnHiddenComplete: function() {
			this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.all, [ this.m_objExtraInfo.Trash ] );
			this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.hidden, [ this.m_objExtraInfo.Trash ] );
			this.OnSaveResponse();
		},

		*//**
		* OnUnHiddenComplete - Called when DB Action is complete for unhidden.  Sends
		*   out required housekeeping messages to everybody.
		*//*
		OnUnHiddenComplete: function() {
			this.RaiseForAddress( 'requestsystemcategoriesdeletenote', SystemCategories.Categories.hidden, [ this.m_objExtraInfo.Trash ]  );
			this.RaiseForAddress( 'requestsystemcategoriesaddnote', SystemCategories.Categories.all, [ this.m_objExtraInfo.Trash ]  );
			this.OnSaveResponse();
		},

	*/	/**
		* OnMetaRequestComplete - Called whenever meta data for a note is updated.  Raises
		*   the given message for the given subscriber and calls the save response.
		* @param {String} in_strMessage - message to raise.
		* @param {String} in_strSubscriber - address to send message to.
		*/
		OnMetaRequestComplete: function( in_strMessage, in_strSubscriber ) {
			Util.Assert( TypeCheck.String( in_strMessage ) );
			Util.Assert( TypeCheck.String( in_strSubscriber ) );
			
			this.RaiseForAddress( in_strMessage, in_strSubscriber, [ this.m_objExtraInfo.Trash ] );
			this.OnSaveResponse();
		},

		_noteTemplateFunc: function( in_objEntry )
		{
			Util.Assert( in_objEntry );

			for( var strKey in in_objEntry.translation ) {
				if( this.m_objExtraInfo[ strKey ] == in_objEntry.translation[ strKey ] ) {
				   // already done for this entry.  Do not do again.
					return false;
				}
			}
			
			var objInput = {};
			objInput.noteID = this.m_strID;
			if( TypeCheck.Defined( in_objEntry.action ) ) { 
				objInput.action = in_objEntry.action;
			}
			
			var objMessages = {};
			if( in_objEntry.message ) {
				objMessages[ in_objEntry.message ] = undefined;
			}

			var me=this;
			if( in_objEntry.oncomplete ) { 
				if( in_objEntry.translation ) {
					for( var strKey in in_objEntry.translation ) {
						me.m_objExtraInfo[ strKey ] = in_objEntry.translation[ strKey ];
					}
				}
				in_objEntry.oncomplete.apply( me, in_objEntry.arguments || [] ); 
			}

			var bRetVal = this.dbSaveActionAsync( in_objEntry.service, objInput, undefined, 
				objMessages );
				
			return bRetVal;
		},
		/**
		* _processTags - sends a message to each of the tags that the status
		*   of the note has been updated.
		* @param {String} in_strMessage - message to send to each category.
		*/
		_processTags: function( in_strMessage ) {
			Util.Assert( TypeCheck.String( in_strMessage ) );

			for( var strCollection in MetaTags.eCollections ) {
				for( var strMetaTagID in this.m_objMetaTagCollections[ strCollection ] )
				{   // the trash flag is only actually used for delete, not trash/untrash.
					this.RaiseForAddress( 'request' + strCollection + in_strMessage, strMetaTagID, [ false ] );
				}
			}
		},

		/**
		* deleteMe - Delete the note permanently
		* @param {String} in_strModelID - the model ID - ignored.
		* @param {Date} in_dtUpdate - update date - ignored.
		* @param {bool} in_bSkipDBSave - If true, skip the DB save.  Assumes false.
		*/
		deleteMe: function( in_strModelID, in_dtUpdate, in_bSkipDBSave ) {	
			var objConfig = {
				noteID: this.m_strID
			};
			
			this._processTags( 'deletenote' );

			this.RaiseForAddress( 'loadall', 'categoriesloader' );

			var bRetVal = Note.Base.deleteMe.apply( this, [ 'NoteRemove', objConfig, in_bSkipDBSave ] );
			return bRetVal;
		},


		/**
		* TODO: where does this really go? could go in the Notes collection model instead of here
		* or maybe it belongs here.
		*
		* setNoteSaveTimer: Creates or resets the timer that triggers a note save.  
		* The timer is added to a collection of timers
		*/
		setNoteSaveTimer: function() {   
			// Clears any old ones.
			this.clearNoteSaveTimer();

			this.m_objNoteTimer = Timeout.setTimeout( this.OnSave, 2000, this );
		},

		/**
		* clearNoteSaveTimer - clear 
		*/
		clearNoteSaveTimer: function() {
			if( this.m_objNoteTimer )
			{
				Timeout.clearTimeout( this.m_objNoteTimer );
				this.m_objNoteTimer = null;
			}
		},

		/**
		* OnToggleStar - Toggle the star flag.
		*/
		OnToggleStar: function() {
			var strFunc = this.m_objExtraInfo.Star ? 'OnUnStar' : 'OnStar';
			this[ strFunc ]();
		},


		/**
		* isOwner - Check to see if the current user is the owner.
		* @returns {Boolean} - true if current user is the owner, false otw.
		*/
		isOwner: function() {
			return !this.m_objExtraInfo.Share_Owner;
		}
	} );
	
	/**
	* This has to come AFTER all of the OnNNNComplete functions or else the oncomplete
	*   functions will not be defined.
	*/
	var prot = Note.prototype;
	var metaUpdateFunctions = {
	/*	OnTrash: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.trash, 
			message: 'notetrash', oncomplete: prot.OnTrashComplete },
			
		OnUnTrash: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.untrash, 
			message: 'noteuntrash', oncomplete: prot.OnUntrashComplete },
		*/	
		OnStar: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.star, 
			translation: { Star: true }, message: 'notestar', 
			oncomplete: prot.OnMetaRequestComplete, 
			arguments: [ 'requestsystemcategoriesaddnote', SystemCategories.Categories.starred ] },
			
		OnUnStar: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.unstar, 
			translation: { Star: false }, message: 'noteunstar', 
			oncomplete: prot.OnMetaRequestComplete, 
			arguments: [ 'requestsystemcategoriesdeletenote', SystemCategories.Categories.starred ] },
			/*
		OnHidden: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.hide, 
			translation: { Hidden: true }, message: 'notehidden',
			oncomplete: prot.OnHiddenComplete },
			
		OnUnHidden: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.unhide, 
			translation: { Hidden: false }, message: 'noteunhidden', 
			oncomplete: prot.OnUnHiddenComplete },
			*/
		OnEmailToSelf: { service: 'NoteEmailToSelf', message: 'noteemail' }
	};
	
	var createFunction = function( in_strFuncName, in_objEntry ) { // do this to create the function.
		Note.prototype[ in_strFuncName ] = function() { 
			return this._noteTemplateFunc( in_objEntry ); 
		};
	};

	for ( var strFuncName in metaUpdateFunctions ) {
		createFunction( strFuncName, metaUpdateFunctions[ strFuncName ] );
	}
	
	return Note;
}() );
