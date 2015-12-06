/*
* HeaderFooterPlugin - Handles headers and footers
*/
function HeaderFooterPlugin()
{
    HeaderFooterPlugin.Base.constructor.apply( this );
}
UberObject.Base( HeaderFooterPlugin, Plugin );

Object.extend( HeaderFooterPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        var objPlugged = this.getPlugged();

        this.RegisterListenerObject( { message: 'setheader', from: Messages.all_publishers_id, 
                to: objPlugged.m_strMessagingID, listener: this.setHeader } )
            .RegisterListenerObject( { message: 'setfooter', from: Messages.all_publishers_id, 
                to: objPlugged.m_strMessagingID, listener: this.setFooter } );

        this.extendPlugged( 'setHeader' );
        this.extendPlugged( 'setFooter' );
	            
	    HeaderFooterPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * setHeader - set the contents of the element 
    *   selected by elementHeader, if available
    * @param {String} in_strHeader - Header text
    */
    setHeader: function( in_strHeader )
    {
        Util.Assert( TypeCheck.String( in_strHeader ) );
        
        this.setChildHTML( 'elementHeader', in_strHeader );
    },

    /**
    * setFooter - set the contents of the element 
    *   selected by elementFooter, if available
    * @param {String} in_strFooter - Footer text
    */
    setFooter: function( in_strFooter )
    {
        Util.Assert( TypeCheck.String( in_strFooter ) );
        
        this.setChildHTML( 'elementFooter', in_strFooter );
    }
} );