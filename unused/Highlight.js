
var Highlight = {};

Object.extend( Highlight, {
    /**
    * removeHighlightInline - Removes the highlighting
    * @param {Object} in_objDocument - the document to remove the highlighting from.
    */
    removeHighlightInline: function( in_objDocument )
    {
        var aobjElements = DOMElement.getElementsByClassName( in_objDocument.body, '*', 'uberSearch' );
        
        for( var nIndex = 0, objElement; objElement = aobjElements[ nIndex ]; ++nIndex )
        {
            //We can guarantee the words before and after are text nodes, we created them.  
            //So join them all back together.
            var strText = objElement.previousSibling.nodeValue + objElement.firstChild.nodeValue + objElement.nextSibling.nodeValue;
            var objNewElement = in_objDocument.createTextNode( strText );
            objElement.parentNode.insertBefore( objNewElement, objElement.previousSibling );
            objElement.parentNode.removeChild( objElement.previousSibling );
            objElement.parentNode.removeChild( objElement.nextSibling );
            objElement.parentNode.removeChild( objElement );
        } // end for
    },
    

    /**
    * highlightWordInline - Highlight a document
    * @param {Object} node - The head node to start from.
    * @param {String} word - The word to search for
    * @param {Object} in_objDocument - the document to remove the highlighting from.
    */
    highlightWordInline: function( node, word, in_objDocument ) 
    {
	    // Iterate into this nodes childNodes
	    if (node.hasChildNodes) {
		    var hi_cn;
		    for (hi_cn=0;hi_cn<node.childNodes.length;hi_cn++) {
			    Highlight.highlightWordInline(node.childNodes[hi_cn],word, in_objDocument);
		    }
	    }
    	
	    // And do this node itself
	    if ( node.nodeType == Node.TEXT_NODE ) { // text node
		    tempNodeVal = node.nodeValue.toLowerCase().stripaccents();
		    tempWordVal = word.toLowerCase().stripaccents();
		    if (tempNodeVal.indexOf(tempWordVal) != -1) {
			    pn = node.parentNode;
			    // check if we're inside a "nosearchhi" zone
			    checkn = pn;
			    while (checkn.nodeType != Node.DOCUMENT_NODE && 
			    checkn.nodeName.toLowerCase() != 'body') { 
			    // 9 = top of doc
				    if (checkn.className.match(/\bnosearchhi\b/)) { return; }
				    checkn = checkn.parentNode;
			    }
			    if (pn.className != 'uberSearch' ) {
				    // word has not already been highlighted!
				    nv = node.nodeValue;
				    ni = tempNodeVal.indexOf(tempWordVal);
				    // Create a load of replacement nodes
				    before = in_objDocument.createTextNode(nv.substr(0,ni));
				    docWordVal = nv.substr(ni,word.length);
				    after = in_objDocument.createTextNode(nv.substr(ni+word.length));
				    hiwordtext = in_objDocument.createTextNode(docWordVal);
				    hiword = in_objDocument.createElement('span');
				    hiword.className = 'uberSearch';
				    //hiword.style.backgroundColor = 'yellow';
				    hiword.appendChild(hiwordtext);
			        pn.insertBefore(before,node);
			        pn.insertBefore(hiword,node);
			        pn.insertBefore(after,node);
				    pn.removeChild(node);
			    }
		    }
	    }
    }
    

} );


Object.extend( Highlight, {
    /* Set these up as pseudonyms for the above 
    *  We do this as a two step process so the functions 
    *   are created before we try the assignment, otherwise they do not exist
    */
    removeHighlight: Highlight.removeHighlightInline,
    highlightWord: Highlight.highlightWordInline
} );
