/**
* Display - a base display for (eventually) all displays
*/
function Display()
{
    this.m_objDomContainer = undefined;
            
    // By default, the DOM is attached on init.  Override this 
    //  in inherited classes to attach the DOM later.
    this.m_bAttachDomOnInit = true;
    this.m_bDetachOnHide = false;

    this.m_aobjDOMElements = undefined;
    
    // Document to use for this item.    
    this.m_objDocument = document;
    
    return Display.Base.constructor.apply( this );
}
UberObject.Base( Display, UberObject );

TypeCheck.createForObject( 'Display' );

/**
* ID generator shared across all displays so we never have collisions.
*/
Display.IDGenerator = new UniqueIDGenerator( "mp_autodisplay" );

/**
* init - Initialize ourselves
* @param {Object} in_objInsertionPoint (optional) - DOM Element to attach to.
* @param {String} in_strTemplate (optional) - Name of the template to use for collection.
* @param {Object} in_objInsertBefore (optional) - If null, Display is placed 
*   as the last child of in_objInsertionPoint.  If undefined, 
*   in_objInsertionPoint point is replaced.  If specified otherwise,
*   DOM element to insert before inputed element.
* @returns {Boolean} true if template successfully loaded and attached, false otw.
*/
Display.prototype.init = function( in_objInsertionPoint, in_strTemplate, in_objInsertBefore )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( ( true == this.m_bAttachDomOnInit ) ? in_objInsertionPoint : true );
    Util.Assert( TypeCheck.String( in_strTemplate, 1 ) || TypeCheck.Defined( in_objInsertionPoint ) );

    var bRetVal = false;

    this.buildDom( in_strTemplate, in_objInsertionPoint );

    if( this.m_objDomContainer )
    {
        this.m_objInsertionPoint = in_objInsertionPoint;
        this.m_objInsertBefore = in_objInsertBefore;
        this.m_aobjDOMElements = {};
        
        bRetVal = Display.Base.init.apply( this );
    }    

    return bRetVal;
};

Display.prototype.dataStructuresReady = function()
{
    if( true == this.m_bAttachDomOnInit )
    {
        this.attachDom( this.m_objInsertionPoint, this.m_objInsertBefore );
    }
    
    return Display.Base.dataStructuresReady.apply( this );
};

/**
* Generic display parameters
*/
Display.prototype.loadConfigParams = function()
{
    var objConfigParams = {
        m_strTemplate: { type: 'string', bRequired: false },
        m_objInsertionPoint: { type: 'object', bRequired: false },
        m_objInsertBefore: { type: 'object', bRequired: false },
        m_objDocument: { type: 'object', bRequired: false, default_value: document },
        m_bAttachDomOnInit: { type: 'boolean', bRequired: false },
        m_bDetachOnHide: { type: 'boolean', bRequired: false },
        m_bGracefulReposition: { type: 'boolean', bRequired: false, default_value: true },
        type: { type: 'string', bRequired: false, default_value: 'display' }
    };

    Display.Base.loadConfigParams.apply( this );
    Object.extend( this.m_objConfigParams, objConfigParams );
    return this;
};

/*
* initWithConfigObject - do initialization via a configuration object.
*   This function calls init, so read init.
* @returns {Boolean} true if template successfully loaded and attached, false otw.
*/
Display.prototype.initWithConfigObject = function( in_objConfig )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( TypeCheck.Object( in_objConfig ) );
    
    var bRetVal = Display.Base.initWithConfigObject.apply( this, [ in_objConfig, true ] );
    
    bRetVal = bRetVal && Display.prototype.init.apply( this, [ this.m_objInsertionPoint, 
        this.m_strTemplate, this.m_objInsertBefore ] );

    return bRetVal;
};

Display.prototype.RegisterMessageHandlers = function()
{
	var me=this, all = Messages.all_publishers_id;
    me.RegisterListener( 'show', all, me.show )
        .RegisterListener( 'hide', all, me.hide )
        .RegisterListener( 'setHeight', all, me.setHeight );
    
    return Display.Base.RegisterMessageHandlers.apply( me );
};

