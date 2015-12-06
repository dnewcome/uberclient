function DOMEvent()
{
    this.keyCode = undefined;
};

Object.extend( DOMEvent.prototype, {
    stopPropagation: function()
    {
        this.m_bPropagationStopped = true;
    },
    
    setCancelled: function()
    {
        this.m_bCancelled = false;
    },
    
    cancelEvent: function()
    {
        this.m_bCancelled = true;
    },
    
    isCancelled: function()
    {
        return !!this.m_bCancelled;
    },

    setPreventDefault: function()
    {
        this.m_bPrevented = false;
    },
    
    preventDefault: function()
    {
        this.m_bPrevented = true;
    },
    
    isPreventDefaulted: function()
    {
        return !!this.m_bPrevented;
    },
    
    setKeyCode: function( in_nKeyCode )
    {
        this.keyCode = in_nKeyCode;
    }
} );

Object.extend( DOMEvent, {
    m_bMouseout: undefined,
    setMouseLeave: function( in_bMouseout )
    {
        DOMEvent.m_bMouseout = in_bMouseout;
    },
    
    checkMouseLeave: function()
    {
        return DOMEvent.m_bMouseout;
    }
} );