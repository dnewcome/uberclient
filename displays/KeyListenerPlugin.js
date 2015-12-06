
function KeyListenerPlugin()
{
    KeyListenerPlugin.Base.constructor.apply( this );
}
UberObject.Base( KeyListenerPlugin, Plugin );

Object.extend( KeyListenerPlugin.prototype, {
    loadConfigParams: function()
    {
        KeyListenerPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strInputSelector: { type: 'string', bRequired: false },
            /**
            * m_objKeys - they 'keys' in the object are the keyCode of the triggering key.
            *   each key can contain either an object, or an array of objects.  An array
            *   of objects means multiple messages are raised on one key.  each object
            *   can contain the following:
            *       message: the message to raise
            *       shiftKey: assumed false
            *       controlKey: assumed false
            *       altKey: assumed false
            *   -> if any of shiftKey, controlKey, or altKey have a value of undefined,
            *       these keys can be in either state.
            */
            m_objKeys: { type: 'object', bRequired: false, default_value: {} },
            m_bFocusOnShow: { type: 'boolean', bRequired: false, default_value: false },
            type: { type: 'string', bReqired: false, default_value: 'KeyListenerPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
        this.RegisterListenerObject( { message: 'onshow', 
	            listener: this.OnShow, context: this } );
        
	    KeyListenerPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );
        
        // Have to set the tab index >= 0 or ff can't focus on it and we never get mouse events.
        objInputElement.tabIndex = 0;
        
        this.RegisterListenerObject( { message: 'onkeydown', from: objInputElement, 
            listener: this.OnKeyDown, context: this } );
    },

    /**
    * OnKeyDown - keyup handler - Handles key presses.
    * @param {Object} in_objEvent - Event with the key
    */
    OnKeyDown: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        
        var vConfig = this.m_objKeys[ in_objEvent.keyCode ];
        if( vConfig )
        {   // make an array out of all the results to keep code simple.
            var aConfig = TypeCheck.Array( vConfig ) ? vConfig : [ vConfig ];
            for( var nIndex = 0, objConfigItem; objConfigItem = aConfig[ nIndex ]; ++nIndex )
            {
                this._processConfigItem( objConfigItem, in_objEvent );
            } // end for
        } // end if
    },

    /**
    * OnShow - of setting the focus.
    */
    OnShow: function()
    {
        if( true === this.m_bFocusOnShow )
        {   // Give IE6 some time to show its stuff before we put in the focus.
            var objElement = this.getPlugged().$( this.m_strInputSelector );
            // We have to put the focus function inside of another function or else IE blows up
            //  saying "unknown javascript error".
            this.m_objFocusTimeout = Timeout.setTimeout( function() { this.focus(); }, 100, objElement );
        } // end if
    },
    
    /**
    * _processConfigItem - processes a configuration item for a key.
    * @param {Object} in_objConfigItem - Configuration item.
    * @param {Object} in_objEvent - Triggering event.
    */
    _processConfigItem: function( in_objConfigItem, in_objEvent )
    {
        if( ( in_objConfigItem.message )
         && ( undefined == in_objConfigItem.altKey  || in_objEvent.altKey == in_objConfigItem.altKey )
         && ( undefined == in_objConfigItem.shiftKey || in_objEvent.shiftKey == in_objConfigItem.shiftKey )
         && ( undefined == in_objConfigItem.controlKey || in_objEvent.ctrlKey == in_objConfigItem.controlKey ) )
        {
            this.getPlugged().Raise( in_objConfigItem.message );
            
            in_objEvent.cancelEvent();
        } // end if
    }
} );
