function MetaTagsDropdownRequestBuilderPlugin()
{
    this.m_strContextID = undefined;
    this.m_objRequests = undefined;
    
    MetaTagsDropdownRequestBuilderPlugin.Base.constructor.apply( this );
};
UberObject.Base( MetaTagsDropdownRequestBuilderPlugin, Plugin );

Object.extend( MetaTagsDropdownRequestBuilderPlugin.prototype, {
	loadConfigParams: function()
	{
		MetaTagsDropdownRequestBuilderPlugin.Base.loadConfigParams.apply( this, arguments );
		this.extendConfigParams( {
			m_strCollectionID: { type: 'string', bRequired: true }
		} );
	},
	
    init: function()
    {
        this._resetRequests();
        MetaTagsDropdownRequestBuilderPlugin.Base.init.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'show', this._resetRequests, this );
        this.RegisterListener( 'contextset', this.OnContextSet, this );
        this.RegisterListener( 'createrequest', this.OnCreate, this );
        this.RegisterListener( 'tagrequest', this.OnTag, this );
        this.RegisterListener( 'untagrequest', this.OnUnTag, this );
        this.RegisterListener( 'cancelrequest', this.OnCancel, this );
        this.RegisterListener( 'applyrequests', this.OnApplyRequests, this );
            
        MetaTagsDropdownRequestBuilderPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnContextSet - set the current context ID
    * @param {String} in_strID - id of new context.
    */
    OnContextSet: function( in_strID )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        this.m_strContextID = in_strID;
    },
    
    /**
    * OnCreate - called for 'createtag'.  Creates an entry to create a tag.
    * @param {String} in_strName - name for tag.
    */
    OnCreate: function( in_strName ) 
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        this.m_objRequests[ in_strName ] = 'create' + this.m_strCollectionID;
    },

    /**
    * OnTag - called for 'tagrequest'.  Creates/updates an entry to tag a note.
    * @param {String} in_strID - ID to add.
    */
    OnTag: function( in_strID ) 
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        this.m_objRequests[ in_strID ] = 'add' + this.m_strCollectionID + 'binding';
    },

    /**
    * OnUnTag - called for 'untagrequest'.  Creates/updates an entry to untag a note.
    * @param {String} in_strID - ID to remove.
    */
    OnUnTag: function( in_strID ) 
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        this.m_objRequests[ in_strID ] = 'remove' + this.m_strCollectionID + 'binding';
    },

    /**
    * OnCancel - called for cancelrequest - cancels a request on a tag given by the id.
    * @param {String} in_strID - ID of tag to remove from the request list.
    */
    OnCancel: function( in_strID ) 
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        if( this.m_objRequests[ in_strID ] )
        {
            delete this.m_objRequests[ in_strID ];
        } // end if
    },
    
    /**
    * OnApplyRequests - called to apply the list of requests
    */
    OnApplyRequests: function()
    {
        var objPlugged = this.getPlugged();
        
        for( strKey in this.m_objRequests )
        {
            var strAction = this.m_objRequests[ strKey ];
            objPlugged.RaiseForAddress( strAction, this.m_strContextID, [ strKey ] );
        } // end for
        this._resetRequests();        
    },
    
    /**
    * @private
    * _getRequests - return the current request set
    * @returns {Object} - Object of Objects based on id that have the current requests
    */
    _getRequests: function()
    {
        return this.m_objRequests;
    },
    
    /**
    * @private
    * _resetRequests - Resets all the requests
    */
    _resetRequests: function()
    {
        this.m_objRequests = {};
    },
    
    /**
    * @private
    * _getRequest - get the request for the specified ID
    * @param {String} in_strID - MetaTag ID
    * @Returns {Object} - Object if request exists for ID, undefined otw
    */
    _getRequest: function( in_strID )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        return this.m_objRequests[ in_strID ];
    },

    /**
    * @private
    * _getContextID - return the current context ID
    * @returns {String} - current context ID
    */
    _getContextID: function()
    {
        return this.m_strContextID;
    }
} );
    