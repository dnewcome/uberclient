
var Timeout = {
    m_objFunctionList: {},
    m_nTimeoutCount: 0,
    
    /**
    * setTimeout - replacement for system setTimeout that takes a scope!
    * @param {Function} in_fncFunction - function to call
    * @param {number} in_nTimeout - timeout to call after
    * @param {Object} in_objScope (optional) - optional scope to call in.
    * @param {Array} in_avArguments (optional) - Array of arguments to pass to the function.
    * @returns {Object} - timeout ID to use for resetting/cancelling.
    */
    setTimeout: function( in_fncFunction, in_nTimeout, in_objScope, in_avArguments )
    {
        Util.Assert( TypeCheck.Function( in_fncFunction ) );
        Util.Assert( TypeCheck.Number( in_nTimeout ) );
        Util.Assert( TypeCheck.Undefined( in_objScope ) || TypeCheck.Object( in_objScope ) );
        Util.Assert( TypeCheck.Undefined( in_avArguments ) || TypeCheck.ArrayLike( in_avArguments ) );
    
        var strID = Timeout.m_nTimeoutCount.toString();
        Timeout.m_nTimoutCount++;
        
        this.m_objFunctionList[ strID ] = in_fncFunction.bind( in_objScope || window );
        return strID;
    },
    
    /**
    * setInterval - replacement for system setInterval that takes a scope!
    * @param {Function} in_fncFunction - function to call
    * @param {number} in_nInterval - interval to call after
    * @param {Object} in_objScope (optional) - optional scope to call in.
    * @param {Array} in_avArguments (optional) - Array of arguments to pass to the function.
    * @returns {Object} - interval ID to use for resetting/cancelling.
    */
    setInterval: function( in_fncFunction, in_nTimeout, in_objScope, in_avArguments )
    {
        Util.Assert( TypeCheck.Function( in_fncFunction ) );
        Util.Assert( TypeCheck.Number( in_nTimeout ) );
        Util.Assert( TypeCheck.Undefined( in_objScope ) || TypeCheck.Object( in_objScope ) );
        Util.Assert( TypeCheck.Undefined( in_avArguments ) || TypeCheck.ArrayLike( in_avArguments ) );
    
        var strID = Timeout.m_nTimeoutCount.toString();
        Timeout.m_nTimoutCount++;
        
        this.m_objFunctionList[ strID ] = in_fncFunction.bind( in_objScope || window );
        return strID;
    },
    
    /**
    * resetTimeout - replacement for system setTimeout that takes a scope!
    * @param {Object} in_objTimeoutID (optional) - ID of timeout to cancel.
    * @param {Function} in_fncFunction - function to call
    * @param {number} in_nTimeout - timeout to call after
    * @param {Object} in_objScope (optional) - optional scope to call in.
    * @param {Array} in_avArguments (optional) - Array of arguments to pass to the function.
    * @returns {Object} - NEW timeout ID to use for resetting/cancelling.
    */
    resetTimeout: function( in_objTimeoutID, in_fncFunction, in_nTimeout, in_objScope, in_avArguments )
    {
        Util.Assert( TypeCheck.Function( in_fncFunction ) );
        Util.Assert( TypeCheck.Number( in_nTimeout ) );
        Util.Assert( TypeCheck.Undefined( in_objScope ) || TypeCheck.Object( in_objScope ) );
        Util.Assert( TypeCheck.Undefined( in_avArguments ) || TypeCheck.Array( in_avArguments ) );
        
    },
    
    /**
    * resetInterval - replacement for system setInterval that takes a scope!
    * @param {Object} in_objIntervalID (optional) - ID of interval to cancel.
    * @param {Function} in_fncFunction - function to call
    * @param {number} in_nInterval - interval to call after
    * @param {Object} in_objScope (optional) - optional scope to call in.
    * @param {Array} in_avArguments (optional) - Array of arguments to pass to the function.
    * @returns {Object} - NEW interval ID to use for resetting/cancelling.
    */
    resetInterval: function( in_objIntervalID, in_fncFunction, in_nInterval, in_objScope, in_avArguments )
    {
        Util.Assert( TypeCheck.Function( in_fncFunction ) );
        Util.Assert( TypeCheck.Number( in_nTimeout ) );
        Util.Assert( TypeCheck.Undefined( in_objScope ) || TypeCheck.Object( in_objScope ) );
        Util.Assert( TypeCheck.Undefined( in_avArguments ) || TypeCheck.Array( in_avArguments ) );

    },

    /**
    * clearTimeout - clear an active timeout.
    * @param {Object} in_strID (optional) - Timeout to cancel, if not given, 
    *       function does nothing.
    */    
    clearTimeout:  function( in_strID )
    {
        if( in_strID )
        {
            this.m_objFunctionList[ in_strID ] = null;
            delete( this.m_objFunctionList[ in_strID ] );
        } // end if
    },

    /**
    * clearInterval - clear an active interval.
    * @param {Object} in_strID (optional) - Interval to cancel, if not given, 
    *       function does nothing.
    */    
    clearInterval:  function( in_strID )
    {
        if( in_strID )
        {
            this.m_objFunctionList[ in_strID ] = null;
            delete( this.m_objFunctionList[ in_strID ] );
        } // end if
    },
    

    /***
    * TEST ONLY FUNCTIONS
    */
    
    /**
    * createTimeout - create a mock timeout and set it to the value( if defined )
    * @param {String} in_strID - timeoutID
    * @param {Variant} in_vValue (optional) - Value to set.  If not given, use in_strID.
    */
    createTimeout: function( in_strID, in_vValue )
    {
        this.m_objFunctionList[ in_strID ] = 'undefined' == typeof( in_vValue ) ? in_strID : in_vValue;
    },
    
    /**
    * getTimeout - See if a timeout is valid.
    * @param {String} in_strID - ID to get.
    * @returns {function} function if valid timeout, undefined otw.
    */
    getTimeout: function( in_strID )
    {
        return this.m_objFunctionList[ in_strID ];
    },
    
    /**
    * causeTimeout - causes a timeout
    * @param {String} in_strID - ID to cause a timeout on.
    */
    causeTimeout: function( in_strID )
    {
        var fncCallback = this.m_objFunctionList[ in_strID ];
        
        if( fncCallback )
        {
            fncCallback();
        } // end if
    },
    
    /**
    * reset - reset the data structures to a clear state.
    */
    reset: function()
    {
        this.m_objFunctionList = {};
        this.m_nTimeoutCount = 0;
    }

};
