/**
* Application - Initializes items shared across appliction types.
*/
function Application()
{
    this.messagebox = undefined;
    this.dialogs = undefined;
    this.connectionresponsehandler = undefined;
    this.offlinewarningdialog = undefined;

    this.externalpage = undefined;
    this.dblog = undefined;
    this.trash = undefined;

    this.systemcategories = undefined;
    this.usercategories = undefined;
    this.folders= undefined;
    this.sharedby = undefined;
    this.sharedwith = undefined;
    this.source = undefined;
    this.attachments = undefined;
    this.othersharedwith = undefined;
    //this.comment = undefined;
	this.contact = undefined;

	this.userpreferences = undefined;

    this.notes = undefined;
    this.categoriesloader = undefined;
   // this.foldersloader= undefined;
	
    this.activityupdates = undefined;
    this.updatedateinterval = undefined;
    
    this.notecategoriesmenu = undefined;
    this.noteactionsmenu = undefined;
    //this.notesharesmenu = undefined;
    this.tagmenu = undefined;
    this.attachmentmenu = undefined;
    this.sharelevelmenu = undefined;
    //this.commentmenu = undefined;
	this.sharesmenu = undefined;

    this.generictextpopupbox = undefined;
    
    this.events = undefined;

    this.attachmenthoverinfo = undefined;
    this.sharehoverinfo = undefined;

    this.notehelper = undefined;
    
    //this.notecommentpopup = undefined;
    
    Application.Base.constructor.apply( this );
};
UberObject.Base( Application, UberObject );


