/*
* ListMouseOverItemPlugin - Adds mouse over action capabilities to a ListDisplay
*/
function ListMouseOverItemPlugin()
{
    ListMouseOverItemPlugin.Base.constructor.apply( this );
}
UberObject.Base( ListMouseOverItemPlugin, Plugin );

Object.extend( ListMouseOverItemPlugin.prototype, {
    loadConfigParams: function()
    {
        ListMouseOverItemPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strItemSelector: { type: 'string', bRequired: false, default_value: '' },
            m_strItemOverMessage: { type: 'string', bRequired: false, default_value: 'listitemmouseover' },
            m_strItemOutMessage: { type: 'string', bRequired: false, default_value: 'listitemmouseout' },
            m_strSendToAddress: { type: 'string', bRequired: false, default_value: '' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } );
	            
	    ListMouseOverItemPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDOMEventHandlers: function()
    {
        var objElement = this.getPlugged().$();

        this.RegisterListenerObject( { message: 'onmouseover', 
                from: objElement, listener: this.OnMouseOverHandler, context: this } )
            .RegisterListenerObject( { message: 'onmouseout', 
                from: objElement, listener: this.OnMouseOutHandler, context: this } );
    },

    OnMouseOverHandler: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        
        var objItem = this.findItem( in_objEvent.target );
        this._sendMessage( this.m_strItemOverMessage, objItem, in_objEvent );
        return objItem;
    },

    OnMouseOutHandler: function( in_objEvent )
    {   
        Util.Assert( in_objEvent );
        
        var objItem = this.findItem( in_objEvent.target );
        this._sendMessage( this.m_strItemOutMessage, objItem, in_objEvent );
        return objItem;
    },

    /**
    * @private 
    * _sendMessage - sends the specified message if given a listitem Element.
    * @param {String} in_strMessage - message to send.
    * @param {Object} in_objItemElement (optional) - Item element moused over.
    * @param {Object} in_objEvent - Event to send along with the raised message.
    */
    _sendMessage: function( in_strMessage, in_objItemElement, in_objEvent )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        Util.Assert( TypeCheck.UObject( in_objItemElement ) );
        Util.Assert( TypeCheck.Object( in_objEvent ) );

        var strItemID = in_objItemElement && in_objItemElement._uberItemID;
        
        if( strItemID )
        {   
            var objPlugged = this.getPlugged();
            var objItem = objPlugged.getByID( strItemID );
            /**
            * In FF2, once the handler (this function) is finished, the event is trashed and 
            *   its values are undefined.  By raising the message with the event asynchronously, 
            *   we were losing the event values, so we change these messages to synchronous.
            */
            if( this.m_strSendToAddress )
            {
                objPlugged.RaiseForAddress( in_strMessage, this.m_strSendToAddress,
                    [ strItemID, in_objEvent, objItem ], true );
            } // end if
            else
            {
                objPlugged.Raise( in_strMessage, [ strItemID, in_objEvent, objItem ], true );
            } // end if-else
        } // end if
    },
    
    /**
    * @private 
    * findItem - Find the list item element if mousing over the selection element.
    * @param {Object} in_objHead - the head to start searching from.
    * @returns {Object} - Element of the list item if mousing over selection item, undefined otw.
    */
    findItem: function( in_objHead )
    {
        var objItemElement = this.getPlugged().findElement( in_objHead );
        var objElement = objItemElement;
        var objRetVal = undefined;
        
        if( this.m_strItemSelector && objElement )
        {   // set the stop element as the item element.  objElement will be undefined
            // if mousing over a list item, but not over a selected element.
            objElement = this._findElementWithSelector( in_objHead, objElement );
        } // end if
        
        if( objElement )
        {   // moused over have a valid selection item.
            objRetVal = objItemElement;
        } // end if
        
        return objRetVal;
    },

    /**
    * @private 
    * _findElementWithSelector - Find the selection element if a selector given.  The
    * @param {Object} in_objHead - the head to start searching from.
    * @param {Object} in_objStopElement - the item element to stop searching at.
    */
    _findElementWithSelector: function( in_objHead, in_objStopElement )
    {
        var objRetVal = in_objHead;
        while( ( objRetVal != in_objStopElement )
            && ( ! Element.hasClassName( objRetVal, this.m_strItemSelector ) ) )
        {
            objRetVal = objRetVal.parentNode; 
        } // end while
        
        if( ! Element.hasClassName( objRetVal, this.m_strItemSelector ) )
        {   // not found, clear the return value.
            objRetVal = undefined;
        } // end if
        
        return objRetVal;
    }
} );