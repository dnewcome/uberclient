/**
* HTMLPopup - a popup that shows HTML
*/
function HTMLPopup()
{
    HTMLPopup.Base.constructor.apply( this );
}
// Inherit from Popup
UberObject.Base( HTMLPopup, Popup );

HTMLPopup.ConfigParams = {
    type: { type: 'string', bRequired: false, default_value: 'HTMLPopup' }
};

Object.extend( HTMLPopup.prototype, {
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
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'setcontent', Messages.all_publishers_id, this.setContent );
        HTMLPopup.Base.RegisterMessageHandlers.apply( this );
    },
    
    loadConfigParams: function()
    {
        HTMLPopup.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, HTMLPopup.ConfigParams, true );
    },

    findDomElements: function()
    {
        Util.Assert( this.$( 'elementContent' ) );
        HTMLPopup.Base.findDomElements.apply( this );
    }
} );