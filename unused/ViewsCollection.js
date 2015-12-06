/**
* Collection to hold refs to view objects within a viewsControl
*	@parent {object} ref to the viewsControl that owns the collection
*/
function ViewsCollection( parent )
{
	var me = this;
	this.type = "viewscollection";
	this.parent = parent;
	this.count = 0;
	this.items = new Object;
	
	/* methods */
	this.Add = Add;
	this.Remove = Remove;
	
	/**
	*	Adds a new view to the collection
	* @param view {object} ref to the view we want to add
	*/
	function Add( view )
	{	
		me.items[view.id] = view;
		me.count++;
	}

	/**
	*	Removes a view from the collection
	* @param view {object} ref to the view we want to add
	*/
	function Remove( viewID )
	{	
		delete me.items[viewID];
		me.count--;
	}
}
