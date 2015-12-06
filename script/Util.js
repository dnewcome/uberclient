/**
* `static' utility functions class.
*/
var Util = 
{	
	type : "util",
	
	/**
	* Takes an ISO timestamp and returns a javascript date object
	* @param {String} sqlTimeString (optional) - ISO time formatted string
	* @returns {Date} Javascript Date if valid sqlTimeString, undefined otw.
	*/		
	convertSQLServerTimestamp : function( sqlTimeString )
	{	
		var jsTimeStamp = undefined;
	    if( TypeCheck.String( sqlTimeString ) )
	    {
		    var jsTimeStamp = new Date();
		    jsTimeStamp.setFullYear(	parseInt( sqlTimeString.substring(0,4), 10),
															    parseInt( sqlTimeString.substring(5,7), 10) - 1,
															    parseInt( sqlTimeString.substring(8,10), 10) );
		    jsTimeStamp.setHours(			parseInt( sqlTimeString.substring(11,13), 10),
															    parseInt( sqlTimeString.substring(14,16), 10),
															    parseInt( sqlTimeString.substring(17,19), 10),
    															
															    // What we really want here is a zero padding function
															    // since sql server removes leading zeros for milliseconds
															    parseInt( sqlTimeString.substring(20,22), 10) * 10 );
		    /* adjust for client timezone */
		    jsTimeStamp.setMinutes(jsTimeStamp.getMinutes() - jsTimeStamp.getTimezoneOffset() );
		} // end if
		return jsTimeStamp;
	},
	
	/**
	* Takes a UniqueID and ensures that it is all lower case.
	*	@in_strIDString {string} ID String to convert.
	*/		
	convertSQLServerUniqueID : function( in_strIDString )
	{	
        Util.Assert( in_strIDString );
        var strRetVal = in_strIDString.toLowerCase().strip();

        return strRetVal;
	},
	
	/**
	* logout function
	* Valid values are LOGOUTUSER: Nice user intended logout
	* LOGOUTERROR: logout the user on error, 
	* LOGOUTSESSION: we detect a dead, invalid or no cookie session.
	* all give a different message to the user
	*/
	logout: function(in_strType) 
	{
	    if ( in_strType != 'LOGOUTSESSION' )
	    {
	        UberXMLHTTPRequest.callWebServiceSync( 'UserSessionClose' );  // Not called for invalid session or loss of cookie, otherwise causes looping
	        Cookies.erase( 'ubernoteSID' );
		    Cookies.erase( 'ubernote' );
	    }

    	Messages.Raise( 'validlogout', Messages.all_publishers_id, undefined, true );
	    
		window.location = '../pages/instantrelay.aspx?cmd=' + in_strType;
	},
		
	/**
	* getSID - Gets the SID that was read from the cookie
	* @returns {String} - strSID that was read from the cookie using readSID
	*/
	getSID: function()
	{
	    return this.m_strSID;
	},
	
	/**
	* readSID - read the SID from the cookie and save the value.
	*/
	readSID: function()
	{
	    this.m_strSID = Ubernote.m_bStandaloneEditor ? Ubernote.m_strSID : Cookies.read( 'ubernoteSID' );
	    
	    if ( ( ! this.m_strSID )
	      || ( this.m_strSID.length != 36 ) )
	    {
	        Util.logout( 'LOGOUTSESSION' );
	    } // end if
	},

    
    /**
    * callDBAction - this is a more generic method of doing DB actions than WebServiceSafe.
    *   The eventual plan is to run disconnected, and if we use this to interface with the DB,
    *   and instead of passing in arguments as a string if we pass them in as a JSON object,
    *   we should be able to easily interface with multiple different persistence types.
    *   Right now this calls callWebServiceSafe.
	*	@param {string} in_strMethodName name of method to call on webservice
	*	@param {object} in_objInputArguments (optional) JSON formatted object that holds key/value pairs.
	*	@param {object} io_objOutputArguments (optional) JSON formatted object that holds initially holds keys of
	*       values to be returned.  After returning, holds key/value pairs returned by the DB.
	*	@return {object} req request object
    */
    callDBAction : function( in_strMethodName, in_objInputArguments, io_objOutputArguments ) 
	{
	    Util.Assert( TypeCheck.String( in_strMethodName ) );
        var vRetVal = UberXMLHTTPRequest.callWebServiceSync( in_strMethodName, in_objInputArguments );
        
        if( vRetVal && io_objOutputArguments )
        {   
            Util.decodeXML( vRetVal.responseXML, io_objOutputArguments );
        } // end if
        
        return vRetVal;
	},
	
    /**
    * callDBActionAsync - this is a more generic method of doing DB actions than WebServiceSafe.
    *   The eventual plan is to run disconnected, and if we use this to interface with the DB,
    *   and instead of passing in arguments as a string if we pass them in as a JSON object,
    *   we should be able to easily interface with multiple different persistence types.
    *   Right now this calls callWebServiceSafe.
	*	@param {string} in_strMethodName name of method  to call on webservice
	*	@param {object} in_objInputArguments (optional) JSON formatted object that holds key/value pairs.
	*	@param {object} io_objOutputArguments (optional) JSON formatted object that holds initially holds keys of
	*       values to be returned.  After returning, holds key/value pairs returned by the DB.
	*   @param {function} in_fncCallback (optional) - Callback to call on completion.  If in_objOutputArguments
	*       specified, passes these to function, if not, pass the response object.
	*   @param {object} in_objScope (optional) - object to call the callback function in. If not given, use the
	*       window object
	*	@return {object} req request object
    */
    callDBActionAsync : function( in_strMethodName, in_objInputArguments, io_objOutputArguments, 
        in_fncCallback, in_objScope ) 
	{
	    Util.Assert( TypeCheck.String( in_strMethodName ) );
	    var OnComplete = function( in_objResp )
	    {
	        // We still do this even if we have no callback
	        //  in the off chance that the caller is checking this
	        //  on a timer.
            if( in_objResp && io_objOutputArguments )
            {   
                Util.decodeXML( in_objResp.responseXML, io_objOutputArguments );
            } // end if
            // Call the callback with either the decode io_objOutputArguments 
            //  or straight up the response if not given.
            if( in_fncCallback )
            {
                in_fncCallback.apply( in_objScope || window, 
                    [ io_objOutputArguments || in_objResp ] );
            } // end if
	    };
	    
        var vRetVal = UberXMLHTTPRequest.callWebServiceAsync( in_strMethodName, in_objInputArguments, OnComplete );	
        return vRetVal;
	},
		
    decodeXML: function( in_objXMLHead, io_objOutputArguments )
    {
        // iterate through each value.
        for( var strFieldName in io_objOutputArguments )
        {   
            if( true === TypeCheck.Array( io_objOutputArguments[ strFieldName ] ) )    
            {
                _processArray( strFieldName, in_objXMLHead, io_objOutputArguments );
            } // end if
            else if( true === TypeCheck.Object( io_objOutputArguments[ strFieldName ] ) )
            {   // Means we have a nested object that we need to look for.  Look for its head
                // in the XML and then continue.
                var objXMLHead = in_objXMLHead.getElementsByTagName( strFieldName )[0];
                Util.decodeXML( objXMLHead, io_objOutputArguments[ strFieldName ] );
            } // end if-else
            else
            {   // a normal value.getAllElementsByTagNameValue
                var vValue = DOMElement.getAllElementsByTagNameValue( in_objXMLHead, strFieldName );
                if( ( true === TypeCheck.Defined( vValue ) )
                 && ( true === TypeCheck.Function( io_objOutputArguments[ strFieldName ] ) ) )
                {   // this means there is a filter, so apply it.
                    vValue = io_objOutputArguments[ strFieldName ]( vValue );
                } // end if
                io_objOutputArguments[ strFieldName ] = vValue;
            } // end if-else
        } // end for
        
    	function _processArray ( in_strFieldName, in_objXMLHead, io_objOutputArguments )
        {
	        // We have an array.  Here is what we have to do.  
            //  1. Use the first element of this array as the template.  
            //  2. Copy the template for each item in the XML.  
            //  3. Populate the fields in the template.
            //  
            var objFields = io_objOutputArguments[ in_strFieldName ][0];
            // Find the matching items in the XML and the number we have.
            var objElements = in_objXMLHead.getElementsByTagName( in_strFieldName );
            for( var i = 0, objCurrItems; objCurrItems = objElements[ i ]; i++ )
            {
                // Set each array value to the fields so we can go find what we need.
                var objNewObject = Object.clone( objFields );
                io_objOutputArguments[ in_strFieldName ][ i ] = objNewObject;

                // Now that it is set for this individual one, go and continue to build the tree.
                Util.decodeXML( objCurrItems, objNewObject );
            } // end for
            
            if( 0 === objElements.length )
            {
                io_objOutputArguments[ in_strFieldName ] = [];
            } // end if
        } // end function

    },
		
	/**
	* clean an ID of any "-"'s, convert to lowercase, and prepend an X
	* @in_strString {string} - String to clean
	*/
	cleanID: function ( in_strString )
	{
	    Util.Assert( in_strString );
	    
	    // strip out the '-'
	    var strReturn = in_strString.replace( /-/g, '' ).toLowerCase();
	    return strReturn;
	},
	
	/**
	* escapeTags - replaces < with &lt; and and > with &gt;
	* @param {String} in_strString - String to escape the tags.
	* @returns {String} string with tags escaped
	*/
	escapeTags: function( in_strString )
	{
	    var strRetVal = in_strString.replace(/</gi, '&lt;');
	    strRetVal = strRetVal.replace(/>/gi, '&gt;');
	    return strRetVal;
	},
	
	/**
	* unescapeTags - replaces &lt; with < and &gt with >;
	* @param {String} in_strString - String to unescape the tags.
	* @returns {String} string with tags unescaped
	*/
	unescapeTags: function( in_strString )
	{
	    var strRetVal = in_strString.replace(/&lt;/gi, '<');
	    strRetVal = strRetVal.replace(/&gt;/gi, '>');
	    return strRetVal;
	},
	
	objectHasProperties: function ( in_objObject )
    {
        var bRetVal = false;
        for ( var property in in_objObject )
        {
            if( in_objObject.hasOwnProperty( property ) )
            {
                bRetVal = true;
                break;
            } // end if
        } // end for
        return bRetVal;
    },
    
    Assert: function( i_bFact, i_strDetails )
    {
        // If Config.bSuppressAssertions does not exist or is false, show the assertion.
        if( ( window.Config && !window.Config.bSuppressAssertions ) && ( ! i_bFact ) )
        { 
	    	// Raise an anonymous message blocking style  We do this instead of a direct call to SysError
	    	// to reduce that dependency.  But yes, we now have a cyclic dependancy between Util and Messages.
	    	// This also allows us to register a listener for raiseerror for testing.
	    	Messages.Raise( 'raiseerror', Messages.all_publishers_id, 
	    	    [ 'Assert', ErrorLevels.eErrorType.ASSERT, ErrorLevels.eErrorLevel.MEDIUM, i_strDetails || '' ], true );
        } // end if
        
        return this;
    },
    
    
	getWindowSize: function()
	{
		var height, width;
		
		if( typeof( window.innerHeight ) == 'number' ) {
			height = window.innerHeight;
			width = window.innerWidth;
		}
		else if( document.documentElement && document.documentElement.clientHeight ) {
			height = document.documentElement.clientHeight;
			width = document.documentElement.clientWidth;
		}
		else if( document.body && document.body.clientHeight ) {
			height = document.body.clientHeight;
			width = document.body.clientWidth;
		}
		
        return Util.dimensionize( {
			x: width,
			y: height
		} );
	},
    
    /**
    * dimensionize - creates a standard dimension object with both x/y and width/height pairs.
    */
    dimensionize: function( in_objDimensions )
    {
        in_objDimensions.x = in_objDimensions.x || in_objDimensions.width;
        in_objDimensions.width = in_objDimensions.x || in_objDimensions.width;
        
        in_objDimensions.y = in_objDimensions.y || in_objDimensions.height;
        in_objDimensions.height = in_objDimensions.y || in_objDimensions.height;
        return in_objDimensions;
    },

    positionize: function( in_objPosition )
    {
        in_objPosition.x = in_objPosition.x || in_objPosition[0];
        in_objPosition[0] = in_objPosition.x || in_objPosition[0];
        
        in_objPosition.y = in_objPosition.y || in_objPosition[1];
        in_objPosition[1] = in_objPosition.y || in_objPosition[1];
        return in_objPosition;
    },
    
    /**
    * AssignIfDefined - assign a value if it is defined, otherwise use the default value.
    * @param {variant} in_vPossible - Possible, assign if type is not "undefined"
    * @param {variant} in_vDefault - Default value if typeof "in_vPossible" is "undefined"
    * @returns {variant} value.
    */
    AssignIfDefined: function( in_vPossible, in_vDefault )
    {
        var vRetVal = in_vPossible;
        if( false == TypeCheck.Defined( in_vPossible ) )
        {
            vRetVal = in_vDefault;
        } // end if
        
        return vRetVal;
	}, 
	
	AssignValueIfDefined: function( in_vCheck, in_vValue, in_vElseValue )
	{
	    var vRetVal = in_vValue;
	    if( false == TypeCheck.Defined( in_vCheck ) )
	    {
	        vRetVal = in_vElseValue;
	    } // end if
	    
	    return vRetVal;
	},

	/**
	* Debug page launcher: call this from the debug hotkey handler.  Really all
	*	we want to do is launch the desired page in a new window with a reference 
	*	into the running application.
	* @in_url : this is the url of the page to load
	*/
	launchDebugPage: function( in_url )
	{
		// TODO: we should give the app a way to know if there is a debug page loaded
		// this way we can use tracelogging or even allow shanes smps window to be external
		// we might be able to update the code that was originally in the profiler.js file
		// we could use this to attach a profiler.  I still think that there should be a way
		// to insert profiling code dynamically while the app is running.		
		window.open( in_url ); 
	},
	
	/**
	* OnJavascriptError - fired when we have an error in the main window object.
	* @param {String} in_strMessage - the browser thrown message.
	*/
	OnJavascriptError: function( in_strMessage )
	{
        if( Config.bAlertOnError )
        {
            Messages.Raise( 'raiseerror', Messages.all_publishers_id, 
                [ 'Javascript Error', ErrorLevels.eErrorType.ERROR, 
                ErrorLevels.eErrorLevel.MEDIUM, in_strMessage ], true );
        } // end if
	},
	
    /**
    * openWindow - Open a window with the specified URL
    * @param {String} in_strURL - URL to open
    */
    openWindow: function( in_strURL )
    {
        var strOptions = 
               'outerHeight=' + Config.nPopupHeight
             + ',outerWidth=' + Config.nPopupWidth
             + ',height=' + Config.nPopupHeight
             + ',width=' + Config.nPopupWidth
             + ',resizable'
             + ',scrollbars'
             + ',menubar=no'
             + ',directories=no'
             + ',toolbar=no'
             + ',zoominherit=yes'
             + ',location=no';

        // Keep the count and increment it so that we can open multiple notes at once.
        var objNewWindow = window.open( in_strURL, Util.openWindow.count.toString(), strOptions );
        if( objNewWindow && objNewWindow.focus )
        {
            objNewWindow.focus();
        } // end if
        
        Util.openWindow.count++;
    }
};

