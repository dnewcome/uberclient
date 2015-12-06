
var DOMElement = {};

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
