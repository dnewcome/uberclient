
/**
* Constructor - Not actually used.
* @param {Object} in_objElement - browser DOM element to add.  
*/
DOMElement = function()
{
    m_strElementID = undefined;
};

/**
* init - Constructor not used because this adds the 
*       m_strElementID directly.
*/
DOMElement.init = function( in_objElement )
{
    // Use the normal element's ID if it exists.
    if( ! in_objElement.id || in_objElement.id.length == 0 )
    {   
        in_objElement.id = DOMElementIDs.generateID();
    } // end if

    in_objElement.m_strElementID = in_objElement.id;
};

/**
* fromElement - Creates a DOMElement from a browser element.  Will return in_objElement if
*   already a DOMElement
* @param {Object} in_objElement (optional) - browser DOM element to add.  
*   If no in_objElement, function does nothing.
* @returns {Object} - DOMElement created from in_objElement if valid, undefined otw.
*/
DOMElement.fromElement = function( in_objElement )
{
    var objRetVal = undefined;
    if( in_objElement /*TypeCheck.HTMLElement( in_objElement ) */)
    {
        objRetVal = in_objElement;

        if( ! in_objElement.m_strElementID )
        {
            DOMElement.init( in_objElement );
        } // end if
    } // end if
    return objRetVal;
};


/**
* DOMElement - Checks to see if the object is a valid DOMElement 
*   DOMElement is THIS, not the browswer provided HTMLElement.
*   returns true if successful, false otw.
* @param {Variant} in_vObject - object to check.
*/
TypeCheck.DOMElement = function( in_vObject )
{
    var bRetVal = in_vObject && in_vObject.m_strElementID ? true : false;
    return bRetVal;
};



/**
* applyEvent
* @param {Object} in_objEvent - Event to apply.
*/
DOMElement.applyEvent = function( in_objDOMElement, in_objEvent )
{
    Util.Assert( in_objDOMElement );
    Util.Assert( in_objEvent );
    
    var objEvent = null;
    if( in_objDOMElement.fireEvent )
    {   // IE bastards.
        objEvent = document.createEventObject( in_objEvent ); 
        if( ( in_objEvent.type == 'contextmenu' ) ||
          ( in_objEvent.type == 'mousemove' ) ||
          ( in_objEvent.type == 'click' ) ||
          ( in_objEvent.type == 'mouseup' ) ||
          ( in_objEvent.type == 'mousedown' ) )
        {
            in_objDOMElement.fireEvent( "on" + in_objEvent.type );
        } // end if
        else
        {
            in_objDOMElement.fireEvent( "on" + in_objEvent.type, objEvent );
        } // end if-else
    }
    else if( document.createEvent )
    {   // Standards compliant world.  
            switch ( in_objEvent.type )
            {
                case "keydown":
                case "keyup":
                case "keypress":
                    objEvent = DOMElement.applyKeyEvent( in_objDOMElement, in_objEvent );
                    break;
                case "mousedown":
                case "mousemove":
                case "mouseout":
                case "mouseover":
                case "mouseup":
                default:
                    objEvent = DOMElement.applyMouseEvent( in_objDOMElement, in_objEvent );
                    break;
                // XXX TODO - Figure out the rest of these!
                    objEvent = DOMElement.applyBasicEvent( in_objDOMElement, in_objEvent );
                    break;
            } // end switch
        	in_objDOMElement.dispatchEvent( objEvent ); 
    } // end if
    
};

DOMElement.applyBasicEvent = function( in_objDOMElement, in_objEvent )
{
    var objEvent = in_objDOMElement.ownerDocument.createEvent("Event");
    objEvent.initEvent( in_objEvent.type, in_objEvent.bubbles, 
                        in_objEvent.cancelable );

    return objEvent;                        
};

