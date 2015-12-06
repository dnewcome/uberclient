/**
* Model for holding the data that is a note
* Also responsible for raising `DataLoaded' and `DataChanged' events
*/
//function NoteModel( noteCategoriesModel )
function NoteModel()
{
	// The data that make up a note	
	this._id = null;
	this._title = null; 
	this._body = null;
	this._createDT = null;
	this._updateDT = null;
	
	// this will be ref to another model
	// TODO: should this even be a member, or should it be 'free' from the note model?
	//this._categories = noteCategoriesModel; 
	
	
	// the controller needs to take care of this
	//this.BodyDocument = notetext.domContainer.contentWindow.document;
	
	// Events fired when data changes -- TODO: use SMPS for this
	this.DataChanged = new Event();
	this.DataLoaded = new Event();
	
	// public Data setters
	this.LoadData = LoadData;	
	this.SetTitle = SetTitle;
	this.SetBody = SetBody;
	this.SetUpdateDT = SetUpdateDT;
	
	/**
	* loads all data into note model..
	* TODO: decide whether a full load should be possible... we might not want to 
	* reuse the model instances, in which case, we only want to `load' on construction
	*/
	function LoadData( title, createDT, updateDT, body, id )
	{	
		// Note: no setters for id and createdDT, only set once during load
		this._id = id;
		this._title = title;
		this._body = body;
		this._updateDT = updateDT;
		this._createDT = createDT;
		
		this.DataLoaded.Raise();
	}
		
	function SetTitle( value )
	{
		var isChanged = ( this._body != value );
		if( isChanged )
		{
			this._body = value;
			this.DataChanged.Raise( "title", value );	
		}
	}

	function SetBody( value )
	{
		var isChanged = ( this._body != value );
		if( isChanged )
		{
			this._body = value;
			this.DataChanged.Raise( "body", value );	
		}
	}

	function SetUpdateDT( value )
	{
		var isChanged = ( this._updateDT != value );
		if( isChanged )
		{
			this._updateDT = value;
			this.DataChanged.Raise( "updateDT", value );	
		}
	}

}
