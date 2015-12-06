ExternalHelpers = (function() {
	var fakeID = 'fakeid';
	return {
		addNoteDisplayFolder: function( folderID ) {			
			displayFolder( folderID );
			noteAddCleanup();
		},
		
		addNoteDisplaySingleNote: function( noteID, folderID ) {
			displayFolder( folderID, true );
			
			// holy hacktastic batman.  We have to put this timeout because of
			//	my ghetto (which I still love at times) message passer.  We are
			//	firing off two 'requestdisplaymessages' at once, the first for the
			//	folder, the second for the single note.  Because of this, the one
			//	to display the folder overwrites the noteid we want to display.
			//	so, we have to delay this until the other request is done being
			//	processed.
			setTimeout(function() {
				Messages.Raise( 'requestdisplaysinglenote', fakeID, [ noteID ] );
			}, 100 );
			noteAddCleanup();
		}
	};
	
	function displayFolder( folderID, supressRequest ) {
		var collectionID = "0" === folderID ? 'systemcategories' : 'folders';
		folderID = "0" === folderID ? 'nofolder' : folderID;
	
		// supress the request so that the next select doesn't go to the DB, we just
		//	want it on the history.
		supressRequest && app.notes.supressNextRequest();
		
		if( folderID === 'nofolder' ) {
			app.maincontrol.selectUnfolderedNotes();
		}
		else {
			app.foldersdisplay.selectItem( folderID );
		}	
	}
	
	function noteAddCleanup() {
		Messages.RaiseForAddress( 'loadall', 'fakeid', 'categoriesloader' );
		app.externalpage.hide();
		app.lightbox.hide();
	}
}() );