DOMElement.applyUIEvent = function( in_objDOMElement, in_objEvent )
{
    var objEvent = in_objDOMElement.ownerDocument.createEvent("UIEvents");
    objEvent.initUIEvent( in_objEvent.type, in_objEvent.bubbles, 
                        in_objEvent.cancelable, in_objDOMElement.ownerDocument.defaultView, 
                        in_objEvent.detail );

    return objEvent;                        
};

DOMElement.applyKeyEvent = function( in_objDOMElement, in_objEvent )
{
    var objEvent = in_objDOMElement.ownerDocument.createEvent("KeyboardEvent");
    objEvent.initKeyEvent( in_objEvent.type, in_objEvent.bubbles, 
                        in_objEvent.cancelable, in_objDOMElement.ownerDocument.defaultView, 
                        in_objEvent.ctrlKey, in_objEvent.altKey, in_objEvent.shiftKey, 
                        in_objEvent.metaKey, in_objEvent.keyCode, in_objEvent.charCodeArg );

    return objEvent;                        
};

DOMElement.applyMouseEvent = function( in_objDOMElement, in_objEvent )
{
	var objEvent = in_objDOMElement.ownerDocument.createEvent( "MouseEvents" );
	
	var nClientX = in_objEvent.clientX;
	var nClientY = in_objEvent.clientY;

	if( in_objDOMElement.ownerDocument != in_objEvent.target.ownerDocument )
	{  // means we are changing documents.  Our event has it's clientX relative to the current document.
	   //  So we are assuming our current event document is embedded inside of the new document. 
	   
	   /*   --------------------------------    <- target container document
	       |
	       |    ---------------------------------    <- target element
	       |   |
	       |   |    -----------------------------------  <- offset of frame (document) inside target element
	       |   |   |
	       |   |   |        X                               <- offset of event inside frame
	       |   |   |  
	   
	     The total screen position is:
	           Current screenX/Y 
	        +  offset of frame inside target element.
	        +  offset of target element inside its document
	        
	        OR
	        
	        the cumulativeOffset of the containing frameElement.
	   */
	   
	   var objOffset = Position.cumulativeOffset( in_objEvent.target.ownerDocument.defaultView.frameElement );
	   nClientX += objOffset[ 0 ];
	   nClientY += objOffset[ 1 ];
	} // end if
	
	objEvent.initMouseEvent( in_objEvent.type, in_objEvent.bubbles, 
		             in_objEvent.cancelable, window, in_objEvent.detail, in_objEvent.screenX, 
		             in_objEvent.screenY, nClientX, nClientY, 
                     in_objEvent.ctrlKey, in_objEvent.altKey, in_objEvent.shiftKey, 
                     in_objEvent.metaKey, in_objEvent.button, in_objEvent.relatedTarget );

    return objEvent;
};

/**
* addClassName - add a class name to an HTML Element
* @param {Object} in_objHTMLElement - HTML Element to add style to.
* @param {String} in_objClassName - CSS class name to add.
*/
DOMElement.addClassName = function( in_objHTMLElement, in_strClassName )
{
    Util.Assert( in_objHTMLElement );
    Util.Assert( TypeCheck.String( in_strClassName ) );

    Element.addClassName( in_objHTMLElement, in_strClassName );
};

/**
* removeClassName - remove a class name to an HTML Element
* @param {Object} in_objHTMLElement - HTML Element to add style to.
* @param {String} in_objClassName - CSS class name to add.
*/
DOMElement.removeClassName = function( in_objHTMLElement, in_strClassName )
{
    Util.Assert( in_objHTMLElement );
    Util.Assert( TypeCheck.String( in_strClassName ) );

    Element.removeClassName( in_objHTMLElement, in_strClassName );
};

/**
* hasClassName - Test an HTML Element for a class name
* @param {Object} in_objHTMLElement - HTML Element to check.
* @param {String} in_objClassName - CSS class name to check.
* Returns true if has classname, false otw.
*/
DOMElement.hasClassName = function( in_objHTMLElement, in_strClassName )
{
    Util.Assert( in_objHTMLElement );
    Util.Assert( TypeCheck.String( in_strClassName ) );

    return Element.hasClassName( in_objHTMLElement, in_strClassName );
};



