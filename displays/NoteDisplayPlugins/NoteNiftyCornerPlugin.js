function NoteNiftyCornerPlugin()
{
    this.m_bLastEditable = undefined;
    
    return NoteNiftyCornerPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteNiftyCornerPlugin, Plugin );

Object.extend( NoteNiftyCornerPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
	    if( ! Nifty.csscorners )
	    {
            this.RegisterListenerObject( { message: 'seteditable', 
	            listener: this.OnNiftyCornerCheck, context: this } );
        } // end if
        
        NoteNiftyCornerPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnNiftyCornerCheck - check to see whether we need to update nifty corners.
    */
    OnNiftyCornerCheck: function( in_bEditable )
    {
        Util.Assert( TypeCheck.Boolean( in_bEditable ) );
        
        if( this.m_bLastEditable != in_bEditable )
        {
            this.m_bLastEditable = in_bEditable;
            this._removeOldCorners();
            Timeout.setTimeout( Nifty, 0, this, [ 'div#' + this.getPlugged().m_strMessagingID, 'all' ] );
        } // end if
    },
    
    /**
    * _removeOldCorners - this removes any previous nifty corners so that we don't clutter
    *   up the DOM.
    */
    _removeOldCorners: function()
    {
        var objOldElements = this.getPlugged().$$( 'niftycorners' );
        for( var nIndex = 0, objElement; objElement = objOldElements[ nIndex ]; ++nIndex )
        {
            objElement.parentNode.removeChild( objElement );
        } // end if        
    }
    
} );    