/**
* buildDom - Builds the DOM from a template
* @param {String} in_strTemplate (optional) - HTML template to use for creation
* @param {Object} in_objInsertionPoint (contidtional) - Must be defined  if in_strTemplate is not valid.
*/
Display.prototype.buildDom = function( in_strTemplate, in_objInsertionPoint )
{
    var bTemplate = TypeCheck.String( in_strTemplate, 1 );
    Util.Assert( bTemplate || TypeCheck.Object( in_objInsertionPoint ) );

    if( this.m_objDomContainer )
    {
        this.teardownDom();
    }
    
    // Reset the remove from DOM flag
    this.m_bRemoveFromDOM = bTemplate;
    
    if( bTemplate )
    {   // Make a template
        this.m_objDomContainer = $( TemplateManager.GetTemplate( in_strTemplate ) );
    }
    else
    {   // Use this subtree from the insertion point.
        this.m_objDomContainer = $( in_objInsertionPoint );
    }
};


/**
* attachDom - allow us to attach to the DOM at a specific insertion point.  Allows for post-init
*   attachment as long as there is a m_objDomContainer.
* @param {Object} in_objInsertionPoint - Parent DOM element to attach to.
* @param {Object} in_objInsertBefore (optional) - DOM element to insert before - if none specified, 
*       place at the end of the children.
*/
Display.prototype.attachDom = function( in_objInsertionPoint, in_objInsertBefore )
{
    Util.Assert( in_objInsertionPoint );
	Util.Assert( this.m_objDomContainer );
    
    // If we post-attach the display (ie, call attachDom after creation),
    //  these are not set.  So to be sure, set these.
    this.m_objInsertionPoint = in_objInsertionPoint;
    this.m_objInsertBefore = in_objInsertBefore;
    
	if( TypeCheck.Defined( in_objInsertBefore ) )
	{
        this.attachToElement( in_objInsertionPoint, in_objInsertBefore );	
    }
    else
    {
        this.replaceElement( in_objInsertionPoint );
    }

	this.Raise( 'domavailable', undefined, true );

    this.RegisterDomEventHandlers();
    
    return this;
};

/**
* detachDom - Remove DOM message handlers and detach from parent
*/
Display.prototype.detachDom = function()
{
    Util.Assert( true == this.isInitialized() );
    
    if( this.m_objDomContainer.parentNode )  // only do this if we are actually attached.
    {
        this.UnRegisterDomEventHandlers();
        this.detachFromParent();
    }
    
    return this;
};


/**
* isAttached - finds if we are currently attached to the DOM
* @returns {Boolean} true if attached, false otw.
*/
Display.prototype.isAttached = function()
{
    Util.Assert( this.isInitialized() );
    var bRetVal = TypeCheck.Defined( document.body.parentElement ) ? 
        this.m_objDomContainer.parentElement : this.m_objDomContainer.parentNode;
    
    bRetVal = !! bRetVal;
    
    return bRetVal;
};


/**
* attachToElement - Attach the display to a position in the DOM
* @param {Object} in_objInsertionPoint - Parent DOM element to attach to.
* @param {Object} in_objInsertBefore (optional) - DOM element to insert before - if none specified, 
*       place at the end of the children.
*/
Display.prototype.attachToElement = function( in_objInsertionPoint, in_objInsertBefore )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( in_objInsertionPoint );

	in_objInsertionPoint.insertBefore( this.m_objDomContainer, in_objInsertBefore );
};


