
/**
* class FunctionContainer: This class is used as a wrapper around a function, 
*   it stores a context as well as a function and some "extra info".  
*/

/**
* Constructor
* @param {function} in_fncFunction function to call back.
* @param {Object} in_objContext (optional) context.  
* @param {Variant} in_vExtraInfo (optional) - Extra info.  For any use.
*/
function FunctionContainer( in_fncFunction, in_objContext, in_vExtraInfo, in_avArguments )
{
    Util.Assert( in_fncFunction );

    this.m_fncFunction = in_fncFunction;
    this.m_objContext = in_objContext;
    this.m_vExtraInfo = in_vExtraInfo;
    this.m_strID = FunctionContainer.IDGenerator.getUniqueID();
    this.m_avArguments = in_avArguments;
}

FunctionContainer.IDGenerator = new UniqueIDGenerator( "id_autoFncCount" );

/**
* Calls a function with an optional context, passes all arguements to the handler.  If no context
*       was set, the function will run with the current "this" context.
* @param {array of object types} in_atArguments (optional) - Array of arguments passed to the function handler
* @param {bool} in_bBlocking (optional) - If true, this will by a synchronous (blocking) call to the listeners.
* @param {number} in_nTimeout (optional) - Optional timeout to call after - only takes effect if in_bBlocking 
*       is not set to true.
* @param {bool} in_bInterval - optional flag whether to call on interval instead of a timeout.  
*   Only takes effect if in_bBlocking is not true.
* @returns {object} Timer ID if interval or timer set, undefined otw.
*/
FunctionContainer.prototype.callFunction = function( in_atArguments, in_bBlocking, in_nTimeout, in_bInterval )
{
    var me = this;
    // Gets our function to call.
    var fncCallfunc = function() { me.m_fncFunction.apply( me.m_objContext || window, 
        in_atArguments || me.m_avArguments || [] ); };
    var objRetVal = undefined;
    
    if( in_bBlocking )
    {   // synchronous (blocking)
        fncCallfunc();
    } // end if
    else 
    {   // asynchronous (nonblocking, whenever we get a chance)
        var strFunction = in_bInterval ? 'setInterval' : 'setTimeout';
        objRetVal = window[ strFunction ]( fncCallfunc, in_nTimeout || 0 );
    } // end if-else
    
    return objRetVal;
};

/**
* callFunctionFast - Calls a the stored function directly.
* NOTE - Does no input checking - this is done for speed.
* @in_atArguments {Array} - Arguments to pass to the function.  MUST BE AN ARRAY!
*/
FunctionContainer.prototype.callFunctionFast = function( in_atArguments )
{
    return this.m_fncFunction.apply( this.m_objContext, in_atArguments );
};


/**
* callFunctionContexted - Calls the stored function directly with a new context.
* NOTE - Does no input checking - this is done for speed.
* @in_objContext {Object} - Context to call the function in.
* @in_atArguments {Array} - Arguments to pass to the function.  MUST BE AN ARRAY!
*/
FunctionContainer.prototype.callFunctionContexted = function( in_objContext, in_atArguments )
{
    return this.m_fncFunction.apply( in_objContext || this.m_objContext, in_atArguments || [] );
};