/**
* count - keep track of how many external windows we have opened
*/
Util.openWindow.count = 0;


// External Source: http://www.piemenus.com/piemenu.htc
function parseBool(val, def)
{
  if( TypeCheck.Undefined( def ) )
  {
    def = false;
  } // end if
  
  if ((val == true) ||
      (val == false)) {
    return val;
  } // if

  var result = false;

  var ival =
    parseInt(val);

  if (isNaN(ival)) {
    var lowerVal =
      val.toLowerCase();
    switch (lowerVal)
    {
        case '1':
        case 'true':
        case 't':
        case 'yes':
        case 'y':
        case 'on':
            result = true;
            break;
        case '0':
        case 'false':
        case 'f':
        case 'no':
        case 'n':
        case 'off':
            result = false;
            break;
        default:
            result = def ? true : false;
     } // end switch
  } else {
      result = ival ? true : false;
  } // if

  return result;
}

/**
* parseInt10 - like parseInt, but always base 10.
* @param {String} in_strValue - string to convert.
* @returns {Number} - converted base 10 number.
*/
function parseInt10( in_strValue )
{
    var nRetVal = parseInt( in_strValue, 10 );
    return nRetVal;
};

/**
* Formats the number according to the 'format' string; 
* adherses to the american number standard where a comma 
* is inserted after every 3 digits.
*  note: there should be only 1 contiguous number in the format, 
* where a number consists of digits, period, and commas
*        any other characters can be wrapped around this number, including '$', '%', or text
*        examples (123456.789):
*          '0′ - (123456) show only digits, no precision
*          '0.00′ - (123456.78) show only digits, 2 precision
*          '0.0000′ - (123456.7890) show only digits, 4 precision
*          '0,000′ - (123,456) show comma and digits, no precision
*          '0,000.00′ - (123,456.78) show comma and digits, 2 precision
*          '0,0.00′ - (123,456.78) shortcut method, show comma and digits, 2 precision
*
* @method format
* @param format {string} the way you would like to format this text
* @return {string} the formatted number
* @public
*/ 

