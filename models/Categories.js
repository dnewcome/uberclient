/**
* class Categories: This is Categories collection model
*/

function Categories()
{
    Categories.Base.constructor.apply( this );
}
UberObject.Base( Categories, MetaTags );

/**
* _fncResultSet - a result set from the DB.  Used in the output arguments.
*/
Categories._fncResultSet = function()
{
    return [ {
        ID: Util.convertSQLServerUniqueID,
        Name: undefined,
        Note_Count: parseInt10
    } ];
};

Categories._fncUserCategoriesResultSet = function()
{   // An array of User_Categories with the following fields.
    this.User_Category = new Categories._fncResultSet();
};

Object.extend( Categories.prototype, {

    /**
    * dbAdd - Add a Category to the database.  
    * @param {String} in_strName {string} - Name of the category to add
    * @param {Array} in_astrNoteIDs (optional) - noteids to add 
    *   this tag to on DB create completion.
    * @Returns {Boolean} a Category object if successful, undefined otw.
    */
    dbAdd: function( in_strName, in_astrNoteIDs )
    {
        var objInputArguments = {
            catName: in_strName
        };	
        
        var objOutputArguments =
        {
            catID: Util.convertSQLServerUniqueID,
            createDT: Util.convertSQLServerTimestamp
        };
        
        var me=this;
        var OnComplete = function( in_objOutputArguments )
        {
	        if( in_objOutputArguments && in_objOutputArguments.catID ) 
	        {   
				var objModel = me._createModelFromItem( { 
					ID: in_objOutputArguments.catID,
					Name: in_strName,
					Note_Count: 0,
					Type: me.m_strModelType
				} );
				me.OnDBAddComplete( objModel );
    	        
			   if( in_astrNoteIDs && in_astrNoteIDs.length )
			   {   
					me.Raise( 'requestnotestagged', [ in_astrNoteIDs, objModel.m_strID ] );
			   } // end if
	        } // end if    
        };
        
	    var objRetVal = Util.callDBActionAsync( 'UserCategoryAdd', objInputArguments, 
	        objOutputArguments, OnComplete );
	    return objRetVal;
    },

    /**
    * dbProcessBatchPost - Batch load a set of categories
    * @param {Object} in_objBatch - an object with a list of category IDs.
    * @returns {Object} Request object if successfully made, undefined otw.
    */
    dbProcessBatchPost: function( in_objBatch )
    {
        Util.Assert( TypeCheck.Object( in_objBatch ) );
        var objRetVal = undefined;
        
        if( in_objBatch.m_nCount > 0 )
        {
            var objInputArguments = {
                userCategoryIDs: in_objBatch.all_model_ids
            };	
            
            var objOutputArguments = new Categories._fncUserCategoriesResultSet();

	        objRetVal = Util.callDBActionAsync( 'UserCategoryBatchGet', objInputArguments, 
	            objOutputArguments, this.loadBatchDecodedItems, this );
	    } // end if
	    return objRetVal;
    },

    /**
    * loadBatchDecodedItems - loads the decoded user categories.
    * @param {Object} in_objDecodedItems - The decoded user category items.
    * @param {Boolean} in_bOverrideDelete (optional) - Set to true to override the delete.  
    *   Assumes false.
    */
    loadBatchDecodedItems: function( in_objDecodedItems )
    {
        in_objDecodedItems.User_Categories = in_objDecodedItems.User_Category;
        Categories.Base.loadDecodedItems.apply( this, [ in_objDecodedItems ] );
    },

    /**
    * OnModelLoad - if we have to load one model, load them all!
    */
    OnModelLoad: function()
    {
        this.RaiseForAddress( 'loadall', 'categoriesloader' );
    }
} );