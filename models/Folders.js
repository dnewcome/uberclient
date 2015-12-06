/**
* class Folders: This is Folders collection model
*/

function Folders()
{
    Folders.Base.constructor.apply( this );
}
UberObject.Base( Folders, MetaTags );

/**
* _fncResultSet - a result set from the DB.  Used in the output arguments.
*/
Folders._fncResultSet = function()
{
    return [ {
        ID: Util.convertSQLServerUniqueID,
        Name: undefined,
        Count: parseInt10,
        Display_Order: parseInt10
		// Create_Dt:
    } ];
};

Folders._fncFoldersResultSet = function()
{   // An array of Folders with the following fields.
    this.Folder = new Folders._fncResultSet();
};

Object.extend( Folders.prototype, {

    /**
    * dbAdd - Add a Folder to the database.  
    * @param {String} in_strName {string} - Name of the folder to add
    * @param {Array} in_astrNoteIDs (optional) - noteids to add 
    *   this tag to on DB create completion.
    * @Returns {Boolean} a Category object if successful, undefined otw.
    */
    dbAdd: function( in_strName, in_astrNoteIDs )
    {
		// input and output argument names should be matched 
		// to web service argument names
        var objInputArguments = {
            name: in_strName,
			parentID: '',
			displayOrder: ''
        };	
        
        var objOutputArguments = {
            folderID: Util.convertSQLServerUniqueID,
            createDT: Util.convertSQLServerTimestamp
        };
        
        var me = this;
        var OnComplete = function( in_objOutputArguments )
        {
	        if( in_objOutputArguments && in_objOutputArguments.folderID ) 
	        {   
				var objModel = me._createModelFromItem( { 
					ID: in_objOutputArguments.folderID,
					Name: in_strName,
					Note_Count: 0,
					Type: me.m_strModelType
				} );
				me.OnDBAddComplete( objModel );
    	        
			   if( in_astrNoteIDs && in_astrNoteIDs.length )
			   {   
				   // todo: raise 'notes foldered' event
					me.Raise( 'requestnotesfoldered', [ in_astrNoteIDs, objModel.m_strID ] );
			   } // end if
	        } // end if    
        };
        
	    var objRetVal = Util.callDBActionAsync( 'FolderAdd', objInputArguments, 
	        objOutputArguments, OnComplete );
	    return objRetVal;
    },

    /**
    * dbProcessBatchPost - Batch load a set of categories
    * @param {Object} in_objBatch - an object with a list of category IDs.
    * @returns {Object} Request object if successfully made, undefined otw.
    */
	/*
	 * TODO: there is no batch get for folders
    dbProcessBatchPost: function( in_objBatch )
    {
        Util.Assert( TypeCheck.Object( in_objBatch ) );
        var objRetVal = undefined;
        
        if( in_objBatch.m_nCount > 0 )
        {
            var objInputArguments = {
                userCategoryIDs: in_objBatch.all_model_ids
            };	
            
            var objOutputArguments = new Folders._fncFoldersResultSet();

	        objRetVal = Util.callDBActionAsync( 'UserCategoryBatchGet', objInputArguments, 
	            objOutputArguments, this.loadBatchDecodedItems, this );
	    } // end if
	    return objRetVal;
    },
	*/

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
		// TODO: figure out which event to raise here
        this.RaiseForAddress( 'loadall', 'categoriesloader' );
    }
} );