/**
* replaceElement - Attach the display to a position in the DOM, replaces the InsertionPoint
* @param {Object} in_objInsertionPoint - Parent DOM element to attach to.
*/
Display.prototype.replaceElement = function( in_objInsertionPoint )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( in_objInsertionPoint );
    Util.Assert( in_objInsertionPoint.parentNode );

	// Take all of the class names that were on the element we want to replace
	//  and put them on the element that does the replacing.
	var me=this;
	var astrClassNames = in_objInsertionPoint.className.split( /\s+/ );
	for( var strClassName, nIndex = 0; strClassName = astrClassNames[ nIndex ]; nIndex++ )
	{
	    DOMElement.addClassName( this.m_objDomContainer, strClassName );
	} // end for

    // if the parent had an ID, keep it.
    if( in_objInsertionPoint.id )
    {
        this.m_objDomContainer.id = in_objInsertionPoint.id;
    }

    // if the parent had a name, keep it.
    if( in_objInsertionPoint.name )
    {
        this.m_objDomContainer.name = in_objInsertionPoint.id;
    }
        
	in_objInsertionPoint.parentNode.replaceChild( this.m_objDomContainer, in_objInsertionPoint );
	in_objInsertionPoint = null;
	
	return this;
};


/**
* detachFromParent - Detach from DOM.  Does not destroy DOM reference.
* @returns {Variant} - HTMLElement that is the head, returns undefined otw.
*/
Display.prototype.detachFromParent = function()
{
    Util.Assert( this.isInitialized() );
    
    if( this.m_bRemoveFromDOM && this.m_objDomContainer && 
        this.m_objDomContainer.parentNode && this.m_objDomContainer.parentNode.innerHTML )
    {
        this.m_objDomContainer.parentNode.removeChild( this.m_objDomContainer );
        this.m_objDomContainer = null;
        delete this.m_objDomContainer;
    }
    
    return this;
};


/**
* teardown - teardown the data and the DOM
*/
Display.prototype.teardown = function()
{
    Util.Assert( true == this.isInitialized() );

    this.teardownDom( false );
    this.m_objDocument = null;
    this.m_objInsertionPoint = null;
    this.m_objInsertBefore = null;
    
    Display.Base.teardown.apply( this );
    return this;
};

/**
* teardownData - free our references
* @param in_bDoChildren {Boolean} (optional) - if true, does teardownData 
*   on each child display.
*/
Display.prototype.teardownData = function( in_bDoChildren )
{
    Util.Assert( true == this.isInitialized() );

    if( true == in_bDoChildren )
    {
        for( var nIndex = 0, objDisplay; objDisplay = this.m_aobjChildren.getByIndex( nIndex ); nIndex++ )
        {
            objDisplay.teardownData();
        } // end for
    }

    Display.Base.teardownData.apply( this, [ in_bDoChildren ] );
    return this;
};

/**
* teardownDom - Detach our HTML tree from our parent and destroy the reference.
* @param in_bDoChildren {Boolean} (optional) - if true, does teardownDom 
*   on each child display.
*/
Display.prototype.teardownDom = function( in_bDoChildren )
{
    Util.Assert( true == this.isInitialized() );
    
    if( true == in_bDoChildren )
    {
        this._teardownDomChildren();
    }
    
    for( var strName in this.m_aobjDOMElements )
    {
        this.detachHTMLElement( strName );
    }
    
    this.detachDom();
    this.m_aobjDOMElements = null;
    delete this.m_aobjDOMElements;

    this.m_objDomContainer = null;
    delete this.m_objDomContainer;
    
    return this;
};

Display.prototype._teardownDomChildren = function()
{
    var fncCallback = function( in_objDisplay )
    {   // Use a callback instead of a direct call to Display.prototype.teardownDom
        // in case it was overridden.
        in_objDisplay.teardownDom();
        in_objDisplay = null;
        delete in_objDisplay;
    };
    this.m_aobjChildren.each( fncCallback );
};

