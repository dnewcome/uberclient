
/**
* specializaton of DynamicDisplayArray to provide the UI for the main
*	list of notes in the application
*/
NoteDisplayCollection = (function() {
	"use strict";
	
	var NoteDisplayCollection = function() {
		// array of NoteIDs to display
		this.m_astrNoteIDs = undefined;
		this.m_nReIDCount = 0;    
		NoteDisplayCollection.Base.constructor.apply( this );
	};
	UberObject.Base( NoteDisplayCollection, ListDisplay );

	Object.extend( NoteDisplayCollection.prototype, {
		loadConfigParams: function() {
			NoteDisplayCollection.Base.loadConfigParams.apply( this );
			this.extendConfigParams( {
				m_strNoteDisplayType: { type: 'string', bRequired: true },
				m_bHideDisplaysWhenUpdating: { type: 'boolean', bRequired: false, default_value: true }
			} );
		},

		/**
		* displayNotes - display a collection of notes.
		* @param {Array} in_astrNoteIDs - array of strings that hold the noteIDs to display.
		*/
		displayNotes: function( in_astrNoteIDs ) {
			Util.Assert( TypeCheck.Array( in_astrNoteIDs ) );

			if( true == this.m_bHideDisplaysWhenUpdating ) {
				this.hideAll();
			}
			
			this.m_astrNoteIDs = in_astrNoteIDs;
			this._showNewDisplays();
		},

		
		/**
		* _showNewDisplays - shows the new set of displays.
		*/
		_showNewDisplays: function() {
			var nIndex = 0;
			for( var strNoteID; strNoteID = this.m_astrNoteIDs[ nIndex ]; ++nIndex ) {
				this._displayNote( strNoteID, nIndex );
			}
			
			if( false == this.m_bHideDisplaysWhenUpdating ) {
				for( var objDisplay; objDisplay = this.getByIndex( nIndex ); ++nIndex ) {
					objDisplay.hide();
				}
			}
		},
		
		/**
		* _displayNote - Display a note display for the given note ID
		* @param {String} in_strNoteID - NoteID to display.
		* @param {Number} in_nIndex - Index to display note at.
		*/
		_displayNote: function( in_strNoteID, in_nIndex ) {
			Util.Assert( TypeCheck.String( in_strNoteID ) );
			Util.Assert( TypeCheck.Number( in_nIndex ) );

			var strNoteID = Util.convertSQLServerUniqueID( in_strNoteID );
			var objDisplay = this.getByIndex( in_nIndex );
			
			this.Raise( 'notedisplay', [ strNoteID ] );
			 
			if( objDisplay ) {
				this._reattachNote( strNoteID, objDisplay );
			}
			else {   
				objDisplay = this._createNote( strNoteID );
			}
			
			if( objDisplay.playWellWithOthers ) {
				objDisplay.playWellWithOthers( this.m_astrNoteIDs.length > 1 );
			}
			
			/*
			var strFunc = !( in_nIndex % 2 ) ? 'addClassName' : 'removeClassName';
			objDisplay.$()[ strFunc ]( 'striped' );
			*/
			objDisplay.show();
		},

		/**
		* _reattachNote - reattach a note display with the given noteID into
		*   the current position.
		* @param {String} in_strNewID - NoteID to give the display
		* @param {Object} in_objDisplay - display to insert and set the noteID for.
		*/
		_reattachNote: function( in_strNewID, in_objDisplay ) {
			var strOldID = in_objDisplay.m_strNoteID;
					
			if( in_strNewID != strOldID ) {
				this.m_nReIDCount++;
				var strTempID = ( this.m_nReIDCount ).toString();
				var objConflictingDisplay = this.reid( in_strNewID, strTempID );
				if( objConflictingDisplay ) {
					objConflictingDisplay.setNoteModelID( strTempID, false );
				}
				
				this.reid( strOldID, in_strNewID );
				in_objDisplay.setNoteModelID( in_strNewID, true );
			}
		},
		
		/**
		* _createNote - Used as the iterator for displayNotes - create a note and attach
		*   it to the child list
		* @param {String} in_strNoteID - noteID of the note to create.
		*/
		_createNote: function( in_strNoteID ) {
			Util.Assert( TypeCheck.String( in_strNoteID ) );
			
			var objDisplay = this.getByID( in_strNoteID );
			if( ! objDisplay ) {
				var objAdditionalConfig = {
					m_strNoteID: in_strNoteID,
					m_bAttachDomOnInit: false
				};
				objDisplay = app.notedisplayfactory.create( this.m_strNoteDisplayType, in_strNoteID, objAdditionalConfig );
				this.addDisplay( in_strNoteID, objDisplay );
			}
			
			return objDisplay;
		},

		/**
		* hide - hides all the displays as well as the container.  This means next time 'show' is 
		*   called on this object, no notes will be shown until displayNotes is called.
		*/    
		hide: function() {
			this.hideAll();
			NoteDisplayCollection.Base.hide.apply( this, arguments );
		}
	});
	
	return NoteDisplayCollection;
}() );