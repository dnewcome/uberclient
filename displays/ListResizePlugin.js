
function ListResizePlugin()
{
    ListResizePlugin.Base.constructor.apply( this );
}
UberObject.Base( ListResizePlugin, Plugin );

Object.extend( ListResizePlugin.prototype, {
    loadConfigParams: function()
    {
        ListResizePlugin.Base.loadConfigParams.apply( this, arguments );
        this.extendConfigParams( {
           m_bResizeOnShow: { type: 'boolean', bRequired: false, default_value: false }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        if( this.m_bResizeOnShow )
        {
            this.RegisterListener( 'onbeforeshow', this.OnBeforeShow, this );
            this.RegisterListener( 'onshow', this.OnShow, this );
        } // end if
        
        this.RegisterListener( 'resizelist', this.OnResize, this );
        
        ListResizePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * OnBeforeShow - called before a list is shown.  If a position is passed in 
    *   set the show position off the screen so the resize is fluid.
    * @param {Object} in_objPosition (optional) - Array or object that has position information.
    */    
    OnBeforeShow: function( in_objPosition )
    {
        Util.Assert( TypeCheck.UObject( in_objPosition ) );
        
        var objPlugged = this.getPlugged();
        
        // Reset the style so that we can get the natural height in OnShow.
        objPlugged.$().setStyle( 'height: auto' );
        objPlugged.$( objPlugged.m_strListItemAreaSelector ).setStyle( 'height: auto' );

        // reset this so that subsequent calls don't have the old position.
        this.m_nOrigTop = undefined;
        
        // We set the position somewhere off the screen and then show the menu there.
        //  this way both the outer container and the inner list area container have a height
        //  when we do the calculations and we can correctly resize everything.
        if( in_objPosition )
        {
            this.m_nOrigTop = in_objPosition.top || in_objPosition[1];
            in_objPosition[1] = '-2000px';
        } // end if
    },
    
    /**
    * OnShow - Does the actual resize of the list.  
    *   Displays list back where was originally specified.
    */   
    OnShow: function()
    {
        var objPlugged = this.getPlugged();
        var objContainer = objPlugged.$();
        var objListAreaContainer = objPlugged.$( objPlugged.m_strListItemAreaSelector );

        var nNaturalHeight = objContainer.getHeight();
        var nViewportHeight = document.viewport.getHeight();
        var nOrigTop = ( 'number' == typeof( this.m_nOrigTop ) ) ? this.m_nOrigTop 
            : objContainer.viewportOffset().top;
        var nAvailableHeight = nViewportHeight - ( nOrigTop ) - 10;
        var nHeight = Math.min( nAvailableHeight, nNaturalHeight );
        objContainer.setStyle( 'height: ' + nHeight.toString() + 'px' );
        
        if( objContainer != objListAreaContainer )
        {
            var nListAreaNaturalHeight = objListAreaContainer.getHeight();
            var nListAreaDifference = nNaturalHeight - nListAreaNaturalHeight;
            var nListAreaHeight = nHeight - nListAreaDifference;
            objListAreaContainer.setStyle( 'height: ' + nListAreaHeight.toString() + 'px' );
        } // end if
        
        if( this.m_nOrigTop )
        {   // Now set the top to where the user originally wanted.
            objContainer.setStyle( 'top: ' + this.m_nOrigTop.toString() + 'px' );
        } // end if
    },
 
    /**
    * OnResize - Resize a list in place.
    */
    OnResize: function()
    {
        this.OnBeforeShow();
        this.OnShow();
    }
} );    