/**
* show - Adds the "show" class to the display.
* @param {Object} in_objPosition (optional) - Position where 
*   to place the object with respect to the viewport.  
*   If not positioned, puts in the default location.  
*   Both x/y of the in_objPosition are optional.  
* @param {Object} in_objPosition (optional) position to 
*   show display at.
*/
Display.prototype.show = function( in_objPosition )
{
    Util.Assert( true == this.isInitialized() );
    
    // Raise this one synchronously in case there are modifications
    //  to be made on the display by a plugin
    this.Raise( 'onbeforeshow', arguments, true );

    if( ( false == this.m_bAttachDomOnInit )
     && ( false == this.isAttached() ) )
    {	
        this.attachDom( document.body, null );
        if( false !== this.m_bDetachOnHide )
        {   // If set to false keep false, otw set to true.
            this.m_bDetachOnHide = true;
        }
    }

    if( in_objPosition )
    {
        Util.positionize( in_objPosition );
        var nXPos = in_objPosition.x;
        var nYPos = in_objPosition.y;

        // XXX Check to see of we are at least absolutely or relatively positioned.
        if( true == this.m_bGracefulReposition )
        {   // Reposition so we aren't off the end of the screen.    	
            var objDimensions = Util.dimensionize( Element.getDimensions( this.m_objDomContainer ) );
            var objViewPortSize = Util.getWindowSize();
            
            function _setDimension( in_nPosition, in_strDimension ) {
                if( true == TypeCheck.Defined( in_nPosition ) )
                {   // In mac, the scroll widgets partially cover up the dropdowns, so shift it further.
                    var nPadding = BrowserInfo.mac ? 45 : 10;
                
                    // find the shifted left from the "right"(bottom) hand side.
                    var nShifted = objViewPortSize[ in_strDimension ] - objDimensions[ in_strDimension ] - nPadding;
                    
                    // pick the furthest "left" and make sure we aren't off the screen.
                    in_nPosition = Math.max( Math.min( in_nPosition, nShifted ), 0 );
                }
                return in_nPosition;
            };

            nXPos = _setDimension( nXPos, 'width' );
            nYPos = _setDimension( nYPos, 'height' );
	    }
	    
        if( true == TypeCheck.Defined( nYPos ) )
        {
            if( Ubernote.m_bStandaloneEditor )
            {   // Since the input position is with respect to the viewport,
                // we have to make it with respect to the scrolled body.
                nYPos += document.body.scrollTop;
            }
            this.m_objDomContainer.style.top = nYPos + 'px';
        }
        
        if( true == TypeCheck.Defined( nXPos ) )
        {
            this.m_objDomContainer.style.left = nXPos + 'px';
        }
    }

    DOMElement.show( this.m_objDomContainer );
    this.Raise( 'onshow', arguments );

    return this;
};

/**
* hide - removes the "show" class to the display.  Detaches from DOM 
*/
Display.prototype.hide = function()
{
    Util.Assert( true == this.isInitialized() );

    // We do this check becasue if hide was called on a timer
    //  and during that timer the display was torn down, this 
    //  may still get called and we have no dom container.
    if( this.m_objDomContainer )
    {
        DOMElement.hide( this.m_objDomContainer );

        if( true == this.m_bDetachOnHide )
        {
            // detachDom will tear down our reference to this.m_objDomContainer, so we
            //  have to save it off and then reset it.
            var objDomContainer = this.m_objDomContainer;
            this.detachDom();
            this.m_bDetachOnHide = false;
            this.m_objDomContainer = objDomContainer;
        }
    }
    this.Raise( 'onhide' );
    
    return this;
};



/**
* DomEvent Handlers
*/
Display.prototype.RegisterDomEventHandlers = function()
{
    this.Raise( 'registerdomeventhandlers' );
    return this;
};


Display.prototype.UnRegisterDomEventHandlers = function()
{
    this._UnregisterAllMessagesInStorage( this.m_objDOMEvents );
    return this;
};

