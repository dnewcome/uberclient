
function ListDisplay()
{
    this.m_objDisplayCallbacks = undefined;
    this.length = undefined;

    this.m_objListItems = undefined;
            
    ListDisplay.Base.constructor.apply( this );
}
UberObject.Base( ListDisplay, Display );

ListDisplay.prototype.loadConfigParams = function()
{
    ListDisplay.Base.loadConfigParams.apply( this );
    this.extendConfigParams( {
        m_strListItemAreaSelector: { type: 'string', bRequired: false, default_value: undefined },
        m_strItemTemplate: { type: 'string', bRequired: false },
        m_strHasItemsClassName: { type: 'string', bRequired: false, default_value: '' }
    }, true );
};

/**
* init - Do intialization.
* @param {object} Configuration object.
* @returns {bool} true if successfully initialized, false otw.
*/
ListDisplay.prototype.init = function( in_objConfig )
{
    var bRetVal = this.initWithConfigObject( in_objConfig );
    if( bRetVal )
    {        
        this.m_objDisplayCallbacks = new HashArray();
        this.m_objDisplayCallbacks.init();
        
        this.m_objListItems = new HashArray();
        this.m_objListItems.init();
        
        this.length = 0;
    } // end if
    return bRetVal;
};

ListDisplay.prototype.teardown = function()
{
    this.m_objDisplayCallbacks.teardown();
    this.m_objDisplayCallbacks = null;
    
    this.m_objListItems.teardown();
    this.m_objListItems = null;

    ListDisplay.Base.teardown.apply( this );
};

/**
* addHTMLItem - attach a menu item.
* @param {String} in_strID - child element ID
* @param {Object} in_objItemElement - DOM Element of item.
* @param {Function} in_fncDisplayCheck (optional) - Function to see if item should be
*   displayed upon show.
* @param {Object} in_objContext (optional) - Context to call function in.
* @param {Number} in_nIndex (optional) - index to put the menu item - if not given, place at the end.
* @param {Function} in_fncInsertFunction (optional) - Optional function to do insertion.  Must be 
*   given the insert before and the insertion point.
*/
ListDisplay.prototype.addHTMLItem = function( in_strID, in_objItemElement, in_fncDisplayCheck, 
    in_objContext, in_nIndex, in_fncInsertFunction )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    Util.Assert( TypeCheck.Object( in_objItemElement ) );
    Util.Assert( TypeCheck.UFunction( in_fncDisplayCheck ) );
    Util.Assert( TypeCheck.UObject( in_objContext ) );
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    Util.Assert( TypeCheck.UFunction( in_fncInsertFunction ) );
    
    /* We use these to get back at both the display and the ItemID 
     * when we select an item.  It keeps us from having to keep another
     * list that keeps track of which item we are selecting.
     */
    in_objItemElement._uberItemID = in_strID;

    if( ! this.m_objListItems.getByKey( in_strID ) )
    {   // Do not re-add if already added.  Could be already added if this is called
        // via addDisplay.
        this.m_objListItems.add( in_strID, in_objItemElement, in_nIndex );
    } // end if
    
    this._addDisplayCheck( in_strID, in_objItemElement, in_fncDisplayCheck, in_objContext );
    this._insertItemElement( in_strID, in_objItemElement, in_nIndex, in_fncInsertFunction );    
    
    this.length++;
    
    if( 1 === this.length )
    {
        this.Raise( 'listhasitems' );
        if( this.m_strHasItemsClassName )
        {
            this.$().addClassName( this.m_strHasItemsClassName );
        } // end if
    } // end if

    this.Raise( 'listitemadd', [ in_strID ], true );
};

