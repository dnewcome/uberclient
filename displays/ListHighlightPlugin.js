/*
* ListHighlightPlugin - Adds highlighting to a ListDisplay
*/
function ListHighlightPlugin()
{
    this.m_objCurrentHighlight = undefined;
    
    ListHighlightPlugin.Base.constructor.apply( this );
}
UberObject.Base( ListHighlightPlugin, Plugin );

Object.extend( ListHighlightPlugin.prototype, {
    teardown: function()
    {
        this.m_objCurrentHighlight = null;
        ListHighlightPlugin.Base.teardown.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'highlightlistitem', this.OnHighlight, this );
        this.RegisterListener( 'unhighlightlistitem', this.OnUnHighlight, this );
        
        this.RegisterListenerObject( { message: 'onshow', 
	            listener: this.OnShow, context: this } );
	            
	    ListHighlightPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnShow: function()
    {
        this._unsetCurrHighlight();
    },
    
    OnHighlight: function( in_strItemID, in_objEvent, in_objItem, in_objItemElement )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        Util.Assert( TypeCheck.UObject( in_objItemElement ) );
        
        in_objItemElement = in_objItemElement || this.getPlugged().getElementByID( in_strItemID );
        this._setCurrHighlight( in_objItemElement, in_strItemID );
    },

    OnUnHighlight: function( in_strItemID, in_objEvent, in_objItem, in_objItemElement )
    {   // moused out, remove the highlights.  could be we moused into an inner container, but OnHighlight will
        // take care of resetting the element.
        this._unsetCurrHighlight();
    },

    _unsetCurrHighlight: function()
    {
        if( this.m_objCurrentHighlight )
        {
            DOMElement.unhighlight( this.m_objCurrentHighlight );
        } // end if
    },

    /**
    * _setCurrHighlight - Sets the currently highlighted element.  Removes
    *   selection from old element.
    * @param {Object} in_objElement - new object to set selected.
    */
    _setCurrHighlight: function( in_objElement, in_strItemID )
    {
        Util.Assert( in_objElement );
        
        this._unsetCurrHighlight();
        this.m_objCurrentHighlight = in_objElement;
        DOMElement.highlight( in_objElement );
        
        this._scrollElementIntoView( in_objElement );

        this.getPlugged().Raise( 'listitemhighlight', [ in_strItemID ] );
    },
    
    /**
    * _scrollElementIntoView - scroll an element into view.
    * @param {Object} in_objElement - element to scroll into view.
    */
    _scrollElementIntoView: function( in_objElement )
    {
        // for the container, do not use the plugin container because the containing element
        //  could have things besides the list.  Use the parentNode of the element.
        var objContainer = in_objElement.parentNode;
        if( in_objElement.offsetTop > ( objContainer.scrollTop + objContainer.getHeight() ) )
        {   // scroll item to bottom of list.
            in_objElement.scrollIntoView( false );
        } // end if
        else if( in_objElement.offsetTop < objContainer.scrollTop )
        {   // scroll item to top of list.
            in_objElement.scrollIntoView( true );
        } // end if
        
    }
} );