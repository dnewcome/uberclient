/**
* MetaTagTitlePlugin
*   This plugin allows us to set the title attribute of the DOM Element of
*   the meta tag to be the combination of the name and the note count.
*   Userful for long tag names that get cut off in the left.
*   This is a good candidate to be made into the thought about "command" plugin.
*/
function MetaTagTitlePlugin()
{
    return MetaTagTitlePlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( MetaTagTitlePlugin, Plugin );

Object.extend( MetaTagTitlePlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData, this );
        MetaTagTitlePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnLoadData: function()
    {
        var objPlugged = this.getPlugged();
        var strTitle = objPlugged.getField( 'Name' );
        var nNoteCount = objPlugged.getField( 'Note_Count' );
        
        if( TypeCheck.Number( nNoteCount ) )
        {
            strTitle += ' (' + nNoteCount.toString() + ')';
        } // end if
        objPlugged.$().setAttribute( 'title', strTitle );
    }
} );