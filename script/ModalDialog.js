/**
* Class ModalDialog 
* @dialog {element} Where to pull the html contents of the dialog from
*/
function ModalDialog( dialog )
{
	var me = this;
	me.type = "ModalDialog";
	me.shadow = document.createElement("div");
	me.dialog = dialog;
	
	me.show = show;
	me.hide = hide;
	
	DOMElement.addClassName( me.shadow, "dialogShadow" );
	
	init();
	attach();
	
	/**
	* Displays the modal dialog centered in the browser
	*/
	function show()
	{
	    DOMElement.show( me.shadow );
	    DOMElement.show( me.dialog );
		DOMElement.Center( me.dialog );
	}
	
	/**
	* Hides the modal dialog
	*/
	function hide()
	{
	    DOMElement.hide( me.shadow );
	    DOMElement.hide( me.dialog );
	}
	
	/**
	* Initialize: hide, set dimensions
	*/
	function init()
	{
		hide();
	}
	
	/**
	* Attach everything to the DOM
	*/	
	function attach()
	{
		document.getElementById("modalDialog").appendChild(me.shadow);
	}

}