/**
* $ - We use it now too!  A shortcut for this.m_aobjDOMElements[ in_strClassName ]
*   If element is initially not found in the cache, we search for it in the DOM
*   and place it in the cache.
* @param {String} in_strSearchClassName (optional) - ID of the element.  
*       If none given, return this.m_objDomContainer.
* @returns {Variant} Returns element if found, undefined if not found.
*/
Display.prototype.$ = function( in_strSearchClassName )
{    
    var objRetElement = undefined;
 
    if( !in_strSearchClassName )
    {
        objRetElement = this.m_objDomContainer;
    } else if( ( this.m_aobjDOMElements ) 
        // Look for it in the cache
        && ( ! ( objRetElement = this.m_aobjDOMElements[ in_strSearchClassName ] ) )
        // not in cache, try to add it to the cache.
        && ( ! ( objRetElement = this.findAttachHTMLElement( in_strSearchClassName ) ) ) )
    {   // not in our DOM, we got null back, so change it to undefined.
        objRetElement = undefined;
    }
    
    
    return objRetElement;
};

/**
* $$ - return an array of elements based on either the selector or the element 
*   passed in.  If element is passed in, put this in an array.  If selector is passed in,
*   the rules for finding the elements are:
*       1) Search for children of the base element with the name in_vElement in the class name.
*       2) If none found, search the entire document for an element with in_vElement as the ID.
*   DOES NOT CACHE ELEMENTS
* @param {Variant} in_vElement - either a DOMElement or a string selector that searches
*   for elements in the DOM.
* @returns undefined if no elements found, an array of elements if any found.
*/
Display.prototype.$$ = function( in_vElement )
{
    var objElements;
    
    if( TypeCheck.Object( in_vElement ) )
    {   // it's already an element
        objElements = [ in_vElement ];
    }
    else
    {   // look for elements first by class name, if not found, search the
        // document for an element with that ID.
        objElements = DOMElement.getElementsByClassName( this.m_objDomContainer, 
            '*', in_vElement );
        if( !objElements || !objElements.length )
        {
            objElements = [ this.m_objDocument.getElementById( in_vElement ) ];
        }
    }
    
    return objElements;
};

/**
* setChildHTML - attempt to set the HTML of a child element.
* @param {String} in_strSearchClassName - Element selector.
* @param {String} in_strHTML (optional)- HTML to set
*/
Display.prototype.setChildHTML = function( in_strSearchClassName, in_strHTML )
{
    Util.Assert( TypeCheck.String( in_strSearchClassName, 1 ) );
    
    var objElements = this.$$( in_strSearchClassName );
    
    for( var objElement, nIndex = 0; objElement = objElements[ nIndex ]; ++nIndex )
    {
        var strText = in_strHTML || "";
        objElement.innerHTML = strText;
    } // end for
        
    return this;
};

/**
* findAttachHTMLElement - Attach a DOM Element by classname selector.  Optionally add it to
*   our list of DOM elements.  Note, this will not find elements by ID within display if 
*   Display is not yet attached to the DOM (ie, m_objInsertOnInit is false on init).
*  If element is not found matching the class selector, do a this.m_objDocument.getElementById
*  Returns null if not found.
* @param {String} in_strSearchClassName - DOM Class/Element ID to look for.
* @Returns {Object} - the first element with the class name in in_strSearchClassName.  
*/
Display.prototype.findAttachHTMLElement = function( in_strSearchClassName )
{
    Util.Assert( TypeCheck.String( in_strSearchClassName, 1 ) );

    var objRetElement = DOMElement.getElementsByClassName( this.m_objDomContainer, 
        '*', in_strSearchClassName )[ 0 ] || this.m_objDocument.getElementById( in_strSearchClassName );
            
    if( objRetElement )
    {   
        this.attachHTMLElement( in_strSearchClassName, objRetElement );
    }    
    
    return objRetElement;
};

/**
* attachHTMLElement - Attach an HTML Element to our cache.
* @param {String} in_strSearchClassName - Cache name the element can be found under
* @param {Object} in_objHTMLElement - HTML Element to attach to the cache.
*/
Display.prototype.attachHTMLElement = function( in_strSearchClassName, in_objHTMLElement )
{
    Util.Assert( TypeCheck.String( in_strSearchClassName, 1 ) );
    Util.Assert( in_objHTMLElement );
    
    // Also attaching it to prototype
    this.m_aobjDOMElements[ in_strSearchClassName ] = $( in_objHTMLElement );
};