/**
* addDisplay - Add a display to the list.  Attaches disp,lay to DOM.
* @param {String} in_strID (optional) - ID of item for later retrieval.  
*    If none given, one is generated.
* @param {Object} in_objDisplay - Display based object to display.
* @param {Function} in_fncDisplayCheck (optional) - callback to call to see 
*       if we should display the item on "show"
* @param {Object} in_objContext (optional) - Context to call the callback and display in. 
*       If none given, run in the ListDisplay's context.
* @param {Number} in_nIndex (optional) - Index where to put the display, if none given
*       insert at the end.
* @returns {string} ID of item if successful, undefined otw.
*/
ListDisplay.prototype.addDisplay = function( in_strID, in_objDisplay, in_fncDisplayCheck, in_objContext, in_nIndex )
{
    Util.Assert( TypeCheck.Object( in_objDisplay ) );
    Util.Assert( TypeCheck.Display( in_objDisplay ) );
    Util.Assert( TypeCheck.UFunction( in_fncDisplayCheck ) );
    Util.Assert( TypeCheck.UObject( in_objContext ) );
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    
    var strRetVal = undefined;
    var strID = in_strID || in_objDisplay.m_strMessagingID;
    
    if( TypeCheck.Undefined( this.getByID( strID ) ) )
    {
        // Default to inserting the display directly.
        var objItemElement = in_objDisplay.$();
        var fncInsert = undefined;
        if( this.m_strItemTemplate )
        {
            var objItemElement = TemplateManager.GetTemplate( this.m_strItemTemplate );

            // Create menu item then attach the display to it, then attach the menu item.        
            var objContentElement = DOMElement.getSingleElementByClassName( objItemElement, 'elementContent', 0 );
            Util.Assert( objContentElement );
            in_objDisplay.attachDom( objContentElement, null );
            objItemElement = objContentElement;
        } // end if
        else
        {
            fncInsert = function( in_objInsertionPoint, in_objInsertBefore )
            {
                in_objDisplay.attachDom( in_objInsertionPoint, in_objInsertBefore );
            };
        } // end if

        this.m_objListItems.add( strID, in_objDisplay, in_nIndex );
        this.addHTMLItem( strID, objItemElement, in_fncDisplayCheck, in_objContext, in_nIndex, fncInsert );
        
        // Attach to DOM/Display.  
        //  Use the display facilities to keep track of which items we have.  Since
        //  we are using attachDisplay, once we attach the item, we do not have to 
        //  tear it down on teardown manually, that will happen via the Display's 
        //  teardown.
        this.attachDisplay( strID, in_objDisplay, in_nIndex );
        
        strRetVal = strID;
    } // end if
    
    return strRetVal;
};



    
/**
* findItemElement - Find the list item element if mousing over the selection element.
* @param {Object} in_objHead - the head to start searching from.
* @param {String} in_strItemSelector - The selector to find within the element.
* @returns {Object} - Element of the list item if mousing over selection item, undefined otw.
*/
ListDisplay.prototype.findItemElement = function( in_objHead, in_strItemSelector )
{
    var objItemElement = this._findItemContainerElement( in_objHead );
    var objElement = objItemElement;
    var objRetVal = undefined;
    
    if( in_strItemSelector && objElement )
    {   // set the stop element as the item element.  objElement will be undefined
        // if mousing over a list item, but not over a selected element.
        objElement = this._findItemElementWithSelector( in_objHead, objElement, in_strItemSelector );
    } // end if
    
    if( objElement )
    {   // moused over have a valid selection item.
        objRetVal = objItemElement;
    } // end if
    
    return objRetVal;
};

/**
* _findItemContainerElement - find the ancestrial list element given the starting point
* @param {Object} in_objStartPoint - starting point to work up the tree from
* @returns {Object} List element if found and part of this list display, 
*    undefined otw.
*/
ListDisplay.prototype._findItemContainerElement = function( in_objStartPoint )
{
    /**
    * we do the !this.m_objListItems.getByKey( element._uberItemID ) check because
    *   we could have a list within a list, and we want to make sure we are finding
    *   for the right list.  Without this check, we will set highlights on inner lists
    *   even if the listhighlightplugin was not added to that list.
    */
    var objElement = in_objStartPoint;
    while( objElement && ( ( !objElement._uberItemID ) 
          || ( !this.m_objListItems.getByKey( objElement._uberItemID ) ) )
        && ( objElement != this.m_objDomContainer ) )
    {
        objElement = objElement.parentNode;
    } // end while
    
    if( objElement == this.m_objDomContainer || null == objElement ) 
    {
        objElement = undefined;
    } // end if
    
    return objElement;
};

