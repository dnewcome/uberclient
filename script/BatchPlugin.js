/*
* BatchPlugin - the basic idea of BatchPlugin is to create a "BatchPlugin" of items and then
*   raise a message after a timeout with those items.
*/
function BatchPlugin()
{
    this.m_objInterval = undefined;
    this.m_objTimeout = undefined;
    this.m_objList = undefined;
    
    BatchPlugin.Base.constructor.apply( this );
};
UberObject.Base( BatchPlugin, Plugin );

Object.extend( BatchPlugin.prototype, {
    init: function()
    {
        BatchPlugin.Base.init.apply( this, arguments );

        this.m_objList = {};
        
        if( this.m_nInterval )
        {
            this.m_objInterval = Timeout.setInterval( this.process, this.m_nInterval, this );
        } // end if
    },
    
    loadConfigParams: function()
    {
        BatchPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            // m_strMessageForAdd - message that causes an item to be added to the BatchPlugin.
            m_strMessageForAdd: { type: 'string', bRequired: true },
            // m_strMessageToRaise - message that is raised at the interval.
            m_strMessageToRaise: { type: 'string', bRequired: false, default_value: 'BatchPluginintervaltimeout' },
            // m_nInterval - raise the message with the list every X milliseconds.
            //  resets the list on message raise.
            m_nInterval: { type: 'number', bRequired: false },
            // m_nTimeout - raise the message with the list X milliseconds after the first item is added.
            //  resets the list on message raise.
            m_nTimeout: { type: 'number', bRequired: false }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: this.m_strMessageForAdd, 
            from: Messages.all_publishers_id, listener: this.addItem, context: this } );
        
        BatchPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    teardownData: function()
    {
        this.m_objList = undefined;
        Timeout.clearTimeout( this.m_objInterval );
        Timeout.clearTimeout( this.m_objTimeout );
        
        BatchPlugin.Base.teardownData.apply( this );
    },
    
    /*
    * addItem - add an item to the BatchPlugin.
    * @param {String} in_strItemID - ID of the item to add
    * @param {Variant} in_vData (optional) - optional data to store.
    */
    addItem: function( in_strItemID, in_vData )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        
        this.m_objList[ in_strItemID ] = in_vData || null;
        
        if( this.m_nTimeout && !this.m_objTimeout )
        {
            this.m_objTimeout = Timeout.setTimeout( this.process, this.m_nTimeout, this );
        }
    },

    /**
    * getBatch - returns the current BatchPlugin set.
    * @param {Object} object with keys as the itemIDS, values as data passed in (if given)
    */
    getBatch: function()
    {
        return this.m_objList;
    },
    
    /*
    * process - Process the BatchPlugin - call the process function with the BatchPlugin list
    */
    process: function()
    {
        // pass the list to the processor, create a new list
        var objList = this.m_objList;
        this.getPlugged().Raise( this.m_strMessageToRaise, [ objList ] );
        this.m_objList = {};
        
        Timeout.clearTimeout( this.m_objTimeout );
        this.m_objTimeout = undefined;
    }
});
