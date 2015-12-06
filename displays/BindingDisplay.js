/**
* BindingDisplay
*/
function BindingDisplay( )
{
    BindingDisplay.Base.constructor.apply( this );
}
UberObject.Base( BindingDisplay, MetaTagDisplay );

TypeCheck.createForObject( 'BindingDisplay' );

Object.extend( BindingDisplay.prototype, {
    loadConfigParams: function()
    {
        BindingDisplay.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objBindingInfo: { type: 'object', bRequired: false },
            m_strNoteID: { type: 'string', bRequired: false }
        } );
    },

    /**
    * setBindingInfo - sets the Binding Info on the meta tag display.
    * @param {Variant} in_objBindingInfo - Binding Info to set.
    */
    setBindingInfo: function( in_objBindingInfo )
    {
        this.m_objBindingInfo = in_objBindingInfo;
        this.Raise( 'loaddataobject', undefined, true );
    },
        
    /**
    * getBindingInfo - gets the Binding Info for the meta tag.
    * @returns {Object} - the binding info
    */
    getBindingInfo: function()
    {
        return this.m_objBindingInfo;
    },
    
    /**
    *   Message handlers
    */
    RegisterMessageHandlers: function()
    {
        if( this.m_strNoteID )
        {
            this.RegisterListener( 'binding' + this.type + 'update', this.m_strNoteID, this.OnUpdate )
                .RegisterListener( 'binding' + this.type + 'delete', this.m_strNoteID, this.teardown );
    	} // end if
    	
	    BindingDisplay.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * show - override the show of Display.
    * @param {Object} in_objPosition (optional) - Position to display at.
    * @param {Object} in_objBindingDisplay (optional) - BindingDisplay base ourselves on.
    */
    show: function( in_objPosition, in_objBindingDisplay )
    {
        Util.Assert( TypeCheck.UObject( in_objPosition ) );
        Util.Assert( TypeCheck.UBindingDisplay( in_objBindingDisplay ) );
        
        this.setBindingInfo( in_objBindingDisplay.getBindingInfo() );

        return BindingDisplay.Base.show.apply( this, arguments );        
    }
} );

