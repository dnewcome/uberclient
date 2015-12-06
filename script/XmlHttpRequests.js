
(function() {
    UberXMLHTTPRequest = {
    m_strMessagingID: 'xmlhttprequests',
    
	/** 
	*   callWebServiceSync - makes a synchronous (blocking) call to webservice 
	*	@param {String} in_strMethodName name of method to call on webservice
	*	@param {Object} in_objArguments - object of arguments to send to the web service
	*	@return {Object} request object
	*/
	callWebServiceSync : function( in_strMethodName, in_objArguments ) 
	{	
	    Util.Assert( TypeCheck.String( in_strMethodName ) );
	    Util.Assert( TypeCheck.UObject( in_objArguments )  );

	    var strURL = Config.webServiceUrl + in_strMethodName;
        var objArguments = this._prepareArguments( in_objArguments );
        var objRetVal = undefined;
        new Ajax.Request( strURL, {
            asynchronous: false,
            method: 'post',
            parameters: objArguments,
            onSuccess: function( response ) {
                // Firefox offline mode returns 0 as the status
                objRetVal = ( 0 != response.status ) ? response : null;
            },
            onFailure: function( response ) {
                objRetVal = null;
            },
            onComplete: function( response ) {
                UberXMLHTTPRequest.broadcastResponse( response, in_strMethodName, in_objArguments );
            }
        } );
        return objRetVal;
	},
	    
	/** 
	*	makes an async (non blocking fire+forget) webservice call 
	*	@param {String} in_strMethodName - name of method to call on webservice
	*	@param {Object} in_objArguments - object of arguments to send to the web service
	*	@param {Function} in_fncCallback - function to call when request returns
	*   @returns {Object} - the request object if successful
	*/
	callWebServiceAsync : function( in_strMethodName, in_objArguments, in_fncCallback )
	{	
	    Util.Assert( TypeCheck.String( in_strMethodName ) );
	    Util.Assert( TypeCheck.UObject( in_objArguments )  );

	    var strURL = Config.webServiceUrl + in_strMethodName;
	    var objArguments = this._prepareArguments( in_objArguments );
        var objRetVal = new Ajax.Request( strURL, {
            method: 'post',
            parameters: objArguments,
            onComplete: function( response ) {
                UberXMLHTTPRequest.broadcastResponse( response, in_strMethodName, in_objArguments );
            },
            onSuccess: function( response ) {
                // Firefox offline mode returns 0 as the status
                if( 0 !== response.status )
                {
                    Timeout.setTimeout( function() {
                        in_fncCallback( response );
                    }, 0 );
                } // end if
            }
        } );

        return objRetVal;
	},

	/** 
	* Get a web page resource synchronously
	*	@in_strPageName {String} name of page get
	*	@return {object} req request object on success, undefined on failure.
	*/
	getWebPage : function( in_strPageName ) 
	{	
	    Util.Assert( TypeCheck.String( in_strPageName ) );

	    var strURL = in_strPageName;
	    if( Ubernote.m_strUpdateString )
	    {   // force download for debug or when versions change.
	        strURL += '?' + Ubernote.m_strUpdateString;
	    } // end if
        var objRetVal = undefined;
        new Ajax.Request( strURL, {
            asynchronous: false,
            method: 'get',
            onSuccess: function( response ) {
                // Firefox offline mode returns 0 as the status
                objRetVal = ( 0 != response.status ) ? response : null;
            },
            onFailure: function( response ) {
                objRetVal = null;
            },
            onComplete: function( response ) {
                UberXMLHTTPRequest.broadcastResponse( response, 'getWebPage: ' + in_strPageName, null );
            }            
        } );
        return objRetVal;
	},

 
    /**
    * _prepareArguments - prepare the argument string, check for a sessionID, if not there, tack it on.
    * @param {Object} in_objArguments (optional) - arguments to send to web service
    * @returns {Object} - Arguments object with sessionID
    */
    _prepareArguments: function( in_objArguments )
    {
        TypeCheck.UObject( in_objArguments );
        
        in_objArguments = in_objArguments || {};
        in_objArguments.sessionID = Util.getSID();
    	
    	return in_objArguments;
    },

    /**
    * broadcastResponse - broadcast a response to the world.  Takes all
    *   the arguments and passes them on.  The first one should
    *   always be the response.
    */    
    broadcastResponse: function()
    {
        Messages.Raise( 'ajaxresponse', this.m_strMessagingID, arguments );
    }
};
})();