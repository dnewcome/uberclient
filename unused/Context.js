
/**
* Second rendition of the context menu.  Based on the original Context object.
*/
function Context()
{
    this.m_nMaxMenuNumber = 0;    
    this.m_strCurrentMenuID = undefined;
    
    UberObject.apply( this );
}
Context.prototype = new UberObject;

Context.prototype.RegisterMessageHandlers = function()
{
	this.RegisterListener( 'setmenumaxheight', Messages.all_publishers_id, this.setMaxHeight );
};

/**
* createNew - Gets a new menu id for us to work with.  
*   Returns a string with the ID of our menu.
* @param {object} in_objInsertionPoint (optional) - Optional attachment point.  
    If not given, will attach to the body
*/
Context.prototype.createNew = function( in_objInsertionPoint )
{
    var strMenuID = "context_menu" + this.m_nMaxMenuNumber;
    this.m_nMaxMenuNumber++;
    var objMenu = new Menu();
    objMenu.init( in_objInsertionPoint );
    this.m_aobjChildren.add( strMenuID, objMenu );    
    
    return strMenuID;
};

/**
* removeMenu - Removes a menu and its references.
*   returns true if successful, false otw.
* @param {String} in_strMenuID - MenuID to remove.
*/
Context.prototype.remove = function( in_strMenuID )
{
    Util.Assert( TypeCheck.String( in_strMenuID ) );

    var bRetVal = false;    
    var objMenu = this.m_aobjChildren.removeByKey( in_strMenuID );

    if( objMenu )
    {
        objMenu.teardown();
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* registerItem - Creates a new menu item on the specified menu.  Returns true if successful, false otw.
* @param {String} in_strMenuID - ID of the menu we want to add to.
* @param {String} in_strMenuText - Text to display
* @param {Function} in_fncCallback - Handler function for if this item is clicked.
* @param {Function} in_fncDisplayCallback (optional) - Function that decides when running showMenu whether this item will be displayed.  
*       If not passed in, always displays
* @param {object} in_objContext - Scope to call the handler function in.
* @param {Array} in_aArguments (optional) - Arguments to pass to the function/callback.  Only used
*   for messages.
*/
Context.prototype.registerItem = function( in_strMenuID, in_strMenuText, 
    in_fncCallback, in_fncDisplayCallback, in_objContext, in_aArguments )
{
    Util.Assert( TypeCheck.String( in_strMenuID ) );
    Util.Assert( TypeCheck.String( in_strMenuText ) );
    Util.Assert( TypeCheck.Function( in_fncCallback ) || TypeCheck.String( in_fncCallback ) );
    Util.Assert( ( !in_fncDisplayCallback ) || TypeCheck.Function( in_fncDisplayCallback ) );
    Util.Assert( TypeCheck.Undefined( in_objContext ) || TypeCheck.UberObject( in_objContext ) );
    Util.Assert( TypeCheck.UArray( in_aArguments ) );
    
    var bRetVal = false;
    var objCurrMenu = this.m_aobjChildren.getByKey( in_strMenuID );
    if( objCurrMenu )
    {
        var me = this;
    	objCurrMenu.addItem( in_strMenuText, function( in_objElement ) {
    	    me.hide( in_strMenuID );
    	    
    	    if( TypeCheck.Function( in_fncCallback ) )
    	    {
    	        in_fncCallback.call( in_objContext || me.m_objContext, in_objElement );
    	    } // end if
    	    else if( TypeCheck.String( in_fncCallback ) )
    	    {   // Raise as if we were the context.
    	        me.Raise( in_fncCallback, in_aArguments, undefined, 
    	            ( in_objContext || me.m_objContext ).m_strMessagingID );
    	    } // end if-else if
    	} // end function
    	, in_fncDisplayCallback, in_objContext );		
    	bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* registerItems - Add menu items from a configuration array.  
* @param {String} in_strMenuID - ID of the menu we want to add to.
* @param {Array} in_aobjConfig - array of configuration objects.
*   Each object in the array can have have:
*       string: string to use as text
*       callback: callback to call when selected
*       displaycheck: (optional) callback to use to check whether item is displayed on show
*       context: (optional) context to run callback and displaycheck in, can be 
*           overridden in function "show"
*/
Context.prototype.registerItems = function( in_strMenuID, in_aobjConfig )
{    
    Util.Assert( TypeCheck.String( in_strMenuID ) );
    Util.Assert( TypeCheck.Array( in_aobjConfig ) );
    
    var objCurrMenu = this.m_aobjChildren.getByKey( in_strMenuID );
    if( objCurrMenu )
    {
        for( var nIndex = 0, objItem; objItem = in_aobjConfig[ nIndex ]; ++nIndex )
        {   
            var fncCallback = objItem.callback;
            var fncDisplayCheck = objItem.displaycheck;     
            var objContext = objItem.context;
            var aArguments = objItem.arguments;
            
            this.registerItem( in_strMenuID, objItem.string, fncCallback, 
                fncDisplayCheck, objContext, aArguments );
        } // end for
    } // end if
};

/**
* registerSeparator - adds a seperator 
*   returns true if menu exists, false otw.
* @param {String} in_strMenuID - ID of the menu we want to add to.
* @param {Function} in_fncDisplayCallback (optional) - Function that decides when running showMenu whether this item will be displayed.  
*       If not passed in, always displays
* @param {object} in_objContext (optional) - Scope to call the handler function in.
*/
Context.prototype.registerSeparator = function( in_strMenuID, in_fncDisplayCallback, 
    in_objContext )
{
    Util.Assert( TypeCheck.String( in_strMenuID ) );
    Util.Assert( ( !in_fncDisplayCallback ) || TypeCheck.Function( in_fncDisplayCallback ) );
    Util.Assert( TypeCheck.Undefined( in_objContext ) || TypeCheck.Object( in_objContext ) );

    var objCurrMenu = this.m_aobjChildren.getByKey( in_strMenuID );
    var bRetVal = !!objCurrMenu;
    
    if( bRetVal )
    {
    	objCurrMenu.addSeparator( in_fncDisplayCallback, in_objContext );
    } // end if
    
    return bRetVal;
};

/**
* show - Show the menu.  Returns true if menu is found, false otw.  This will hide
*   any context menus that were already being shown.
* @param {String} in_strMenuID - ID of menu to show
* @param {object} in_objEvent (optional) - DOM event
* @param {object} in_objContext (optional) - Optional scope to run all of the functions in.
*   overrides any set previously.
*/
Context.prototype.show = function( in_strMenuID, in_objEvent, in_objContext )
{
    var bRetVal = false;
    var objCurrMenu = this.m_aobjChildren.getByKey( in_strMenuID );
    this.m_objContext = in_objContext;
    
    if( objCurrMenu )
    {
        if( this.m_strCurrentMenuID )
        {   // Hides any menus that were already shown.
            this.hide( this.m_strCurrentMenuID );
        } // end if
        
        this.m_strCurrentMenuID = in_strMenuID;
        
    	var objPosition = undefined;
    	
    	if( in_objEvent )
    	{
    	    objPosition = DOMEvent.documentCoordinates( in_objEvent );
    	    in_objEvent.cancelEvent();
		} // end if
		
		objCurrMenu.show( objPosition, in_objContext ); 
		objCurrMenu.setMaxHeight( this.m_nHeight );
		
		bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* hide - Hide a menu.  Returns true if menu is found, false otw.
* @param {String} in_strMenuID - ID of menu to hide
*/
Context.prototype.hide = function( in_strMenuID )
{
    var bRetVal = false;
    var objCurrMenu = this.m_aobjChildren.getByKey( in_strMenuID );
    
    if( objCurrMenu )
    {
        this.m_strCurrentMenuID = undefined;
		objCurrMenu.hide();
    } // end if
    
    return bRetVal;
};


/**
* setMaxHeight - set the maximum height of the context menu.
* @param {Number} in_nHeight - max height of the context menu.
*/
Context.prototype.setMaxHeight = function( in_nHeight )
{
    Util.Assert( TypeCheck.Number( in_nHeight ) );
    
    // Save this off for later because not all the menus may be created yet.
    this.m_nHeight = in_nHeight;
    
    // Do this because there may be a menu open when we do this.
    this.m_aobjChildren.each( function( in_objMenu ) {
        in_objMenu.setMaxHeight( in_nHeight );
    } );
};