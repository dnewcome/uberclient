/**
* DOMRange - Our Uber Range
*/
function DOMRange( in_objRange, in_objDocument )
{
    in_objRange.m_objDocument = in_objDocument;
    
    DOMRange.standardizeRange( in_objRange );
    return in_objRange;
}

DOMRange.standardizeRange = function( in_objRange ) 
{
    Util.Assert( TypeCheck.Defined( in_objRange ) );
    
    if ( TypeCheck.Undefined( in_objRange.collapsed ) )
    {
        in_objRange.collapsed = true;
    } // end if
    if ( TypeCheck.Undefined( in_objRange.toString ) )
    {   // Used for IE
        in_objRange.toString = function() { return this.text; };
    } // end if
    
    if( TypeCheck.Undefined( in_objRange.htmlText ) )
    {   // Used for W3C to be like IE.  Does not update value if we update the range
        try {
            var objContents = in_objRange.cloneContents() || in_objRange.m_objDocument.createDocumentFragment();
            var objElement = in_objRange.m_objDocument.createElement( 'div' );
            objElement.appendChild( objContents );
            this.htmlText = objElement.innerHTML || '';
            this.text = in_objRange.toString();
        } catch ( e ) { // do nothing 
            this.htmlText = '';
            this.text = '';
        } 
    } // end if
    
    for ( var item in DOMRange )
    {
        if( TypeCheck.Undefined( in_objRange[ item ] ) )
        {
            in_objRange[ item ] = DOMRange[ item ];
        } // end if
    }
};

DOMRange.select = function()
{   // Simulate in W3C IE functionality.
    var objSelection = this.getSelection();
    objSelection.removeAllRanges();
    objSelection.addRange( this );
};

DOMRange.deleteContents = function()
{   // Used for MSIE
    try
    {   // sometimes IE blows up on this.
        this.pasteHTML( '' );
    } catch ( e ) {}
};

DOMRange.insertNode = function( in_objNode )
{   // Used for MSIE
    this.pasteHTML( in_objNode.outerHTML || in_objNode.nodeValue );
};


DOMRange.getSelection = function( in_objDocument )
{
	var objSelection = undefined;
	var objDocument = in_objDocument || this.m_objDocument;
	if( objDocument )
	{
	    if( objDocument.defaultView 
	     && objDocument.defaultView.getSelection )
	    {   // Mozilla
		    objSelection = objDocument.defaultView.getSelection();
	    } // end if
	    else if( objDocument.parentWindow 
	          && objDocument.parentWindow.document )
	    {   // IE
		    objSelection = objDocument.selection;
	    } // end if-else
	} // end if

    return objSelection;
};

DOMRange.collapseToStart = function()
{   // Used for IE
    this.collapse( true );
};

DOMRange.collapseToEnd = function()
{   // Used for IE
    this.collapse( false );
};

DOMRange.parentElement = function()
{   // Used for W3C to be like IE
	var objElement = this.startContainer ? this.startContainer.parentNode : undefined;
	return objElement;
};

DOMRange.pasteHTML = function( in_strHTML )
{   // Used for W3C to be like IE
    Util.Assert( TypeCheck.String( in_strHTML ) );
    this.m_objDocument.execCommand( 'insertHTML', false, in_strHTML );
};

DOMRange.getHTMLText = function()
{   // Used for W3C to be like IE's htmlText
    // the objDocument.createDocumentFragment fixes a Safari problem of returning
    //  null if the range is empty.
    var strRetVal = this.htmlText || this.text; // IE
    
    if( !strRetVal && this.cloneContents )
    {   // W3C
        var objContents = this.cloneContents() || this.m_objDocument.createDocumentFragment();
        var objElement = this.m_objDocument.createElement( 'div' );
        objElement.insertBefore( objContents, null );
        strRetVal = objElement.innerHTML;
    } // end if 
    
    return strRetVal;
};

/**
* getElement - gets the element that the range starts in.  more or less the startContainer.
*/
DOMRange.getElement = function()
{
	var objElement = undefined;
	if( this.startContainer )
	{   // W3C Compatible
	    if( this.startContainer.nodeType == Node.TEXT_NODE )
	    {   // text node
		    objElement = this.startContainer;
	    } // end if
	    else
	    {   // Node
	        var nOffset = this.startOffset;
		    objElement = this.startContainer.childNodes[ nOffset ];
		} // end if-else
	} // end if
	else if( this.parentElement )
	{   // IE
		objElement = this.parentElement();
	} // end if-else if
	return objElement;
};
