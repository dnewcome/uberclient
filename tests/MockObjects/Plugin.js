function Plugin()
{
    this.m_strMessagingID = 'testpluginmessagingid';
    this.m_objPlugged = undefined;
    
    Plugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( Plugin, UberObject );

Object.extend( Plugin.prototype, {
    init: function() {
        // Allow a derived class to set the plugged object before initialization.
        this.m_objPlugged = this.m_objPlugged || new UberObject();
        this.m_objPlugged.init();
        
        Plugin.Base.init.apply( this, arguments );
    },
    
    RegisterListener: function( in_strMessage, in_fncListener, in_objContext ) {
        this.RegisterListenerObject( { 
            message: in_strMessage,
            listener: in_fncListener,
            context: in_objContext,
            from: this.getPlugged().m_strMessagingID
        } );
    },
    
    setPlugged: function( in_objNewPlugged ) {
        this.m_objPlugged = in_objNewPlugged;
    },
    
    getPlugged: function() { return this.m_objPlugged; },
    
    extendPlugged: function() {},
    


} );