/**
* detachHTMLElement - Remove an HTML Element from our cache.
* @param {String} in_strSearchClassName - Cache name the element can be found under
* @returns {Object} - Element if found, undefined otw.
*/
Display.prototype.detachHTMLElement = function( in_strSearchClassName )
{
    Util.Assert( TypeCheck.String( in_strSearchClassName, 1 ) );
    
    var objRetVal = this.m_aobjDOMElements[ in_strSearchClassName ];
    
    if( objRetVal )
    {
        this.m_aobjDOMElements[ in_strSearchClassName ] = null;
        delete this.m_aobjDOMElements[ in_strSearchClassName ];
    }
        
    return objRetVal;
};

/**
* attachDisplay - attach a display to our list of display children.  DOES NOT
*   ATTACH TO CACHE!  This must be done manually.
* @param {String} in_strDisplayID (optional) - ID to use for the display, if not given, 
*   use the messaging ID of the display.
* @param {Object} in_objDisplay - Display to attach to list of children.
* @param {Number} in_nIndex (optional) - Index to store child in child list.  If not given, store at end.
* @returns {Boolean} true if successful attach (no other displays with same messaging ID, etc.)
*/
Display.prototype.attachDisplay = function( in_strDisplayID, in_objDisplay, in_nIndex )
{
    Util.Assert( in_objDisplay instanceof Display );
    Util.Assert( in_objDisplay.isInitialized() );
    Util.Assert( TypeCheck.String( in_strDisplayID ) );
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    
    var strID = in_strDisplayID || in_objDisplay.m_strMessagingID;
    return this.attachChild( strID, in_objDisplay, in_nIndex );
};

/**
* detachDisplay - detach a display to our list of display children.  
* @param {String} in_strDisplayID - MessagingID of Display to detach.
* @returns {object} Returns Display removed from list if available, undefined otw.
*/
Display.prototype.detachDisplay = function( in_strDisplayID )
{
    Util.Assert( TypeCheck.String( in_strDisplayID ) );
    
    var objRetVal = this.m_aobjChildren.removeByKey( in_strDisplayID );
    return objRetVal;
};

/**
* _attachBehavior - an internal helper to attach a behavior to an element
* @param {Object} in_objElement - element to attach behavior to.
* @param {Function} in_fncApplyBehavior (optional) - optional behavior to attach.
*   If set to null, no behavior attached.
*   If undefined, button looks at element for the _behavior attribute.  If not given, attach
*   the default button behavior.
*/
Display.prototype._attachBehavior = function( in_objElement, in_fncApplyBehavior )
{
    if( in_fncApplyBehavior )
    {
        in_fncApplyBehavior( in_objElement );
    }
    else
    {   // If not defined and we have an attribute, use it.
        var strBehavior = in_objElement.getAttribute( '_behavior' ) || 'TransparentButtonBehavior';
        window[ strBehavior ].ApplyBehavior( in_objElement, this );
	}
};