/**
* @private 
* _findItemElementWithSelector - Find the selection element if a selector given.  The
* @param {Object} in_objHead - the head to start searching from.
* @param {Object} in_objStopElement - the item element to stop searching at.
* @param {String} in_strItemSelector - selector to use to find the element.
*/
ListDisplay.prototype._findItemElementWithSelector = function( in_objHead, in_objStopElement, 
    in_strItemSelector )
{
    var objRetVal = in_objHead;
    while( ( objRetVal != in_objStopElement )
        && ( ! Element.hasClassName( objRetVal, in_strItemSelector ) ) )
    {
        objRetVal = objRetVal.parentNode; 
    } // end while
    
    if( ! Element.hasClassName( objRetVal, in_strItemSelector ) )
    {   // not found, clear the return value.
        objRetVal = undefined;
    } // end if
    
    return objRetVal;
};
    
/**
* getElementByID - gets a menu item
* @param {String} in_strID - ID of the menu item to get.
* @returns {Object} the HTML Element of the item given by 
*       in_strID if exists, undefined otw.
*/
ListDisplay.prototype.getElementByID = function( in_strID, in_strSelector )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    
    var vRetVal = this.m_objListItems.getByKey( in_strID );
    
    if( vRetVal )
    {   
        vRetVal = this.getElementForItem( vRetVal, in_strSelector );
    } // end if
    
    return vRetVal;
};

/**
* getElementByIndex - gets a menu item
* @param {Number} in_nIndex - Index of menu item to get.
* @returns {Object} the HTML Element of the item given by 
*       in_strID if exists, undefined otw.
*/
ListDisplay.prototype.getElementByIndex = function( in_nIndex, in_strSelector )
{
    Util.Assert( TypeCheck.Number( in_nIndex ) );
    
    var vRetVal = this.m_objListItems.getByIndex( in_nIndex );
    
    if( vRetVal )
    {   
        vRetVal = this.getElementForItem( vRetVal, in_strSelector );
    } // end if
    
    return vRetVal;
};

/**
* getElementForItem - get the DOM Element for a list item.
* @param {Object} in_objItem - List item to get the DOM Element for.
* @param {String} in_strSelector (optional) - If given, return a child
*   element of the DOM element as specified by the selector.
*/
ListDisplay.prototype.getElementForItem = function( in_objItem, in_strSelector )
{
    Util.Assert( TypeCheck.Object( in_objItem ) );
    Util.Assert( TypeCheck.UString( in_strSelector ) );
    
    var vRetVal = in_objItem;
    
    if( vRetVal.$ )
    {   // a display, re-assign to the element.
        vRetVal = vRetVal.$();
    } // end if
    // We do this because the display dom container could be wrapped in another element 
    //  and we don't actually have the outer list element.
    vRetVal = this.findItemElement( vRetVal );
    
    if( vRetVal && in_strSelector )
    {
        vRetVal = vRetVal.down( in_strSelector );
    } // end if
    
    return vRetVal;
};


/**
* getIndexByID - get the index of an item by the ID
* @param {String} in_strID - ID of item to get index for
* @return {Number} index if ID valid, undefined otw.
*/
ListDisplay.prototype.getIndexByID = function( in_strID )
{
    Util.Assert( TypeCheck.String( in_strID ) );

    var nRetVal = this.m_objListItems.getIndexByKey( in_strID );
    return nRetVal;
};

