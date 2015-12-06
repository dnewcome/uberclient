/*
* ListMouseClickPlugin - Interfaces with a service that 
*   accepts the 'clicklistitem' message to do mouse clicks on a list.
*/
function ListMouseClickPlugin()
{
    ListMouseClickPlugin.Base.constructor.apply( this );
}
UberObject.Base( ListMouseClickPlugin, Plugin );

Object.extend( ListMouseClickPlugin.prototype, {
    loadConfigParams: function()
    {
        ListMouseClickPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strMessage: { type: 'string', bRequired: false, default_value: 'clicklistitem' },
            m_bShiftKey: { type: 'boolean', bRequired: false, default_value: false },
            m_bControlKey: { type: 'boolean', bRequired: false, default_value: false },
            m_bAltKey: { type: 'boolean', bRequired: false, default_value: false },
            m_bIgnoreHandled: { type: 'boolean', bRequired: false, default_value: true },
            type: { type: 'string', bRequired: false, default_value: 'ListMouseClickPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } );
	            
	    ListMouseClickPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDOMEventHandlers: function()
    {
        var objElement = this.getPlugged().$();

        this.RegisterListenerObject( { message: 'onclick', 
                from: objElement, listener: this.OnMouseClickHandler, context: this } );
    },

    OnMouseClickHandler: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        
        // if we aren't a left click, we don't want it.  FF 2.0 has problems with this
        // getting called on context menu events    
        if( ( !BrowserInfo.gecko || Event.isLeftClick( in_objEvent ) )
         && ( ( false === this.m_bIgnoreHandled ) 
           || ( ! in_objEvent._uberClickHandled ) )
         && ( in_objEvent.altKey == this.m_bAltKey )
         && ( in_objEvent.shiftKey == this.m_bShiftKey )
         && ( in_objEvent.ctrlKey == this.m_bControlKey ) )
        {
            var objPlugged = this.getPlugged();
            var objElement = objPlugged.findElement( in_objEvent.target );
            if( objElement._uberItemID )
            {   
                this.RaiseForAddress( this.m_strMessage, 
                    objPlugged.m_strMessagingID, [ objElement._uberItemID ] );
            } // end if
            in_objEvent._uberClickHandled = true;
        } // end if
    }
} );