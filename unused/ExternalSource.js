
function ExternalSourceDisplay()
{
    ExternalSourceDisplay.Base.constructor.apply( this );
};
UberObject.Base( ExternalSourceDisplay, Display );

Object.extend( ExternalSourceDisplay.prototype, {
    RegisterDomEventHandlers: function()
    {
        this.attachButton( 'elementCloseButton', this.hide );
        ExternalSourceDisplay.Base.RegisterDomEventHandlers.apply( this );
    },
    
    init: function( in_objConfig )
    {
        var vRetVal = this.initWithConfigObject( in_objConfig );
        return vRetVal;
    },
    
    show: function( in_strURL )
    {
        Util.Assert( TypeCheck.String( in_strURL ) );
        
        var objResponse = UberXMLHTTPRequest.getWebPage( in_strURL );
        if( objResponse )
        {
            var strHTML = objResponse.responseText;
	        strHTML = strHTML.replace(/<\/?(!doctype|body|head|meta|html|title)[^>]*>/gi, '');
	        //this.setChildHTML( 'elementContents', strHTML );
            var objParent = this.$('elementContents');
            // Remove all of our children so we can repopulate!  YEAH!
            DOMElement.removeChildren( objParent );

            // We do this create the div, remove the first child, etc
            //  because IE sometimes has problems assigning directly 
            //  to the innerHTML on an element that already has children.
            //  why?  who knows.  Found this solution in several places 
            //  on the net.
            var objDiv = DOMElement.createElement( 'div', strHTML );
            objParent.appendChild( objDiv );
        } // end if
        
        ExternalSourceDisplay.Base.show.apply( this );
    }
} );