Object.extend( Application.prototype, {
    init: function()
    {
        // We are moving this here so that Config does not have a dependency on BrowserInfo
        //  and we can use Config.js in tinyMCE plugins.
        Config.aLogoutErrorLevels = [ ErrorLevels.eErrorLevel.EXTREME, ErrorLevels.eErrorLevel.CRITICAL ];

	    this.genericfactory = new Factory();
	    this.notedisplayfactory = new NoteDisplayFactory();
        this.menufactory = new MenuFactory();
        
        this.dialogs = new Dialogs();
		// DJN: this is hackish but we want to show it asap before other stuff, and has to come after Dialogs()
		this.dialogs.loadingscreen.show(); 
    
        Application.Base.init.apply( this );

        this.connectionresponsehandler = this.createInitUberObject( ConnectionResponseHandler );
        this.offlinewarningdialog = this.createInitUberObject( OfflineWarningDialog, {
            m_objWarningDialog: this.dialogs.connectionscreen
        } );
        
	    try
	    {
	        document.execCommand( 'BackgroundImageCache', false, true);
	    }
	    catch(e) {}
        
	    // we must do this first so that we have an SID to do any other processing.
	    Util.readSID();
    	
        this.dblog = this.createInitUberObject( Logger, { type: 'DBLog' } );
        
        // Get this ready in case we have any assertions.
        this.messagebox = this.createInitUberObject( {
            type: 'HTMLDisplay',
		    factory: this.genericfactory,
		    config: {
                m_strTemplate: 'PopupMessage',
                m_bAttachDomOnInit: false
            },
            Plugins: [ { type: 'PopupPlugin', config: {} } ]
		} );
        
	    SysError.init( {
	        m_objMessagePopup: this,
	        m_strLogID: this.dblog.m_strMessagingID,
	        m_bLogFirebug: Config.bLogFirebug,
            m_aLogoutLevels: Config.aLogoutErrorLevels
	    } );
        this.attachUberObject( SysError );

		this.userpreferences = this.createInitUberObject( UserPref );
        
	    this.trash = false;
	    
        this.systemcategories = this.createInitUberObject( SystemCategories, {
	          m_strModelType: MetaTags.eCollections.systemcategories, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category'
	        } );
	    this.usercategories = this.createInitUberObject( Categories, {
	          m_strModelType: MetaTags.eCollections.tagged, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category'
	        } );
	    this.folders = this.createInitUberObject( Folders, {
	          m_strModelType: MetaTags.eCollections.folders, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category'
	        } );
	    this.contact = this.createInitUberObject( Contacts, 
	        { m_strModelType: MetaTags.eCollections.contact, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category'
	        } );
	    this.sharedby = this.createInitUberObject( Shares, {
	          m_strModelType: MetaTags.eCollections.sharedbyperuser, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category',
              m_objContacts: this.contact
	        } );
	    this.sharedwith = this.createInitUberObject( Shares, {
	          m_strModelType: MetaTags.eCollections.sharedwithperuser, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category',
              m_objContacts: this.contact
	        } );
	    this.source = this.createInitUberObject( MetaTags, {
	          m_strModelType: MetaTags.eCollections.source, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category'
	        } );
	    this.othersharedwith = this.createInitUberObject( Shares, {
	          m_strModelType: MetaTags.eCollections.othersharedwith, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Category',
              m_objContacts: this.contact
	        } );
	    this.attachments = this.createInitUberObject( MetaTags, 
	        { m_strModelType: MetaTags.eCollections.attachment, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Attachment'
	        } );
			/*
	    this.comment = this.createInitUberObject( Comments, 
	        { m_strModelType: MetaTags.eCollections.comment, 
	          m_fncModelFactory: this.genericfactory,  
	          m_strModelFactoryType: 'Comment'
	        } );
        
		*/
	    //this.notecategoriesmenu = this.menufactory.create( 'notemenucategories' );
	    this.noteactionsmenu = this.menufactory.create( 'notemenuactions' );
	    //this.notesharesmenu = this.menufactory.create( 'notemenushares' );
	    this.tagmenu = this.menufactory.create( 'metatagmenu' );
	    this.attachmentmenu = this.menufactory.create( 'attachmenttagmenu' );
	    this.sharelevelmenu = this.menufactory.create( 'sharelevelmenu' );
        //this.commentmenu = this.menufactory.create( 'commentmenu' );
        //this.notecontactsmenu = this.menufactory.create( 'notemenucontacts' );
		
	    this.notes = this.createInitUberObject( Notes );
    
	    this.categoriesloader = this.createInitUberObject( CategoriesLoader );
	   // this.foldersloader = this.createInitUberObject( FoldersLoader );

        this.activityupdates = this.createInitUberObject( ActivityUpdates, {
            m_strItemID: Ubernote.m_strNoteID ? Ubernote.m_strNoteID : ''
        } );
        
	    this.events = this.createInitUberObject( GlobalEventHandler, {} );
        
        this.attachmenthoverinfo = this.createInitUberObject( app.genericfactory, {
            type: 'BindingDisplay',
            config: {
                m_strTemplate: 'AttachmentTagExtended',
				m_bAttachDomOnInit: false
            }, // end config
            Plugins: [ ExtraInfoDataPlugin ]
        } );

        this.sharehoverinfo = this.createInitUberObject( app.genericfactory, {
            type: 'BindingDisplay',
            config: {
                m_strTemplate: 'ShareTagExtended',
				m_bAttachDomOnInit: false
            }, // end config
            Plugins: [ ExtraInfoDataPlugin ]
        } );
        
        this.notehelper = this.createInitUberObject( app.genericfactory, {
            type: 'NoteHelper',
            config: {
                m_objInsertionPoint: $( 'notehelper' ),
                m_strTemplate: 'notehelper',
                m_strBaseURL: '../clientpages/notehelperdisplay.aspx'
            }, // end config
            Plugins: [ {
                type: 'BatchPlugin',
                config: {
                    m_strMessageForAdd: 'notedisplay',
                    m_strMessageToRaise: 'updatead',
                    m_nTimeout: 500
                }
            } ]
        } );
		
		
        
        this.generictextpopupbox = this.createInitUberObject( {
            type: 'DisplayAltConfig',
		    factory: this.genericfactory,
		    config: {
                m_strTemplate: 'EditorTextInputPopup',
                m_bGracefulReposition: true,
                m_bAttachDomOnInit: false,
                type: 'textinput'
            },
            Plugins: [ 
                { type: 'TextInputPlugin', config: { 
                    m_bFocusOnShow: true,
                    m_strInputSelector: 'elementInput',
                    m_eFocusBehavior: TextInputPlugin.eFocusBehavior.FB_SELECT
                } },
                { type: 'PopupPlugin', config: {} },
                { type: 'OKCloseCancelButtonsPlugin', config: {
                    m_strCloseFunctionName: 'getValue'
                } },
                { type: 'HeaderFooterPlugin', config: {} } 
            ]
		} );        

		/*
        this.commentpopupbox = this.createInitUberObject( {
            type: 'DisplayAltConfig',
		    factory: this.genericfactory,
		    config: {
                m_strTemplate: 'CommentTextInputPopup',
                m_bGracefulReposition: true,
                m_bAttachDomOnInit: false,
                type: 'textinput'
            },
            Plugins: [ 
                { type: 'TextInputPlugin', config: { 
                    m_bFocusOnShow: true,
                    m_strInputSelector: 'elementInput',
					m_bSubmitOnEnter: false,
                    m_eFocusBehavior: TextInputPlugin.eFocusBehavior.FB_SELECT
                } },
                { type: 'PopupPlugin', config: {} },
                { type: 'OKCloseCancelButtonsPlugin', config: {
                    m_strCloseFunctionName: 'getValue'
                } },
                { type: 'HeaderFooterPlugin', config: {} } 
            ]
		} );        
		this.notecommentpopup = this.createInitUberObject( {
            type: 'NoteAddCommentPopupDisplay',
		    factory: this.genericfactory,
		    config: {
                m_objPopup: this.commentpopupbox
            }
        } );		
		*/
    },
    
    initExternalPage: function()
    {
        this.externalpage = this.createInitUberObject( ExternalSourceIframeDisplay, {
	        m_strMessagingID: 'externalpage',
	        m_strHeaderSelector: 'elementIFrameHeader',
	        m_strTemplate: 'IframePopup',
	        m_objInsertionPoint: $( 'externalpage' )
	    } );
        Timeout.setTimeout( this.externalpage.hide, 0, this.externalpage );
    },
    
    initLightbox: function()
    {
        this.lightbox = this.createInitUberObject( Lightbox, {
	        m_strMessagingID: 'lightbox',
	        m_strHeaderSelector: 'elementIFrameHeader',
	        m_strTemplate: 'IframePopupLightbox',
	        m_objInsertionPoint: $( 'lightbox' )
	    } );
        Timeout.setTimeout( this.lightbox.hide, 0, this.lightbox );
    },
    
    /**
    * logout function is called on clicking the 'logout' button on default.aspx
    */
    logout: function() 
    {
        this.teardown();
        Util.logout( 'LOGOUTUSER' );
    },

    /**
    * showMessage - Show a message to the user.
    * @param {String} in_strMessage (optional) - message to display.
    * @param {String} in_strMessageType (optional) - either ok or error.
    */
    showMessage: function( in_strMessage, in_strMessageType )
    {
        Util.Assert( TypeCheck.UString( in_strMessage ) );
        Util.Assert( TypeCheck.UString( in_strMessageType ) );
        
        var strMessage = in_strMessage || _localStrings.NO_MESSAGE;
        this.messagebox.setContent( strMessage );
        if( this.m_strLastMessageType )
        {
            this.messagebox.$().removeClassName( this.m_strLastMessageType );
            this.m_strLastMessageType = undefined;
        } // end if
        
        if( in_strMessageType )
        {
            this.m_strLastMessageType = in_strMessageType;
            this.messagebox.$().addClassName( in_strMessageType );
        } // end if

        this.messagebox.showTimed( Config.nMessageBoxDisplayTime );
        DOMElement.Center( this.messagebox.$() );
    },

    /**
    * refreshUpdateDates - raise a message to refresh update dates.
    */
    refreshUpdateDates: function()	
    {
        this.Raise( 'noterefreshupdatedate' );
    },
    
    /**
    * startIntervals - start the timers (activity update/update dates)
    */
    startIntervals: function()
    {
        // start the activity updates.  10 seconds if we are active, timeout after
        // 9.5 minutes. reset based on network requests
        this.activityupdates.startActiveUpdate();    
        this.updatedateinterval = Timeout.setInterval( 
            this.refreshUpdateDates, 30000, this ); // update update dates every 30 seconds
    },

    /**
    * stopIntervals - stop the timers
    */    
    stopIntervals: function()
    {
        Timeout.clearInterval( this.updatedateinterval );

        if( this.activityupdates )
        {
            this.activityupdates.stopIntervalUpdate();
        } // end if    
    },

    RegisterMessageHandlers: function()
    {
	    this.RegisterListener( 'onbeforeunload', window, this.teardown );
        this.RegisterListener( 'appokmessage', Messages.all_publishers_id, this.showMessage );
    	
	    Application.Base.RegisterMessageHandlers.apply( this );
    },
    
    
    /**
    * teardown - called to tear the app down and close the window..
    */
    teardown: function()
    {
        this.stopIntervals();
        
        SysError.ignoreAll( true );
        
        this.dialogs = null;
        delete this.dialogs;
        
        try {
            // Sometimes safari dies here with no good reason.  
            Application.Base.teardown.apply( this );
        } catch(e) {}
        
        Messages.teardown(); 

        window.app = null;
    }
} );

(function(){
    bootApp();
    function bootApp()
    {
        // Make sure all of our dependencies are loaded before trying to do an InitApp.
        if( window.UberObject
         && window.Prototype
         && window.Display
         && window.Model
         && window.BrowserInfo
         && ( ( ( window.FullApplication )
             && ( window.FullApplication.Base ) )
           || ( ( window.StandaloneEditorApp )
             && ( window.StandaloneEditorApp.Base ) ) )
         && window.MenuFactory
        )
        {
            InitApp();
        } 
        else
        {
            window.setTimeout( bootApp, 10 );
        }
    };
})();
