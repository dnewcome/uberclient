/**
* MetaTagDisplay
*/
function MetaTagDisplay( )
{
    MetaTagDisplay.Base.constructor.apply( this );
}
UberObject.Base( MetaTagDisplay, DisplayAltConfig );

TypeCheck.createForObject( 'MetaTagDisplay' );

Object.extend( MetaTagDisplay.prototype, {
    loadConfigParams: function()
    {
        MetaTagDisplay.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objExtraInfo: { type: 'object', bRequired: false },
            m_objMetaTag: { type: 'object', bRequired: false }
        } );
    },

    /**
    *   Message handlers
    */
    RegisterMessageHandlers: function()
    {
        if( this.m_objMetaTag )
        {
            var strMetaTagID = this.m_objMetaTag.getID();
            
            this.RegisterListener( this.type + 'update', strMetaTagID, this.OnUpdate )
                .RegisterListener( this.type + 'delete', strMetaTagID, this.teardown );
    	} // end if

		this.RegisterListener( 'domavailable', this.m_strMessagingID, this.OnUpdate );
    	
	    MetaTagDisplay.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * compareName - used for sorting/searching.
    * @param {String} in_strName - Name to compare against.
    * @returns {Number} - 0 if ( in_strName == tag.m_strName ), 
    *   -1 if in_strName < tag.m_strName, +1 otw.
    */
    compareName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        return this.m_objMetaTag.compareName( in_strName );
    },

    /**
    * getMetaTag - get the MetaTag for this display.
    * @returns {Object} MetaTag attached to this display.
    */
    getMetaTag: function()
    {
        return this.m_objMetaTag;
    },
    
    /**
    * setExtraInfo - sets the Extra Info on the meta tag display.
    * @param {Variant} in_objExtraInfo - Extra Info to set.
    */
    setExtraInfo: function( in_objExtraInfo )
    {
        this.m_objExtraInfo = in_objExtraInfo;
        this.Raise( 'loaddataobject', undefined, true );
    },
        
    /**
    * getExtraInfo - gets the extra info for the meta tag.
    * @returns {Variant} - The set extra info.
    */
    getExtraInfo: function()
    {
        return this.m_objExtraInfo;
    },
    
    /**
    * getField - get a field from the meta tag display
    * @param {String} in_strField - field to get
    * @returns {variant} Value if field exists, undefined otw.
    */
    getField: function( in_strField )
    {
        Util.Assert( TypeCheck.String( in_strField ) );
        
        return this.m_objExtraInfo[ in_strField ];
    },
    
    /**
    * getMetaTagID - Gets the ID of the attached MetaTag
    * @returns {String} - ID of the meta tag
    */
    getMetaTagID: function()
    {
        var strRetVal = this.m_objMetaTag && this.m_objMetaTag.getID();
        return strRetVal;
    },
    
    /**
    * OnUpdate - the model has been updated, so set the extra info
    */
    OnUpdate: function()
    {
        this.setExtraInfo( this.m_objMetaTag.getExtraInfo() );
    },
    
    /**
    * show - override the show of Display.   XXX this should probably go into a plugin 
    *   as well that overridees show.
    * @param {Object} in_objPosition (optional) - Position to display at.
    * @param {Object} in_objMetaTagDisplay (optional) - MetaTagDisplay base ourselves on.
    */
    show: function( in_objPosition, in_objMetaTagDisplay )
    {
        Util.Assert( TypeCheck.UObject( in_objPosition ) );
        Util.Assert( TypeCheck.UMetaTagDisplay( in_objMetaTagDisplay ) );
        
        this.setExtraInfo( in_objMetaTagDisplay.getExtraInfo() );
        this.m_objMetaTag = in_objMetaTagDisplay.m_objMetaTag;
        
        return MetaTagDisplay.Base.show.apply( this, [ in_objPosition ] );        
    }
} );

