
function MetaTagsDropdownNewTagsListPlugin()
{
    MetaTagsDropdownNewTagsListPlugin.Base.constructor.apply( this );
};
UberObject.Base( MetaTagsDropdownNewTagsListPlugin, Plugin );

Object.extend( MetaTagsDropdownNewTagsListPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'childinitialization', this.OnChildInitialization, this );
        this.RegisterListener( 'onbeforeshow', this.OnBeforeShow, this );
        this.RegisterListener( 'addnewtag', this.OnAddNewTag, this );
        this.RegisterListener( 'cancelnewtag', this.OnCancelNewTag, this );
        this.RegisterListenerObject( { message: 'cancelnewtag', 
            from: Messages.all_publishers_id,
            listener: this.OnCancelNewTag, context: this } );
        
        MetaTagsDropdownNewTagsListPlugin.Base.RegisterMessageHandlers.apply( this );
    },
    
    OnChildInitialization: function()
    {
        var objPlugged = this.getPlugged();
        var objListElement = objPlugged.$( 'elementNewTags' );
        this.m_objTagList = this.createInitUberObject( {
		    factory: app.genericfactory,
            type: 'ListDisplay',
            config: {
                m_objInsertionPoint: objPlugged.$( 'elementNewTags' ),
                m_strTemplate: 'NewTagsList',
                m_strListItemAreaSelector: 'listarea',
                m_strHasItemsClassName: 'hasitems'
            },
            Plugins: [
            { type: 'ListMouseEventPlugin', config: {
                m_strSendToAddress: this.m_objMessagingID,
                m_strDOMEvent: 'mousedown',
                m_strMessage: 'cancelnewtag'
            } } 
            ]
        } );
    },
    
    OnBeforeShow: function()
    {
        this.m_objTagList && this.m_objTagList.each( function( in_objItem, in_strKey ) {
            this.m_objTagList.removeItem( in_strKey );
        }, this );
    },
    
    /**
    * OnAddNewTag - if an item is not already added to the list, 
    *   create a new template item, add it to the list, and 
    *   set its element with the class 'name' to be the name.
    * @param {String} in_strName - Name to add.
    */
    OnAddNewTag: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        if( ! this._isNewTag( in_strName ) )
        {
            var objNewElement = $( TemplateManager.GetTemplate( 'NewTagMenuItem' ) );
        
            this.m_objTagList.addHTMLItem( in_strName, objNewElement );
            objNewElement.down( '.name', 0 ).innerHTML = in_strName;
        } // end if
    },
    
    /**
    * OnCancelNewTag - if an item is added to the list, remove it and 
    *   raise the 'newtagcancel' message.
    * @param {String} in_strName - Name to cancel.
    */
    OnCancelNewTag: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        if( this._isNewTag( in_strName ) )
        {   
            this.m_objTagList.removeItem( in_strName );
            // Raise these synchronously so that the redraw happens faster.
            this.getPlugged().Raise( 'newtagcancel', [ in_strName ], true );
        } // end if
    },
    
    /**
    * @private
    * _isNewTag - see if the given name is added as a new tag.
    * @param {String} in_strName
    */
    _isNewTag: function( in_strName )
    {
        return !!this.m_objTagList.getByID( in_strName );
    }
} );    