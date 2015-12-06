/**
* Data access layer for Note model and notesControl ... will split this at some point.
* @notesControl {NotesControl} owning notescontrol that the data access layer services
*/
function NotesDataAccess()
{	
	
	this.NoteTrash = noteTrash;
	this.NoteSave = NoteSave;
	this.UnTag = UnTag;
	this.UnTrash = UnTrash;
	this.TitleEdit = TitleEdit;
	this.newNote = newNote;
	this.NoteCategoryTag = NoteCategoryTag;
	this.noteDelete = noteDelete;
	
	function noteTrash( note )
	{	
		var sessionID = document.getElementById("SID").value;
		Util.callWebServiceSafe( "NoteTrash", "noteID="+note.id );
		note.domContainer.parentNode.removeChild( note.domContainer );		
	}
	
	function NoteSave( note )
	{	
		var id = note.id;
		var body = note.NoteText.domContainer.contentWindow.document.body.innerHTML;
		var title = note.NoteBar.title.GetValue(); // TODO: do we need to escape this string also??
		var sessionID = document.getElementById("SID").value;
		body = escape(body); /* very important!! prep string for http transfer */
		var resp = Util.callWebServiceSafe( "NoteSave", "ID="+id+"&title="+title+"&body="+body );
        
        if( resp )
		{
			window.status = "Save Completed";
		}
		else
		{
			window.status = "Save Could Not Be Completed";
		}
	}	
	
	function UnTag( tag )
	{
		var noteID = tag.note.m_modelID;
		var categoryID = tag.id;
		var sessionID = document.getElementById("SID").value;
		var resp = Util.callWebServiceSafe( "NoteCategoryUnTag", "noteID="+noteID+"&categoryID="+categoryID );

		if( resp ) 
		{
		    // This is the safest place to do this!
            Messages.RaiseForAddress( "requestcategorydecrementcount", noteID, categoryID );
			return true;
		} // end if
		else 
		{
			return false;
		} // end if-else
	}
	
	function TitleEdit( note, title )
	{
		Util.callWebServiceSafe( "NoteSave", "ID="+note.id+"&title="+title+"&body="+null );
	}
	
	function UnTrash( note )
	{ 
		Util.callWebServiceSafe( "NoteUnTrash", "noteID="+note.id );
		note.domContainer.parentNode.removeChild( note.domContainer );			
	}

	function newNote()
	{	
		var resp = Util.callWebServiceSafe( "NoteAdd" );
		var noteID = resp.responseXML.getElementsByTagName("noteID")[0].childNodes[0].nodeValue;			
		var createDT = resp.responseXML.getElementsByTagName("createDT")[0].childNodes[0].nodeValue;			
		var jsCreateDT = Util.convertSQLServerTimestamp( createDT );
		return { "noteID":noteID, "createDT":createDT, "jsCreateDT":jsCreateDT };
	}
	
	function NoteCategoryTag( noteID, categoryID )
	{	
		var resp = Util.callWebServiceSafe( "NoteCategoryTag", "noteID="+noteID+"&categoryID="+categoryID); 
		
		if( resp ) 
		{
            Messages.RaiseForAddress( "requestcategoryincrementcount", noteID, categoryID );
			return true;
		} // end if
		else 
		{
			return false;
	    } // end if-else
	}

	function noteDelete( note )
	{	
		var noteID = note.id;
		var resp = Util.callWebServiceSafe( "NoteRemove", "noteID="+noteID );
		note.domContainer.parentNode.removeChild( note.domContainer );
	}

}