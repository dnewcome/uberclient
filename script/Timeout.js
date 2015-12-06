
var Timeout = {
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
        
        var objContainer = new FunctionContainer( in_fncFunction, in_objScope, 'setTimeout' );
        return objContainer.callFunction( in_avArguments, false, in_nTimeout, false );
    },
    
    /**
    * setInterval - replacement for system setInterval that takes a scope!
    * @param {Function} in_fncFunction - function to call
    * @param {number} in_nInterval - interval to call after
    * @param {Object} in_objScope (optional) - optional scope to call in.
    * @param {Array} in_avArguments (optional) - Array of arguments to pass to the function.
    * @returns {Object} - interval ID to use for resetting/cancelling.
    */
    setInterval: function( in_fncFunction, in_nInterval, in_objScope, in_avArguments )
    {
        Util.Assert( TypeCheck.Function( in_fncFunction ) );
        Util.Assert( TypeCheck.Number( in_nInterval ) );
        Util.Assert( TypeCheck.Undefined( in_objScope ) || TypeCheck.Object( in_objScope ) );
        Util.Assert( TypeCheck.Undefined( in_avArguments ) || TypeCheck.Array( in_avArguments ) );
        
        var objContainer = new FunctionContainer( in_fncFunction, in_objScope, 'setInterval' );
        return objContainer.callFunction( in_avArguments, false, in_nInterval, true );
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
        
        Timeout.clearTimeout( in_objTimeoutID );
        return Timeout.setTimeout( in_fncFunction, in_nTimeout, in_objScope, in_avArguments );
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

        Timeout.clearInterval( in_objIntervalID );
        return Timeout.setInterval( in_fncFunction, in_nInterval, in_objScope, in_avArguments );
    },

    /**
    * clearTimeout - clear an active timeout.
    * @param {Object} in_objTimeoutID (optional) - Timeout to cancel, if not given, 
    *       function does nothing.
    */    
    clearTimeout:  function( in_objTimeoutID )
    {
        in_objTimeoutID && clearTimeout( in_objTimeoutID );   
    },

    /**
    * clearInterval - clear an active interval.
    * @param {Object} in_objIntervalID (optional) - Interval to cancel, if not given, 
    *       function does nothing.
    */    
    clearInterval:  function( in_objIntervalID )
    {
        in_objIntervalID && clearInterval( in_objIntervalID );   
    }

};

