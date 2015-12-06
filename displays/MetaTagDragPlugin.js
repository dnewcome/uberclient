/*
* MetaTagDragPlugin - Drag for a meta tag.  Sets the drag text to be the name of
*   the meta tag.
*/
function MetaTagDragPlugin()
{
    MetaTagDragPlugin.Base.constructor.apply( this );
}
UberObject.Base( MetaTagDragPlugin, DragPlugin );

Object.extend( MetaTagDragPlugin.prototype, {
    /**
    * OnDragStart - all it does is set the drag text to be the name of 
    *   this meta tag.
    */
    OnDragStart: function( in_objEvent )
    {
        this.m_strDragText = this.getPlugged().getField( 'Name' );
        MetaTagDragPlugin.Base.OnDragStart.apply( this, arguments );
    }
} );