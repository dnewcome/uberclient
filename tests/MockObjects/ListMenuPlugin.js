function ListMenuPlugin()
{
    this.m_objContext = undefined;
    
    ListMenuPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( ListMenuPlugin, Plugin );

Object.extend( ListMenuPlugin.prototype, {
    init: function()
    {
        this.m_objContext = new UberObject();
        this.m_objContext.init();
        this.m_objContext.setMessagingID( 'contextid' );
        
        ListMenuPlugin.Base.init.apply( this, arguments );
    },
    
    $: function( in_strSelector )
    {
        var objRetVal = window.document.body;
        return objRetVal;
    },
    
    getContext: function()
    {
        return this.m_objContext;
    }
} );
