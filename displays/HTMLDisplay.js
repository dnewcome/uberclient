/**
* HTMLDisplay - a popup that shows HTML
*/
function HTMLDisplay()
{
    HTMLDisplay.Base.constructor.apply( this );
}
// Inherit from Popup
UberObject.Base( HTMLDisplay, DisplayAltConfig );

Object.extend( HTMLDisplay.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            type: { type: 'string', bRequired: false, default_value: 'HTMLDisplay' }
        };
        HTMLDisplay.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'setcontent', Messages.all_publishers_id, this.setContent );
        HTMLDisplay.Base.RegisterMessageHandlers.apply( this );
    },
    
    /**
    * setContent - sets the HTML Message.
    * @param {String} in_strHTML - HTML to show.  Can be an empty string
    * @returns {bool} returns true if set, false otw.
    */
    setContent: function( in_strHTML )
    {
        Util.Assert( TypeCheck.String( in_strHTML ) );
        var bRetVal = false;
        
        // We do this because there could be an error in the app
        //  after we are officially torn down.
        if( this.m_objDomContainer )
        {
            bRetVal = this.setChildHTML( 'elementContent', in_strHTML );
        } // end if
        return bRetVal;
    }
} );