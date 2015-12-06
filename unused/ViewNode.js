
/**
* class ViewNode: This is a ViewNode 'model'.  
*   The ViewNode model object does database type stuff, keeps track of the data
*   for one ViewNode, and sends messages on name changes and the like.
*/

function ViewNode()
{
    this.m_strUserCategoryID = undefined;
    this.m_strUserViewID = undefined;
    this.m_objParentViewNode = undefined;
    this.m_objChildren = undefined;

    Model.apply( this );
}

ViewNode.prototype = new Model();

ViewNode.prototype.init = function( in_strID, in_objParentViewNode, in_strUserCategoryID, in_strUserViewID )
{
    this.m_strMessagingID = in_strID;
    this.m_strUserCategoryID = in_strUserCategoryID;
    this.m_strUserViewID = in_strUserViewID;
    this.m_objParentViewNode = in_objParentViewNode;

    Model.prototype.init.apply( this, [ 'viewnode', in_strID ] );

    // Holds a container to our children.  It is attached to us, 
    //      so it will receive some messages for us.
    // We are commenting this out for now until we actually get a tree-structure.  
    //  It offers no advantages at the moment, only added complexity.
    /*this.m_objChildren = new ViewNodes();           
    this.m_objChildren.init( this );*/
};
	
/**
* Register our message handlers 
*/
ViewNode.prototype.RegisterMessageHandlers = function()
{
    this.RegisterListener( 'requestviewnodesetcategory', Messages.all_publishers_id, this.setCategory );
    Model.prototype.RegisterMessageHandlers.apply( this );
};

/**
*   External Accessor functions
*/


/**
* get the parent ViewNode
*/
ViewNode.prototype.getParentViewNode = function()
{
    return this.m_objParentViewNode;
};

/**
* get the Category ID
*/
ViewNode.prototype.getUserCategoryID = function()
{
    return this.m_strUserCategoryID;
};

ViewNode.prototype.getCategory = function()
{
    return app.usercategories.getByID( this.m_strUserCategoryID );
};

/**
* get the UserView ID
*/
ViewNode.prototype.getUserViewID = function()
{
    return this.m_strUserViewID;
};


/**
* deleteMe - Delete the ViewNode.
* @param {String} in_strModelID - the model ID - ignored.
* @param {Date} in_dtUpdate - update date - ignored.
* @param {bool} in_bSkipDBSave - If true, skip the DB save.  Assumes false.
* @returns {bool} true and sends a 'viewnodedelete' message if successful.
*/
ViewNode.prototype.deleteMe = function( in_strModelID, in_dtUpdate, in_bSkipDBSave )
{
    var objConfig = {
        userViewNodeID: this.m_strID
    };
        
    var bRetVal = Model.prototype.deleteMe.apply( this, [ 'UserViewNodeRemove', objConfig, in_bSkipDBSave ] );    
	return bRetVal;
};

/**
* setCategory - Change the category this ViewNode is attached to
*   Sends a 'viewnodesetcategory' message if successful.
* @in_strCategoryID {string} - New category ID
*/
ViewNode.prototype.setCategory = function( in_strCategoryID )
{
    var objConfig = {
        userViewNodeID: this.m_strID,
        categoryID: in_strCategoryID
    };
    
    var objTranslation = {
        m_strUserCategoryID: in_strCategoryID
    };
    
    var objMessages = {
        viewnodesetcategory: in_strCategoryID
    };
    
	/* This doesn't exist yet! */
    var bRetVal = this.dbSaveAction( 'UserViewNodeSetCategory', objConfig, objTranslation, objMessages );
	return bRetVal;
};










/**
*
* class ViewNodes: This is ViewNodes collection 'model'.  
*
*/

/**
* Constructor - Create a ViewNodes collection.  Can be standalone or attached to a ViewNode.
* @in_objParentViewNode {object} (optional) - the ViewNode this collection is attached to.  
*       If null or undefined, this ViewNodes collection is not attached to a ViewNode and is a 'root'.
*/
function ViewNodes()
{
    this.m_objParentViewNode = null;
    this.m_objViewnodesForCategory = undefined;
    this.m_strUserViewID = undefined;
    
    ModelCollection.apply( this );
}
ViewNodes.prototype = new ModelCollection();

