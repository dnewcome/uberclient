/**
* Draggable pane splitter class
* @param domElement {object} the page element that will function as splitter
*/
function Splitter( domElement, parent )
{
	this.type = "splitter";
	this.parent = parent; // keep Application obj as parent for all controls...
	var me = this;
	
	/* wire up the drag start event */
	//domElement.onmousedown = dragstart;
	
	/**
	* The first function in the drag sequence. Registers this with the Drag obj
	*/
	function dragstart()
	{	
		app.drag.start(null, ondrag, ondragend); 
		/* change the cursor for body, so that we don't have a flickering cursor */
		document.body.style.cursor = "e-resize";
		app.drag.xStart = event.clientX;
	}
	
	/**
	* this gets called by the drag object any time mouse moves
	*/
	function ondrag()
	{
		domElement.firstChild.style.display = "block";
		domElement.firstChild.style.left = event.clientX;
	}
	
	/**
	* Called by drag object when mouse is released
	*/
	function ondragend()
	{
		/* put the cursor back to auto mode */
		document.body.style.cursor = "auto";
		/* hide the splitter shadow */
		domElement.firstChild.style.display = "none";
		var tagPanel = document.getElementById("catpane");
		
		/* hack since styles applied via css don't have values */
		if (tagPanel.style.width == "") 
		{
			tagPanel.style.width = app.drag.xStart;
		}
		
		tagPanel.style.width = parseInt( tagPanel.style.width ) + ( event.clientX - app.drag.xStart );		
	}
	
} // </class> Splitter
