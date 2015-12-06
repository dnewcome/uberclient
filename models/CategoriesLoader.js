
/**
* CategoriesLoader - Loads the counts for all of the various types
*   of categories.
*/
function CategoriesLoader()
{
    this.m_objTimeout = undefined;
    
    CategoriesLoader.Base.constructor.apply( this, arguments );
};
UberObject.Base( CategoriesLoader, UberObject );



/**
* CategoriesLoader.eDBResultsSet - holds the translation keys
*   in the results set from the DB where the collection
*   can find its own data.
*/
CategoriesLoader.eDBResultsSet = {
    tagged: 'User_Categories',
    sharedbyperuser: 'ShareBy',
    sharedwithperuser: 'ShareWith',
    source: 'Source',
    attachment: 'Attachments',
    othersharedwith: 'ShareOthers',
    //comment: 'Comments',
	contact: 'Contacts',
	// we add folders here only because CategoriesLoader is coded into
	// MetaTags::loadDecodedItems
	folders: 'Folders'
};
 		
CategoriesLoader._fncResultSet = function()
{   
    this[ CategoriesLoader.eDBResultsSet.tagged ] = new Categories._fncResultSet();
    this[ CategoriesLoader.eDBResultsSet.sharedbyperuser ] = new Categories._fncResultSet();
    this[ CategoriesLoader.eDBResultsSet.sharedwithperuser ] = new Categories._fncResultSet();
    this[ CategoriesLoader.eDBResultsSet.source ] = new Categories._fncResultSet();
    //this[ CategoriesLoader.eDBResultsSet.comment ] = new Categories._fncResultSet();
    this[ CategoriesLoader.eDBResultsSet.folders ] = new Categories._fncResultSet();
    this[ CategoriesLoader.eDBResultsSet.contact ] = new Contacts._fncResultSet();  
    this.StaticCounts = {
        all: parseInt10,
        starred: parseInt10,
        untagged: parseInt10,
        trashed: parseInt10,
        hidden: parseInt10,
        sharedby: parseInt10,
        sharedwith: parseInt10,
		my: parseInt10,
		nofolder: parseInt10
    };
};



Object.extend( CategoriesLoader.prototype, {
    init: function()
    {
        this.m_strMessagingID = 'categoriesloader';
        CategoriesLoader.Base.init.apply( this, arguments );
    },
    
    RegisterMessageHandlers: function()
    {
		var me=this, all=Messages.all_publishers_id;
		
		[ 'loadall',
		  'requestsharecheck', 'requestshareload', 'requestsharedelete', 
		  'requestcontactcheck', 'requestcontactload', 'requestcontactdelete',
		  'requestfoldercheck', 'requestfolderload', 'requestfolderdelete' ].forEach( function( message ) {
			me.RegisterListener( message, all, me.loadAll );
		  } );

        CategoriesLoader.Base.RegisterMessageHandlers.apply( this, arguments );
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
    * dbLoadAll - Load the categories into our collection.  
    * @returns {Boolean} true if request was successful, false otw.
    */
    dbLoadAll: function()
    {
        this.m_objTimeout = undefined;
        
        var objOutputArguments = new CategoriesLoader._fncResultSet();

        var bRetVal = !! Util.callDBActionAsync( 'NotesCountGet', undefined, 
            objOutputArguments, this.dbLoadAllComplete, this );
            
	    return bRetVal;
    },

    /**
    * dbLoadAllComplete - called whenever dbLoadAll has completed, loads up decoded items
    *   and system category counts.
    * @param {Object} in_objDecodedItems - decoded items to load up.
    */
    dbLoadAllComplete: function( in_objDecodedItems )
    {
        if( in_objDecodedItems )
        {
            app.systemcategories.loadAll( in_objDecodedItems );
            app.usercategories.loadAll( in_objDecodedItems );
           // app.comment.loadAll( in_objDecodedItems );
            app.sharedby.loadAll( in_objDecodedItems );
            app.sharedwith.loadAll( in_objDecodedItems );
            app.source.loadAll( in_objDecodedItems );
			app.contact.loadAll( in_objDecodedItems );
			app.folders.loadAll( in_objDecodedItems, true );
        } // end if
        
        this.Raise( 'categorycountsload' );
    }
} );

