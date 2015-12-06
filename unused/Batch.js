/*
* Batch - the basic idea of Batch is to create a "batch" of items and then
*   call a processor on those items.  Think of it as cron for Ubernote.
*
* This object is useful for things like batch network requests where we want to request multiple items
*   but want to do it all in one call.  Instead of calling each item separately, we create a batch
*   of items.  We don't want response time to be too long after the first item is added, so we set
*   the "after first item timer" to some number like 2 seconds.  But, we don't want to wait 1.5 seconds
*   if no new requests are coming, so we set the "after last item timer" to something like a half a second,
*   that way if no new requests come in for 1/2 a second, even if we haven't reached the 2 second mark,
*   process the batch.  Or, we can limit the number of unique items in the list to 10, that way even if
*   we have 100 items we want to ask for, we don't want to process the entire blob at once and slow the system
*   down, we ask for a maximum of 10 at a time, even if we have reached neither timeout.
*
* The list is created using the "addItem" function,
*   and processed via the "process" function.  The process call can be done manually, effectively
*   making this a work queue, or it can be done automatically via several configuration parameters.
*   These are: after N unique items are added, a certain number milliseconds after the first
*   item is added, or a certain number of milliseconds after the last number is added.
*
* Counters are triggered/updated on item ADDITION, but not on update.  This means that if an item
*   is in the list with key XYZ, and another item is attempted to be placed on the list with the ID
*   XYZ, the LastItemTimeout counter will not reset.
*
*
* Configuration needs at minimum 3 functions:
*            m_fncAddItem: Create an item to add to the batch.  
*            m_fncUpdateItem: Update an item in the batch
*            m_fncBatchProcessor: Do something with the list.
*
* Optional configuration items:
*            m_nFirstItemTimeout: Maximum time allowed after first item is added until process function is called.
*            m_nLastItemTimeout: Maximum time allowed after last item is added until process function is called.
*            m_nMaxItemsBeforeProcess: Maximum number of unique items added until process function is called.
*            m_objScope: scope to call the above functions in.
*            m_objList: Optional Object list to call.  Keys into object are ID's of item.
*
*/
function Batch()
{
    this.m_objFirstItemTimeoutID = undefined;
    this.m_objLastItemTimeoutID = undefined;
    this.m_nCount = 0;

    this.Base.constructor.apply( this );
};
UberObject.Base( Batch, UberObject );

Object.extend( Batch, {

    init: function( in_objConfig )
    {
        this.Base.initWithConfigObject.apply( this, [ in_objConfig ] );
    },

    teardownData: function()
    {
        this.m_objList = undefined;
        Timeout.clearTimeout( this.m_objFirstItemTimeoutID );
        Timeout.clearTimeout( this.m_objLastItemTimeoutID );
        
        this.Base.teardownData.apply( this );
    },
    
    loadConfigParams: function()
    {
        /**
        * Each of these items is added to the object.
        */
        var objConfigParams = {
            m_fncAddItem: { type: 'function', bRequired: true },
            m_fncUpdateItem: { type: 'function', bRequired: true },
            m_fncBatchProcessor: { type: 'function', bRequired: true },
            m_nFirstItemTimeout: { type: 'number', bRequired: false, default_value: Infinity },
            m_nLastItemTimeout: { type: 'number', bRequired: false, default_value: Infinity },
            m_nMaxItemsBeforeProcess: { type: 'number', bRequired: false, default_value: Infinity },
            m_objScope: { type: 'object', bRequired: false, default_value: this },
            m_objList: { type: 'object', bRequired: false, default_value: {} }
        };

        this.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    /*
    * addItem - add an item to the batch.
    * @param {String} in_strItemID - ID of the item to add
    * @param {variant} in_vArguments - arguments to pass to the update/create function
    */
    addItem: function( in_strItemID, in_vArguments )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        
        var objItem = this.m_objList[ in_strItemID ];
        if( objItem )
        {
            this._itemUpdate( objItem, in_strItemID, in_vArguments );
        } // end if
        else
        {
            this._itemAdd( in_objItemID, in_vArguments );
        } // end if
    },

    /*
    * process - Process the batch - call the process function with the batch list
    */
    process: function()
    {
        // clear our timeouts
        Timeout.clearTimeout( this.m_objFirstItemTimeoutID );
        Timeout.clearTimeout( this.m_objLastItemTimeoutID );
        this.m_nCount = 0;
        
        // pass the list to the processor, create a new list
        var objList = this.m_objList;
        this.m_objList = {};
            
        this.m_fncBatchProcessor.apply( this.m_objScope, [ objList ] );
    },

    /**
    * _itemAdd - Take care of calling the add function, adding it to our list,
    *   setting the "firstItemTimeout" if needed.
    */
    _itemAdd: function( in_objItemID, in_vArguments )
    {
        var objItem = this.m_fncAddItem.apply( this.m_objScope, [ in_vArguments ] );
        this.m_objList[ in_strItemID ] = objItem;
        
        if( 0 == this.m_nCount )
        {   // first item, set the first item timeout
            this.m_objFirstItemTimeoutID = Timeout.setTimeout( this.process, 
                this.m_nFirstItemTimeout, this );
        } // end if

        // keep waiting.
        this.m_objLastItemTimeout = Timeout.resetTimeout( this.m_objLastItemTimeoutID, 
            this.process, this.m_nLastItemTimeout, this );
        
        this.m_nCount++;
        if( this.m_nMaxItemsBeforeProcess == this.m_nCount )
        {   // max reached, go process the batch now.
            this.process();
        } // end if
    },
    
    /**
    * _itemUpdate - Take care of calling the update function, setting/resetting the 
    *   LastItemTimeout
    */
    _itemUpdate: function( in_objItem, in_strItemID, in_vArguments )
    {
        this.m_fncUpdateItem.apply( this.m_objScope, [ in_objItem, in_vArguments ] );
    }
});
