function ListDisplay()
{
    this.resetList();
    ListDisplay.Base.constructor.apply( this, arguments );
};
UberObject.Base( ListDisplay, Display );

Object.extend( ListDisplay.prototype, {
	resetList: function()
	{
		this.length = 0;
		this.m_aItemIDs = [];
		this.m_aItems = [];
		this.m_objItems = {};
		this.m_astrShownItems = undefined;
	},
	
    addElement: function( in_strID, in_objElement )
    {
        this.m_aItemIDs.push( in_strID );
        this.m_aItems.push( $( in_objElement ) );
        this.length++;
        this.m_objItems[ in_strID ] = in_objElement;
    },
    
    
    addHTMLItem: function( in_strID, in_objElement ) { this.addElement( in_strID, in_objElement ); },
    addDisplay: function( in_strID, in_objDisplay ) { if( in_objDisplay ) this.addElement( in_strID, in_objDisplay.$() ); },
	
    removeItem: function( in_strID )
    {
        var nIndex = this.getIndexByID( in_strID );
        delete this.m_objItems[ in_strID ];
        this.m_aItemIDs.splice( nIndex, 1 );        
        return this.m_aItems.splice( nIndex, 1 );
    },
    
    getByID: function( in_strID )
    {
        return this.m_objItems[ in_strID ];
    },
    
    getIDByIndex: function( in_nIndex )
    {
        return this.m_aItemIDs[ in_nIndex ];
    },
    
    getIndexByID: function( in_strID )
    {
        return this.m_aItemIDs.indexOf( in_strID );
    },
    
    getElementByIndex: function( in_nIndex )
    {
        return this.m_aItems[ in_nIndex ];
    },
    
    showItems: function( in_astrItems )
    {
        this.m_astrShownItems = in_astrItems;
    },
    
	resetShowAll: function()
	{
		this.m_bAllShown = false;
	},
	
	getShowAll: function()
	{
		return !! this.m_bAllShown;
	},
	
    showAll: function()
    {
		this.m_bAllShown = true;
    },
    
    /**
    * each - run a function on each item in the list.  Runs in reverse index order.
    */
    each: function( in_strFunction, in_strContext )
    {
        for( var nIndex = this.m_aItemIDs.length - 1, strKey; strKey = this.m_aItemIDs[ nIndex ]; --nIndex )
        {
            var objItem = this.m_objItems[ strKey ];
            in_strFunction.apply( in_strContext || objItem, [ objItem, strKey ] );
        } // end for
    } 
} );
