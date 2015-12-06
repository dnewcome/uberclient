function MetaTagsListDelayedInitPlugin()
{
    MetaTagsListDelayedInitPlugin.Base.constructor.apply( this );
};
UberObject.Base( MetaTagsListDelayedInitPlugin, Plugin );

Object.extend( MetaTagsListDelayedInitPlugin.prototype, {
    init: function()
    {
        MetaTagsListDelayedInitPlugin.Base.init.apply( this, arguments );
        this.extendPlugged( 'prepareForDisplay', this );
        
    },
    /**
    * getAllMetaTags - Get all the categories and create/insert a menu item for each.
    */
    getAllMetaTags: function()
    {
        var objPlugged = this.getPlugged();
        objPlugged.removeTeardownAll();
        
        for( var nIndex = 0, objMetaTag; 
            objMetaTag = objPlugged.m_objCollection.getByIndex( nIndex ); ++nIndex )
        {
	            objPlugged.addMetaTagFromModel( objMetaTag, false );
        } // end for  
    },
    
    /**
    * prepareForDisplay - Builds the category list based off of what is in the 
    *   categories model.  Call this before doing a "show" or doing any selections 
    *   to get the display ready - it builds the
    */
    prepareForDisplay: function()
    {
        var objPlugged = this.getPlugged();
        
        if( ! objPlugged.isInitialized() )
        {
    	    this.getPlugged().init();
        } // end if
        
        if( ! objPlugged.m_bReadyForDisplay )
        {
            this.getAllMetaTags();
        } // end if
    }    
});