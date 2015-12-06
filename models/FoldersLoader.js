
/**
* FoldersLoader - Loads the data for the folders 
*/
function FoldersLoader()
{
    this.m_objTimeout = undefined;
    
    FoldersLoader.Base.constructor.apply( this, arguments );
};
UberObject.Base( FoldersLoader, UberObject );

/**
* CategoriesLoader.eDBResultsSet - holds the translation keys
*   in the results set from the DB where the collection
*   can find its own data.
*/
FoldersLoader.eDBResultsSet = {
    folders: 'Folders'
};

FoldersLoader._fncResultSet = function()
{   
    this[ FoldersLoader.eDBResultsSet.folders ] = new Folders._fncResultSet();
};



Object.extend( FoldersLoader.prototype, {
    init: function()
    {
        this.m_strMessagingID = 'foldersloader';
        FoldersLoader.Base.init.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'requestsharecheck', Messages.all_publishers_id, this.loadAll );
        this.RegisterListener( 'requestshareload', Messages.all_publishers_id, this.loadAll );
        this.RegisterListener( 'requestsharedelete', Messages.all_publishers_id, this.loadAll );

        this.RegisterListener( 'loadall', Messages.all_publishers_id, this.loadAll );
        FoldersLoader.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * loadAll -  Does the loading from the database.
    */
    loadAll: function()
    {   /* We do the timeout in case there are multiple requests coming 
        *   from various sources so we do not do multiple DB requests.
        */
        if( ! this.m_objTimeout )
        {
            this.m_objTimeout = Timeout.setTimeout( this.dbLoadAll, 600, this );
        } // end if
    },

    /**
    * dbLoadAll - Load the folders into our collection.  
    * @returns {Boolean} true if request was successful, false otw.
    */
    dbLoadAll: function()
    {
        this.m_objTimeout = undefined;
        
        var objOutputArguments = new FoldersLoader._fncResultSet();
		// TODO: this is hard coded to only get the first level of folders
		// note the "" parent id - also I want to be able to handle null here
		// the web service checks for length instead of null Fix this
		var objInputArguments = { parentID: "" };
        var bRetVal = !! Util.callDBActionAsync( 'FoldersGet', objInputArguments, 
            objOutputArguments, this.dbLoadAllComplete, this );
            
	    return bRetVal;
    },

    /**
    * dbLoadAllComplete - called whenever dbLoadAll has completed, loads up decoded items
    *   and folder counts.
    * @param {Object} in_objDecodedItems - decoded items to load up.
    */
    dbLoadAllComplete: function( in_objDecodedItems )
    {
        if( in_objDecodedItems )
        {
            app.folders.loadAll( in_objDecodedItems );
        } // end if
        
        this.Raise( 'categorycountsload' );
    }
} );

