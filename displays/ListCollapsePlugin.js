/*
* ListCollapsePlugin - 
*/
function ListCollapsePlugin()
{
    ListCollapsePlugin.Base.constructor.apply( this );
}
UberObject.Base( ListCollapsePlugin, Plugin );

Object.extend( ListCollapsePlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        ListCollapsePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
        this.RegisterListener( 'collapselist', this.OnCollapse, this );
        this.RegisterListener( 'uncollapselist', this.OnReset, this );
        this.RegisterListener( 'onshow', this.OnReset, this );
    },
    
    /**
    * OnCollapse - show the specified notes
    * @param {Object} in_aobjNotesToDisplay - an array of objects that contain
    *   the noteids of the notes to display.
    */
    OnCollapse: function( in_aobjNotesToDisplay )
    {
        Util.Assert( TypeCheck.Array( in_aobjNotesToDisplay ) );
        
        var objPlugged = this.getPlugged();
        var astrIDs = [];
        
        for( var nIndex = 0, objItem; objItem = in_aobjNotesToDisplay[ nIndex ]; ++nIndex )
        {
            astrIDs.push( objItem.id );
        } // end for
        
        objPlugged.showItems( astrIDs );
    },
    
    /**
    * OnReset - re-shows all the list items
    */
    OnReset: function()
    {
        var objPlugged = this.getPlugged();
        objPlugged.showAll();    
    }
} );