
function MetaTag()
{
    this.m_strMetaTagID;
    
    this.m_objRaisedMessages = {};
    this.m_bRequestRemove = false;
}

Object.extend( MetaTag.prototype, {
    setType: function( in_strType )
    {
        this.type = in_strType;
    },
    
    setMetaTagID: function( in_strID )
    {
        this.m_strMetaTagID = in_strID;
    },
    
    getMetaTagID: function()
    {
        return this.m_strMetaTagID;
    },
    
    RaiseForAddress: function( in_strMessage, in_strAddress )
    {
        this.m_objRaisedMessages[ in_strMessage ] = in_strAddress;
    },
    
    getRaisedMessage: function( in_strMessage )
    {
        return this.m_objRaisedMessages[ in_strMessage ];
    },
    
    resetRemoveRequested: function()
    {
        this.m_bRequestRemove = false;
    },
    
    getRemoveRequested: function()
    {
        return this.m_bRequestRemove;    
    }
} );

