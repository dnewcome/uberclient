function MetaTagsDropdownMenuPlugin()
{
    this.m_nTagsToAdd = undefined;
    this.m_bApplyCloseOnAutoCompleteSelect = undefined;
    
    MetaTagsDropdownMenuPlugin.Base.constructor.apply( this );
};
UberObject.Base( MetaTagsDropdownMenuPlugin, ListMenuPlugin );

Object.extend( MetaTagsDropdownMenuPlugin.prototype, {
    loadConfigParams: function()
    {
        MetaTagsDropdownMenuPlugin.Base.loadConfigParams.apply( this, arguments );
        this.extendConfigParams( {
			m_strCollectionID: { type: 'string', bRequired: true },
			m_bAutoCompleteAttached: { type: 'boolean', bRequired: true },
            m_strInputText: { type: 'string', bRequired: true },
            /** Keep the object clear because we post add items **/
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: {} }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'onbeforeshow', this.OnBeforeShow, this );
        this.RegisterListener( 'onhide', this.OnHide, this );
        this.RegisterListener( 'listitemselected', this.OnListItemSelected, this );
        this.RegisterListener( 'listitemunselected', this.OnListItemUnSelected, this );
		if( this.m_bAutoCompleteAttached )
		{
			this.RegisterListener( 'autocompleteselect', this.OnAutoCompleteSelect, this );
			this.RegisterListener( 'autocompletestart', this.OnAutoCompleteStart, this );
			this.RegisterListener( 'autocompletematch', this.OnAutoCompleteMatch, this );
		} // end if-else
        this.RegisterListener( 'applyclosedropdown', this.OnApplyCloseDropdown, this );
        this.RegisterListener( 'newtagcancel', this.OnNewTagCancel, this );
        
        this.RegisterListenerObject( { message: this.m_strCollectionID + 'add', from: Messages.all_publishers_id,
            listener: this.OnMetaTagAdd, context: this } );

        this.RegisterListener( 'textinputfocus', this.OnTextInputFocus, this );
        
        MetaTagsDropdownMenuPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * OnBeforeShow - set the value of the input box.
    */
    OnBeforeShow: function()
    {
        // Only send it to ourselves or else we are going to 
        //  set every text input in the entire app!
        var objPlugged = this.getPlugged();
		objPlugged.RaiseForAddress( 'setvaluetextinput', objPlugged.m_strMessagingID, 
            [ this.m_strInputText ], true );
            
        // reset this because the first focus we do not raise the suspend mouse message.
        this.m_bRaiseSuspendMouse = false;
    },
    
    /**
    * OnHide - called to clear all of the menu items before we show the next time.
    */
    OnHide: function()
    {
        var objPlugged = this.getPlugged();
        objPlugged.unselectAll( true );
        objPlugged.removeAllClassNames();
    },
    
    /**
    * OnListItemSelected - Takes care of the list item selection
    * @param {String} in_strItemID - item ID to select
    */
    OnListItemSelected: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );

        if( ! this.m_bIgnoreNextListItemSelected )
        {
            var objPlugged = this.getPlugged();
            var strName = objPlugged.m_objCollection.getByID( in_strItemID ).getName();
            objPlugged.Raise( 'insertlastautocomplete', [ strName ] );
            objPlugged.Raise( 'tagrequest', [ in_strItemID ] );
        } // end if
        
        this.m_bIgnoreNextListItemSelected = false;
    },

    /**
    * OnListItemUnSelected - Takes care of the list item unselection
    * @param {String} in_strItemID - item ID to unselect
    */
    OnListItemUnSelected: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
        
        var objPlugged = this.getPlugged();
        var strName = objPlugged.m_objCollection.getByID( in_strItemID ).getName();
        objPlugged.Raise( 'untagrequest', [ in_strItemID ] );
    },
    
    /**
    * OnMetaTagAdd - Takes care of a tagged add message, adds a meta tag to the display
    * @param {Object} in_objMetaTag - Meta tag to add
    */
    OnMetaTagAdd: function( in_objMetaTag )
    {
        Util.Assert( TypeCheck.Object( in_objMetaTag ) );
        this.getPlugged().addMetaTagFromModel( in_objMetaTag );
    },
    
    /**
    * OnAutoCompleteMatch - handler for 'autocompletematch' message
    *   causes the list to collapse to only show matches
    *   causes list to resize.
    * @param {Array} in_aobjMatches - array of objects with match data.
    */
    OnAutoCompleteMatch: function( in_aobjMatches )
    {
        Util.Assert( TypeCheck.Array( in_aobjMatches ) );
        
        var objPlugged = this.getPlugged();
        objPlugged.Raise( 'collapselist', [ in_aobjMatches ] );
        objPlugged.Raise( 'resizelist' );
    },
    
    /**
    * OnAutoCompleteSelect - handler for 'autocompleteselect' message
    *   causes list to select items selected in autocomplete.
    * @param {Object} in_objEntry - Entry of matching entry.  
    *   Contains id if item already exists, and name under all circumstances.
    */
    OnAutoCompleteSelect: function( in_objEntry )
    {
        Util.Assert( TypeCheck.Object( in_objEntry ) );
        var objPlugged = this.getPlugged();
        
        if( in_objEntry.id )
        {   // make sure the selectlistitem is done and this ignores 
            //  the listitemselected message
            this.m_bIgnoreNextListItemSelected = true;
            objPlugged.Raise( 'selectlistitem', [ in_objEntry.id, true ] );
            objPlugged.Raise( 'tagrequest', [ in_objEntry.id ] );
        } // end if
        else if( ( in_objEntry.name )
              && ( _localStrings.ADD_TAGS != in_objEntry.name ) )
        {   // create a new tag
        
            objPlugged.Raise( 'addnewtag', [ in_objEntry.name ] );
            objPlugged.Raise( 'createrequest', [ in_objEntry.name ] );
        } // end if-else
        
        if( this.m_bApplyCloseOnAutoCompleteSelect )
        {
			this._close();
        } // end if
        
        this.m_bApplyCloseOnAutoCompleteSelect = false;
    },
    
    /**
    * OnAutoCompleteStart - handler for 'autocompletestart' message
    *   causes the list to collapse to show all items
    *   causes list to resize.
    */
    OnAutoCompleteStart: function()
    {
        var objPlugged = this.getPlugged();
        objPlugged.Raise( 'uncollapselist' );
        objPlugged.Raise( 'resizelist' );
    },

    /** 
    * OnApplyCloseDropdown - called when we close.  Tells the autocomplete
    *   to select its last item, then we handle the rest in the OnAutoCompleteSelect
    *   which should raise the appropriate create/tag and close messages.
    */
    OnApplyCloseDropdown: function()
    {
		if( this.m_bAutoCompleteAttached )
		{
			this.m_bApplyCloseOnAutoCompleteSelect = true;
			this.getPlugged().Raise( 'selectlastautocomplete' );
		} // end if
		else
		{
			this._close();
		} // end if-else
    },

    OnNewTagCancel: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        var objPlugged = this.getPlugged();
        
        // Raise these synchronously so that the redraw happens faster.
        objPlugged.Raise( 'cancelrequest', [ in_strName ], true );
        objPlugged.Raise( 'resizelist', [], true );
    },

    /**
    * OnTextInputFocus - this is the listener for a 'textinputfocus'.
    *   If a textinputfocus happens, the first time through is because
    *   we did an autofocus when showing the menu, so we should not
    *   cancel the mouse activities, allowing for a mouse out and normal
    *   menu close.  But, a subsequent click or starting to type raise
    *   the 'suspendmouse' message.
    */
    OnTextInputFocus: function()
    {
        if( true === this.m_bRaiseSuspendMouse )
        {
            this.getPlugged().Raise( 'suspendmouse' );
        } // end if
        this.m_bRaiseSuspendMouse = true;
        
    },
    
	/**
	* @private
	* _close - close the menu, tell any requests to be applied.
	*/
	_close: function()
	{
		var objPlugged = this.getPlugged();
		objPlugged.Raise( 'applyrequests' );
		objPlugged.Raise( 'close' );
	},
	
    /**
    * initMenuItems - overrides ListMenuPlugin's initMenuItems to add the meta tags.
    *   Note - normally this is not called because the menu is created before
    *   the getMetaTagCounts call completes, and all the menu items are added
    *   through OnMetaTagAdd on startup.
    */ 
    initMenuItems: function()
    {
        var objPlugged = this.getPlugged();
        for( var nIndex = 0, objMetaTag; 
            objMetaTag = objPlugged.m_objCollection.getByIndex( nIndex ); ++nIndex )
        {
	            objPlugged.addMetaTagFromModel( objMetaTag );
        } // end for  
    }
} );

