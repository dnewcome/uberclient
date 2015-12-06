 
function ButtonBehavior( in_strEnding )
{
    var strMessagingID;
    var strMouseDownEvent = 'btnMouseDown' + in_strEnding;
    var strMouseOverEvent = 'btnMouseOver' + in_strEnding;
    var strButtonWidgetClassName = 'ButtonWidget' + in_strEnding;
    
    this.ApplyBehavior = function( domContainer, in_objAltRegistration )
	{   
	    if( ! strMessagingID )
	    {
            strMessagingID = Messages.generateID();
        } // end if
        
	    if( domContainer )
	    {
	        if( in_objAltRegistration && in_objAltRegistration.RegisterListener )
	        {
                in_objAltRegistration.RegisterListener( 'mouseover', domContainer, OnMouseOver, undefined );
                in_objAltRegistration.RegisterListener( 'mouseout', domContainer, OnMouseOut, undefined );
	            in_objAltRegistration.RegisterListener( 'mousedown', domContainer, OnMouseDown, undefined );
	            in_objAltRegistration.RegisterListener( 'mouseup', domContainer, OnMouseUp, undefined );
	            in_objAltRegistration.RegisterListener( 'click', domContainer, OnClick, undefined );
	        } // end if
	        else
	        {
                Messages.RegisterListener( 'mouseover', domContainer, strMessagingID, OnMouseOver );
                Messages.RegisterListener( 'mouseout', domContainer, strMessagingID, OnMouseOut );
    	        Messages.RegisterListener( 'mousedown', domContainer,strMessagingID, OnMouseDown );
	            Messages.RegisterListener( 'mouseup', domContainer, strMessagingID, OnMouseUp );
	            Messages.RegisterListener( 'click', domContainer, strMessagingID, OnClick );
            } // end if-else	    
		    DOMElement.removeClassName( domContainer, 'ControlWidget' );
    		DOMElement.addClassName( domContainer, strButtonWidgetClassName );
    		domContainer._button = true;
		} // end if
	};

	this.RemoveBehavior = function( domContainer, in_objAltRegistration )
	{   
	    if( ! strMessagingID )
	    {
            strMessagingID = Messages.generateID();
        } // end if

	    if( domContainer )
	    {
	        if( in_objAltRegistration && in_objAltRegistration.UnRegisterListener )
	        {
	            in_objAltRegistration.UnRegisterListener( 'mouseover', domContainer, OnMouseOver );
	            in_objAltRegistration.UnRegisterListener( 'mouseout', domContainer, OnMouseOut );
	            in_objAltRegistration.UnRegisterListener( 'mousedown', domContainer, OnMouseDown );
	            in_objAltRegistration.UnRegisterListener( 'mouseup', domContainer, OnMouseUp );
	            in_objAltRegistration.UnRegisterListener( 'click', domContainer, OnClick );
	        } // end if
	        else
	        {
    	        Messages.UnRegisterListener( 'mouseover', domContainer, strMessagingID );
	            Messages.UnRegisterListener( 'mouseout', domContainer, strMessagingID );
	            Messages.UnRegisterListener( 'mousedown', domContainer, strMessagingID );
    	        Messages.UnRegisterListener( 'mouseup', domContainer, strMessagingID );
    	        Messages.UnRegisterListener( 'click', domContainer, strMessagingID );
    	    } // end if-else
    	    domContainer._button = false;
	    } // end if
	};
	
	var OnMouseOver = function( in_objEvent ) { DOMElement.addClassName( in_objEvent._currentTarget, strMouseOverEvent ); };
	var OnMouseOut = function ( in_objEvent ) { DOMElement.removeClassName( in_objEvent._currentTarget, strMouseOverEvent ); };
	var OnMouseDown = function( in_objEvent ) { DOMElement.addClassName( in_objEvent._currentTarget, strMouseDownEvent ); };
	var OnMouseUp = function( in_objEvent ) { DOMElement.removeClassName( in_objEvent._currentTarget, strMouseDownEvent ); };
	var OnClick = function( in_objEvent ) { in_objEvent.cancelEvent(); };
};

var BasicButtonBehavior = new ButtonBehavior( '' );
var TransparentButtonBehavior = new ButtonBehavior( 'Trans' );
