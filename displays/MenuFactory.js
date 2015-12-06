function MenuFactory()
{
    MenuFactory.Base.constructor.apply( this, arguments );
};
UberObject.Base( MenuFactory, Factory );

Object.extend( MenuFactory.prototype, {
    /**
    * create - create a note display.
    * @param {String} in_strType - type of display to create.
    * @param {Object} in_objAdditionalConfig (optional) - optional configuration used on top of 
    *   standard config for type.
    * @returns {Object} a NoteDisplay based object.
    */
    create: function( in_strType, in_objAdditionalConfig )
    {
        Util.Assert( TypeCheck.String( in_strType ) );
        Util.Assert( TypeCheck.UObject( in_objAdditionalConfig ) );
        
        var objRetVal = undefined;
        var objConfig = this.getDefaultConfig( in_strType );
        
        if( objConfig )
        {
            if( in_objAdditionalConfig )
            {
                Object.extend( objConfig.config, in_objAdditionalConfig );
            } // end if
            objRetVal = MenuFactory.Base.create.apply( this, [ objConfig ] );
        } // end if 
        
        return objRetVal;
    },

    /**
    * getDefaultConfig - gets the base configuration object for 
    *    a given menu type
    * @param {String} in_strType - type of display to create.
    * @returns {Object} - Base configuration object if valid type, undefined otw.
    */
    getDefaultConfig: function( in_strType )
    {
        Util.Assert( TypeCheck.String( in_strType ) );
    
        var objRetVal = undefined;
        switch( in_strType )
        {
    /*        case 'notemenucategories':
                objRetVal = this._getNoteMenuCategories();
                break;
				*/
            case 'notemenuactions':
                objRetVal = this._getNoteMenuActions();
                break;/*
            case 'notemenushares':
                objRetVal = this._getNoteMenuShares();
                break;
            case 'notemenucontacts':
                objRetVal = this._getNoteMenuContacts();
                break;
				*/
            case 'metatagmenu':
                objRetVal = this._getMetaTagMenu();
                break;
            case 'attachmenttagmenu':
                objRetVal = this._getAttachmentTagMenu();
                break;
            case 'sharelevelmenu':
                objRetVal = this._getShareLevelMenu();
                break;
            case 'notespagingmenusortorder':
                objRetVal = this._getNotesPagingMenuSortOrder();
                break;
            case 'notespagingmenuviewtype':
                objRetVal = this._getNotesPagingMenuViewType();
                break;
				/*
            case 'newnotemenu':
                objRetVal = this._getNewNoteMenu();
                break;
            case 'notedisplaycollectionmenucommands':
                objRetVal = this._getNoteDisplayCollectionMenuCommands();
                break;
				*/
            case 'commentmenu':
                objRetVal = this._getCommentMenu();
                break;
            default:
                break;
        } // end switch
        
        return objRetVal;
    },
    
    _getCommonConfig: function( in_strSelectItemMessage, in_bCancelMouseDown )
    {
        in_strSelectItemMessage = in_strSelectItemMessage || 'selectmenuitem';
	    var objConfig = {
		    type: 'ListDisplay',
		    config: {
		        m_strTemplate: 'Menu',
		        m_strItemTemplate: 'BasicMenuItem',
		        m_bAttachDomOnInit: false
		    },
            Plugins: [
            { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mousedown',
                m_strMessage: in_strSelectItemMessage,
                m_bCancelEvent: in_bCancelMouseDown
            } }, {
                type: 'PopupPlugin',
                config: {
                    m_bStartHideTimerOnShow: false,
                    m_nHideDelayMS: Config.nMenuHideDelayMS,
                    m_nNoEnterDelayMS: Config.nMenuNoEnterDelayMS,
                    m_strSuspendMouseOutMessage: 'suspendmouse',
                    m_strEnableMouseOutMessage: 'startmouse'
                }
            }, 
            { type: 'ListHighlightPlugin', config: { 
            } },
            { type: 'ListIteratorPlugin', config: {
                m_strItemSetMessage: 'listitemhighlight',
                m_strSetItemMessage: 'highlightlistitem',
                m_strCurrentItemGetMessage: in_strSelectItemMessage
            } }, 
            { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strMessage: 'highlightlistitem'
            } }, { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_strMessage: 'unhighlightlistitem'
            } },
            { type: 'KeyListenerPlugin', config: {
                //m_bFocusOnShow: true,
                m_objKeys: {
      /* ESC */   27: { altKey: false, shiftKey: false, controlKey: false, message: 'close' },
 /* UP_ARROW */   38: [ { altKey: false, shiftKey: false, controlKey: false, message: 'clickpreviouslistitem' },
                        { altKey: false, shiftKey: false, controlKey: false, message: 'suspendmouse' } ],
/* DOWN_ARROW */  40: [ { altKey: false, shiftKey: false, controlKey: false, message: 'clicknextlistitem' },
                        { altKey: false, shiftKey: false, controlKey: false, message: 'suspendmouse' } ],
    /* SPACE */   32: [ { altKey: false, shiftKey: false, controlKey: false, message: 'clickcurrentlistitem' },
                        { altKey: false, shiftKey: false, controlKey: false, message: 'suspendmouse' } ],
    /* ENTER */   13: [ { altKey: false, shiftKey: false, controlKey: false, message: 'clickcurrentlistitem' },
                        { altKey: false, shiftKey: false, controlKey: false, message: 'close' } ]
                }
                
            } } ]
		};
        
        return objConfig;
    },
    /*
    _getNoteMenuCategories: function()
    {
        var objRetVal = this._getMetaTagsDropdown( 
            app.usercategories, 
            MetaTags.eCollections.tagged,
            _localStrings.ADD_TAGS 
        );
                
        return objRetVal;
    },
    */
    _getNoteMenuActions: function()
    {
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( NoteMenuActions );
        return objRetVal;
	},
	/*
	_getNoteMenuShares: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( NoteMenuShares );
        return objRetVal;
	},

	_getNoteMenuContacts: function()
	{
        var objRetVal = this._getMetaTagsDropdown( 
            app.contact,
            MetaTags.eCollections.sharedbyperuser, 
            _localStrings.ADD_USERS_EMAILS 
        );
                
        return objRetVal;
	},
	*/
	
	_getMetaTagMenu: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( MetaTagMenu );
        return objRetVal;
	},
	
	_getAttachmentTagMenu: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( AttachmentTagMenu );
        return objRetVal;
	},
	
	_getShareLevelMenu: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.config.m_strItemTemplate = 'SelectedMenuItem';
        objRetVal.Plugins.push( ListSelectionPlugin );
        objRetVal.Plugins.push( ShareLevelMenu );
        return objRetVal;
	},
	
	_getNotesPagingMenuSortOrder: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( NotesPagingMenuSortOrder );
        return objRetVal;
	},
	
	_getNotesPagingMenuViewType: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( NotesPagingMenuViewType );
        return objRetVal;
	},
	/*
	_getNewNoteMenu: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( NewNoteMenu );
        return objRetVal;
	},

	_getNoteDisplayCollectionMenuCommands: function()
	{
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( { 
	        type: 'NotesDisplayCollectionMenuCommands', config: {
	        m_objNotesCollection: app.notes  
	    } } );
        return objRetVal;
	},
	*/
    _getCommentMenu: function()
    {
        var objRetVal = this._getCommonConfig();
        objRetVal.Plugins.push( CommentMenu );
        return objRetVal;
    }/*,

    _getMetaTagsDropdown: function( in_objCollection,
        in_strSendRequestToID, in_strInputText )
    {
        var objRetVal = this._getCommonConfig( 'clicklistitem' );
        objRetVal.type = 'MetaTagsList'; 
        Object.extend( objRetVal.config, {
                m_strTemplate: 'EditorCategoriesDropdown',
                m_strItemTemplate: undefined,
                m_strListItemAreaSelector: 'elementSelectionList',
                m_bGracefulReposition: false,
                m_bDetachOnHide: false,
                m_bAttachDomOnInit: false, 
                type: in_objCollection.m_strModelType,
                m_objCollection: in_objCollection,
                m_objDisplayFactory: 
                {
                    type: 'MetaTagDisplay',
                    factory: app.genericfactory,
                    config: {
                        m_strTemplate: 'CategorySelectionItem'
                    },
                    Plugins: [ ExtraInfoDataPlugin ]
                }
        } );
        // AutoCompletePlugin has to come before the TextInputPlugin so that it can
        //  get first shot at the DOM events and cancel any that the TextInputPlugin
        //  shouldn't get.
        objRetVal.Plugins.push( 
            { type: 'AutoCompletePlugin', config: {
                m_strInputSelector: 'elementInput',
                m_fncMatchFinder: in_objCollection.searchMetaTagNames.bind( in_objCollection )
            } },
            { type: 'TextInputPlugin', config: {
                m_strInputSelector: 'elementInput',
                m_eFocusBehavior: TextInputPlugin.eFocusBehavior.FB_SELECT,
                m_strSubmitMessage: 'applyclosedropdown',
                m_strCancelMessage: 'close',
                m_strChangedMessage: 'suspendmouse',
                m_bFocusOnShow: true,
                m_bStopClickPropagation: true
            } },
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'elementCloseButton',
                m_strOnPressMessage: 'close'
            } },
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'elementCancelButton',
                m_strOnPressMessage: 'close'
            } },
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'elementApply',
                m_strOnPressMessage: 'applyclosedropdown'
            } },
            { type: 'ListClassnamePlugin', config: {} },
            { type: 'MetaTagsDropdownMenuPlugin', config: {
                m_strCollectionID: in_objCollection.m_strModelType,
                m_bAutoCompleteAttached: true,
                m_strInputText: in_strInputText
            } },
            { type: 'MetaTagsDropdownRequestBuilderPlugin', config: {
                m_strCollectionID: in_strSendRequestToID
            } },
            { type: 'MetaTagsDropdownNewTagsListPlugin', config: {} },
            { type: 'ListSelectionPlugin', config: { 
                m_strListenMessage: 'clicklistitem'
            } },
            { type: 'ListCollapsePlugin', config: { 
            } },
            { type: 'ListResizePlugin', config: { 
                m_bResizeOnShow: true
            } } 
        );
        
        return objRetVal;
    }
*/
} );