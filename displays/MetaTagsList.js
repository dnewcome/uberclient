function MetaTagsList()
{
    MetaTagsList.Base.constructor.apply( this );
};
UberObject.Base( MetaTagsList, ListDisplay );

Object.extend( MetaTagsList.prototype, {
    loadConfigParams: function()
    {
        MetaTagsList.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_objCollection: { type: 'object', bReqired: true },
            m_objDisplayFactory: { type: 'object', bReqired: true }
        } );
    },
    
    configurationReady: function()
    {
        this.type = this.m_objCollection.m_strModelType;
        MetaTagsList.Base.configurationReady.apply( this );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( this.type + 'delete', Messages.all_publishers_id, this.removeTeardownItem );
	    this.RegisterListener( this.type + 'setname', Messages.all_publishers_id, this.OnMetaTagSetName );
	    
        MetaTagsList.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * addMetaTagFromModel - creates and adds a metatag to the dropdown menu.
    * @param {Object} in_objMetaTag - metatag being added.
    */
    addMetaTagFromModel: function( in_objMetaTag )
    {
        Util.Assert( TypeCheck.MetaTag( in_objMetaTag ) );
        
        this.m_objDisplayFactory.config = this.m_objDisplayFactory.config || {};
        this.m_objDisplayFactory.config.m_objMetaTag = in_objMetaTag;
		this.m_objDisplayFactory.config.m_bAttachDomOnInit = false;
        this.m_objDisplayFactory.config.type = this.type;
        this.m_objDisplayFactory.attach = false;
        
        if( TypeCheck.Object( in_objMetaTag.m_objExtraInfo ) )
        {
            this.m_objDisplayFactory.config.m_objExtraInfo = in_objMetaTag.m_objExtraInfo;
        } // end if

        var objTag = this.createInitUberObject( this.m_objDisplayFactory );
        
        this.addMetaTagDisplay( objTag );  
    },

    /**
    * addMetaTagFromID - Adds a tag from the MetaTagID.  If a tag already exists 
    *   for this metatag, the new tag will not add.
    * @param {String} in_strMetaTagID - ID of metatag to add
    * @returns {bool} true if successfully added, false otw.
    */
    addMetaTagFromID: function( in_strMetaTagID, in_objExtraInfo )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        var objMetaTag = this.getByID( in_strMetaTagID );
        var bRetVal = ! objMetaTag;
        if( bRetVal )
        {   // a new meta tag
            var objConfig = {
                metatagid: in_strMetaTagID,
                callback: this.addMetaTagFromModel,
                context: this,
                extrainfo: in_objExtraInfo
            };
            this.m_objCollection.getMetaTagWithCallback( objConfig );
        } // end if
        else if( objMetaTag.getExtraInfo() != in_objExtraInfo )
        {   // an updated meta tag.
            objMetaTag.setExtraInfo( in_objExtraInfo );
        } // end if
        
        return bRetVal;
    },

    /**
    * addMetaTagDisplay - adds a metatag display to the list
    * @param {Object} in_objMetaTagDisplay - MetaTagDisplay to be added.
    */
    addMetaTagDisplay: function( in_objMetaTagDisplay )
    {
        Util.Assert( TypeCheck.MetaTagDisplay( in_objMetaTagDisplay ) );
        
        var objMetaTag = in_objMetaTagDisplay.getMetaTag();
        
        var nIndex = this.findInsertionIndex( objMetaTag );
        this.addDisplay( objMetaTag.m_strID, in_objMetaTagDisplay, undefined, undefined, nIndex );
    },

	
    /**
    * OnMetaTagSetName - categorysetname handler, re-orders the tags when there is a renaming.
    * @param {String} in_strMetaTagID - MetaTagID of metatag being renamed.
    */
    OnMetaTagSetName: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        
        // remove, re-add under new name.    
        var objItem = this.removeItem( in_strMetaTagID );
        if( objItem )
        {
            this.addMetaTagDisplay( objItem );
        } // end if
    },
	
	/**
	* findInsertionIndex - find the theoretical index of the name in the given collection.
	*   Made a static function so that it can be used on any collection that has getByIndex
	*   and it's children has a compareName.
	* @param {Object} in_objMetaTag - Meta tag to find insertion index for.
	*/
	findInsertionIndex: function( in_objMetaTag )
	{
		var strName = in_objMetaTag.getName();
		var nRetVal = this.m_objListItems.length;   // default to at the end
		for( var nIndex = 0, objChild; objChild = this.m_objListItems.getByIndex( nIndex ); ++nIndex )
		{   // simple search - no binary search stuff.
			if( objChild.compareName && objChild.compareName( strName ) <= 0 )
			{
				nRetVal = nIndex;
				break;
			} // end if
		} // end for
		
		return nRetVal;
	}
} );