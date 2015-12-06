/*
*	class ViewsControl: This is a UI accordion-type control that displays user views 
*	@param parent {object} ref to the application object that owns the control
*/
function ViewsControl( parent ) 
{	
	var me = this;	
	this.type = "viewscontrol";
	this.control = this;
	this.parent = parent;

	this.domContainer = document.getElementById( "catpane" );
	this.viewPaneDomContainer = DOMElement.getElementsByClassName( document, '*', "viewsPaneDiv" )[ 0 ];
	this.viewsCollection = new HashArray();
	this.viewsCollection.init();
	this.selectedView = null;
		
	/* methods */
	this.userViewDelete = userViewDelete;//(object view)
	this.loadAll = loadAll;//()
	this.userViewAdd = userViewAdd;//()
	this.toggleUserView = toggleUserView;//()
	this.getViews = getViews;
	this.m_strMessagingID = Messages.generateID();
	
	
	/**
	*	Deletes a user view in the database
	*	@param {object} reference to the view app object that we want to delete
	*/
	function userViewDelete( view )
	{
		var resp = UberXMLHTTPRequest.callWebServiceSafeSync( "UserViewRemove", "userViewID=" + view.m_strViewID );
		view.domContainer.parentNode.removeChild(view.domContainer);
		me.viewsCollection.removeByKey( view.m_strViewID );
	}
	
	/**
	* Shows/Hides the user view pane in the UI
	*/
	function toggleUserView()
	{	
		var el = document.getElementById("catpane");
		if( el.style.display == "none" )
		{	
			el.style.display = "block"; 
		}
		else
		{	
			el.style.display = "none"; 
		}
	}

	/** 
	*	Adds a new user view.  Prompts user for name of new view and saves to database
	*/
	function userViewAdd()
	{	
		var name = prompt('Please enter the name of the view you wish to create', '');
		var resp = UberXMLHTTPRequest.callWebServiceSafeSync( "UserViewAdd", "name="+name );
		var objViewDisplay = new ViewDisplay();
		objViewDisplay.init( resp.responseXML.text, me.viewPaneDomContainer, "View" );
    	me.viewsCollection.add( objViewDisplay.m_strViewID, objViewDisplay );
	}
	
	/**
	* Gets the collection of all user views from the database
	*/
	function loadAll()
	{	
	    var objOutput = { 
	        User_View: [ {
	            PK_View_ID: Util.convertSQLServerUniqueID,
	            Name: undefined
	        } ] 
	    };

	    Util.callDBActionAsync( 'UserViewsGet', undefined, objOutput, OnLoadAllComplete );
	}

	function OnLoadAllComplete( in_objDecodedItems )
	{
	    for ( var nIndex = 0, objItem; objItem = in_objDecodedItems.User_View[ nIndex ]; ++nIndex )
        {	
	        var objViewDisplay = new ViewDisplay();
	        objViewDisplay.init( objItem.PK_View_ID, me.viewPaneDomContainer, 'View' );
	        me.viewsCollection.add( objItem.PK_View_ID, objViewDisplay );
        } // end for
	}
	
	function getViews()
	{
	    return me.viewsCollection;
	}
} // class ViewsControl