/**
* attachButton - Attach a command to DOM element(s), if found give the element(s)
*   a BasicButtonBehavior, attach the command to it.
* @param {Variant} in_vElement - Either an HTMLElement or a DOM element selector.
* @param {Variant} in_vCommand - Either a function callback or a message to raise on button click.
* @param {Object} in_objScope (conditional) - Scope to call the callback in/send the message to.  
*    If sending a message and undefined, does a Messages.Raise, if defined, Messages.RaiseForAddress.
*    If calling a function, default is to use "this" for scope, in_objScope overrides.
* @param {Boolean} in_bAddToArray (optional) - Add to local DOMElement collection hash under the name
*   in in_vElement - defaults to true.
* @param {function} in_fncApplyBehavior (optional) - Optional function to add apply behavior to the element.
*   If none provided, TransparentButtonBehavior will be used.  Null means apply no behavior.
* @param {array} in_aobjArguments (optional) - Arguments to send to the command
* @param {string} in_strEvent (optional) - Event to register on, if not defined click will be used.
*/
Display.prototype.attachButton = function( in_vElement, in_vCommand, in_objScope, 
    in_bAddToArray, in_fncApplyBehavior, in_aobjArguments, in_strEvent )
{
    
    if( in_vElement && in_vElement.element )
    {   // take care of a configuration object passed in.
        return this.attachButton( in_vElement.element,
            in_vElement.command,
            in_vElement.scope,
            in_vElement.addtoarray,
            in_vElement.behavior,
            in_vElement.arguments,
            in_vElement[ 'event' ]
        );
    }
    
    Util.Assert( TypeCheck.Object( in_vElement ) || TypeCheck.String( in_vElement ) );
    Util.Assert( TypeCheck.String( in_vCommand ) || TypeCheck.Function( in_vCommand ) );
    
    // Default as HTML Element, if a string passed in, look up the element.
    var objElements = this.$$( in_vElement );
    for( var objRetElement, nIndex = 0; objRetElement = objElements[ nIndex ]; ++nIndex )
    {   // use apply so we have the "this"
        this._attachButton( objRetElement, in_vCommand, in_objScope, 
            in_bAddToArray, in_fncApplyBehavior, in_aobjArguments, in_strEvent );
    } // end for
    
    return this;
};

/**
* _attachButton - Attach a command to a single DOM element, give the element
*   a BasicButtonBehavior, attach the command to it.
*  Returns the first element with the class name in in_vElement
*  Returns null if not found.
* @param {Object} in_vElement - HTMLElement.
* @param {Variant} in_vCommand - Either a function callback or a message to raise on button click.
* @param {Object} in_objScope (conditional) - Scope to call the callback in/send the message to.  
*    If sending a message and undefined, does a Messages.Raise, if defined, Messages.RaiseForAddress.
*    If calling a function, default is to use "this" for scope, in_objScope overrides.
* @param {Boolean} in_bAddToArray (optional) - Add to local DOMElement collection hash under the name
*   in in_vElement - defaults to true.
* @param {function} in_fncApplyBehavior (optional) - Optional function to add apply behavior to the element.
*   If none provided, TransparentButtonBehavior will be used.  Null means apply no behavior.
* @param {array} in_aobjArguments (optional) - Arguments to send to the command
* @param {string} in_strEvent (optional) - Event to register on, if not defined click will be used.
*/
Display.prototype._attachButton = function( in_vElement, in_vCommand, in_objScope, 
    in_bAddToArray, in_fncApplyBehavior, in_aobjArguments, in_strEvent )
{
    Util.Assert( TypeCheck.Object( in_vElement ) );
    Util.Assert( TypeCheck.String( in_vCommand ) || TypeCheck.Function( in_vCommand ) );

    this._attachBehavior( in_vElement, in_fncApplyBehavior );

    var fncCallback = function( in_objEvent ) { 
        if( this._isLeftClick( in_objEvent ) )
        {   
            this._logButton( in_vElement );
            this._doCommand( in_vCommand, in_objScope, in_aobjArguments, in_objEvent );
            in_objEvent._uberEventHandled = true;
			in_objEvent.cancelEvent();
        }
    }; // end function
    
    in_strEvent = in_strEvent || 'onclick';
   	this.RegisterListener( in_strEvent, in_vElement, fncCallback );
};

/**
* _logButton - Attempt to log a button press.  If button has "elementClassName"
*   where ClassName is the name of the button, it will log "ClassName button" to
*   the database.
* @param {Object} in_objElement - element to attempt to log.
*/
Display.prototype._logButton = function( in_objElement )
{
    // Look for the class name with 'element' in it.
    var astrMatchingNames = in_objElement.className.match( /element\w*/gi ) || [];
    if( astrMatchingNames[0] )
    {   // Can only log features if we can guess a name for them.
        var strLoggedName = astrMatchingNames[0].replace( /element/gi, '' );
        this.logFeature( strLoggedName + ' button', 'button action' );
    }
};

