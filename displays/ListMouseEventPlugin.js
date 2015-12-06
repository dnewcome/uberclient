/*
* ListMouseEventPlugin - 
*/
function ListMouseEventPlugin()
{
    ListMouseEventPlugin.Base.constructor.apply( this );
}
UberObject.Base( ListMouseEventPlugin, Plugin );

Object.extend( ListMouseEventPlugin.prototype, {
    loadConfigParams: function()
    {
        ListMouseEventPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strDOMEvent: { type: 'string', bRequired: true },
            m_strItemSelector: { type: 'string', bRequired: false, default_value: '' },
            m_strMessage: { type: 'string', bRequired: true },
            /**
            * m_strArguments is a comma separated list of arguments/strings to be passed
            *   with the message.  We can put several special strings in the list that will
            *   be interpreted as follows
            * RegExp List:
            *   {#ITEMID} - ItemID selected
            *   {#ITEMINDEX} - Index of item selected
            *   {#EVENT} - Triggering event.
            *   {#ITEM} - List item that triggered event.
            *   {#ITEMELEMENT} - List item container element
            */
            m_strArguments: { type: 'string', bRequired: false, default_value: '' },
            /**
            * if any of m_bShiftKey, m_bControlKey, or m_bAltKey have a value of null,
            *   these keys can be in either state.
            */
            m_bShiftKey: { bRequired: false, default_value: false },
            m_bControlKey: { bRequired: false, default_value: false },
            m_bAltKey: { bRequired: false, default_value: false },
            m_bIgnoreHandled: { type: 'boolean', bRequired: false, default_value: true },
            m_strSendToAddress: { type: 'string', bRequired: false, default_value: '' },
            m_bItemIDAsSendToAddress: { type: 'boolean', bRequired: false, default_value: false },
            m_strSuspendListenMessage: { type: 'string', bRequired: false, default_value: '' },
            m_strEnableListenMessage: { type: 'string', bRequired: false, default_value: '' },
            m_bCancelEvent: { type: 'boolean', bRequired: false, default_value: false },
			m_bStopPropagation: { type: 'boolean', bRequired: false, default_value: false },
			m_bPreventDefault: { type: 'boolean', bRequired: false, default_value: false }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } );
	     
	    if( this.m_strSuspendListenMessage )
	    {
            this.RegisterListener( this.m_strSuspendListenMessage, this.OnSuspendListen, this );
            this.RegisterListener( 'onshow', this.OnEnableListen, this );
	    }

	    if( this.m_strEnableListenMessage )
	    {
            this.RegisterListener( this.m_strEnableListenMessage, this.OnEnableListen, this );
	    }
	    
	    ListMouseEventPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDOMEventHandlers: function()
    {
        var objElement = this.getPlugged().$();

        this.RegisterListenerObject( { message: this.m_strDOMEvent, 
                from: objElement, listener: this.OnDOMEventHandler, context: this } );
    },

    OnDOMEventHandler: function( in_objEvent )
    {
        Util.Assert( in_objEvent );

        if( ( ! this.m_bSuspended )
         && ( ( false === this.m_bIgnoreHandled ) || ( ! in_objEvent._uberEventHandled ) )
         && ( null == this.m_bAltKey  || in_objEvent.altKey == this.m_bAltKey )
         && ( null == this.m_bShiftKey || in_objEvent.shiftKey == this.m_bShiftKey )
         && ( null == this.m_bControlKey || in_objEvent.ctrlKey == this.m_bControlKey ) )
        {
            var objItem = this.getPlugged().findItemElement( in_objEvent.target, this.m_strItemSelector );
			if( objItem )
			{	// only send the message or cancel the event if we have an item.  
				// There may be other things within the list container besides list items.
				this._sendMessage( this.m_strMessage, objItem, in_objEvent );
				
				if( this.m_bCancelEvent ) {
					in_objEvent.cancelEvent();
				}
				
				if( this.m_bStopPropagation ) {
					in_objEvent.stopPropagation();
				}
				
				if( this.m_bPreventDefault ) {
					in_objEvent.preventDefault();
				}
			}
        }
    },

    /**
    * OnSuspendListen - suspends listening for a particular event.  Listening 
    *   can be restarted with OnEnableListen
    */
    OnSuspendListen: function()
    {
        this.m_bSuspended = true;
    },

    /**
    * OnEnableListen - starts listening for an event again.
    */
    OnEnableListen: function()
    {
        this.m_bSuspended = false;
    },
    
    /**
    * @private 
    * _sendMessage - sends the specified message for the given list element.
    * @param {String} in_strMessage - message to send.
    * @param {Object} in_objItemElement - Item element moused over.
    * @param {Object} in_objEvent - Event to send along with the raised message.
    */
    _sendMessage: function( in_strMessage, in_objItemElement, in_objEvent )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        Util.Assert( TypeCheck.Object( in_objItemElement ) );
        Util.Assert( TypeCheck.Object( in_objEvent ) );

        var strItemID = in_objItemElement._uberItemID;
        
        if( strItemID )
        {   
            var objPlugged = this.getPlugged();
            var objItem = objPlugged.getByID( strItemID );
            /**
            * In FF2, once the handler (this function) is finished, the event is trashed and 
            *   its values are undefined.  By raising the message with the event asynchronously, 
            *   we were losing the event values, so we change these messages to synchronous.
            */
            if( this.m_bItemIDAsSendToAddress )
            {
                this.m_strSendToAddress = strItemID;
            }

            var aArguments = this._findArguments( strItemID, in_objEvent, objItem, in_objItemElement );
            if( this.m_strSendToAddress )
            {
                objPlugged.RaiseForAddress( in_strMessage, this.m_strSendToAddress, 
                   aArguments, true );
            }
            else
            {
                objPlugged.Raise( in_strMessage, aArguments, true );
            }
            // only want this handled if we actually have an ID.
            in_objEvent._uberEventHandled = true;
        }
    },
    
    /**
    * @private 
    * _findArguments - finds the argument list given the current configuration.
    *   Will pass the array of in_strItemID, in_objEvent, in_objItem, in_objItemElement if 
    *   there is no this.m_strArguments, will produce and pass back an array specified
    *   in the arguments string.
    * @param {String} in_strItemID - ItemID currently selected.
    * @param {Object} in_objEvent - Event that triggered call.
    * @param {Object} in_objItem - List item that is stored.
    * @param {Object} in_objItemElement - the list item's containing DOM element.
    * @returns {Array} Arguments array list suitable to pass to the raise function.
    */
    _findArguments: function( in_strItemID, in_objEvent, in_objItem, in_objItemElement )
    {
        var aRetVal = [];
        if( this.m_strArguments )
        {
            var aStrings = this.m_strArguments.split( ',' );
            for( var strArgument, nIndex = 0; strArgument = aStrings[ nIndex ]; ++nIndex )
            {
                strArgument = strArgument.strip();
                switch( strArgument )
                {
                    case '{#ITEMID}': 
                        aRetVal.push( in_strItemID );
                        break;
                    case '{#ITEMINDEX}': 
                        var objPlugged = this.getPlugged();
                        var nItemIndex = objPlugged.getIndexByID( in_strItemID );
                        aRetVal.push( nItemIndex );
                        break;
                    case '{#EVENT}': 
                        aRetVal.push( in_objEvent );
                        break;
                    case '{#ITEM}': 
                        aRetVal.push( in_objItem );
                        break;
                    case '{#ITEMELEMENT}': 
                        aRetVal.push( in_objItemElement );
                        break;
                    default:
                        aRetVal.push( strArgument );
                        break;
                }
            } // end for
        }
        else
        {   // default, pass the standard list.
            aRetVal = [ in_strItemID, in_objEvent, in_objItem, in_objItemElement ];
        }
        
        return aRetVal;
    }
} );