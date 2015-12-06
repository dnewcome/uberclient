/*
* ButtonPlugin - Add an individual button.
*/
function ButtonPlugin()
{
    this.m_strOnPressFunctionName = undefined;
    
    ButtonPlugin.Base.constructor.apply( this );
}
UberObject.Base( ButtonPlugin, Plugin );

Object.extend( ButtonPlugin.prototype, {
    loadConfigParams: function()
    {
        ButtonPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strSelector: { type: 'string', bRequired: true },
            m_strOnPressMessage: { type: 'string', bRequired: false },
            m_astrOnPressMessages: { type: 'object', bRequired: false, default_value: [] },
			m_bSendToPlugged: { type: 'boolean', bRequired: false, default_value: false },
            m_strOnPressFunctionName: { type: 'string', bRequired: false }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
	            
	    ButtonPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objPlugged = this.getPlugged();

        objPlugged.attachButton( this.m_strSelector, this.doButtonAction, this );
    },

    doButtonAction: function( in_objEvent )
    {
        var aArguments = this._getClosingArguments( in_objEvent );
        
        for( var nIndex = 0, strMessage; strMessage = this.m_astrOnPressMessages[ nIndex ]; ++nIndex )
        {
			this._sendMessage( strMessage, aArguments );
        } // end for
        
        if( this.m_strOnPressMessage )
        {   
			this._sendMessage( this.m_strOnPressMessage, aArguments );
        } // end if
    },
    
    /**
	* @private
    * _getClosingArguments - you just like the name, don't you?
    * @returns {Variant} - either undefined or an array, passed directly to the Raise function.
    */
    _getClosingArguments: function( in_objEvent )
    {
        var aRetVal = [ in_objEvent ];
        if( this.m_strOnPressFunctionName )
        {
           var vRetVal = this.getPlugged()[ this.m_strOnPressFunctionName ]();
           if( TypeCheck.Defined( vRetVal ) )
           {
                aRetVal = [ vRetVal ];
           } // end if
        } // end if
        
        return aRetVal;
    },

	/**
	* @private
	* _sendMessage - send out the specified message.  If this.m_bSendToPlugged is set, 
	*	send to that address, send to world otw.
	* @param {String} in_strMessage - message to send
	* @param {Array} in_aArguments (optional) - optional arguments to send.
	*/
	_sendMessage: function( in_strMessage, in_aArguments )
	{
		Util.Assert( TypeCheck.String( in_strMessage ) );
		Util.Assert( TypeCheck.UArray( in_aArguments ) );
		
		var objPlugged = this.getPlugged();
		
		if( this.m_bSendToPlugged )
		{
			objPlugged.RaiseForAddress( in_strMessage, objPlugged.m_strMessagingID, in_aArguments );
		} // end if
		else
		{
			objPlugged.Raise( in_strMessage, in_aArguments );
		} // end if-else
	}
} );