/**
* init - initialize the object
* @param {Object} in_objParentViewNode (optional) - the parent view node
*/
ViewNodes.prototype.init = function( in_objParentViewNode )
{
    if( in_objParentViewNode )
    {   // means we are attached.
        // If we are attached to a ViewNode, we are recieving messages 
        //      like 'requestviewnodeadd' for that ViewNode.
        this.m_strMessagingID = in_objParentViewNode.getID();
        this.m_objParentViewNode = in_objParentViewNode;
        this.m_strUserViewID = in_objParentViewNode.getUserViewID();
    } // end if
    
    // Just a simple key/value pair of ViewNode/Category bindings
    this.m_objViewnodesForCategory = {};
    
    ModelCollection.prototype.init.apply( this, [ 'viewnode' ] );
};

/**
*   Externally callable functions.
*/

/**
* getViewNodeForCategoryID - get the view node for a category.  
*   We hold this here because each view node can have one category,
*   but each category can be attached to multiple view nodes.
*   We should really be returning multiples, but for right now we'll fudge 
*   it and return one.
* @param {String} in_strCateogryID - Category ID to get the view node for.
* @returns {Object} ViewNode for the given category if found, undefined otw.
*/
ViewNodes.prototype.getViewNodeForCategoryID = function( in_strCategoryID )
{
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    
    var objRetVal = undefined;
    var strViewNodeID = this.m_objViewnodesForCategory[ in_strCategoryID ];

    if( strViewNodeID )
    {
        objRetVal = this.m_aobjChildren.getByKey( strViewNodeID );
    } // end if
        
    return objRetVal;
};

/**
* getID - Return our ID.
*/
ViewNodes.prototype.getID = function()
{
    return this.m_strMessagingID;
};

/**
* getLength - Get how many view nodes are attached to the collection.
* @returns {Number} number of view nodes attached to collection.
*/
ViewNodes.prototype.getLength = function()
{
    return this.m_aobjChildren.length;
};


/**
* Add a ViewNode - if successfully added to the database, 
*   creates a ViewNode and sends a 'viewnodeadd' with that ViewNode 
* @in_strCategoryID {string} - Category ID to attach to 
*/
ViewNodes.prototype.add = function( in_strCategoryID )
{
    Util.Assert( TypeCheck.String( in_strCategoryID ) );
    
    var bRetVal = false;
    
    // don't want to re-add if we already have a viewnode with this category id.
    if( ! this.m_objViewnodesForCategory[ in_strCategoryID ] )
    {
        var strUserViewID = this.m_strUserViewID;
        var strUserViewNodeParentID = null;
        // Use these if there is a parent.
        if( this.m_objParentViewNode )
        {
            strUserViewID = this.m_objParentViewNode.getUserViewID();
            strUserViewNodeParentID = this.getID();
        } // end if
        
        bRetVal = ModelCollection.prototype.add.apply( this, [ strUserViewNodeParentID, 
            in_strCategoryID, strUserViewID ] );
    } // end if
    return bRetVal;
};


/**
*   Database related functions
*/

ViewNodes.prototype.dbLoadAll = function( in_strUserViewID )
{
    Util.Assert( TypeCheck.String( in_strUserViewID ) );
    
    var bRetVal = false, strDBAction = 'UserViewNodesGetByView';
    // only update the UserViewID if one has been assigned.  Otherwise, 
    //  take the value from init.
    this.m_strUserViewID = Util.AssignIfDefined( in_strUserViewID, 
        this.m_strUserViewID );
    
    var objInputArguments = {
        userViewID: in_strUserViewID
    };	
    
    if( this.m_objParentViewNode )
    {   // We are attached, get by our view node
        strDBAction = 'UserViewNodesGet';
        objInputArguments = {
            userViewNodeID: this.m_objParentViewNode.getID()
        };	
    } // end if

    var objOutputArguments =
    {   // An array of User_Categories with the following fields.
        User_View_Node: [ {
            View_Node_ID: Util.convertSQLServerUniqueID,
            User_Category_ID: Util.convertSQLServerUniqueID
        } ]
    };
    
	var bRetVal = !!Util.callDBAction( strDBAction, objInputArguments, objOutputArguments );
	if( bRetVal )
	{
	    this.dbLoadAllComplete( objOutputArguments, in_strUserViewID );
	} // end if
	
	return bRetVal;
};

