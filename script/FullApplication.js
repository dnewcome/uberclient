/**
* Main FullApplication object.  Instantiates the other toplevel objects in the FullApplication.
*/

function FullApplication()
{ 
    this.maincontrol = undefined;
    this.drag = undefined;
	//this.usercategoriesdisplay = undefined;
	this.foldersdisplay = undefined;
	/*this.sharedbydisplay = undefined;
	this.sharedwithdisplay = undefined;
	this.sourcedisplay = undefined;
	*/
	this.notespaging = undefined;
	//this.tagsaccordion = undefined;
    this.headerbar = undefined;
    //this.newnotemenu = undefined;
    this.sharenotedisplay = undefined;
        
    FullApplication.Base.constructor.apply( this );
};
UberObject.Base( FullApplication, Application );

Object.extend( FullApplication.prototype, {
    init: function()
    {
        FullApplication.Base.init.apply( this );
        this.notessortordermenu = this.menufactory.create( 'notespagingmenusortorder' );
        this.viewtypemenu = this.menufactory.create( 'notespagingmenuviewtype' );
        //this.newnotemenu = this.menufactory.create( 'newnotemenu' );

        this.sharenotedisplay = this.notedisplayfactory.create( 'popupmetatags' );
		this.notesdisplaycollectionfactory = new NotesDisplayCollectionFactory();
        //this.listviewcommandsmenu = this.menufactory.create( 'notedisplaycollectionmenucommands' );
		this.drag = new Drag();
		
		this.expandedcollection = this.createInitUberObject( this.notesdisplaycollectionfactory, 'expanded' );
		this.listcollection = this.createInitUberObject( this.notesdisplaycollectionfactory, 'list' );
		this.singlecollection = this.createInitUberObject( this.notesdisplaycollectionfactory, 'singlenote' );
		this.notespaging = this.createInitUberObject( this._getNotesPagingConfig() );
		
		this.initExternalPage();
		this.initLightbox();
		this.headerbar = this.createInitUberObject( HeaderBar );
		this.searchBox = this.createInitUberObject( this._getHeaderSearchConfig() );
        if( ! Ubernote.m_strNoteID )
        {
            this.headerbar.showDashboard();
        } // end if    
        
        this.maincontrol = this.createInitUberObject( this._getMainControlConfig() );

        // Set up the view displays here.
		/*
		this.sharedbydisplay = this.createInitUberObject( this._getViewConfig( 'sharedByDiv', 'ViewNoInput', 'ViewNode', this.sharedby ) );
		this.sharedwithdisplay = this.createInitUberObject( this._getViewConfig( 'sharedWithDiv', 'ViewNoInput', 'ViewNode', this.sharedwith ) );
		this.sourcedisplay = this.createInitUberObject( this._getViewConfig( 'sourcesDiv', 'ViewNoInput', 'ViewNode', this.source ) );
		this.usercategoriesdisplay = this.createInitUberObject( this._getTaggedViewConfig() );
*/
        this.foldersdisplay = this.createInitUberObject( this._getFoldersViewConfig() );

        this.categoriesloader.loadAll();
    //    this.foldersloader.loadAll();

        this._displayInitialNotes();
    },
    
	OnCategoryChange: function()
	{
	    this.externalpage.hide();
	    this.trash = false;
	},

    RegisterMessageHandlers: function()
    {
    	this.RegisterListener( 'requestdisplaycategory', Messages.all_publishers_id, this.OnCategoryChange );

	    FullApplication.Base.RegisterMessageHandlers.apply( this );
    },
    
    _getStartupView: function()
    {
        var strRetVal = Cookies.read( 'view' );
        if( ( 'expanded' != strRetVal )
         && ( 'list' != strRetVal ) )
        {   // do this in case we have no cookie or a bad cookie.
            strRetVal = 'list';
        } // end if
        
        return strRetVal;
    },
    
    _getStartupSortOrder: function()
    {
        var strRetVal = Cookies.read( 'sortorder' );
        
        if( false === TypeCheck.EnumKey( strRetVal, Notes.eNoteSortOrder ) )
        {   // do this in case we have no cookie or a bad cookie.
            strRetVal = Notes.eNoteSortOrder.UPDATEDT_NEWFIRST;
        } // end if
        
        return strRetVal;
    },
    
    
    _getViewConfig: function( in_strInsertionSelector, in_strTemplate, in_strTagTemplate, in_objCollection )
    {
        return {
            type: 'MetaTagsList',
		    factory: this.genericfactory,
		    config: {
                m_strTemplate: in_strTemplate,
                m_objInsertionPoint: document.getElementById( in_strInsertionSelector ),
                m_strItemTemplate: 'MetaTagListItem',
                m_strListItemAreaSelector: 'elementTagsViewPort',
                m_objCollection: in_objCollection,
                m_objDisplayFactory: 
                {
                    type: 'MetaTagDisplay',
                    factory: this.genericfactory,
                    config: {
                        m_strTemplate: in_strTagTemplate
                    },
                    Plugins: [ ExtraInfoDataPlugin/*, MetaTagTitlePlugin */]
                }
            },
            Plugins: [ { type: 'ViewPlugin', config: {} },
            { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strMessage: 'highlightlistitem'
            } }, { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_strMessage: 'unhighlightlistitem'
            } },
            { type: 'ListHighlightPlugin', config: {} },
            { type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_strMessage: 'listitemclick',
				m_bPreventDefault: true
            } },
            { type: 'ListSelectionPlugin', config: {
                m_eSelectionBehavior: ListSelectionPlugin.eSelectionType.RADIO,
				m_bCanReselect: true
            } }
            ]
		};        
    },
	/*
    _getTaggedViewConfig: function()
    {
        var objConfig = this._getViewConfig( 'viewsPaneDiv', 'View', 'ViewNode', this.usercategories );
        // plugins for the tag displays
        objConfig.config.m_objDisplayFactory.Plugins.push(
            { type: 'MetaTagDragPlugin', config: { 
                m_objDragService: app.drag } }
        );

        // plugins for the view.
        objConfig.Plugins.push( 
            { type: 'TextInputPlugin', config: { 
                m_strInputSelector: 'elementInput',
                m_eFocusBehavior: TextInputPlugin.eFocusBehavior.FB_SELECT,
                m_bStopClickPropagation: true,
                m_strSubmitMessage: this.usercategories.m_strMessagingID + 'addaction'
            } },
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'elementActionIcon',
                m_strOnPressMessage: this.usercategories.m_strMessagingID + 'addaction',
                m_strOnPressFunctionName: 'getValue'    *//* Gets the value from the TextInputPlugin *//*
            } }
        );
        
        return objConfig;
    },
    */
    _getFoldersViewConfig: function()
    {
        var objConfig = this._getViewConfig( 'folders', 'FoldersPane', 'FolderNode', this.folders );
        objConfig.config.m_strListItemAreaSelector = 'folders';
        
        return objConfig;
    },

	_getHeaderSearchConfig: function() {
		return {
			type: 'DisplayAltConfig',
			factory: this.genericfactory,
			config: {
				m_objInsertionPoint: $( 'topStatus' )
			},
			Plugins: [
                { type: 'TextInputPlugin', config: { 
                    m_strInputSelector: 'elementSearchInput',
                    m_eFocusBehavior: TextInputPlugin.eFocusBehavior.FB_SELECT,
                    m_strSubmitMessage: 'categoryselectsearch',
                    m_bStopClickPropagation: true,
                    m_strSetValueMessage: 'setvaluesearch'
                } },
                { type: 'ButtonPlugin', config: {
                    m_strSelector: 'elementSearchButton',
                    m_strOnPressMessage: 'categoryselectsearch',
                    m_strOnPressFunctionName: 'getValue'    /* Gets the value from the TextInputPlugin */
                } }
			]
		};
	},
	
    _getMainControlConfig: function()
    {
        return { 
            type: 'MainControl', 
		    factory: this.genericfactory,
            config: {
                m_strTemplate: 'MainControl',
	            m_objInsertionPoint: $( 'catcontrols' )
            }
        };
    },
    
    _getNotesPagingConfig: function()
    {
        return {
		    factory: app.genericfactory,
		    type: 'NotesPaging',
		    config: {
                m_strTemplate: 'NotesPagingBasic',
                m_objInsertionPoint: $( 'noteside' )
            },
            Plugins: [ 
            { type: 'MenuPlugin', config: { m_objMenu: app.viewtypemenu,
                m_strButtonAttachmentSelector: 'elementViewType' } },
/*            { type: 'MenuPlugin', config: { m_objMenu: app.newnotemenu,
                m_strButtonAttachmentSelector: 'NoteAddMenuButton' } },
				*/
            { type: 'MenuPlugin', config: { m_objMenu: app.notessortordermenu,
                m_strButtonAttachmentSelector: 'elementSortOrder' } },                
            { type: 'MtoNofXCountPlugin', config: { 
                m_strFirstSelector: 'elementFirstNote',
                m_strLastSelector: 'elementLastNote',
                m_strTotalSelector: 'elementTotalNotes',
                m_strUpdateMessage: 'updatenotecounts'
            } },
            { type: 'MtoNofXCountPlugin', config: { 
                m_strFirstSelector: 'elementFirstNoteBottom',
                m_strLastSelector: 'elementLastNoteBottom',
                m_strTotalSelector: 'elementTotalNotesBottom',
                m_strUpdateMessage: 'updatenotecounts'
            } },
            { type: 'CollapsingNumberListPlugin', config: { 
               m_strListSelector: 'NumberListTop',
               m_strNewSelectionMessage: 'setpage',
               m_strTooltipText: _localStrings.GOTO_PAGE
            } },
            { type: 'CollapsingNumberListPlugin', config: { 
               m_strListSelector: 'NumberListBottom',
               m_strNewSelectionMessage: 'setpage',
               m_strTooltipText: _localStrings.GOTO_PAGE
            } },
            { type: 'NotesPagingHistoryPlugin', config: { 
               m_strURLHandlerID: 'externalpage',
               m_strSingleNoteView: 'singlenote'
            } },
            { type: 'ButtonPlugin', config: { 
               m_strSelector: 'elementBack',
               m_strOnPressMessage: 'back'
            } },
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'NoteAddButton',
                m_strOnPressMessage: 'requestnewnote'
            } },
            { type: 'NotesPagingViewsPlugin', config: {
                m_objViews: {
                    expanded: {
                        display: app.expandedcollection,
                        visibleclassnames: 'expanded',
                        notesperpage: ( ( true === BrowserInfo.ie ) && ( 6 == BrowserInfo.majorVersion() ) ) ? 5 : 10
                    },
                    list: {
                        display: app.listcollection,
                        visibleclassnames: 'listview',
                        notesperpage: 25
                    },
                    singlenote: {
                        display: app.singlecollection,
                        visibleclassnames: 'singlenoteview',
                        notesperpage: 1
                    }
                },
                m_strDefaultView: this._getStartupView(),
                m_strSingleNoteView: 'singlenote',
                m_strMultipleNoteView: 'expanded'
            } },
            { type: 'NotesPagingSingleNoteViewPlugin', config: {
                m_strSingleNoteView: 'singlenote'
            } }/*,
            { type: 'NotesPagingHeaderPlugin', config: {
            } }*/,
            { type: 'NotesPagingPagingPlugin', config: {
            } },
            { type: 'NotesPagingSortOrderPlugin', config: {
                m_strDefaultSortOrder: Cookies.read( 'sortorder' ) || Notes.eNoteSortOrder.CREATEDT_NEWFIRST
            } },
            { type: 'NotesPagingNewNotePlugin', config: {
            } },
            { type: 'NotesPagingLoadingScreenPlugin', config: {
                m_objScreenToShow: this.dialogs.loadingscreen
            } },
            { type: 'NotesPagingSystemCategoriesPlugin', config: {
            } },
			{ type: 'ButtonPlugin', config: {
				m_strSelector: 'buttonPrevious',
				m_strOnPressMessage: 'setpreviouspage',
				m_bSendToPlugged: true
            } },
			{ type: 'ButtonPlugin', config: {
				m_strSelector: 'buttonNext',
				m_strOnPressMessage: 'setnextpage',
				m_bSendToPlugged: true
            } }
            
            ]
		};
    },
    
    _displayInitialNotes: function()
    {
        if( Ubernote.m_strNoteID )
        {
            this.Raise( 'requestdisplaynotes', [ { noteids: [ Ubernote.m_strNoteID ] } ] );
            this._continueLoad();
        } // end if
        else
        {
            var fncCallback = new FunctionContainer( this._continueLoad, this );
        
            this.Raise( 'requestdisplaynotes', [ { 
                metatagid: SystemCategories.Categories.nofolder,
                collectionid: MetaTags.eCollections.systemcategories, 
                view: this._getStartupView(),
                sortorder: this._getStartupSortOrder(),
                page: 0, 
                callback: fncCallback
            } ] );
            this.Raise( 'categorysetall' );
        } // end if-else
    },

    _continueLoad: function()
    {
        Timeout.setTimeout( this.dialogs.loadingscreen.hide, 0, this );
    /*
        this.tagsaccordion = this.createInitUberObject( Accordion, 'test' );
    	this.tagsaccordion.run( 0 );
*/
        // Masquerade as the window and raise a resize to get the sizes right.
        this.Raise( 'resize', undefined, undefined, window.m_strElementID );
        this.startIntervals();

        this.logFeature( 'startupview', this._getStartupView() );
    }
} );

/**
* InitStandaloneEditorApp - create and initialize the standalone editor app.
*/
function InitFullApp()
{
    window.app = new FullApplication();    
    window.app.init();
};
