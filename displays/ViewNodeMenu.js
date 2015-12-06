
function ViewNodeMenu()
{
    ViewNodeMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( ViewNodeMenu, ListMenuPlugin );

Object.extend( ViewNodeMenu.prototype, {
    loadConfigParams: function()
    {
        ViewNodeMenu.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { string: _localStrings.RENAME_TAG, callback: this.menuCategoryRename, context: this },
                    { string: _localStrings.DELETE_TAG, callback: this.menuCategoryDelete, context: this }
            ] },
            m_objPopup: { type: 'object', bRequired: true },
            type: { type: 'string', bReqired: false, default_value: 'ViewNodeMenu' }
        } );
    },
    

    /**
    * menuCategoryRename - Request a rename of the category.
    */
    menuCategoryRename: function()
    {
        var objViewNode = this.getContext();
        var objNameElement = objViewNode.$( 'elementName' );

        var objPopupLocation = {x: 20, y: ( Element.getHeight( objNameElement )/2 - 3 ) };
	    var objOffset = Element.viewportOffset( objViewNode.$() );
        objPopupLocation.x += objOffset[ 0 ];
        objPopupLocation.y += objOffset[ 1 ];

        this.RegisterListenerObject( { message: 'textinputcancelled', from: this.m_objPopup.m_strMessagingID, 
            listener: this.popupUnRegisterMessageHandlers, context: this } );
        this.RegisterListenerObject( { message: 'textinputsubmit', from: this.m_objPopup.m_strMessagingID, 
            listener: this.requestSetName, context: this } );

        this.m_objPopup.setOKText( _localStrings.RENAME_TAG );
        this.m_objPopup.setHeader( _localStrings.RENAME_TAG );
        this.m_objPopup.setValue( objNameElement.innerHTML );
        this.m_objPopup.show( objPopupLocation );
    },

    /**
    * requestSetName - request the setting of the name.
    * @param {String} in_strName (optional) - name to set.  
    *   If empty, no action taken.
    */
    requestSetName: function( in_strName )
    {
        Util.Assert( TypeCheck.UString( in_strName ) );
        
        var objViewNode = this.getContext();
        var strMetaTagID = objViewNode.getMetaTagID();

        if( ! in_strName )
        {
            this.Raise( 'appokmessage', [ _localStrings.EMPTY_VIEWNODE_NAME_ERROR, 'error' ] );
        } // end if
        else if( strMetaTagID )
        {
            this.Raise( 'request' + objViewNode.type + 'setname', [ strMetaTagID, in_strName, 
                this._requestSetNameCallback.bind( this ) ] );
        } // end if
    },
    
    _requestSetNameCallback: function( in_strName, in_bRenamed )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        Util.Assert( TypeCheck.Boolean( in_bRenamed ) );

        if( true == in_bRenamed )
        {   // only close if it was renamed
            this.popupUnRegisterMessageHandlers();
        } // end if
        else
        {   
            this.Raise( 'appokmessage', [ _localStrings.DUPLICATE_TAG_NAMES_RENAME + in_strName, 'error' ] );
        } // end if-else
    },

    /**
    * menuCategoryRename - Request a delete of the category.
    */
    menuCategoryDelete: function()
    {
        var objViewNode = this.getContext();
	    var strMetaTagID = objViewNode.getMetaTagID();
        
        this.RaiseForAddress( 'request' + objViewNode.type + 'delete', strMetaTagID );
    },

    popupUnRegisterMessageHandlers: function()
    {
        this.m_objPopup.hide();
        this.UnRegisterListener( 'textinputcancelled', this.m_objPopup.m_strMessagingID )
            .UnRegisterListener( 'textinputsubmit', this.m_objPopup.m_strMessagingID );
    }
} );