if( !Number.prototype.format )
{
    Number.prototype.format = function(format) {
      if (! TypeCheck.String(format)) {return '';} // sanity check 

      var hasComma = -1 < format.indexOf(','),
        psplit = format.split('.'),
        that = this; 

      // compute precision
      if (1 < psplit.length) {
        // fix number precision
        that = that.toFixed(psplit[1].length);
      }
      // error: too many periods
      else if (2 < psplit.length) {
        throw('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
      }
      // remove precision
      else {
        that = that.toFixed(0);
      } 

      // get the string now that precision is correct
      var fnum = that.toString(); 

      // format has comma, then compute commas
      if (hasComma) {
        // remove precision for computation
        psplit = fnum.split('.'); 

        var cnum = psplit[0],
          parr = [],
          j = cnum.length,
          m = Math.floor(j / 3),
          n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop 

        // break the number into chunks of 3 digits; first chunk may be less than 3
        for (var i = 0; i < j; i += n) {
          if (i != 0) {n = 3;}
          parr[parr.length] = cnum.substr(i, n);
          m -= 1;
        } 

        // put chunks back together, separated by comma
        fnum = parr.join(','); 

        // add the precision back in
        if (psplit[1]) {fnum += '.' + psplit[1];}
      } 

      // replace the number portion of the format with fnum
      return format.replace(/[\d,?\.?]+/, fnum);
    };
}

Object.extendIfMissing = function(destination, source) {
  if( destination === source )
  {
    return;
  } // end if
  for (var property in source)
  {
    if( 'undefined' === typeof( destination[property] ) )
    {
        destination[property] = source[property];
    } // end if
  } // end for
  return destination;
};

Object.updateIfAvailable = function(destination, source) {
  if( destination === source )
  {
    return;
  } // end if
  for (var property in destination)
  {
    if( 'undefined' !== typeof( source[property] ) )
    {
        destination[property] = source[property];
    } // end if
  } // end for
  return destination;
};