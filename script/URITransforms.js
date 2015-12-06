var URITransforms = {
    /**
    * proxySrcURIs - converts all SRC URIs to be proxied through the in_strProxyBaseURL
    *   for example: <img src="www.fakeurl.com/image1.gif' /> 
    *       if given the proxy of "http://www.proxy.com?url=" is converted to:
    *                <img src="http://www.proxy.com?url=www.fakeurl.com/image1.gif" />
    * @param {String} in_strInput - input string to add proxied URIs to
    * @param {String} in_strProxyBaseURL - URL to add as the proxy
    * @returns {String} converted string.
    */
    proxySrcURIs: function( in_strInput, in_strProxyBaseURL )
    {
        return this.convertSRC( in_strInput, function ( entire_src, uri ) {
            var strRetVal = ' src="';
            if( -1 == uri.indexOf( in_strProxyBaseURL ) )
            {   // don't convert any URIs that already have the proxy on the front.
                strRetVal += in_strProxyBaseURL;
            } // end if
            
            return strRetVal + uri + '"';
        } );

    },
    
    /**
    * unproxySrcURIs - removes the proxying of a URI created with proxySrcURIs
    * @param {String} in_strInput - input string to remove proxied URIs from
    * @param {String} in_strProxyBaseURL - URL to search for as the proxy
    * @returns {String} converted string.
    */
    unproxySrcURIs: function( in_strInput, in_strProxyBaseURL )
    {
        return this.convertSRC( in_strInput, function ( entire_src, uri ) {
            // If the string STARTS with the proxy base URL, then remove it.
            nStartPos = ( 0 == uri.indexOf( in_strProxyBaseURL ) ) ? in_strProxyBaseURL.length : 0;
            return ' src="' + uri.substr( nStartPos ) + '"';
        } );
    },
    
    /**
    * convertSRC - convert the SRC attributes of iframe, img, script, and object 
    *   tags given a converter.
    * @param {String} in_strInput - string to convert
    * @param {Function} in_fncConverter - converter function, will be passed two paramters, 
    *   the entire src string, as well as the uri.
    * @returns {String} converted string.
    */ 
    convertSRC: function( in_strInput, in_fncConverter )
    {
        return in_strInput.replace(/<(iframe|img|script|object) [^>]*src[^>]*>/gi, function( entire_match ) {
            // Keep these separated so we don't mix " and '
            entire_match = entire_match.replace(/ src=[\"]([^\"]+)[\"]/gi, in_fncConverter); // W3C
            entire_match = entire_match.replace(/ src=[\']([^\']+)[\']/gi, in_fncConverter); // W3C
            entire_match = entire_match.replace(/ src=([^\s\"\'>]+)/gi, in_fncConverter); // IE
            return entire_match;
		});
    }
};