/**
* Class ViewBase - This is the base class for all view classes
* @template {string} the name of the template that will be retrieved from TemplateManager
*/
function ViewBase( template )
{
    this.template = template;
    
    this.DomBuilder = DomBuilder;
    this.AttachControl = AttachControl;
    this.AttachWidgets = AttachWidgets;
    
    // deprecated
    // this.Notify = Notify;
    
    function DomBuilder()
    {	
		this.ControlWidgets = {};
		this.DisplayWidgets = {};
		this.ControlSites = {};
		
		// our `Event' type conflicts with prototype
		// this.NotifyEvent = new Event();
		
	    this.domContainer = TemplateManager.GetTemplate( this.template );	
	    this.domContainer.ownerControl = this;
    	
	    var controlWidgets = DOMElement.getElementsByClassName( this.domContainer,"*", "ControlWidget" );
	    AttachWidgets( controlWidgets, this.ControlWidgets, this );

	    var displayWidgets = DOMElement.getElementsByClassName( this.domContainer,"*", "DisplayWidget" );
        AttachWidgets( displayWidgets, this.DisplayWidgets, this );

   	    var controlSites = DOMElement.getElementsByClassName( this.domContainer,"*", "ControlSite" );
   	    AttachWidgets( controlSites, this.ControlSites, this );
    }
    
    /**
	* Attach child control to parent control
	* TODO: simplify this so we don't have to tell it where to attach,
	* also would be nice to include adding object ref also see wiki ConstructionNote1
	* @object {object} This is the reference to the control we want to attach
	* @name {string} this is the name of the attachment point we want to use see
	* http://www.ubernote.com/wiki/ow.asp?ConstructionNote1
	*/	
	function AttachControl( object, name )
	{
	    try
	    {
	        /* the `site' is a dom element initially after we process html template */
	        //var testanchor = document.getElementById( "menuAnchorPoint" );
	        //testanchor.appendChild( this.domContainer );
	        //var tempref = this.ControlSites[name];
		    var el = this.ControlSites[name].parentNode.replaceChild( object.domContainer, this.ControlSites[name] );
		    object.parent = this; // inject parent ref
		    this[name] = object; // set ref to actual object instead of domcontainer
    	}
    	catch( ex )
    	{
    	    alert( "Error attaching control" + ex );
    	}
	
	}

    function AttachWidgets( in_aobjWidgetsHTML, in_aobjAttachmentPoint, in_objOwner )
	{
	    for( var i=0; i < in_aobjWidgetsHTML.length; i++ )
        {
            var strName = DOMElement.getName( in_aobjWidgetsHTML[i] );
	        in_aobjAttachmentPoint[ strName ] = in_aobjWidgetsHTML[i]; // add references
		    in_aobjWidgetsHTML[i].owner = in_objOwner;
        } // end for
	}
    	
	
	/**
	* Call this method to update this view.
	* @
	*/
	function Update()
	{
	}

	/**
	* Deprecate this.. we are using messages instead
	* Call this method to send a user action to the controller
	
	function Notify()
	{
		this.NotifyEvent.Raise.apply( this, arguments );
	}
	*/

}