/**
* Plugin - allow us to attach functionality similar to a decorator onto an UberObject
*/
function Plugin()
{
    this.m_objPlugged = undefined;
    this.m_objSavedFuncs = undefined;
        
    Plugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( Plugin, UberObject );

Object.extend( Plugin.prototype, {
    init: function( in_objConfig )
    {
        this.m_objSavedFuncs = {};
        this.initWithConfigObject( in_objConfig );
    },

    loadConfigParams: function()
    {
        Plugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objPlugged: { type: 'object', bRequired: true },
            type: { type: 'string', bRequired: false, default_value: 'Plugin' }
        } );
    },
    
    teardown: function()
    {
        this.m_objSavedFuncs = null;
        Plugin.Base.teardown.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'datastructuresready', this.OnDataStructuresReady, this );
        this.RegisterListener( 'unregisterdomeventhandlers', Display.prototype.UnRegisterDomEventHandlers, this );
        
        Plugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnDataStructuresReady: function()
    {
        // Note1 - We have to FINALLY attach ourselves as a child 
        //  so we can get torn down later.  We will be torn
        //  down as one of the children of the plugged object.
        
        // Note2 - We have to check if the plugged object is initialized.  
        //  There is a chance that the plugged object was torn down before getting 
        //  here, and then we are trying to attach now.  If this is the case, tear
        //  ourselves down.
        var objPlugged = this.getPlugged();
        if( objPlugged.isInitialized() )
        {
            this.getPlugged().attachUberObject( this );
        } // end if
        else
        {   
            this.teardown();
        } // end if-else
    },
    
    /**
    * RegisterListener - A shortcut for listening for messages from the 
    *   plugged object.  By default, registers the listener to run in the plugged
    *   objects context, but this can be overridden.
    * @param {String} in_strMessage - message to listen for
    * @param {Function} in_fncFunction - callback to call when recieving message.
    * @param {Object} in_objContext (optional) - optional context to run in_fncFunction in.
    *   if not given, runs callback in context of plugged object.
    * @returns {Object} - 'this'
    */
    RegisterListener: function( in_strMessage, in_fncFunction, in_objContext )
    {
        return Plugin.Base.RegisterListener.apply( this, [ in_strMessage, this.m_objPlugged.m_strMessagingID, 
            in_fncFunction, undefined, in_objContext || this.m_objPlugged ] );
    },
    
    RegisterListenerObject: function( in_objConfig )
    {
        return Plugin.Base.RegisterListener.apply( this, [ 
            in_objConfig.message, 
            in_objConfig.from || this.m_objPlugged.m_strMessagingID, 
            in_objConfig.listener,
            in_objConfig.arguments,
            in_objConfig.context || this.m_objPlugged,
            in_objConfig.to
        ] );
    },

    /**
    * getPlugged - returns the plugged object.
    * @return {Object} - plugged object.
    */    
    getPlugged: function()
    {
        return this.m_objPlugged;
    },

    /**
    * getReplaced - gets a function we replaced with extendPlugin
    * @param {String} in_strFunctionName - Function name to get
    * @returns {Function} - function if exists, undefined otw.
    */
    getReplaced: function( in_strFunctionName )
    {
        Util.Assert( TypeCheck.String( in_strFunctionName ) );
        
        return this.m_objSavedFuncs[ in_strFunctionName ];
    },

    /**
    * applyReplaced - applies the replaced function, in the context of 
    *   the plugged object.
    * @param {String} in_strFunctionName - function name to run.
    * @param {Array} in_aArguments (optional) - Optional arguments to pass.
    * @returns {Variant} whatever the replaced function returns.
    */
    applyReplaced: function( in_strFunctionName, in_aArguments )
    {
        Util.Assert( TypeCheck.String( in_strFunctionName ) );
        //Util.Assert( TypeCheck.UArray( in_aArguments ) );
        
        return this.m_objSavedFuncs[ in_strFunctionName ].apply( this.m_objPlugged, in_aArguments );
    },
    
    /**
    * extendPlugged - extend the plugged object with a mixin function
    * @param {String} in_strFunctionName - function name to add to the plugged object.
    * @param {Object} in_objContext (optional) - Context to run the function in.  
    *   If not given, run it in the context of the plugged object.
    */    
    extendPlugged: function( in_strFunctionName, in_objContext )
    {
        Util.Assert( TypeCheck.String( in_strFunctionName ) );
        Util.Assert( TypeCheck.Function( this[ in_strFunctionName ] ) );
        
        var me=this;
        if( this.m_objPlugged[ in_strFunctionName ] )
        {   // save off old version of it.
            this.m_objSavedFuncs[ in_strFunctionName ] = this.m_objPlugged[ in_strFunctionName ];
        } // end if
         
        this.m_objPlugged[ in_strFunctionName ] = function() { 
            return me[ in_strFunctionName ].apply( in_objContext || me.m_objPlugged, arguments ); 
        };
    }
} );
