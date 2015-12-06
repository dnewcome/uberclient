/**
* NotesPagingHeaderPlugin object.
*/
function NotesPagingHeaderPlugin()
{
    NotesPagingHeaderPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingHeaderPlugin, Plugin );

Object.extend( NotesPagingHeaderPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        NotesPagingHeaderPlugin.Base.RegisterMessageHandlers.apply( this );

        this.RegisterListener( 'configchange', this.OnConfigChange, this );
    },

    /**
    * _getHeaderText - get the header text for the given category.
    */
    _getHeaderText: function()
    {
        var objConfig = this.getPlugged().m_objConfig;
        var strMetaTagID = objConfig.metatagid;
        var strCollectionID = objConfig.collectionid;
        
        if(  strMetaTagID == SystemCategories.Categories.search ) 
        {   
            var strHeader = _localStrings.SEARCH_TERM + '<b>' + objConfig.searchterm + '</b>';
            this.setHeader( strHeader );
        } // end if
        else
        {   // Go ask the collection for the info.
            if( !strMetaTagID )
            {   // System category, these are all stored in the tagged collection.
                strMetaTagID = strCollectionID;
                strCollectionID = MetaTags.eCollections.tagged;
            } // end if
            
            this.RaiseForAddress( 'request' + strCollectionID + 'get', strCollectionID, 
                [ { metatagid: strMetaTagID,
                    callback: this.OnGetMetaTagComplete,
                    context: this
                } ] );
        } // end if-else
    },

    /**
    * OnGetMetaTagComplete - set the header based off of the category given
    * @param {Object} in_objMetaTag - MetaTag to display the heading for.
    */
    OnGetMetaTagComplete: function( in_objMetaTag )
    {
        Util.Assert( TypeCheck.MetaTag( in_objMetaTag ) );
        
        var strHeading = _localStrings.CURRENT_CATEGORY 
            + '<b>' + in_objMetaTag.m_objExtraInfo.Name + '</b>';
        this.setHeader( strHeading );
    },
    
    /**
    * updateHeader - Updates the header based on the current configuration
    */
    updateHeader: function( in_objConfig )
    {
        if( in_objConfig.header )
        {
            this.setHeader( in_objConfig.header );
        } // end if-else
        else
        {
            this._getHeaderText();
        } // end if-else
    },

    /**
    * setHeader - sets the header
    * @param {String} in_strHeader - header HTML.
    */
    setHeader: function( in_strHeader )
    {
        var objPlugged = this.getPlugged();

        Util.Assert( TypeCheck.String( in_strHeader ) );
        Util.Assert( TypeCheck.Object( objPlugged.$( 'elementHeader' ) ) );
        Util.Assert( TypeCheck.String( in_strHeader ) );    // can be an empty string too!
        
        var strOperation = in_strHeader ? 'addClassName' : 'removeClassName';
        objPlugged.$()[ strOperation ]( 'hasmessage' );
        
        objPlugged.$( 'elementHeader' ).update( in_strHeader );
    },
    
    OnConfigChange: function()
    {
        this.updateHeader( this.getPlugged().m_objConfig );    
    }
} );
