

/**
* DOMEvent - a W3C compatible event model.  For IE, it adds the necessary properties to 
*   bring us up to spec.  Note, this can be used in event handlers not registered to
*   the SMPS to find/standardize the event for cancelling.
*/
function DOMEvent( in_objEvent )
{   
    DOMEvent.standardizeEvent( in_objEvent );
    return in_objEvent;
}


if( Event && Event.stopPropagation )
{
    Event._stopPropagation = Event.stopPropagation;
} // end if

DOMEvent.UberStopPropagationIE = function()
{
    this.cancelBubble = true;
    this.propagating = false;
};


DOMEvent.UberStopPropagationW3C = function()
{
    this.propagating = false;
};

DOMEvent.UberPreventDefaultIE = function()
{
    this.returnValue = false;
};


DOMEvent.UberCancelEventIE = function()
{
    this.returnValue = false;
    this.cancelBubble = true;
    this.propagating = false;
};


DOMEvent.UberCancelEventW3C = function()
{
    this.preventDefault(); 
    this.propagating = false;
};

// Standardizes IE events to the W3C Event model.  
//  EXTERNAL from: http://www.mozillazine.org/talkback.html?article=2433

DOMEvent.standardizeEventW3C = function( in_objEvent ) 
{   
    var libEvent = DOMEvent; 
    in_objEvent.stopPropagation = libEvent.UberStopPropagationW3C;
    in_objEvent.cancelEvent = libEvent.UberCancelEventW3C;
};

DOMEvent.standardizeEventIE = function( in_objEvent ) 
{   
    var libEvent = DOMEvent; 
    in_objEvent.stopPropagation = libEvent.UberStopPropagationIE;
    in_objEvent.cancelEvent = libEvent.UberCancelEventIE;
    in_objEvent.preventDefault = libEvent.UberPreventDefaultIE;
        
    return in_objEvent;
};

( function() {
    if( BrowserInfo.ie )
    {
        DOMEvent.standardizeEvent = DOMEvent.standardizeEventIE;   
    } // end if
    else
    {
        DOMEvent.standardizeEvent = DOMEvent.standardizeEventW3C;
    } // end if-else
})();

/**
* Non-W3C standard functions, but useful.  All take the a DOMEvent as a parameter
*/

/**
* checkMouseoutContainer - Checks to see if we completely left the container
*   and not just went into a child element.
* Returns true if left the container, false otw.
* @in_objEvent {object} - W3C compliant event.
*/
DOMEvent.checkMouseLeave = function( in_objEvent )
{
    var bRetVal = false;
    
    var objRelatedTarget = in_objEvent.relatedTarget;
    var objRegisteredTarget = in_objEvent._currentTarget;
    
    if( BrowserInfo.gecko2 )
    {   // We do this because Mozilla blows up on input elements but we 
        // don't want to use try-catch in other browsers - it is slow.
        try {   
			while( objRelatedTarget && ( objRelatedTarget != objRegisteredTarget ) )
			{
				objRelatedTarget = objRelatedTarget.parentNode;
			} // end while
		} catch ( e ) {}
	} // end if
	else
	{
        while( objRelatedTarget && ( objRelatedTarget != objRegisteredTarget ) )
        {
            objRelatedTarget = objRelatedTarget.parentNode;
        } // end while
	} // end if-else
	
    bRetVal = !objRelatedTarget;
    
    return bRetVal;
};

/**
* cancelEvent - Cancels an event - Can be used as an event handler.
* @param {Object} in_objEvent (optional) - event to cancel.  If 
*       undefined (as in used in IE event handler), will look at 
*       "event" then "window.event"
*/ 
DOMEvent.cancelEvent = function( in_objEvent )
{
    in_objEvent.cancelEvent();
};


var _UberDocumentEventList = new Enum(
    'load',
    'unload',
    'abort',
    'error',
    'select',
    'change',
    'submit',
    'reset',
    'resize',
    'mouseout',
    'mouseover',
    'mouseup',
    'mousedown',
    'click',
    'dblclick',
    'keydown',
 //   'keypress',   // Prototype changes this to a keydow and we have two key downs.  BOO!!
    'keyup',
    'contextmenu'
);


var _UberElementEventList = new Enum(
    'mousemove',    // mousemove is just called WAYYY too often.
    'scroll',
    'focus',
    'blur',
    'cut',          // IE extensions that also work in FF3
    'copy',
    'paste',
    'beforecut',
    'beforecopy',
    'beforepaste'
);

