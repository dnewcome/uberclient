function Tooltip()
{
    Tooltip.Base.constructor.apply( this );
};
UberObject.Base( Tooltip, Display );

Object.extend( Tooltip.prototype, {

    loadConfigParams: function()
    {
         var ConfigParams = {
            m_bGracefulReposition: { type: 'boolean', bRequired: false, default_value: true },
            type: { type: 'string', bRequired: false, default_value: 'Tooltip' }
        };
        Tooltip.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, ConfigParams, true );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'tooltipshow', Messages.all_publishers_id, this.show );
        this.RegisterListener( 'tooltiphide', Messages.all_publishers_id, this.hide );
        
        return Tooltip.Base.RegisterMessageHandlers.apply( this );
    },
    
    init: function( in_objConfig )
    {
        Util.Assert( false == this.isInitialized() );
        Util.Assert( TypeCheck.Object( in_objConfig ) );

        return Tooltip.Base.initWithConfigObject.apply( this, [ in_objConfig ] );
    },
    
    /**
    * show - Shows the tooltip for an element
    * @param {Object} in_objElement - Element to try to create tooltip for.
    *   Tooltip will be set to 1) title, 2) alt text.  If not found, 
    *   tooltip not shown.
    */
    show: function( in_objElement )
    {
        Util.Assert( in_objElement );
        
        var bOverride = BrowserInfo.ie || BrowserInfo.webkit;
        var vRetVal = undefined, strText = undefined;        

        if( ( false === bOverride ) 
         && ( strText = in_objElement.title || in_objElement.alt ) 
         && ( strText ) )
        {
            var objCoordinates = Position.cumulativeOffset( in_objElement );
            var objDimensions = Element.getDimensions( in_objElement );
            this.m_objDomContainer.innerHTML = strText;
            
            // Offset off of the element a bit.
            objCoordinates[1] += ( objDimensions.height + 20 );
            
            vRetVal = Tooltip.Base.show.apply( this, [ objCoordinates ] );
        } // end if
        
        return vRetVal;
    }

});
