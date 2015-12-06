/** 
* Class Drag - handles drag and drop within the application.  
* This is a singleton class
*/ 
function Drag()
{	
	var me = this;
	this.type = 'drag';
	this.dragging = false; // drag mode indicator

	this.start = start;//( obj, dragCallback, dropCallback )
	this.regDropTarget = regDropTarget;//( fn )
	this.unregDropTarget = unregDropTarget;//()
	this.cancelDrag = cancelDrag;
	this.queryDragSource = queryDragSource;//()
	this.m_strMessagingID = Messages.generateID();
    this.m_objDragElement = undefined;	
    var m_objDragTimer = undefined;
	var m_nDragTriggerDelay = 300;
	
	var m_nXOffset = 3;
	var m_nYOffset = -15;
	
	var dragSource = null; // the object that we are dragging
	
	var dragHandler; // call while dragging
	var dragHandlerContext;
	
	var dropHandler; // call after letting go, regardless of successful drop
	var dropHandlerContext;
	
	var dropTarget = null; // function to call when we drop
	var dropTargetContext;
	
	
		
	/**
	* Initiates drag operation by registering event handlers for drag action 
	* and drag end.	
	* @in_obj {object} The object that we are dragging
	* @in_dragCallback {function} (optional) Callback function to call when performing drag action
	* @in_dragCallbackContext {object} (optional) scope to call in_dragCallback
	* @in_dropCallback {function} (optional) Callback function to call when performing the drop action
	* @in_dropCallbackContext {object} (optional) scope to call in_dropCallback
	* @in_strDragImageURL {string} (optional) - URL to the icon to display on drag.
	* @in_strDragText {string} (optional) - Text to display in a small drag item.
	* @in_objCoordinates {object} (conditional) - Coordinates to start at.
	*/
	function start( in_obj, in_dragCallback, in_dragCallbackContext, in_dropCallback, in_dropCallbackContext,
	    in_strDragImageURL, in_strDragText, in_objCoordinates )
	{	
	    if( me.dragging )
	    {   // already dragging, get rid of the current drag item.  FF3 has a problem with
	        // this happening on double click.
	        cancelDrag();
	    } // end if
        	    
		me.dragging = true;
        
        // Cancel all move's until the drag has started or we cancel.  We do this so we don't start
        // highlighting everyting in the document.
        UberEvents.addEvent( document, 'onmousemove', cancelEvent );

        // We do this to give us time to see if any other events took care of this (such as a click) and we
        //  really don't want to drag.	
	    m_objDragTimer = Timeout.setTimeout( function(){ _delayedStart( in_obj, in_dragCallback, in_dragCallbackContext, 
	        in_dropCallback, in_dropCallbackContext, in_strDragImageURL, in_strDragText,
	        in_objCoordinates ); }, m_nDragTriggerDelay );
    }
    
    /**
    * cancelEvent - cancels an event.
    * @param {Object} in_objEvent (optional) - possible event to cancel.  
    *   If not defined, looks for event or window.event.
    */
    function cancelEvent( in_objEvent )
    {
        DOMEvent( in_objEvent );
        in_objEvent.cancelEvent();
    } // end if
    
    /**
    * _delayedStart - Does the actual processing for the starting of processing.  We
    *   do a delayed start so that we can process other events on the same DOMEvent.
    */
    function _delayedStart( in_obj, in_dragCallback, in_dragCallbackContext, in_dropCallback, in_dropCallbackContext,
	    in_strDragImageURL, in_strDragText, in_objCoordinates )
    {
        if( true == me.dragging )
        {
		    dragSource = in_obj;
    		
		    dragHandler = in_dragCallback;
		    dragHandlerContext = in_dragCallbackContext;
    		
		    dropHandler = in_dropCallback;
		    dropHandlerContext = in_dropCallbackContext;
    		
		    // We aren't going to use the SMPS for the onmousemove for performance reasons.
    		UberEvents.removeEvent( document, 'onmousemove', cancelEvent );
            UberEvents.addEvent( document, 'onmousemove', drag );
		    UberEvents.addEvent( document, 'onmouseup', end );
		    
		    // We do this so that we do not have to manually unregister targets, but only 
		    //  register a drag using the onmouseover of "droppable" targets.
           // UberEvents.addEvent( document, 'onmouseover', unregDropTarget );
        
    		
    		var objDragElement = undefined;
    		
		    if( in_strDragImageURL )
		    {
		        var objDragElement = document.createElement( 'img' );
		        objDragElement.src = in_strDragImageURL;
		    } // end if
		    
		    if( ! objDragElement && in_strDragText )
		    {
		        var objDragElement = document.createElement( 'span' );
		        objDragElement.innerHTML = in_strDragText;
		    } // end if
		    
		    if( objDragElement )
		    {
		        objDragElement.className = 'UberDragElement';
    		    
		        objDragElement.style.left = in_objCoordinates.x + m_nYOffset;
		        objDragElement.style.top = in_objCoordinates.y + m_nXOffset;
    		    objDragElement.style.position = 'absolute';
    		    
		        document.getElementsByTagName('body')[0].appendChild( objDragElement );
    
                // We want to cancel onmouseover events when our cursor runs over
                //  the image.
                UberEvents.addEvent( objDragElement, 'onmouseover', DOMEvent.cancelEvent );
    		    
		        me.m_objDragElement = objDragElement;
		    } // end if
		} // end if
	}
	
	/**
	* registers a function to call when drop occurs
	*/
	function regDropTarget( in_function, in_context )
	{
		dropTarget = in_function;
		dropTargetContext = in_context;
	}
	
	/**
	* allow Drop targets to find out what is being dragged over it
	*/
	function queryDragSource()
	{
		return dragSource;
	}
	
	/**
	* unregisters the currently regged drop target
	*/
	function unregDropTarget()
	{
        dropTarget = null;
	}
	
	/**
	* Handler that performs the drag action
	*/
	function drag( in_objEvent ) 
	{	// This wasn't registered with SMPS, soo, standardize it.
	    DOMEvent( in_objEvent );
	    var objEvent = in_objEvent;
	    
		if( me.m_objDragElement )
		{
		    var objCoordinates = Event.pointer( objEvent );

		    me.m_objDragElement.style.left = objCoordinates.x + m_nXOffset;
		    me.m_objDragElement.style.top = objCoordinates.y + m_nYOffset;
        } // end if

		/* call the callback passed in start() if we have one */
		if( dragHandler )
		{
			dragHandler.apply( dragHandlerContext, [ objEvent ] ); 
		}
		
		objEvent.cancelEvent();
	}
	
	/**
	* call this from any "onclicks" handlers that are also registered on the same element
	*   as this drag was called from.  This ensures the click gets called and we don't start
	*   dragging all over the place.
	*/
	function cancelDrag()
	{
		UberEvents.removeEvent( document, 'onmousemove', cancelEvent );
		dropTarget = null;
		dropHandler = null;
		end();
	}
	
	/**
	* Terminates drag operation by unregistering event handlers and calling the drop callback fn
	*/
	function end( in_objEvent ) 
	{	
	    // clear this timeout so we don't end the drag but then start the delayed timer.
        Timeout.clearTimeout( m_objDragTimer );
		me.dragging = false;
		me.dragSource = null;
		
		UberEvents.removeEvent( document, 'onmousemove', drag  );
		UberEvents.removeEvent( document, 'onmouseup', end );
        UberEvents.removeEvent( document, 'onmouseover', unregDropTarget );
		
		if( me.m_objDragElement )
		{
            UberEvents.removeEvent( me.m_objDragElement, 'onmouseover', DOMEvent.cancelEvent );
            document.getElementsByTagName( 'body' )[0].removeChild( me.m_objDragElement );
            me.m_objDragElement = undefined;
		} // end if
		
		if( dropTarget ) 
		{
			// do the drop
			dropTarget.call( dropTargetContext, dragSource ); 
		}
		
		if( dropHandler )
		{
			// call the callback passed in start() if we have one
			dropHandler.call( dropHandlerContext );
		}
		
		dropTarget = null;
		dropHandler = null;
	}
}