/**
* getIDByIndex - get the index of an item by the ID
* @param {Number} in_nIndex - index to get ID for.
* @return {String} ID of item if valid, undefined otw.
*/
ListDisplay.prototype.getIDByIndex = function( in_nIndex )
{
    Util.Assert( TypeCheck.Number( in_nIndex ) );

    var strRetVal = this.m_objListItems.getKeyByIndex( in_nIndex );
    return strRetVal;
};

/**
* getByID - get the child item by ID.
* @param {Number} in_nIndex - index to check.
* @returns {Object} - Item stored at the index.
*/
ListDisplay.prototype.getByID = function( in_strID )
{
    Util.Assert( TypeCheck.String( in_strID ) );

    var objRetVal = this.m_objListItems.getByKey( in_strID );
    return objRetVal;
};

/**
* getByIndex - get the child item by index.
* @param {Number} in_nIndex - index to check.
* @returns {Object} - Item stored at the index.
*/
ListDisplay.prototype.getByIndex = function( in_nIndex )
{
    Util.Assert( TypeCheck.Number( in_nIndex ) );

    var objRetVal = this.m_objListItems.getByIndex( in_nIndex );
    return objRetVal;
};

/**
* removeItem - removes a menu item
* @param {String} in_strID - ID of the menu item to get.
* @returns {Object} - If Display was attached and found, the display, 
*       if HTML Element attached and found, the HTML element, undefined otw.
*/
ListDisplay.prototype.removeItem = function( in_strID )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    
    var vRetVal = this.getElementByID( in_strID );
    if( vRetVal )
    {
        var nIndex = this.getIndexByID( in_strID );
                
        this.$( this.m_strListItemAreaSelector ).removeChild( vRetVal );

        vRetVal = this.detachDisplay( in_strID ) || vRetVal; // won't blow up HTML elements
        this.m_objDisplayCallbacks.removeByKey( in_strID );        
        this.m_objListItems.removeByKey( in_strID );

        this.length--;

        if( 0 === this.length )
        {
            this.Raise( 'listempty' );
            if( this.m_strHasItemsClassName )
            {
                this.$().removeClassName( this.m_strHasItemsClassName );
            } // end if
        } // end if
        
        
        this.Raise( 'listitemremove', [ in_strID ], true );
    } // end if
    
    return vRetVal;
};

/**
* reid - reid's a member.
* @param {String} in_strOldKey - Old key to replace
* @param {String} in_strNewKey - New key to replace with
* @returns {Object} the reid'd object on successful, undefined otw.
*/
ListDisplay.prototype.reid = function( in_strOldID, in_strNewID )
{
    var vRetVal = this.getByID( in_strOldID );
    if( vRetVal )
    {
        // We have to do this before we do the reids or else we can't find the element.
        var objElement = this.getElementByID( in_strOldID );
        objElement._uberItemID = in_strNewID;

        this.m_aobjChildren.reid( in_strOldID, in_strNewID );
        this.m_objDisplayCallbacks.reid( in_strOldID, in_strNewID );
        this.m_objListItems.reid( in_strOldID, in_strNewID );
    } // end if
    
    return vRetVal;
};

/**
* removeTeardownItem - Removes and tears down an item
* @param {String} in_strID - ID to teardown.
*/
ListDisplay.prototype.removeTeardownItem = function( in_strID )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    
    var objDisplay = this.removeItem( in_strID );
    if( objDisplay && objDisplay.teardown )
    {
        objDisplay.teardown();
    } // end if
};

/**
* removeTeardownAll - remove everybody in our list.
*/
ListDisplay.prototype.removeTeardownAll = function()
{
    for( var nIndex = this.length - 1, strKey; strKey = this.m_objListItems.getKeyByIndex( nIndex ); nIndex-- )
    {
        this.removeTeardownItem( strKey );
    } // end for

    this.length = 0;
};

/**
* show - Show us
*/
ListDisplay.prototype.show = function()
{	
    this._displayPoll();      // see which items we should display
    
    ListDisplay.Base.show.apply( this, arguments );	
};