ViewNodes.prototype.dbLoadAllComplete = function( in_objDecodedItems, in_strUserViewID )
{
    for( var nIndex = 0, objCurrSet; ( objCurrSet = in_objDecodedItems.User_View_Node[ nIndex ] ) 
        && objCurrSet.View_Node_ID; ++nIndex )
    {
        var objModel = new ViewNode();
        objModel.init( objCurrSet.View_Node_ID, this.m_objParentViewNode, 
            objCurrSet.User_Category_ID, in_strUserViewID );
        // save off the binding.
        this.m_objViewnodesForCategory[ objCurrSet.User_Category_ID ] = objCurrSet.View_Node_ID;
        this.insert( objCurrSet.View_Node_ID, objModel );	        
    } // end for
};

/**
* Add a ViewNode to the database - 
*   Returns the dataset if correctly added, NULL otw.
* @in_strUserViewNodeParentID {string} - The ID of the parents ViewNode.
* @in_strCategoryID {string} - Category ID to attach to 
* @in_strUserViewID {string} - User View ID
*/
ViewNodes.prototype.dbAdd = function( in_strUserViewNodeParentID, in_strCategoryID, in_strUserViewID )
{
    var objRetVal = undefined;
    
    var objInputArguments = {
        userViewID: in_strUserViewID,
        userViewNodeParentID: in_strUserViewNodeParentID,
        userCategoryID: in_strCategoryID
    };	

    var me=this;
    var OnComplete = function( in_objResponse )
    {
	    if( in_objResponse ) 
	    {   // XXX Get this good!
            // IE first, W3C next
	        var strID = in_objResponse.responseXML.text || 
	            ( in_objResponse.responseXML.firstChild && in_objResponse.responseXML.firstChild.textContent );
    	    strID = strID.toLowerCase();
    	    
	        var objModel = new ViewNode();
	        objModel.init( strID, me.m_objParentViewNode, in_strCategoryID, in_strUserViewNodeParentID );

    	    // save off the binding.
            me.m_objViewnodesForCategory[ in_strCategoryID ] = strID;

    	    me.OnDBAddComplete( objModel );
	    } // end if
    };
    
	var objRetVal = Util.callDBActionAsync( 'UserViewNodeAdd', objInputArguments, undefined, OnComplete );
	return objRetVal;
};

/**
* dbProcessBatchPost - Batch load a set of categories
* @param {Object} in_objBatch - an object with a list of category IDs.
* @returns {Object} Request object if successfully made, undefined otw.
*/
ViewNodes.prototype.dbProcessBatchPost = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
    
    var objRetVal = undefined;
    if( in_objBatch.m_nCount > 0 )
    {
        var objInputArguments = {
            userViewNodeIDs: in_objBatch.all_model_ids
        };	

        var objOutputArguments =
        {   // An array of User_Categories with the following fields.
            ViewNodes/*View_Nodes*/: [ {
                View_Node_ID: undefined,
                User_Category_ID: undefined
            } ]
        };

	    objRetVal = Util.callDBActionAsync( 'UserViewNodeBatchGet', objInputArguments, 
	        objOutputArguments, this.loadDecodedItems, this );
	} // end if
	
	return objRetVal;
};

ViewNodes.prototype.loadDecodedItems = function( in_objDecodedItems )
{
    for( var i = 0, objCurrSet; ( objCurrSet = in_objDecodedItems.ViewNodes[ i ] ) 
        && objCurrSet.View_Node_ID; i++ )
    {
        var strID = objCurrSet.View_Node_ID.toLowerCase();
        var objModel = this.m_aobjChildren.getByKey( strID );
        if( ! objModel )
        {   // only create a model if new
            var strCatID = objCurrSet.User_Category_ID.toLowerCase();
            objModel = new ViewNode();
            objModel.init( strID, this.m_objParentViewNode, 
                strCatID, this.m_strUserViewID );
            // save off the binding.
            this.m_objViewnodesForCategory[ strCatID ] = strID;
            this.OnDBAddComplete( objModel );
        } // end if
        else
        {
            // the category may have changed
            // XXX Hook this up!
        } // end if-else
        
        this.raiseLoad( objModel );    
    } // end for
};
