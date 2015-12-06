// Mock Util for testing purposes

var Util = {
    Assert: function( i_bFact, i_strDetails )
    {
        fireunit.ok( !!i_bFact, i_strDetails || 'Util.Assert: no details given' );
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
    
    /**
    * callDBActionAsync
    */
    callDBActionAsync: function( in_strMethodName, in_objInputArguments, io_objOutputArguments, 
        in_fncCallback, in_objContext ) 
    {
        this.m_objDBActionConfig = {
            method: in_strMethodName,
            input: in_objInputArguments,
            output: io_objOutputArguments,
            callback: in_fncCallback,
            context: in_objContext
        };
        
        if( in_fncCallback )
        {
            in_fncCallback.apply( in_objContext, [ {} ] );
        } // end if
    },
    
    /**
    * getLastDBCall - returns the configuration of the last DB call.
    * @returns {Object} if available, configuration of the last call to 
    *   callDBAction or callDBActionAsync 
    */
    getLastDBCall: function()
    {
        return this.m_objDBActionConfig;
    },
    
    /**
    * resetLastDBCall - reset the last DB call.
    */
    resetLastDBCall: function()
    {
        this.m_objDBActionConfig = undefined;
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
	}
};