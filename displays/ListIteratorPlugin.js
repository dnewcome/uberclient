function ListIteratorPlugin()
{
    this.m_nCurrItemIndex = -1;
    
    ListIteratorPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( ListIteratorPlugin, Plugin );

Object.extend( ListIteratorPlugin.prototype, {
    loadConfigParams: function()
    {
        ListIteratorPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            /* SetItemMessage - Message to RAISE when doing next or previous to set the item */
            m_strSetItemMessage: { type: 'string', bRequired: false, default_value: 'clicklistitem' },
            /* ItemSetMessage - Message that gets raised by the plugged object when an item is set */
            m_strItemSetMessage: { type: 'string', bRequired: false, default_value: 'listitemclick' },
            /* ItemGetMessage - Message to RAISE when getting the current item */
            m_strCurrentItemGetMessage: { type: 'string', bRequired: false, default_value: 'clicklistitem' },
            m_strSetNextItemMessage: { type: 'string', bRequired: false, default_value: 'clicknextlistitem' },
            m_strSetPreviousItemMessage: { type: 'string', bRequired: false, default_value: 'clickpreviouslistitem' },
            /* GetItemMessage - Message to listen for to get the current item */
            m_strGetCurrentItemMessage: { type: 'string', bRequired: false, default_value: 'clickcurrentlistitem' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        var strPluggedID = this.getPlugged().m_strMessagingID;
        this.RegisterListener( this.m_strItemSetMessage, this.OnListItemSet, this );
        this.RegisterListenerObject( { 
            message: this.m_strSetNextItemMessage,
            listener: this.setNext, context: this
        } );
        this.RegisterListenerObject( { 
            message: this.m_strSetPreviousItemMessage,
            listener: this.setPrevious, context: this
        } );
        this.RegisterListenerObject( { 
            message: this.m_strGetCurrentItemMessage,
            listener: this.OnGetCurrentListItem, context: this
        } );
        this.RegisterListener( 'onshow', this.OnShow, this );

        ListIteratorPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * OnShow - resets the iterator.
    */
    OnShow: function()
    {
        this.OnListItemSet( undefined );
    },
    
    /**
    * OnListItemSet - Handler for 'listitemclick' message.  
    *   Sets which item is currently clicked.
    * @param {String} in_strItemID (optional) - can set to undefined or an itemID
    */
    OnListItemSet: function( in_strItemID )
    {
        Util.Assert( TypeCheck.UString( in_strItemID ) );
        
        this.m_nCurrItemIndex = in_strItemID ? this.getPlugged().getIndexByID( in_strItemID ) : -1;
    },

    /**
    * OnGetCurrentListItem - Select the current list item.
    */    
    OnGetCurrentListItem: function()
    {
        if( this.m_nCurrItemIndex )
        {
            var objPlugged = this.getPlugged();
            objPlugged.Raise( this.m_strCurrentItemGetMessage, 
                [ objPlugged.getIDByIndex( this.m_nCurrItemIndex ) ] );
        } // end if
    },
    
    /**
    * setNext - click the next item pointed to by the iterator
    */
    setNext: function()
    {
        var me=this;
        this._doClick( function( in_nIndex ) { 
            var objPlugged = me.getPlugged();
            var nLength = Util.AssignIfDefined( objPlugged.m_nShownLength, objPlugged.length );
            return Math.min( in_nIndex + 1, nLength - 1 );
        } );
    },

    /**
    * setPrevious - Select the previous item pointed to by the iterator
    */
    setPrevious: function()
    {
        this._doClick( function( in_nIndex ) { 
            return Math.max( in_nIndex - 1, 0 ); 
        } );
    },
    
    _doClick: function( in_fncNewIndexFunc )
    {
        var objPlugged = this.getPlugged();
        var nNewIndex = 0;
        if( -1 != this.m_nCurrItemIndex )
        {
            nNewIndex = in_fncNewIndexFunc( this.m_nCurrItemIndex );
        } // end if
        
        if( nNewIndex != this.m_nCurrItemIndex )
        {
            var objElement = objPlugged.getElementByIndex( nNewIndex );
            var bDisplayed = objElement.getStyle('display');
            this.m_nCurrItemIndex = nNewIndex;
            
            if ( ( 'none' == bDisplayed ) || ( null == bDisplayed ) )
            {   // item not displayed, go to next item.
                this._doClick( in_fncNewIndexFunc );
            } // end if-else
            else
            {   // item displayed, select it.
                var strNewID = objPlugged.getIDByIndex( nNewIndex );
                objPlugged.Raise( this.m_strSetItemMessage, [ strNewID ] );
            } // end if
        } // end if
    }
} );