/**
* _insertItemElement - insert an item element into the list
* @param {String} in_strID - ID of element being inserted.
* @param {Object} in_objItemElement - Item Element to insert
* @param {Number} in_nIndex (optional) - index to insert to, if not given, place at end
*/
ListDisplay.prototype._insertItemElement = function( in_strID, in_objItemElement, in_nIndex, 
    in_fncInsertCallback )
{
    var nIndex = Util.AssignIfDefined( in_nIndex, this.length );
    var objListElement = this.$( this.m_strListItemAreaSelector );
    var objInsertBefore = objListElement.childNodes[ nIndex ] || null;
    
    $( in_objItemElement );
    
    if( in_fncInsertCallback )
    {
        in_fncInsertCallback( objListElement, objInsertBefore );
    } // end if
    else
    {
        objListElement.insertBefore( in_objItemElement, objInsertBefore );
    } // end if-else
    
};


/**
* _addDisplayCheck - Adds a display check to the list.
* @param {String} in_strID - ID to attach check to.
* @param {Object} in_objElement - Element that we are displaying.
* @param {Function} in_fncDisplayCheck (optional) - Display check function
* @param {Object} in_objContext (optional) - Context to run check in
*/
ListDisplay.prototype._addDisplayCheck = function( in_strID, in_objElement, in_fncDisplayCheck, in_objContext )
{
    Util.Assert( TypeCheck.String( in_strID ) );
    Util.Assert( TypeCheck.Object( in_objElement ) );
    Util.Assert( TypeCheck.UFunction( in_fncDisplayCheck ) );
    Util.Assert( TypeCheck.UObject( in_objContext ) );
    
    /* set up the display callback */
    if( in_fncDisplayCheck )
    {
        var objCallback = new FunctionContainer( in_fncDisplayCheck, in_objContext, {element: in_objElement} );
        this.m_objDisplayCallbacks.add( in_strID, objCallback );
    } // end if
};

ListDisplay.prototype._displayPoll = function()
{
    // Loop through each function container, ask each function container its
    //  element should display or not.  If a menu item does not have a function container
    //  it is shown by default and this will never query that element.
    this.Raise( 'displaypollpre', [], true );
    for( var nIndex = 0, objCurrCallback; 
        objCurrCallback = this.m_objDisplayCallbacks.getByIndex( nIndex ); nIndex++ )
    {
        var objElement = objCurrCallback.m_vExtraInfo.element;
        // this.m_objContext may be set by a plugin (ListMenuPlugin for example)   
        var strFunction = objCurrCallback.callFunctionContexted( objCurrCallback.m_objContext || this.m_objContext ) ? 'show' : 'hide';

        DOMElement[ strFunction ]( objElement );
    } // end for
};


/**
* hideAll - Hide all of the items.
*/
ListDisplay.prototype.hideAll = function()
{
    this.m_objListItems.each( Display.prototype.hide );
};

/**
* showAll - show all of the items.
*/
ListDisplay.prototype.showAll = function()
{
    this.m_objListItems.each( Display.prototype.show );
};

/**
* showItems - show the specified items in the list
* @param {Array} in_astrItemIDs - Array of IDs of items to show.
*/
ListDisplay.prototype.showItems = function( in_astrItemIDs )
{
    Util.Assert( TypeCheck.Array( in_astrItemIDs ) );
    
    this.hideAll();
    
    for( var nIndex = 0, strID; strID = in_astrItemIDs[ nIndex ]; ++nIndex )
    {
        objDisplay = this.getByID( strID );
        DOMElement.show( objDisplay.$() );
    } // end for
};

/**
* each - run a function on each item in the list.  Runs in reverse index order.
*/
ListDisplay.prototype.each = function( in_strFunction, in_strContext )
{
    for( var nIndex = this.m_objListItems.length - 1, strKey; strKey = this.m_objListItems.getKeyByIndex( nIndex ); --nIndex )
    {
        var objItem = this.m_objListItems.getByKey( strKey );
        in_strFunction.apply( in_strContext || objItem, [ objItem, strKey ] );
    } // end for
};