/**
* _doCommand - perform a command, can be either a message or a function, called wtih a scope, arguments.
* @param {Variant} in_vCommand - Either a function callback or a message to raise on button click.
* @param {Object} in_objScope (conditional) - Scope to call the callback in/send the message to.  
*    If sending a message and undefined, does a Messages.Raise, if defined, Messages.RaiseForAddress.
*    If calling a function, default is to use "this" for scope, in_objScope overrides.
* @param {array} in_aobjArguments (optional) - Arguments to send to the command
* @param {string} in_strEvent (optional) - Event to register on, if not defined click will be used.
*/
Display.prototype._doCommand = function( in_vCommand, in_objScope, in_aobjArguments, in_objEvent )
{
    Util.Assert( TypeCheck.String( in_vCommand ) || TypeCheck.Function( in_vCommand ) );

    if( TypeCheck.Function( in_vCommand ) )
    {
        in_vCommand.apply( in_objScope || this, in_aobjArguments || [ in_objEvent ] );
    }
    else if( TypeCheck.String( in_vCommand ) )
    {
        if( in_objScope )
        {   // Send to a particular address
            this.RaiseForAddress( in_vCommand, in_objScope.m_strMessagingID, 
                in_aobjArguments || [ in_objEvent ], true );
        }
        else
        {   // Send to the world
            this.Raise( in_vCommand, in_aobjArguments || [ in_objEvent ], true );
        }
    }
};

/**
* _isLeftClick - check to see if an event was a left hand click - only in mozilla.
* @param {Object} in_objEvent - DOM event.
* @return {Boolean} returns true if a left click, false otw.
*/
Display.prototype._isLeftClick = function( in_objEvent )
{
    var bRetVal = true;
    
    if( ( BrowserInfo.gecko )
     && ( false === Event.isLeftClick( in_objEvent ) ) )
    {   // if we aren't a left click, we don't want it.  FF 2.0 has problems with this
        // getting called on context menu events
        bRetVal = false;
    }
    
    return bRetVal;
};


/**
* detachButton - Removes all listeners from the button.
* @param {Variant} in_vElement - Either an HTMLElement or a DOM element selector.
* @param {Variant} in_vCommand (optional) - Either a function callback or a message to raise on button click.
* @param {function} in_fncRemoveBehavior (optional) - Optional function to add remove behavior from the element.
*   If none provided, TransparentButtonBehavior will be used.  Null means remove no behavior.
*/
/**
* XXX Do something with the command!
*/
Display.prototype.detachButton = function( in_vElement, in_vCommand, in_fncRemoveBehavior )
{
    var strVElementType = typeof( in_vElement );
    Util.Assert( 'object' == strVElementType || 'string' == strVElementType );
    //Util.Assert( in_vCommand );
    
    var objElement = in_vElement;    // Default to it is an HTML element.
    if( 'string' == strVElementType )   // If not, go find the element.
    {
        objElement = this.$( in_vElement );
    }

    if( objElement )
    {   
        if( in_fncRemoveBehavior )
        {
            in_fncRemoveBehavior( objElement );
        }
        else if( typeof( in_fncRemoveBehavior ) == 'undefined' )
        {
		    TransparentButtonBehavior.RemoveBehavior( objElement );
		}

        this.UnRegisterListener( 'onclick', objElement );
    }
};


/**
* setHeight - set the height of the container.
* @param {Number || String} in_vHeight - height in pixels to set the container.
*/
Display.prototype.setHeight = function( in_vHeight )
{
    Util.Assert( TypeCheck.Number( in_vHeight ) || TypeCheck.String( in_vHeight ) );

    DOMElement.setDimensionStyle( this.$(), 'height', in_vHeight );
    return this;
};

/**
* getHeight - get the height of the container.
* @returns {Number || String} - visible (non-scrolling) height in pixels of the container.
*/
Display.prototype.getHeight = function()
{
    return this.$().style[ 'height' ];
};