function UberEvents( in_objDocument )
{
    if( in_objDocument )
    {
        for( var strKey in _UberDocumentEventList )
        {
            Event.observe( in_objDocument, strKey, UberEvents.genericEventHandler );
        } // end for 
    } // end if
}


UberEvents.properName = function( in_strName )
{
    Util.Assert( TypeCheck.String( in_strName ) );
    // events return without the 'on' portion.    
    var strRetVal = in_strName.replace( /^on/g, '' );
    return strRetVal;
};


UberEvents.unload = function( in_objDocument )
{
    for( var strKey in _UberDocumentEventList )
    {
        Event.stopObserving( in_objDocument, strKey, UberEvents.genericEventHandler );
    } // end for 
};

UberEvents.addEvent = function( in_objHTMLElement, in_strEventType, in_fncCallback, in_objScope )
{
    Util.Assert( TypeCheck.Object( in_objHTMLElement ) );
    Util.Assert( TypeCheck.String( in_strEventType, 1 ) );
    Util.Assert( TypeCheck.Function( in_fncCallback ) );
    
    var strEventType = UberEvents.properName( in_strEventType );
    var fncRealEvent = undefined;
    
    // A scroll or a window based event has to be registered on the object directly, but we still
    // save our handlers off so we can get at them later.
    var bRegisterOnElement = TypeCheck.EnumKey( strEventType, _UberElementEventList );
    
    if( ( true == bRegisterOnElement )
     || ( in_objHTMLElement == window ) )
    {
        fncRealEvent = function( event ) 
        {
            var objEvent = event || window.event;
            DOMEvent.standardizeEvent( objEvent );
            return in_fncCallback.call( in_objScope, objEvent );
        }; // end function
        Event.observe( in_objHTMLElement, strEventType, fncRealEvent );
    } // end if

    DOMElement.addEventHandler( in_objHTMLElement, strEventType, in_fncCallback, in_objScope, fncRealEvent );
};

UberEvents.removeEvent = function( in_objHTMLElement, in_strEventType, in_fncCallback )
{
    Util.Assert( TypeCheck.Object( in_objHTMLElement ) );
    Util.Assert( TypeCheck.String( in_strEventType, 1 ) );
    Util.Assert( TypeCheck.Function( in_fncCallback ) );

    var strEventType = UberEvents.properName( in_strEventType );
    var aobjHandlers = DOMElement.removeEventHandler( in_objHTMLElement, strEventType, in_fncCallback );

    var bRegisterOnElement = TypeCheck.EnumKey( strEventType, _UberElementEventList );
    
    if( ( true == bRegisterOnElement ) 
     || ( in_objHTMLElement == window ) )
    {
        for( var nIndex = 0, fncEvent, fncRealEvent; fncEvent = aobjHandlers[ nIndex ]; nIndex++ )
        {
            fncRealEvent = fncEvent.m_vExtraInfo;
            Util.Assert( fncRealEvent );
            try {
                Event.stopObserving( in_objHTMLElement, strEventType, fncRealEvent );
                fncRealEvent = null;
            } // end try
            // ignore.  this blows up on IE6/Win2000 if an IFRAME document
            //  element is no longer valid.
            catch ( e ) { /* ignore */ };
        } // end for
    } // end if
};

UberEvents.genericEventHandler = function( in_objEvent )
{
    var objEvent = in_objEvent || event || window.event ;
    DOMEvent.standardizeEvent( objEvent );
    objEvent.propagating = true;
    var objCurrentNode = objEvent.target;
    // Cache these variables off so we have memory for them.
    var aobjEvent = [ objEvent ];   // cache this off
    var strType = objEvent.type;
    var libDOMElement = DOMElement; // save this to reduce name lookup
    
    
    // Walk back up the DOM Tree looking for nodes that have event handlers
    //  for this event.  If an element has an event handler, run it.
    //  Stop when we have no more nodes or whenever we cancel propagation.
    //  We KNOW the first time through here, we are going to be "propagating"
    //  still.  So don't even check.
    
    do
    {
        objEvent._currentTarget = objCurrentNode;   // add the current target to the event.
        
        // We do not check propagating here so that every handler for this
        //  element gets taken care of.  We cancel after all handlers are done.
        for( var objHandler, 
            aobjEvents = libDOMElement.getEventHandlers( objCurrentNode, strType ), 
            nIndex = 0;
            objHandler = aobjEvents[ nIndex ]; 
            ++nIndex )
        {   
            objHandler.callFunctionFast( aobjEvent );
        } // end if
    } while( ( objEvent.propagating )
        && ( objCurrentNode = objCurrentNode.parentNode ) );
        
    in_objEvent.stopPropagation();
};

UberEvents( document );
