/*
* OKCloseCancelButtonsPlugin - Handles the OK, Close and Cancel buttons
*/
function OKCloseCancelButtonsPlugin()
{
    this.m_strCloseFunctionName = undefined;
    
    OKCloseCancelButtonsPlugin.Base.constructor.apply( this );
}
UberObject.Base( OKCloseCancelButtonsPlugin, Plugin );

Object.extend( OKCloseCancelButtonsPlugin.prototype, {
    loadConfigParams: function()
    {
        OKCloseCancelButtonsPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strCloseFunctionName: { type: 'string', bRequired: false }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
	    
	    this.extendPlugged( 'setOKText', this );
	    
	    OKCloseCancelButtonsPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objPlugged = this.getPlugged();

        objPlugged.attachButton( 'elementCloseButton', this.OnCloseButtonClick, this );
        objPlugged.attachButton( 'elementOKButton', this.OnOKButtonClick, this );
        objPlugged.attachButton( 'elementCancelButton', this.OnCancelButtonClick, this );
    },

    /**
    * OnCloseButtonClick - Hides ourselves
    */
    OnCloseButtonClick: function( in_objEvent )
    {
        this._doButtonAction( 'close' );
    },

    /**
    * OnOKButtonClick - Hides ourselves
    */
    OnOKButtonClick: function( in_objEvent )
    {
        this._doButtonAction( 'submit' );
    },

    /**
    * OnCancelButtonClick - Hides ourselves
    */
    OnCancelButtonClick: function( in_objEvent )
    {
        this._doButtonAction( 'cancelled' );
    },

    _doButtonAction: function( in_strMessage )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        var objPlugged = this.getPlugged();
        var aArguments = this._getClosingArguments();
        
        objPlugged.Raise( objPlugged.type + in_strMessage, aArguments );
    },
    
    /**
    * _getClosingArguments - you just like the name, don't you?
    * @param {Variant} - either undefined or an array, passed directly to the Raise function.
    */
    _getClosingArguments: function()
    {
        var aRetVal = undefined;
        if( this.m_strCloseFunctionName )
        {
           var vRetVal = this.getPlugged()[ this.m_strCloseFunctionName ]();
           if( vRetVal )
           {
                aRetVal = [ vRetVal ];
           } // end if
        } // end if
        
        return aRetVal;
    },
    
    /**
    * setOKText - set the text of the OK button
    * @param {String} in_strText - text to set the input button to
    */
    setOKText: function( in_strText )
    {
        Util.Assert( TypeCheck.String( in_strText ) );
        
        this.getPlugged().$( 'elementOKButton' ).innerHTML = in_strText;
    }
} );