/**
* ancestorHasClassName - Test an HTML Element for a class name
* @param {Object} in_objElement - HTML Element to check.
* @param {String} in_objClassName - CSS class name to check.
* Returns true if has classname, false otw.
*/
DOMElement.ancestorHasClassName = function( in_objElement, in_strClassName )
{
    Util.Assert( in_objElement );
    Util.Assert( TypeCheck.String( in_strClassName ) );

    var bRetVal = false;
    // We want the ancestor, so we immediately go to the parent node.  
    //  Do not check the document.
    while( ( false == bRetVal ) && ( in_objElement = in_objElement.parentNode ) && ( ! in_objElement.body ) )
    {
        bRetVal = DOMElement.hasClassName( in_objElement, in_strClassName );    
    } // end while
    
    return bRetVal;
};


/**
* addTimedClassName - adds a style to an HTML element for a specified time.
* @param {Object} in_objHTMLElement - HTML Element to add style to.
* @param {String} in_objClassName - CSS class name to add.
* @param {Number} in_nDurationMS - Time in milliseconds to add style.
* @returns returns the timer object
*/
DOMElement.addTimedClassName = function( in_objHTMLElement, in_strClassName, in_nDurationMS )
{
    Util.Assert( in_objHTMLElement && typeof( in_objHTMLElement.innerHTML ) != 'undefined' );
    Util.Assert( TypeCheck.String( in_strClassName ) );
    Util.Assert( TypeCheck.Number( in_nDurationMS ) );

    DOMElement.addClassName( in_objHTMLElement, in_strClassName );
    var objRetVal = setTimeout( function() { 
        DOMElement.removeClassName( in_objHTMLElement, in_strClassName ); 
    }, in_nDurationMS );
    
    return objRetVal;
};


/**
* isTagType - Check to see if an element is of the specified tag type.
* @param {Object} in_objHTMLElement - HTML Element to add style to.
* @param {String} in_objTagType - Tag type to check.
*/
DOMElement.isTagType = function( in_objHTMLElement, in_strTagType )
{
    Util.Assert( in_strTagType );
    var bRetVal = ( ( in_objHTMLElement )
	   && ( in_objHTMLElement.tagName )
	   && ( in_objHTMLElement.tagName.toLowerCase() == in_strTagType.toLowerCase() ) );
    
    return bRetVal;
};


/** 
* getElementsByClassName - get all elements in a tree that have the specified class name.
* Jonathan Snook, http://www.snook.ca/jonathan Robert Nyman, http://www.robertnyman.com 
* @param oElm - Head element.
* @param strTagName - Tag name to look for, if looking to match any tag, use "*".
* @param strClassName - Class name to look for.
* @returns {Array} - Returns an array of elements that have the tag name.  
*   Array of length 0 if none found.
*/
(function(){
    var objRegExpCache = {};
    DOMElement.getElementsByClassName = function( oElm, strTagName, strClassName )
    {
	    var arrReturnElements = [];
	    var oRegExp = objRegExpCache[ strClassName ];
	    if( ! oRegExp ) 
	    {
	        oRegExp = objRegExpCache[ strClassName ] = new RegExp( "(^|\\s)" + strClassName + "($|\\s)" );
	    } // end if

        // Do the head node
        if( oRegExp.test(oElm.className) && ( strTagName == "*" || oElm.tagName == strClassName ) )
	    {	
	        arrReturnElements[ 0 ] = oElm; 
	    } // end if
    	
        for( var i=0, aobjElements = oElm.getElementsByTagName(strTagName), oElement; 
            oElement = aobjElements[ i ]; ++i)
        {	
            if( oRegExp.test(oElement.className) )
	        {	
	            arrReturnElements[ arrReturnElements.length ] = oElement; 
	        } // end if
        }
        
	    return arrReturnElements;
    };
})();

