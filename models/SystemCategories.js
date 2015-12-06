/**
* SystemCategories - a subclassed Categories object specialized for decoding 
*   system category database results.
*/
SystemCategories = (function() {
	var SystemCategories = function()
	{
		SystemCategories.Base.constructor.apply( this, arguments );
	};
	UberObject.Base( SystemCategories, Categories );

	SystemCategories.Categories = new Enum( 
		'all', 
		'untagged', 
		'trashed', 
		'starred', 
		'bookmarked',
		'search',
		'unchecked',
		'hidden',
		'public',
		'my',
		'nofolder'
	);

	/**
	* These are never really "instantiated" as categories,
	*   but the enum is used for the categories in the "Source"
	*   collection.
	*/
	SystemCategories.SourceCategories = new Enum( 
		'client',
		'system'
	);

	Object.extend( SystemCategories.prototype, {
		/**
		* init - creates the system categories.
		*/
		init: function( in_objConfig )
		{
			SystemCategories.Base.init.apply( this, arguments );
			   
			for( var strCategory in SystemCategories.Categories )
			{
				var strID = SystemCategories.Categories[ strCategory ];
				var strName = _localStrings[ strCategory ];
		  
				var objCategory = this._createModelFromItem( {
					ID: strID,
					Name: strName,
					Type: 'systemcategories',
					Note_Count: 0
				} );
				this.insert( strID, objCategory );
			}
		},

		/**
		* loadDecodedItems - load the counts for all of the system categories.
		* @param {object} in_objDecodedItems - decoded database items, ready for action.
		*/
		loadDecodedItems: function( in_objDecodedItems )
		{
			for( var strCategory in in_objDecodedItems.StaticCounts )
			{
				var objCategory = this.getByID( strCategory );
				if( objCategory )
				{
					var nNewCount = in_objDecodedItems.StaticCounts[ strCategory ];
					objCategory.setCount( nNewCount );
				}
			}
		}
	} );
	
	return SystemCategories;
}() );