/**
* SharedMenu - A context menu that can be shared among several different objects.
*   The menu is initialized once.  To set the menu items, inherit from this object 
*   or pass in in the configuration object an object with the 'm_aobjMenuItems'.
*   m_aobjMenuItems is an array of items, the format of which is explained in
*   Context.registerItems.  An example can be found in displays/NoteActionsMenu.js
*
*   To share this among multiple objects, when calling the 'show' function,
*   pass in a context.  All callback/displayCallback functions will be called with
*   this context.
*/
function SharedMenu()
{
    this.m_objContextMenuCollection = undefined;
    this.m_strMenuID = undefined;
    
    SharedMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( SharedMenu, UberObject );

Object.extend( SharedMenu.prototype, {
    loadConfigParams: function()
    {
        var objParkingSpot = document.getElementsByTagName( 'body' )[0];
        var objConfigParams = {
            m_objContextMenuCollection: { type: 'object', bRequired: true },
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [] },
            m_objInsertionPoint: { type: 'object', bRequired: false, default_value: objParkingSpot },
            type: { type: 'string', bReqired: false, default_value: 'SharedMenu' }
        };
        
        SharedMenu.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    /**
    * init - initialize the shared menu
    * @param {Object} in_objConfig (optional) - configuration object.
    */
    init: function( in_objConfig )
    {
        in_objConfig = in_objConfig || {};

        SharedMenu.Base.initWithConfigObject.apply( this, [ in_objConfig ] );
    },
    
    /**
    * _initItems - initialize the menu items if it hasn't already been done.
    */
    _initItems: function()
    {    
        if( ! this.m_strMenuID )
        {            
            this.m_strMenuID = this.m_objContextMenuCollection.createNew( 
                this.m_objInsertionPoint );
                
            this.m_objContextMenuCollection.registerItems( this.m_strMenuID, 
                this.m_aobjMenuItems );
        } // end if
    },
    
    /**
    * show - show the menu with the specified context.
    * @param {Object} in_objEvent - event that called this item.
    * @param {Object} in_objContext (optional) - context to call the callbacks and 
    *   display functions in.
    */
    show: function( in_objEvent, in_objContext )
    {
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        Util.Assert( TypeCheck.UObject( in_objContext ) );
        
        this.m_objCurrentContext = in_objContext;
        this._initItems();
        this.m_objContextMenuCollection.show( this.m_strMenuID, in_objEvent, in_objContext );
    },
    
    /**
    * getContext - returns the current context the menu is shown in.
    * @param {Object} - current context.
    */
    getContext: function()
    {
        return this.m_objCurrentContext;
    }
} );
