/*
* ListClassnamePlugin - Add/remove class names to individual list items
*/
function ListClassnamePlugin()
{
    this.m_objRegisteredClassNames = undefined;
    
    ListClassnamePlugin.Base.constructor.apply( this );
}
UberObject.Base( ListClassnamePlugin, Plugin );

Object.extend( ListClassnamePlugin.prototype, {
    init: function()
    {
        this.m_objRegisteredClassNames = {};
        
        ListClassnamePlugin.Base.init.apply( this, arguments );

        this.extendPlugged( 'addClassName', this );
        this.extendPlugged( 'removeClassName', this );
        this.extendPlugged( 'removeAllClassNames', this );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'addclassname', this.addClassName, this );
        this.RegisterListener( 'removeclassname', this.removeClassName, this );
        this.RegisterListener( 'removeallclassnames', this.removeAllClassNames, this );
        
        ListClassnamePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    teardown: function()
    {
        this.m_objRegisteredClassNames = undefined;
        ListClassnamePlugin.Base.teardown.apply( this, arguments );
    },
    
    /**
    * addClassName - add a class name to an item
    * @param {String} in_strItemID - itemID to add the class name to
    * @param {String} in_strClassName - Classname to add
    */
    addClassName: function( in_strItemID, in_strClassName )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        Util.Assert( TypeCheck.String( in_strClassName ) );
        
        var objPlugged = this.getPlugged();
        var objElement = objPlugged.getElementByID( in_strItemID );
        
        if( objElement )
        {   // Keep track of which class names are registered on us so we don't
            // unregister ones we shouldn't be.
            var objItemsClassNames = this.m_objRegisteredClassNames[ in_strItemID ]
                = this.m_objRegisteredClassNames[ in_strItemID ] || {};
            objItemsClassNames[ in_strClassName ] = true;
            
            objElement.addClassName( in_strClassName );
        } // end if
    },
    
    /**
    * removeClassName - remove a class name to from an item.  Only removes
    *   class names that were added using addClassName.
    * @param {String} in_strItemID - itemID to remove the class name from
    * @param {String} in_strClassName - Classname to remove
    */
    removeClassName: function( in_strItemID, in_strClassName )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        Util.Assert( TypeCheck.String( in_strClassName ) );

        var objRegistedClassNames = this.m_objRegisteredClassNames[ in_strItemID ];
        
        // Only unregister class names that have been registered with us.        
        if( objRegistedClassNames && objRegistedClassNames[ in_strClassName ] )
        {
            var objElement = this.getPlugged().getElementByID( in_strItemID );
            objElement.removeClassName( in_strClassName );
            
            // Remove from our list so we don't re-delete it.
            delete objRegistedClassNames[ in_strClassName ][ in_strClassName ];
            if( !Util.objectHasProperties( objRegistedClassNames[ in_strClassName ] ) )
            {   // a bit of cleanup, if an item no longer has any class names, remove it.
                delete objRegistedClassNames[ in_strClassName ];
            } // end if
        } // end if
    },
    
    /**
    * removeAllClassNames - remove all classnames that were added with addClassName for an item.
    * @param {String} in_strItemID (optional) - optional itemID to operate on, 
    *   if not given, do it for all items.
    */
    removeAllClassNames: function( in_strItemID )
    {
        Util.Assert( TypeCheck.UString( in_strItemID ) );
        
        if( in_strItemID )
        {
            this._removeAllClassNamesFromItem( in_strItemID );
        } // end if
        else
        {
            for( var strItemID in this.m_objRegisteredClassNames )
            {
                this._removeAllClassNamesFromItem( strItemID );
            } // end for
        }
    },
    
    /**
    * @private
    * _removeAllClassNamesFromItem - removes all the class names added using addClassName from
    *   an item.
    * @param {String} in_strItemID - Item to remove class names from
    */
    _removeAllClassNamesFromItem: function( in_strItemID )
    {
        var objRegistedClassNames = this.m_objRegisteredClassNames[ in_strItemID ];
        
        // Only unregister class names that have been registered with us.        
        for( var strClassName in objRegistedClassNames )
        {
            this.removeClassName( in_strItemID, strClassName );
        } // end if
    }
} );