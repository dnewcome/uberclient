/**
* class MetaTags: This is MetaTags collection model
*/

function MetaTags()
{
    this.m_objOutstandingRequests = undefined;
        
    MetaTags.Base.constructor.apply( this );
}
UberObject.Base( MetaTags, ModelCollection );

/**
* Special system MetaTags.  Note - because this enum is used 
*   in a RegExp filter, any names that have one name as a subset as another
*   name (ie, sharedby, sharedbyperuser), the larger name MUST COME FIRST
*   or else the filtering happens incorrectly.
*/
MetaTags.eCollections = new Enum( 
    'systemcategories',
    'tagged',
    'sharedbyperuser',
    'sharedwithperuser',
    'source',
    'attachment',
    'othersharedwith',
    //'comment',
	'contact',
	'folders'
);

    

Object.extend( MetaTags.prototype, {
    /**
    * init - initialize the collection.
    * @param {Object} in_objConfig - Configuration object that has the following fields:
    *   @param {Enum Value} m_strModelType - MetaTagType type defined as a 
    *       value of MetaTags.eCollections.
    *   @param {Factory} m_fncModelFactory - the factory to create the models.
    *   @param {String} m_strModelFactoryType - The model type for the factory to create.
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        Util.Assert( TypeCheck.EnumKey( in_objConfig.m_strModelType, MetaTags.eCollections ) );
        Util.Assert( TypeCheck.Factory( in_objConfig.m_fncModelFactory ) );
        Util.Assert( TypeCheck.String( in_objConfig.m_strModelFactoryType ) );
        
        this.m_fncModelFactory = in_objConfig.m_fncModelFactory;
        // XXX get this with initWithConfigObject.
        this.m_strModelFactoryType = in_objConfig.m_strModelFactoryType;
        this.m_strMessagingID = in_objConfig.m_strModelType;
        
        this.m_objOutstandingRequests = {};
        
        return MetaTags.Base.init.apply( this, [ in_objConfig.m_strModelType ] );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'request' + this.m_strModelType + 'get', 
            Messages.all_publishers_id, this.getMetaTagWithCallback );
        this.RegisterListener( 'request' + this.m_strModelType + 'setName', 
            Messages.all_publishers_id, this.setName );
        
        MetaTags.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * loadAll - load metatags from the decoded DB items.
    * @param {Object} in_objDecodedItems - The decoded user meta tag items.
    * @param {Boolean} in_bRemoveAbsent - Remove items missing from the decoded items
    *   from the store.
    * @returns XXX
    */
    loadAll: function( in_objDecodedItems, in_bRemoveAbsent )
    {	
        Util.Assert( TypeCheck.Object( in_objDecodedItems ) );
        Util.Assert( TypeCheck.UBoolean( in_bRemoveAbsent ) );
        
        return this.loadDecodedItems( in_objDecodedItems, in_bRemoveAbsent ); 
    },


    /**
    * getMetaTagWithCallback - get a category and call a callback with it.
    *   Async behavior in the future is likely.
    * @param {Object} in_objConfig - has three members:
    * @param {Function} in_objConfig.metatagid - Category to get.
    * @param {Function} in_objConfig.callback - callback to call.
    * @param {Object} in_objConfig.context (optional) - context to call backback in, 
    *   if not given, use window
    */
    getMetaTagWithCallback: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        Util.Assert( TypeCheck.String( in_objConfig.metatagid ) );
        Util.Assert( TypeCheck.Function( in_objConfig.callback ) );
        Util.Assert( TypeCheck.UObject( in_objConfig.context ) );
        
        // If category is ready, call callback with category, if not, put
        //  the request on the outstanding requests list.
        var objMetaTag = this.getByID( in_objConfig.metatagid );
        if( objMetaTag )
        {
            in_objConfig.callback.apply( in_objConfig.context || window, [ objMetaTag ] );
        } // end if
        else
        {   
            var objMetaTag = this.m_objOutstandingRequests[ in_objConfig.metatagid ] || [];
            this.m_objOutstandingRequests[ in_objConfig.metatagid ] = objMetaTag;
            objMetaTag.push( in_objConfig );
        } // end if-else
    },
     
    /**
    * insert - insert a model into the collection
    * @param {String} in_strModelID - ID to use for model
    * @param {variant} in_objModel - model to store.
    * @param {Number} in_nIndex (optional) - Index where to insert the object.  If not
    *   given, adds to the end.
    * @returns {Number} - index into the collection on success (i.e. does not 
    *       already exist), -1 otw.
    */
    insert: function( in_strModelID, in_objModel, in_nIndex )
    {
        Util.Assert( TypeCheck.String( in_strModelID ) );
        Util.Assert( TypeCheck.Object( in_objModel ) );
        Util.Assert( TypeCheck.UNumber( in_nIndex ) );
        
        this._processPendingRequests( in_objModel );
        
        return MetaTags.Base.insert.apply( this, [ in_strModelID, in_objModel ] );
    },

    /*
    * _processPendingRequests - If there was anybody waiting for this category, 
    *   call their callbacks and remove the request from the pending requests list.
    * @param {Object} in_objModel - Category to process.
    */
    _processPendingRequests: function( in_objModel )
    {
        Util.Assert( TypeCheck.Object( in_objModel ) );

        var strModelID = in_objModel.m_strID;
        var aobjPendingRequests = this.m_objOutstandingRequests[ strModelID ];
        
        if( aobjPendingRequests )
        {
            aobjPendingRequests.each( function( in_objRequest ) {
                in_objRequest.callback.apply( in_objRequest.context || window, [ in_objModel ] );
            }, this );
            
            this.m_objOutstandingRequests[ strModelID ] = undefined;
            delete this.m_objOutstandingRequests[ strModelID ];
        } // end if
    },

    /**
    * _preProcessItem - Because this is coming from NotesGet and NotesCountGet, 
    *   we have to do some data massaging - Category_ID and not ID, so we convert to ID (if need be).
    *   Add a Note_Count as well as a type.
    * @param {Object} in_objItem - Decoded category item.
    */
    _preProcessItem: function( in_objItem )
    {   // We do Category_ID here because right now it is general to ALL types.
        in_objItem.ID = in_objItem.ID || in_objItem.Category_ID;
        in_objItem.Name = in_objItem.Name || 'ERROR: Name Undefined';
        
        in_objItem.Type = this.m_strModelType;
        this.m_astrNewIDs.push( in_objItem.ID );
        
        return MetaTags.Base._preProcessItem.apply( this, arguments );
    },
    
    /**
    * _createModelFromItem - create a category from a database decoded item.
    * @param {Object} in_objItem - the decoded database item.
    * @returns {Object} - created Category object.
    */
    _createModelFromItem: function( in_objItem )
    {
        Util.Assert( TypeCheck.Object( in_objItem ) );
        
        var objConfig = {
            type: this.m_strModelFactoryType,
            config: in_objItem
        };
        
        var objRetVal = this.m_fncModelFactory.create( objConfig );
        return objRetVal;
    },

    /**
    * _createModelFromItem - create a category from a database decoded item.
    * @param {Object} in_objModel - The model to update.
    * @param {Object} in_objItem - the decoded database item.
    */
    _updateModelFromItem: function( in_objModel, in_objItem )
    {
        Util.Assert( TypeCheck.MetaTag( in_objModel ) );
        Util.Assert( TypeCheck.Object( in_objItem ) );
        
        in_objModel.updateFromItem( in_objItem );
        
        return MetaTags.Base._updateModelFromItem.apply( this, arguments );
    },

    /**
    * loadDecodedItems - loads the decoded user MetaTags.
    * @param {Object} in_objDecodedItems - The decoded user category items.
    * @param {Boolean} in_bRemoveAbsent (optional) - if true, removes items from the data
    *   store that are not part of the decoded items.
    */
    loadDecodedItems: function( in_objDecodedItems, in_bRemoveAbsent )
    {
        Util.Assert( TypeCheck.Object( in_objDecodedItems ) );
        Util.Assert( TypeCheck.UBoolean( in_bRemoveAbsent ) );
        
        this.m_astrNewIDs = [];
        
        var aobjMetaTags = in_objDecodedItems[ CategoriesLoader.eDBResultsSet[ this.m_strModelType ] ];
        var vRetVal = MetaTags.Base.loadDecodedItems.apply( this, [ aobjMetaTags ] );
        
        this._removeAbsentItems( in_bRemoveAbsent );

        return vRetVal;
    },
    
    /**
    * _removeAbsentItems - removes items from the children data store that
    *   are not in the this.m_astrNewIDs list.
    * @param {Boolean} in_bRemoveAbsent (optional) - if true, does the removal.
    */
    _removeAbsentItems: function( in_bRemoveAbsent )
    {
        Util.Assert( TypeCheck.UBoolean( in_bRemoveAbsent ) );

        if( true === in_bRemoveAbsent )
        {
            var astrAllIDs = this.m_aobjChildren.m_objArray;
            var astrIDsToDelete = Array.prototype.without.apply( astrAllIDs, this.m_astrNewIDs );
            
            astrIDsToDelete.each( function( in_strID ) {
                var objMetaTag = this.getByID( in_strID );
                if( objMetaTag )
                {
                    objMetaTag.deleteMe( in_strID, undefined, true );
                } // end if
            }, this );
        } // end if
    },

    /**
    * getByName - get the model of a meta tag if given a name name.
    * @param {String} in_strName - name to search for.
    * @returns {Object} Model if meta tag is found, undefined otw.
    */
    getByName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        var vRetVal = undefined;
        
        for( var nIndex = 0, objChild; objChild = this.getByIndex( nIndex ); ++nIndex )
        {   // simple search - no binary search stuff.
            if( 0 === objChild.compareName( in_strName ) )
            {
                vRetVal = objChild;
                break;
            } // end if
        } // end for
        
        return vRetVal;
    },
    
    /**
    * getIDByName - get the ID of a meta tag if given a name name.
    * @param {String} in_strName - name to search for.
    * @returns {String} ID of the meta tag, if name exists, undefined otw.
    */
    getIDByName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
      
        var objModel = this.getByName( in_strName );
        var vRetVal = objModel ? objModel.m_strID : undefined;
        
        return vRetVal;
    },
    
    /**
    * setName - set the name of a meta tag if another meta tag with the same name does
    *   not exist.
    * @param {String} in_strID - ID of meta tag to set name of
    * @param {String} in_strName - Name to set.
    * @param {Function} in_fncCallback (optional) - optional callback to call with status.
    *   called with true if renamed, false otw.
    */
    setName: function( in_strID, in_strName, in_fncCallback )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        Util.Assert( TypeCheck.String( in_strName ) );
        Util.Assert( TypeCheck.UFunction( in_fncCallback ) );

        // If category is ready, call callback with category, if not, put
        //  the request on the outstanding requests list.
        var objMetaTag = this.getByID( in_strID );
        var strCollisionMetaTag = this.getIDByName( in_strName );
        var bRetVal = false;
        
        if( objMetaTag && !strCollisionMetaTag )
        {
            bRetVal = objMetaTag.setName( in_strName );
        } // end if
        
        if( in_fncCallback )
        {
            in_fncCallback( in_strName, bRetVal );
        } // end if
    },
    
    /**
    * searchMetaTagNames - create a list of all the meta tags matching
    *   with the given search term.
    * @param {String} in_strSearchTerm - beginning of name.
    * @param {bool} in_bExact (optional) - if true, specfies exact match.  
    *   If undefined or false, do a partial match on the beginning of the word.
    */
    searchMetaTagNames: function( in_strSearchTerm, in_bExact )
    {
        Util.Assert( TypeCheck.String( in_strSearchTerm ) );
        Util.Assert( TypeCheck.UBoolean( in_bExact ) );
        
        var astrRetVal = [];
        var strSearchFunction = in_bExact ? 'compareName' : 'comparePartialName';
        
        for( var nIndex = this.length - 1, objChild; objChild = this.getByIndex( nIndex ); --nIndex )
        {   
            if( 0 === objChild[ strSearchFunction ]( in_strSearchTerm ) )
            {
                var objExtraInfo = objChild.m_objExtraInfo;
                astrRetVal.push( { name: objExtraInfo.Name, id: objChild.m_strID } );
            } // end if
        } // end for
        
        return astrRetVal;
    }
} );