/*
* getSingleElementByClassName - get the a single DOM element by class name
* @param {Object} objBaseElement - DOM Node that is the head of the tree we are searching
* @param {String} strKey - Class name of the Element to look for
* @param {Number} intIndex - Index in array to look for.
* @param {bool} bSuprressAssertion - If true, does not raise an error if no elements are found.
*/
DOMElement.getSingleElementByClassName = function( objBaseElement, strKey, intIndex, bSuppressAssertion ){
    var objRetVal = null;   // default not found
    try
    {
	    var aElements = DOMElement.getElementsByClassName( objBaseElement, "*", strKey );
    } catch ( e ) {
        if( ! bSuppressAssertion )
        {
            SysError.raiseError( 'DOMElement.getSingleElementByClassName', 
                ErrorLevels.eErrorType.EXCEPTION, ErrorLevels.eErrorLevel.LOW, ' ' );
        } // end if
    } 
    
    if( aElements && aElements.length > intIndex )
	{
        objRetVal = aElements[ intIndex ];
    } // end if

    return objRetVal;
};
	  
/*
* This function will merge the values of the all elements with tagName = strKey
*   @objBaseElement DOM Node that is the head of the tree we are searching
*   @strKey Name of the tag
*   @strDefault Default string if the tag is not found.  This could include if
*       the base element is null, the base element has no children, or the strKey is not
*       a member of the children.
*/
DOMElement.getAllElementsByTagNameValue = function( objBaseElement, strKey, strDefault )
{
    var objRetVal = strDefault;
    var objElement = objBaseElement.getElementsByTagName( strKey )[0];
    
    // First check if we have an element, if we do, start running from its first child.
    if( objElement && ( objElement = objElement.firstChild ) )
    {
        objRetVal = '';
        do
        {
            objRetVal += objElement.nodeValue;
        } while( objElement = objElement.nextSibling );
    } // end if
    
    return objRetVal;  
};

