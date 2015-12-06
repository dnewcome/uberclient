/*
* ListClickPlugin - Adds selection to a ListDisplay.  When an item is clicked
*   the 'listitemclick' message is raised with the ID of that item.
*/
function ListClickPlugin()
{
    ListClickPlugin.Base.constructor.apply( this );
}
UberObject.Base( ListClickPlugin, Plugin );

Object.extend( ListClickPlugin.prototype, {
    loadConfigParams: function()
    {
        ListClickPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strMessage: { type: 'string', bRequired: false, default_value: 'listitemclick' },
            m_bItemAsAddress: { type: 'boolean', bRequired: false, default_value: false },
            type: { type: 'string', bRequired: false, default_value: 'ListClickPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'clickitem',
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.handleClick, context: this } );

        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } );
	            
	    ListClickPlugin.Base.RegisterMessageHandlers.apply( this );
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
        if( !BrowserInfo.gecko || Event.isLeftClick( in_objEvent ) )
        {
            var objPlugged = this.getPlugged();
            var objElement = objPlugged.findElement( in_objEvent.target );
            if( objElement._uberItemID )
            {    
                this.handleClick( objElement._uberItemID );
            } // end if
        } // end if
    },

    /**
    * handleClick - handles the click for the itemID
    * @param {String} in_strItemID - the itemID that was clicked.
    */
    handleClick: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        
        if( this.m_strMessage != 'listitemclick' )
        {
            this.getPlugged().Raise( 'listitemclick', [ in_strItemID ] );
        } // end if
    
        if( true === this.m_bItemAsAddress )
        {    
            this.getPlugged().RaiseForAddress( this.m_strMessage, in_strItemID, [ in_strItemID ] );
        }
        else
        {
            this.getPlugged().Raise( this.m_strMessage, [ in_strItemID ] );
        } // end if-else
    }
} );