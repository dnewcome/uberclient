/**
* NoteDisplayFactory - Singleton factory to create a note displays
*/

function NoteDisplayFactory()
{
    NoteDisplayFactory.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteDisplayFactory, Factory );

Object.extend( NoteDisplayFactory.prototype, {
    /**
    * create - create a note display.
    * @param {String} in_strType - type of display to create.
    * @param {String} in_strNoteID (optional) - NoteID to use for note
    * @param {Object} in_objAdditionalConfig (optional) - optional configuration used on top of 
    *   standard config for type.
    * @returns {Object} a NoteDisplay based object.
    */
    create: function( in_strType, in_strNoteID, in_objAdditionalConfig )
    {
        Util.Assert( TypeCheck.String( in_strType ) );
        Util.Assert( TypeCheck.UString( in_strNoteID ) );
        Util.Assert( TypeCheck.UObject( in_objAdditionalConfig ) );
        
        var objRetVal = undefined;
        var objConfig = this.getBaseConfig( in_strType, in_strNoteID );
        
        // We make a copy so we don't disturb the original.
        //  XXX might not need that.
        if( objConfig )
        {
            objConfig = Object.clone( objConfig );
            
            if( in_objAdditionalConfig )
            {
                Object.extend( objConfig.config, in_objAdditionalConfig );
            } // end if
            objRetVal = NoteDisplayFactory.Base.create.apply( this, [ objConfig ] );
        } // end if 
        
        return objRetVal;
    },
    
    /**
    * getBaseConfig - gets the base configuration object for 
    *    a given type and a noteID
    * @param {String} in_strType - type of display to create.
    * @param {String} in_strNoteID - NoteID to create the display to.
    * @returns {Object} - Base configuration object if valid type, undefined otw.
    */
    getBaseConfig: function( in_strType, in_strNoteID )
    {
        Util.Assert( TypeCheck.String( in_strType ) );
        Util.Assert( TypeCheck.UString( in_strNoteID ) );
    
        var objRetVal = undefined;
        switch( in_strType )
        {
            case 'standaloneeditor':
                objRetVal = this.getStandaloneEditorConfig( in_strNoteID );
                break;
            case 'fulleditor':
                objRetVal = this.getFullAppEditorConfig( in_strNoteID );
                break;
            case 'listview':
                objRetVal = this.getListDetailsConfig( in_strNoteID );
                break;
            case 'popupmetatags':
                objRetVal = this.getPopupMetaTagsConfig( in_strNoteID );
                break;
            default:
                Util.Assert( false, 'Invalid Display Type' );
                break;
        } // end switch.
        return objRetVal;
    },
    
    getStandaloneEditorConfig: function( in_strNoteID )
    {
        Util.Assert( in_strNoteID, 'This note type requires a NoteID' );

        var objConfig = {
            type: 'NoteEditor',
            config: {
                m_strTemplate: 'Note',
                m_bEditable: false,
                m_bHideOnTrash: false,
                m_strNoteID: in_strNoteID,
                m_objInsertionPoint: document.getElementById( 'elementNoteDisplay' )
            },
            Plugins: []
        };
        
        this._getEditorPlugins( in_strNoteID, objConfig.Plugins, true );
        this._getMetaTagsPlugins( in_strNoteID, objConfig.Plugins );
        objConfig.Plugins.push(
            { type: 'ButtonPlugin', config: {
                m_strSelector: 'elementAddComment',
                m_strOnPressMessage: 'shownewnotecommentinput',
                m_bSendToPlugged: true
            } } );
        return objConfig;
    },
    
    getFullAppEditorConfig: function( in_strNoteID )
    {
        Util.Assert( in_strNoteID, 'This note type requires a NoteID' );
        
        var objConfig = {
            type: 'NoteEditor',
            config: {
                m_strTemplate: 'Note',
                m_bEditable: false,
                m_bHideOnTrash: true
            },
            Plugins: []
        };
      
        this._getEditorPlugins( in_strNoteID, objConfig.Plugins, false );
        this._getMetaTagsPlugins( in_strNoteID, objConfig.Plugins );
          
        return objConfig;
    },

    getListDetailsConfig: function( in_strNoteID )
    {
        return {
            type: 'NoteDisplay',
            config: {
                m_strTemplate: 'NoteListDetails',
                m_strNoteID: in_strNoteID,
                m_eLoadLevel: Notes.eLoadLevels.SUMMARY
            },
            Plugins: [ 
            NoteSavePlugin, NoteShareInfoPlugin, NoteActionsPlugin, NoteActionButtonsPlugin, 
            { 
                type: 'ExtraInfoDataPlugin',
                config: {
                    m_aobjLoadDataMessages: {
                        'loaddataobject': undefined,
                        'onsavecomplete': undefined,
                        'noterefreshupdatedate': Messages.all_publishers_id
                    }
            } },
            { type: 'NoteMetaTagLightPlugin', config: 
              {
                m_strNoteID: in_strNoteID,
                m_objCollectionsArray: [
                    {   collection: app.usercategories,
                        hastagsclass: 'usercategories'
                    },
                    {   collection: app.sharedby,
                        hastagsclass: 'sharedbyme'
                    },
                    {   collection: app.othersharedwith,
                        hastagsclass: 'othersharenames'
                    },
                    {   collection: app.attachments,
                        hastagsclass: 'attachments'
                    }
                ]
              } // end config
            },
            NoteBooleanFlagsPlugin/*,
			*//*
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementCategories',
                m_objMenu: app.notecategoriesmenu
            } },
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementActions',
                m_strShowMenuMessage: 'requestactionsmenu',
                m_objMenu: app.noteactionsmenu
            } },
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementEmail',
                m_strShowMenuMessage: 'requestsharesmenu',
                //m_objMenu: app.notesharesmenu
				m_objMenu: app.notecontactsmenu
            } },
            { type: 'NoteTagsDropdownPlugin', config: 
              {
                m_objMenu: app.notecategoriesmenu,
				m_strCollectionID: 'tagged'
              } // end config
            },
            { type: 'NoteTagsDropdownPlugin', config: 
              {
                m_objMenu: app.notecontactsmenu,
				m_strCollectionID: 'sharedbyperuser'
              } // end config
            }
			*/
            ]
       };
    },

    getPopupMetaTagsConfig: function( in_strNoteID )
    {
        var objConfig = {
            type: 'NoteDisplay',
            config: {
                m_strTemplate: 'NotePopup',
                m_bFocusOnShow: true,
                m_objInsertionPoint: document.getElementsByTagName('body')[0],
                m_objInsertBefore: null,
                m_eLoadLevel: Notes.eLoadLevels.SUMMARY
            },
            Plugins: [ ExtraInfoDataPlugin, NoteShareInfoPlugin, 
                { type: 'PopupPlugin',
                  config:
                  {
                    m_bStartHideTimerOnShow: false,
                    m_nHideDelayMS: Config.nMenuHideDelayMS,
                    m_nNoEnterDelayMS: Config.nMenuNoEnterDelayMS,
                    m_bRaiseCloseOnShow: true
                } },
                /* NoteSharedDisplayPlugin has to go after PopupPlugin because both override the
                *   base show function.  The above PopupPlugin forces a close on all open popups,
                *   and if it comes after the NoteSharedDisplayPlugin, it forces a close of this
                *   popup, not the behavior we want
                */
                { type: 'NoteSharedDisplayPlugin',
                  config: {
                    m_nShowDelay: 500
                } }
            ] // end plugins
        };

        if( in_strNoteID )
        {
            objConfig.config.m_strNoteID = in_strNoteID;
        } // end if

        this._getMetaTagsPlugins( in_strNoteID, objConfig.Plugins );
        
        return objConfig;
    },
    
    /**
    * _getMetaTagsPlugins - get the standard plugins for meta tags
    * @param {String} in_strNoteID - noteID for the note.
    * @param {Array} in_objPluginsList - Array to add plugins to.
    */
    _getMetaTagsPlugins: function( in_strNoteID, in_objPluginsList )
    {
        var aobjPlugins = [
                { type: 'NoteMetaTagListPlugin', config: 
                  {
                    m_strNoteID: in_strNoteID,
                    m_strInsertionPointSelector: 'tags',
                    m_strHasTagsClassName: 'usercategories',
                    m_bDeltaHeight: true,
                    m_objListDisplayFactory: { 
                        factory: app.genericfactory,
                        type: 'BindingsList',
                        config: {
                            m_strTemplate: 'tags',
                            m_objCollection: app.usercategories,
                            m_objDisplayFactory: {
                                factory: app.genericfactory,   
                                Plugins: [ { type: 'MenuPlugin', config: { m_objMenu: app.tagmenu } },
                                           ExtraInfoDataPlugin ],
                                type: 'BindingDisplay',
                                config: {
                                    m_strTemplate: 'Tag'
                                } // end config
                            } // end m_objDisplayFactory
                        } // end config
                    } // end m_objListDisplayFactory 
                  } // end config
                }, // end tags config ,

                { type: 'NoteMetaTagListPlugin', config: 
                  {
                    m_strNoteID: in_strNoteID,
                    m_strInsertionPointSelector: 'elementShareWithNames',
                    m_strHasTagsClassName: 'sharedbyme',
                    m_bDeltaHeight: true,
					m_strBindingType: 'sharedbyperuser',
                    m_objListDisplayFactory: { 
                        factory: app.genericfactory,
                        type: 'BindingsList',
                        config: {
                            m_strTemplate: 'tags',
                            m_objCollection: app.sharedby,
                            m_objDisplayFactory: {
                                factory: app.genericfactory,   
                                type: 'BindingDisplay',
                                Plugins: [ { type: 'HoverPlugin', config: { m_objDisplay: app.sharehoverinfo } },
                                           { type: 'MenuPlugin', config: { m_objMenu: app.sharelevelmenu } },
                                           ExtraInfoDataPlugin ],
                                config: {
                                    m_strTemplate: 'Tag'
                                } // end config
                            } // end m_objDisplayFactory
                        } // end config
                    } // end m_objListDisplayFactory 
                  } // end config
                }, // end ShareWith config

                { type: 'NoteMetaTagListPlugin', config: 
                  {
                    m_strNoteID: in_strNoteID,
                    m_strInsertionPointSelector: 'elementOthersShareWithNames',
                    m_strHasTagsClassName: 'othersharenames',
                    m_bDeltaHeight: true,
                    m_objListDisplayFactory: { 
                        factory: app.genericfactory,
                        type: 'BindingsList',
                        config: {
                            m_strTemplate: 'tags',
                            m_objCollection: app.othersharedwith,
                            m_objDisplayFactory: {
                                factory: app.genericfactory,   
                                type: 'BindingDisplay',
                                Plugins: [ { type: 'HoverPlugin', config: { m_objDisplay: app.sharehoverinfo } },
                                           ExtraInfoDataPlugin ],
                                config: {
                                    m_strTemplate: 'Tag'
                                } // end config
                            } // end m_objDisplayFactory
                        } // end config
                    } // end m_objListDisplayFactory 
                  } // end config
                }, // end OthersShareWith config ,

                { type: 'NoteMetaTagListPlugin', config: 
                  {
                    m_strNoteID: in_strNoteID,
                    m_strInsertionPointSelector: 'elementAttachmentsNames',
                    m_strHasTagsClassName: 'attachments',
                    m_bDeltaHeight: true,
                    m_objListDisplayFactory: { 
                        factory: app.genericfactory,
                        type: 'BindingsList',
                        config: {
                            m_strTemplate: 'tags',
                            m_objCollection: app.attachments,
                            m_bEditable: true,
                            m_objDisplayFactory: {
                                factory: app.genericfactory,
                                type: 'BindingDisplay',
                                Plugins: [ { type: 'MenuPlugin', config: { m_objMenu: app.attachmentmenu } },
                                           { type: 'HoverPlugin', config: { m_objDisplay: app.attachmenthoverinfo } },
                                           ExtraInfoDataPlugin
                                 ],
                                config: {
                                    m_strTemplate: 'AttachmentTag'
                                } // end config
                            } // end m_objDisplayFactory
                        } // end config
                    } // end m_objListDisplayFactory 
                  } // end config
                }/*, // end Attachments config
                { type: 'NoteMetaTagListPlugin', config: 
                  {
                    m_strNoteID: in_strNoteID,
                    m_strInsertionPointSelector: 'elementCommentListContainer',
                    m_strHasTagsClassName: 'comments',
                    m_bDeltaHeight: true,
                    m_objListDisplayFactory: { 
                        factory: app.genericfactory,
                        type: 'CommentsList',
                        Plugins: [
						{ type: 'ButtonPlugin', config: {
							m_strSelector: 'elementMoreCommentsButton',
							m_strOnPressMessage: 'showall',
							m_bSendToPlugged: true
						} },
						{ type: 'ButtonPlugin', config: {
							m_strSelector: 'elementLessCommentsButton',
							m_strOnPressMessage: 'hideextras',
							m_bSendToPlugged: true
						} }
                        ],
                        config: {
                            m_strTemplate: 'Comments',
                            m_objCollection: app.comment,
							m_nDisplaysShown: 5,
                            m_bEditable: true,
							m_strListItemAreaSelector: 'elementCommentList',
                            m_objDisplayFactory: {
                                factory: app.genericfactory,
                                type: 'BindingDisplay',
                                Plugins: [ { type: 'MenuPlugin', config: { 
                                                m_objMenu: app.commentmenu,
                                                m_strButtonAttachmentSelector: 'elementCommentMenu'
                                           } },
                                           ExtraInfoDataPlugin,
										   { type: 'BindingDisplayCommentPlugin', config: { 
                                                m_strUserName: Ubernote.m_strUserName
                                           } }
                                 ],
                                config: {
                                    m_strTemplate: 'Comment'
                                } // end config
                            }
                        } // end config
                    } // end m_objListDisplayFactory 
                  } // end config
                } // end Attachments config
                */
           ];

        aobjPlugins.each( function( in_objItem ) {
            in_objPluginsList.push( in_objItem );
        } );
    },
    
    /**
    * _getEditorPlugins - get the standard plugins for an editor based note display.
    * @param {String} in_strNoteID - noteID for the note.
    * @param {Array} in_objPluginsList - Array to add plugins to.
    * @param {bool} in_CreateEditorOnInit - whether to create the editor on initialization.
    */
    _getEditorPlugins: function( in_strNoteID, in_objPluginsList, in_bCreateEditorOnInit )
    {
        Util.Assert( TypeCheck.String( in_strNoteID ) );
        Util.Assert( TypeCheck.Object( in_objPluginsList ) );
        Util.Assert( TypeCheck.Boolean( in_bCreateEditorOnInit ) );
        
        var aobjPlugins = [ 
            NoteSavePlugin, NoteActionsPlugin, NoteActionButtonsPlugin, 
            NoteShareInfoPlugin, /*NoteNiftyCornerPlugin,*/
            {   type: 'ExtraInfoDataPlugin',
                config: {
                    m_aobjLoadDataMessages: {
                        'loaddataobject': undefined,
                        'onsavecomplete': undefined,
                        'noterefreshupdatedate': Messages.all_publishers_id
                    }
            } },
			NoteDatesPlugin, NoteReadWriteStatusPlugin,
            NoteBooleanFlagsPlugin,
            {   type: 'NoteEditorPlugin',
                config: {
                        m_bCreateEditorOnInit: in_bCreateEditorOnInit,
                        m_strNoteID: in_strNoteID
                } // end config
            },/* 
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementCategories',
                m_objMenu: app.notecategoriesmenu
            } },
			*/
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementActions',
                m_strShowMenuMessage: 'requestactionsmenu',
                m_objMenu: app.noteactionsmenu
            } },/*
            { type: 'MenuPlugin', config: {
                m_strButtonAttachmentSelector: 'elementEmail',
                m_strShowMenuMessage: 'requestsharesmenu',
                //m_objMenu: app.notesharesmenu
				m_objMenu: app.notecontactsmenu
            } },
            { type: 'NoteTagsDropdownPlugin', config: 
              {
                m_objMenu: app.notecategoriesmenu,
				m_strCollectionID: 'tagged'
              } // end config
            },
            { type: 'NoteTagsDropdownPlugin', config: 
              {
                m_objMenu: app.notecontactsmenu,
				m_strCollectionID: 'sharedbyperuser'
              } // end config
            }, */            
			{ type: 'ButtonPlugin', config: {
                m_strSelector: 'elementTitle',
                m_strOnPressMessage: 'notededittitle'/*,
                m_bSendToPlugged: true*/
            } },
			{
                type: 'NoteTitlePopupPlugin',
                config: {
                    m_objPopup: app.generictextpopupbox
            } },
            { type: 'KeyListenerPlugin', config: {
            m_objKeys: {
  /* ALT-G 71 */   71:   { altKey: true, shiftKey: false, controlKey: false, message: 'requesttagsmenu' },
  /* ALT-A 65 */   65:   { altKey: true, shiftKey: false, controlKey: false, message: 'requestactionsmenu' },
  /* ALT-D 68 */   68:   { altKey: true, shiftKey: false, controlKey: false, message: 'requestsharesmenu' },
  /* CTRL-M 68 */  77:   { altKey: false, shiftKey: false, controlKey: true, message: 'notededittitle' }
            } } },
            { type: 'NoteLinkOpenPlugin', config: {
            } }
        ];
        
        aobjPlugins.each( function( in_objItem ) {
            in_objPluginsList.push( in_objItem );
        } );
    }
} );

