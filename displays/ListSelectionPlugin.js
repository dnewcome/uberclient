
function ListSelectionPlugin()
{
    this.m_nNumSelected = undefined;
    this.m_strSelectedID = undefined;     // only used for RADIO selection
    this.m_astrSelectedItems = undefined;
    
    ListSelectionPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( ListSelectionPlugin, Plugin );

ListSelectionPlugin.eSelectionType = new Enum(
    'RADIO',
    'CHECK_EXPLICIT',
    'CHECK_UNLIMITED'
);

Object.extend( ListSelectionPlugin.prototype, {
    loadConfigParams: function()
    {
        ListSelectionPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
			m_bCanReselect: { type: 'boolean', bRequired: false, default_value: false },
            m_strListenMessage: { type: 'string', bRequired: false, default_value: 'listitemclick' },
            m_eSelectionBehavior: { type: 'string', bRequired: false, 
                default_value: ListSelectionPlugin.eSelectionType.CHECK_UNLIMITED },
            m_nMaxSelections: { type: 'number', bRequired: false, default_value: Infinity },
            m_bMessagesSync: { type: 'boolean', bRequired: false, default_value: false }
        } );
    },

    init: function( in_objConfig )
    {
		var me=this;
        ListSelectionPlugin.Base.init.apply( this, arguments );
        
		[ 'isSelected', 'selectAll', 'unselectAll', 'selectItem', 
			'unselectItem', 'getSelected' ].forEach( function( name, i ) {
				me.extendPlugged( name, me );
			} );
			
        me.m_nNumSelected = 0;
        me.m_astrSelectedItems = {};
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( this.m_strListenMessage, this.OnListItemClick, this );
        this.RegisterListener( 'selectlistitem', this.selectItem, this );
        
        this.RegisterListenerObject( { message: 'selectall', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.selectAll, context: this } );
        this.RegisterListenerObject( { message: 'unselectall', 
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.unselectAll, context: this } );
        this.RegisterListener( 'listitemremove', this.OnRemoveItem, this );

        ListSelectionPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * selectItem - Set an item to be selected.
    *   NOTE: Only works if the item is currently displayed.
    * @param {String} in_strID - ID of item to set.
    * @param {bool} in_bSuppressMessage (optional) - if true, 
    *   suppresses message raising
    * @returns {bool} true on success (item existed), false otw.
    */
    selectItem: function( in_strID, in_bSuppressMessage )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        Util.Assert( TypeCheck.UBoolean( in_bSuppressMessage ) );
        
        var objElement = this.getPlugged().getElementByID( in_strID );
        var bRetVal = ( ( objElement )
                     && ( 'none' !== objElement.getStyle( 'display' ) ) );
        
        if( true === bRetVal )
        {
            this._unselectRadioButton( in_strID );
            bRetVal = this._trySelectNew( in_strID, in_bSuppressMessage );
        } // end if
        
        return bRetVal;
    },
    
    /**
    * unselectItem - Set an item to be unselected.
    * @param {String} in_strID - ID of item to set.
    * @param {bool} in_bSuppressMessage (optional) - if true, 
    *   suppresses message raising
    * @returns {bool} true on success (item existed), false otw.
    */
    unselectItem: function( in_strID, in_bSuppressMessage )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        Util.Assert( TypeCheck.UBoolean( in_bSuppressMessage ) );

        var bRetVal = this.isSelected( in_strID );
        
        if( true === bRetVal ) 
        {   
            this._itemAddRemoveClassName( in_strID, 'removeClassName', 'selected' );

            // Remove this item from the object all together.
            delete ( this.m_astrSelectedItems[ in_strID ] );
            this.m_nNumSelected--;

            if( ! in_bSuppressMessage )
            {        
                this.getPlugged().Raise( 'listitemunselected', arguments, this.m_bMessagesSync );        
            } // end if
        } // end if
        
        return bRetVal;
    },


    /**
    * selectAll - Set all items to be unselected.
    * @param {bool} in_bSuppressMessage (optional) - if true, 
    *   suppresses message raising
    */
    selectAll: function( in_bSuppressMessage )
    {
        Util.Assert( TypeCheck.UBoolean( in_bSuppressMessage ) );

        this.getPlugged().m_objListItems.each( function( in_vObject, in_strKey ) 
        {
            this.selectItem( in_strKey, in_bSuppressMessage );
        }, this );
    },


    /**
    * unselectAll - Set all items to be unselected.
    * @param {bool} in_bSuppressMessage (optional) - if true, 
    *   suppresses message raising
    */
    unselectAll: function( in_bSuppressMessage )
    {
        Util.Assert( TypeCheck.UBoolean( in_bSuppressMessage ) );

        this.getPlugged().m_objListItems.each( function( in_vObject, in_strKey ) 
        {
            this.unselectItem( in_strKey, in_bSuppressMessage );
        }, this );
    },

    /**
    * isSelected - Check whether an item is selected or not.
    * @param {String} in_strID - ID to check.
    * @returns {bool} undefined if item does not exist, true if selected, false otw.
    */
    isSelected: function( in_strID )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        return !!this.m_astrSelectedItems[ in_strID ];
    },

    /**
    * getSelected - get an object with the keys that are the IDs of the selected items.
    *   the items will be returned in the order they are found in the list, not in
    *   the order they were selected.
    * @returns {Object} Object with the keys that are the IDs of the selected items.
    */
    getSelected: function()
    {
        var objRetVal = {};
        var objPlugged = this.getPlugged();
        for( var nIndex = 0, strID; strID = objPlugged.getIDByIndex( nIndex ); ++nIndex )
        {   // we should have at most 50 items, so we don't have to worry about too many cycles.
            if( this.m_astrSelectedItems[ strID ] )
            {
                objRetVal[ strID ] = true;
            } // end if
        } // end for
        return objRetVal;
    },
    
    /**
    * OnRemoveItem - removes a menu item
    * @param {String} in_strID - ID of the menu item to get.
    * @returns {Object} - the HTML Element of the item given by 
    *       in_strID if exists, undefined otw.
    */
    OnRemoveItem: function( in_strID )
    {   
        Util.Assert( TypeCheck.String( in_strID ) );
        
        if( true === this.isSelected( in_strID ) ) 
        {   // keep our counts straight.
            this.m_nNumSelected--;
            // Remove this item from the object all together.
            delete ( this.m_astrSelectedItems[ in_strID ] );
        } // end if
    },

    OnListItemClick: function( in_strID )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        var objElement = this.getPlugged().getElementByID( in_strID );

        if( objElement )
        {
            // Do not unselect the selected radio button.
            if( ( this.isSelected( in_strID ) ) && 
                ( this.m_eSelectionBehavior != ListSelectionPlugin.eSelectionType.RADIO ) )
            {
                this.unselectItem( in_strID );
            } // end if
            else
            {
                this.selectItem( in_strID );
            } // end if-else
        } // end if
    },

    /**
    * @private
    * _unselectRadioButton - unselects the last selected item
    *   if radio button behavior is selected.
    * @param {String} in_strID - new ID being set.
    */
    _unselectRadioButton: function( in_strID )
    {
        Util.Assert( TypeCheck.String( in_strID ) );
        
        if( ( this.m_eSelectionBehavior == ListSelectionPlugin.eSelectionType.RADIO )
         && ( this.m_strSelectedID ) 
         && ( in_strID != this.m_strSelectedID ) )
        {   // if we have a RADIO, get rid of the last one.
            this.unselectItem( this.m_strSelectedID );
        } // end if
    },
    
    /**
    * @private
    * _trySelectNew - selects an item as long as the current number of selections is less than 
    *   the max selections or if selection behavior is set to unlimited.
    * @param {String} in_strID - ID of item to set.
    * @param {bool} in_bSuppressMessage (optional) - if true, 
    *   suppresses message raising
    */
    _trySelectNew: function( in_strID, in_bSuppressMessage )
    {
		var me=this, bRetVal = me._selectItemAllowed( in_strID );

        if( true === bRetVal )
        {   
            me._itemAddRemoveClassName( in_strID, 'addClassName', 'selected' );
            me.m_strSelectedID = in_strID;
            me.m_nNumSelected++;
            
            // We are keeping track of the indexes of the selected items so that
            //  when getSelected is called, the items are returned in the order in
            //  the list and not the order they are selected.
            me.m_astrSelectedItems[ in_strID ] = true;
            
            if( ! in_bSuppressMessage )
            {        
                me.getPlugged().Raise( 'listitemselected', arguments, me.m_bMessagesSync );
            } // end if
        } // end if
        
        return bRetVal;
    },

    /**
    * @private 
    * _selectItemAllowed - checks to see whether selecting a new item is allowed.
    * @returns {bool} true if allowed, false otw.
    */
    _selectItemAllowed: function( in_strID )
    {
	
        var me=this, bRetVal = ( ( me.m_bCanReselect || false === me.isSelected( in_strID ) )
                     && ( ( me.m_eSelectionBehavior == ListSelectionPlugin.eSelectionType.CHECK_UNLIMITED ) 
                       || ( me.m_nNumSelected < me.m_nMaxSelections ) ) );
    
        return bRetVal;
    },

    /**
    * @private
    * _itemAddRemoveClassName - adds/removes a classname from an item, if item exists.
    * @param {String} in_strID - ItemID
    * @param {String} in_strFunction - function to perform.
    * @param {String} in_strClassName - class name to add/remove
    */    
    _itemAddRemoveClassName: function( in_strID, in_strFunction, in_strClassName )
    {
        var objElement = this.getPlugged().getElementByID( in_strID );
        if( objElement )
        {   // We have to check for the element because we could receive the
            // message to select AFTER the item has already been removed.
            objElement[ in_strFunction ]( in_strClassName );
        } // end if
    }
} );
