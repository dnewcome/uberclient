/**
* NotePaging object.  Created to give us pages of notes.
*/

NotesPaging = (function() {
	"use strict";
	
	var NotesPaging = function() {
		this.m_objConfig = undefined;
		this.m_objTimeout = undefined;
		
		NotesPaging.Base.constructor.call( this );
	};
	UberObject.Base( NotesPaging, DisplayAltConfig );

	Object.extend( NotesPaging.prototype, {
		loadConfigParams: function() {
			NotesPaging.Base.loadConfigParams.call( this );
			this.extendConfigParams( {
				m_objConfig: { type: 'object', bRequired: false, default_value: {} },
				m_nRedisplayInPlaceTimeout: { type: 'number', bRequired: false, default_value: 500 }
			} );
		},

		teardown: function() {
			this.m_objConfig = null;
			Timeout.clearTimeout( this.m_objTimeout );
			
			NotesPaging.Base.teardown.apply( this, arguments );
		},

		RegisterMessageHandlers: function() {
			var t=this, all=Messages.all_publishers_id, register=t.RegisterListener.bind(t);
			NotesPaging.Base.RegisterMessageHandlers.call( t );
			
			register( 'requestdisplaynotes', all, t.OnDisplayNotes );
			register( 'requestdisplaysinglenote', all, t.OnDisplaySingleNote );
					
			register( 'documentresize', all, t.onDocumentResize );        

			//register( 'notetrash', all, t.redisplayInPlace );
			register( 'notedelete', all, t.redisplayInPlace );
			/*register( 'noteuntrash', all, t.redisplayInPlace );
			register( 'notehidden', all, t.redisplayInPlace );
			register( 'noteunhidden', all, t.redisplayInPlace );
			register( 'notesemptytrash', all, t.redisplay );
			*/
		},

		/**
		* onDocumentResize - set the height of the container.
		* @param {Number} in_nHeight - height in pixels of the document
		*/
		onDocumentResize: function( in_nHeight ) {
			Util.Assert( TypeCheck.Number( in_nHeight ) );
			var top = this.$( 'NotePane' ).cumulativeOffset()[1];
			
			//DOMElement.setDimensionStyle( this.$( 'NotePane' ), 'height', in_nHeight - top );
		},

		/**
		* OnDisplayNotes - Display a category of notes. 
		*   Note, if a message must be displayed in the header, it must 
		*   be set AFTER OnDisplayNotes is called.  OnDisplayNotes will
		*   clear the header if there are notes or set it to "No notes found" 
		*   if none are found.
		* @param {String} in_objConfig - configuration object.  Has the following fields:
		* @param {String} categoryid (optional) - CategoryID to display.  If not given, previous value used.
		* @param {Number} page (optional) - Page number to display (0 based index).  If not given, previous value used.
		* @param {String} header (optional) - Header to set.  If not given, previous value used.
		* @param {Enum Value} sortorder (optional) - sort order to use.  If not given, previous value used.
		* @param {FunctionContainer} callback (optional) - Function container to call when operation is complete. 
		*       NOTE: callback settings are NOT saved between invocations - ie, previous value is NOT used if not given.
		*       NOTE2: I am starting to take a new approach to passing in callback values, it has its place
		*           where the message passer is not ideal because the message passer would be broadcast.
		*           Hmmm...  Check this out, how can we use the message passer?  But we could pass in a "send to" ID
		*           for the same effect.
		*/
		OnDisplayNotes: function( in_objConfig ) {   
			Util.Assert( TypeCheck.Object( in_objConfig ) );
			Util.Assert( TypeCheck.UString( in_objConfig.metatagid ) );
			Util.Assert( TypeCheck.UString( in_objConfig.collectionid ) );
			//Util.Assert( TypeCheck.UString( in_objConfig.header ) );
			Util.Assert( TypeCheck.UEnumKey( in_objConfig.sortorder, Notes.eNoteSortOrder ) );
			Util.Assert( TypeCheck.UObject( in_objConfig.callback) );
			Util.Assert( TypeCheck.UString( in_objConfig.focusnoteid ) );
			Util.Assert( TypeCheck.UBoolean( in_objConfig.scrolltotop ) );

			var t = this, config = t.m_objConfig;
			/**
			* give a plugin a chance to compare the old config vs the
			*   new config with beforeconfigchange.
			*/
			t.Raise( 'beforeconfigchange', arguments , true );
			
			// get rid of the these so we don't stay in single/selected note mode.
			config.header = config.noteids = null;
			
			Object.extend( config, in_objConfig );
			t.Raise( 'configchange', arguments, true );
			
			t.updateSearchTerm();
			if( config.noteids ) {
				t.displaySpecifiedNotes();
			}
			else {
				t.requestNotesToDisplay();
			}
		},

		displaySpecifiedNotes: function() {
			var me=this;
			Timeout.setTimeout( function() {
				var noteids=me.m_objConfig.noteids;
				me.displayNotes( { 
					noteids: noteids,
					totalcount: noteids.length
				} );
			}, 0 );
		},

			
		requestNotesToDisplay: function() {
			var t = this, config = t.m_objConfig;
			t.Raise( 'requestnoteids', [ {
				callback: t.displayNotes,
				context: t,
				metatagid: config.metatagid,
				collectionid: config.collectionid,
				searchterm: config.searchterm,
				sort: config.sortorder,
				startrow: config.startrow,
				maxrows: config.maxrows
			} ] );
		},

		/**
		* redisplay - redisplay the current category.  Useful if notes got updated and 
		*   the list should be updated.
		*/	
		redisplay: function() {
			this.OnDisplayNotes( { } );
		},

		/**
		* redisplayInPlace - redisplay the current category, but do not scroll to the
		*   top.  Useful if notes got updated and 
		*   the list should be updated.
		*/	
		redisplayInPlace: function() {
			/*
			* One of the problems is that we are calling NotesMasterGet for every 
			*   note we delete/trash/untrash and this is causing major bottlenecks 
			*   in decoding, displaying etc.  What happens is for every note that 
			*   gets trashed/untrashed/deleted, a notetrash/untrash/delete message 
			*   is raised.  NotesPaging requests a re-display of the current page 
			*   of notes for each of these messages it receives.  So as a hack, we 
			*   are setting a timeout of 500 ms and then doing the re-display.  If 
			*   a new message for trash/untrash/delete comes in within that 500 ms, 
			*   the timeout is cleared and restarted.  This keeps us from requesting 
			*   NotesMasterGet for each note that is done and hopefully the display 
			*   updates correctly.
			*/
			var t=this;
			t.Raise( 'notespagingredisplayinplace' );
			
			Timeout.clearTimeout( t.m_objTimeout );
			t.m_objTimeout = Timeout.setTimeout( t.OnDisplayNotes, 
				t.m_nRedisplayInPlaceTimeout, t, [ { scrolltotop: false } ] );
		},

		/**
		* displayNotes - called whenever 'requestnoteids' completes, is called
		*   with a set of noteids and counts used to update the display.
		* @param {Object} in_objConfig - configuration object.  Contains:
		* @param {Array of Strings} in_objConfig.noteids - noteids to display.
		* @param {Number} in_objConfig.totalcount - TOTAL count of notes in category requested.
		* @param {String} in_objConfig.header (optional) - Header to set.
		* @param {Boolean} in_objConfig.displaysort (optional) - Whether to display sort or not.  
		*   Assumed to be true
		* @param {Boolean} in_objConfig.scrolltotop (optional) - Whether to scroll to the first note
		*   Assumed to be true
		*/
		displayNotes: function( in_objConfig ) {
			Util.Assert( TypeCheck.Object( in_objConfig ) );
			Util.Assert( TypeCheck.Object( in_objConfig.noteids ) );
			Util.Assert( TypeCheck.Number( in_objConfig.totalcount ) );
			Util.Assert( TypeCheck.UBoolean( in_objConfig.displaysort ) );
			Util.Assert( TypeCheck.UBoolean( in_objConfig.scrolltotop ) );
			
			var t = this, config = t.m_objConfig;
			if( false === TypeCheck.Array( in_objConfig.noteids ) ) {
			   /* We use the $A because any arrays coming form external pages
				* are standard javascript arrays and not our special prototype ones
				*/
				in_objConfig.noteids = $A( in_objConfig.noteids );
			}
			
			t.Raise( 'displaynotes', arguments, true );

			var strFunction = ( 1 === in_objConfig.totalcount ) ? 'addClassName' : 'removeClassName';
			t.$()[ strFunction ]( 'singlenote' );

			// this is a one time thing unless we get a special command to override it.
			if( true === config.scrolltotop ) {
				document.body.scrollTo();
			}

			// focus either the specified note, or the first note.  There might not be either.
			var strFocusID = config.focusnoteid || in_objConfig.noteids[ 0 ];
			if( strFocusID ) {
				t.RaiseForAddress( 'forcefocus', strFocusID );
				config.focusnoteid = undefined;
			}
			
			if( config.callback ) {   // call the callback.  
				config.callback.callFunction();
				config.callback = undefined;
			}
			
			t.Raise( 'displaynotespost' );

		},

		/**
		* OnDisplaySingleNote - display a single note.
		* @param {String} in_strNoteID - single note to display.
		* @param {Variant} in_vOptional - Optional information passed along to plugins.
		*/
		OnDisplaySingleNote: function( in_strNoteID, in_strURL, in_strTitle ) {
			this.OnDisplayNotes( { noteids: [ in_strNoteID ], url: in_strURL, title: in_strTitle } );
		},

		/**
		* updateSearchTerm - Updates the configuration's search term for the current
		*   meta tag.  If we are in the search meta tag, keep the search term, if not, 
		*   get rid of it.
		*/
		updateSearchTerm: function() {
			var config = this.m_objConfig;
			config.searchterm = 
				( config.metatagid == SystemCategories.Categories.search ) 
				? config.searchterm : undefined;
		}
	} );
	/*
	function getHeader( in_objConfig ) {
		return in_objConfig.header ? in_objConfig.header : in_objConfig.noteids ? 
				in_objConfig.noteids.length > 1 ? _localStrings.VIEWING_SELECTED_NOTES : _localStrings.VIEWING_SELECTED_NOTE
				:undefined;
	
	}
	*/
	return NotesPaging;
}() );
