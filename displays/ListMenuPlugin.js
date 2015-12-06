function ListMenuPlugin()
{
    this.m_aobjCallbacks = undefined;
    ListMenuPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( ListMenuPlugin, Plugin );

Object.extend( ListMenuPlugin.prototype, {
    loadConfigParams: function()
    {
        ListMenuPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: true },
            m_bCloseOnClick: { type: 'boolean', bRequired: false, default_value: true }
        } );
    },

    init: function( in_objConfig )
    {
        ListMenuPlugin.Base.init.apply( this, arguments );

        this.m_aobjCallbacks = {};
        this.extendPlugged( 'show', this );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'selectmenuitem', this.OnSelectMenuItem, this );
        
	    ListHighlightPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    initMenuItems: function()
    {
        var objPlugged = this.getPlugged();

        for( var nIndex = 0, objItem; objItem = this.m_aobjMenuItems[ nIndex ]; ++nIndex )
        {   
            var strID = objItem.id || nIndex.toString();
            this.m_aobjCallbacks[ strID ] = objItem;

	        var objItemElement = TemplateManager.GetTemplate( objPlugged.m_strItemTemplate );
            objItemElement.innerHTML = objItemElement.innerHTML.replace(/{TEXT}/g, objItem.string );

            objPlugged.addHTMLItem( strID, objItemElement, objItem.displaycheck, objItem.context );
        } // end for
    },

    teardown: function()
    {
        this.m_aobjCallbacks = null;
        ListMenuPlugin.Base.teardown.apply( this, arguments );
    },

    /**
    * OnSelectMenuItem - handles the menu item selection.  Hides the menu if necessary,
    *   raises the message/calls the function
    * @param {String} in_strItemID - ItemID that was selected.
    */    
    OnSelectMenuItem: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        
        if( true === this.m_bCloseOnClick )
        {
            this.getPlugged().hide();        
        } // end if

        this._performSelection( in_strItemID );
    },

    /**
    * _performSelection - perform the menu selection given an itemID.
    * @param {String} in_strItemID - ItemID that is being selected.
    */
    _performSelection: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
    
        var objItem = this.m_aobjCallbacks[ in_strItemID ];
        var vCallback = objItem.callback;

	    if( TypeCheck.Function( vCallback ) )
	    {
	        vCallback.apply( objItem.context || this.m_objContext, objItem.arguments || [] );
	    } // end if
	    else if( TypeCheck.String( vCallback ) )
	    {   // Raise as if we were the context.
	        this.getPlugged().Raise( vCallback, objItem.arguments, undefined, 
	            ( objItem.context || this.m_objContext ).m_strMessagingID );
	    } // end if-else if
    },
    
    /**
    * show - overrides the ListDisplay's show.
    * @param {Object} in_objPosition - Position to show menu at.
    * @param {Object} in_objContext - the context to show the menu in.
    */    
    show: function( in_objPosition, in_objContext )
    {
        var objPlugged = this.getPlugged();

        if( ! objPlugged.length )
        {
            this.initMenuItems();
        } // end if

        this.m_objContext = objPlugged.m_objContext = in_objContext;
        objPlugged.Raise( 'contextset', [ this.m_objContext.m_strMessagingID ] );

        this.m_objSavedFuncs.show.apply( objPlugged, [ in_objPosition ] );
    },
    
    /**
    * getContext - returns the current context the menu is shown in.
    * @param {Object} - current context.
    */
    getContext: function()
    {
        return this.m_objContext;
    }
       
} );
