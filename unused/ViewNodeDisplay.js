/**
* ViewNodeDisplay
*/
function ViewNodeDisplay()
{
    ViewNodeDisplay.Base.constructor.apply( this );
}
UberObject.Base( ViewNodeDisplay, MetaTagDisplay );

Object.extend( ViewNodeDisplay.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_strTemplate: { type: 'string', bRequired: false, default_value: 'ViewNode' },
            type: { type: 'string', bRequired: true }
        };

        ViewNodeDisplay.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    RegisterMessageHandlers: function()
    {
	    this.RegisterListener( this.type + 'setcount', this.getMetaTagID(), this.OnSetCount );
           
        ViewNodeDisplay.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * Set the HTML to display the information in this Category.
    *   Helper function that should only be called internally.
    */
    _HTMLLoadData: function ()
    {    
        this.setChildHTML( 'elementCount', "(" + this.m_objMetaTag.getCount() + ")" ); 
        
        return ViewNodeDisplay.Base._HTMLLoadData.apply( this, arguments );
    },

    /**
    * OnSetCount - setCount message handler
    * @param {number} in_nCount - note count
    */
    OnSetCount: function( in_nCount )
    {
        Util.Assert( TypeCheck.Number( in_nCount ) );
        
        this.setChildHTML( 'elementCount', "(" + in_nCount + ")" );
    }
} );