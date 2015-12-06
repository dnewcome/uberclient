
/**
* ViewNodeCategoryDisplay constructor - This object inherits from CategoryDisplay
* @in_objInsertionPoint {object} - Parent DOM element to attach to.
* @in_objCategory {object} (optional) - Category to make the display for
*/
function ViewNodeCategoryDisplay()
{
    // apply our parent constructor which does the rest of the setup
    CategoryDisplay.apply( this );
    
    this.type = "viewnodedisplay";
    this.m_strTemplate = "ViewNodeCategory";
}
// Inherit from the CategoryDisplay
ViewNodeCategoryDisplay.prototype = new CategoryDisplay;

ViewNodeCategoryDisplay.prototype.init = function( in_objInsertionPoint, in_objCategory )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( in_objInsertionPoint );
    Util.Assert( in_objCategory );

    var objConfig =
    {
        m_strTemplate: this.m_strTemplate,
        m_objCategory: in_objCategory,
        m_objInsertionPoint: in_objInsertionPoint,
        m_objInsertBefore: null
    };
    
    CategoryDisplay.prototype.init.apply( this, [ objConfig ] );
};