/**
* setTooltip - Sets the tooltip text of elements that have alt/title tags.  Attempts to 
*   set BOTH alt and title, if supported.
*   Returns true if element supports setting alt text, false otw.
* @param {Object} in_objHTMLElement (optional) - Element to set tooltip text. 
*   If not given, function does nothing.
* @param {String} in_strText - String to set tooltip text.  Can be empty.
*/
DOMElement.setTooltip = function( in_objHTMLElement, in_strText )
{
    Util.Assert( TypeCheck.String( in_strText ) );
    
    var bRetVal = false;
    
    if( in_objHTMLElement )
    {
        in_objHTMLElement.setAttribute( 'alt', in_strText );
        in_objHTMLElement.setAttribute( 'title', in_strText );
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* hide - hide an element.  applies the .hide css class
* @param in_objHTMLElement - HTML Element to hide.
*/
DOMElement.hide = function( in_objHTMLElement )
{
    Util.Assert( in_objHTMLElement );

    Element.addClassName( in_objHTMLElement, 'hide' );
};

/**
* show - show an element.  removes the .hide css class
* @param in_objHTMLElement - HTML Element to show.
*/
DOMElement.show = function( in_objHTMLElement )
{
    Util.Assert( in_objHTMLElement );

    Element.removeClassName( in_objHTMLElement, 'hide' );
};


/**
* highlight - highlight an element.  applies the .highlight css class
* @param in_objHTMLElement - HTML Element to highlight.
*/
DOMElement.highlight = function( in_objHTMLElement )
{
    Util.Assert( in_objHTMLElement );

    Element.addClassName( in_objHTMLElement, 'highlighted' );
};

/**
* unhighlight - unhighlight an element.  removes the .highlight css class
* @param in_objHTMLElement - HTML Element to unhighlight.
*/
DOMElement.unhighlight = function( in_objHTMLElement )
{
    Util.Assert( in_objHTMLElement );

    Element.removeClassName( in_objHTMLElement, 'highlighted' );
};

/* https://github.com/dnewcome/tiny-popup/blob/master/tinypopup.js */
DOMElement.Center = function(element, parent) {
        var w, h, pw, ph;
        var d = Element.getDimensions(element);
        w = d.width;
        h = d.height;
        Position.prepare();
        if (!parent) {
                /*
                var ws = Util.getWindowSize();
                pw = ws.x;
                ph = ws.y;
                */
                pw = window.innerWidth;
                ph = window.innerHeight;
        } else {
                pw = parent.offsetWidth;
                ph = parent.offsetHeight;
        }
        // element.style.top = (ph/2) - (h/2) -  Position.deltaY + "px";
        // element.style.left = (pw/2) - (w/2) -  Position.deltaX + "px";
        element.style.top = (ph - h) / 2 + "px";
        element.style.left = (pw - w) / 2 + "px"; 
};



/**
* findAnchorHref - Try to find the anchor href of an element or one of our ancestors.
* @param {Object} in_objElement (optional) - element to search from.  If not given, returns.
* @returns {String}
*/
DOMElement.findAnchorHref = function( in_objElement )
{
    var objElement = in_objElement;
    var strRetVal = undefined;
    
    while( objElement )
    {
        if( DOMElement.isTagType( objElement, 'a' ) )
        {
            strRetVal = objElement.getAttribute( 'href' );
            objElement = undefined;
        } // end if
        else
        {
            objElement = objElement.parentNode;
        } // end if-else
    } // end while
    
    return strRetVal;
};


/**
* setDimensionStyle - set a style dimension of an HTMLElement
* @param {Object} in_objHTMLElement - Element to check.
* @param {String} in_strStyle - Style to set.
* @param {Number || String} in_vValue - height to set the container.
* @param {Object} HTMLElement passed in.
*/
DOMElement.setDimensionStyle = function( in_objHTMLElement, in_strStyle, in_vValue )
{
    Util.Assert( TypeCheck.Object( in_objHTMLElement ) );
    Util.Assert( TypeCheck.String( in_strStyle ) );
    Util.Assert( TypeCheck.Number( in_vValue ) || TypeCheck.String( in_vValue ) );

    var strValue = undefined;
    
    // First convert to number to see if we are >= 0
    if( 'auto' === in_vValue )
    {
        strValue = in_vValue;
    }
    else
    {
        var nDimension = TypeCheck.Number( in_vValue ) ? in_vValue : parseInt10( in_vValue );
        if( nDimension < 1 )
        {   // If we set it to 0, it clears the height altogether in IE.
            nDimension = 1;
        } // end if
        
        // Then convert to string to see if we have a dimension "type"
        var strValue = TypeCheck.String( in_vValue ) ? in_vValue : in_vValue.toString();
        var strType = ( /px|%|em|pt/gi ).test( strValue ) ? '' : 'px';
        
        // Combine them.
        strValue = nDimension.toString() + strType;
    } // end if
    
    if( strValue )
    {
        in_objHTMLElement.style[ in_strStyle ] = strValue;
    } // end if
    
    return in_objHTMLElement;
};



/**
* DOMElementIDs - A DOMElement ID generator - A Singleton, do not instantiate
*/
var DOMElementIDs = new function()
{
    this.m_objIDGenerator = new UniqueIDGenerator( "auto_domelement" );
};

/**
* generateID - Generate a uniqueID
*/
DOMElementIDs.generateID = function()
{
    return this.m_objIDGenerator.getUniqueID();
};





/**
* addEventHandler - Add an event storage jobbie to the current HTML element
* @param in_objHTMLElement - HTML Element to add event storage to.
* @param in_strEventType - Event to register
* @param {Function} in_fncCallback - Callback to call
* @param in_objScope (optional) - Scope to call function.
* @param in_vExtraInfo (optional) - Extra info to put in the function container that
*       we may need later.
* @returns FunctionContainer that is the handler
*/
DOMElement.addEventHandler = function( in_objHTMLElement, in_strEventType, in_fncCallback, 
    in_objScope, in_vExtraInfo )
{
    Util.Assert( TypeCheck.Object( in_objHTMLElement ) );
    Util.Assert( TypeCheck.String( in_strEventType, 1 ) );
    Util.Assert( TypeCheck.Function( in_fncCallback ) );

    var objHandler = new FunctionContainer( in_fncCallback, in_objScope, in_vExtraInfo );
    
    // Takes care of setting up the initial event object if needs be.
    in_objHTMLElement._events = in_objHTMLElement._events || {};
    // Takes care of setting up the event type array if needs be.
    var aEvents = in_objHTMLElement._events[ in_strEventType ] = in_objHTMLElement._events[ in_strEventType ] || [];

    // Don't worry about duplicates
    aEvents[ aEvents.length ] = objHandler ;
    
    return objHandler;
};

/**
* getEventHandlers - Get the event handlers for the specified event for an HTMLElement
* @param in_objHTMLElement - HTML Element to check.
* @param in_strEventType - Event to search for.
* @param {Array} returns an array of FunctionContainers.  Length 0 if none 
*   defined.
*/
DOMElement.getEventHandlers = function( in_objHTMLElement, in_strEventType )
{
    var aRetVal = ( in_objHTMLElement._events && 
        in_objHTMLElement._events[ in_strEventType ] ) || [];

    return aRetVal;
};


/**
* removeEventHandler - Add an event storage jobbie to the current HTML element
* @param in_objHTMLElement - HTML Element to add event storage to.
* @param in_strEventType - Event to register
* @param {Function} in_fncCallback - Callback to call
* @param returns an array of removed FunctionContainers.  Length 0 if none 
*   defined.
*/
DOMElement.removeEventHandler = function( in_objHTMLElement, in_strEventType, in_fncCallback )
{
    Util.Assert( TypeCheck.Object( in_objHTMLElement ) );
    Util.Assert( TypeCheck.String( in_strEventType, 1 ) );
    Util.Assert( TypeCheck.Function( in_fncCallback ) );

    var aobjEvents = DOMElement.getEventHandlers( in_objHTMLElement, in_strEventType );
    var objRetVal = []; // return the list of values matching this function.
    
    for( var nIndex = aobjEvents.length - 1; nIndex >= 0; nIndex-- ) 
    {
        if( aobjEvents[ nIndex ].m_fncFunction == in_fncCallback )
        {   // We spliced one element, so take the one element and push it onto the return value.
            objRetVal[ objRetVal.length ] = aobjEvents.splice( nIndex, 1 )[0];
        } // end for
    } // end for
    
    return objRetVal;
};

if( !String.prototype.stripaccents )
{
    /**
    * stripaccents - strip the international accents from a string.
    */
    String.prototype.stripaccents = function(){
        var t=this;
        t=t.replace(/À|Á|Â|Ã|Ä|Å|à|á|â|ã|ä|å/ig,'a');
        t=t.replace(/Ò|Ó|Ô|Õ|Ö|Ø|ò|ó|ô|õ|ö|ø/ig,'o');
        t=t.replace(/È|É|Ê|Ë|è|é|ê|ë/ig,'e');
        t=t.replace(/Ç|ç/ig,'c');
        t=t.replace(/Ì|Í|Î|Ï|ì|í|î|ï/ig,'i');
        t=t.replace(/Ù|Ú|Û|Ü|ù|ú|û|ü/ig,'u');
        t=t.replace(/ÿ/ig,'y');
        t=t.replace(/Ñ|ñ/ig,'n');
        return t;
    };
} // end if

