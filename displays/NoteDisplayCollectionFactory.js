function NotesDisplayCollectionFactory()
{
    NotesDisplayCollectionFactory.Base.constructor.apply( this, arguments );
};
UberObject.Base( NotesDisplayCollectionFactory, Factory );

Object.extend( NotesDisplayCollectionFactory.prototype, {
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
        var objConfig = this.getBaseConfig( in_strType );
        
        if( objConfig )
        {
            if( in_objAdditionalConfig )
            {
                Object.extend( objConfig.config, in_objAdditionalConfig );
            } // end if
            objRetVal = NotesDisplayCollectionFactory.Base.create.apply( this, [ objConfig ] );
        } // end if 
        
        return objRetVal;
    },

    /**
    * getBaseConfig - gets the base configuration object for 
    *    a given type and a noteID
    * @param {String} in_strType - type of display to create.
    * @returns {Object} - Base configuration object if valid type, undefined otw.
    */
    getBaseConfig: function( in_strType )
    {
        Util.Assert( TypeCheck.String( in_strType ) );
    
        var objRetVal = undefined;
        switch( in_strType )
        {
            case 'list':
                objRetVal = this._getListDisplayConfig();
                break;
            case 'expanded':
                objRetVal = this._getExpandedDisplayConfig();
                break;
            case 'singlenote':
                objRetVal = this._getExpandedDisplayConfig();
                objRetVal.config.m_strTemplate = 'NotesMainSingleNote';
                objRetVal.config.m_bHideDisplaysWhenUpdating = false;
                objRetVal.Plugins.push( { type: 'KeyListenerPlugin', config: { 
                // XXX We are going to have to change these for Webkit.
                m_objKeys: {
      /* CTRL-< 188 */   188:   { altKey: false, shiftKey: false, controlKey: true, message: 'setpreviouspage' },
      /* CTRL-> 190 */   190:   { altKey: false, shiftKey: false, controlKey: true, message: 'setnextpage' },
             /* ESC */    27:   { altKey: false, shiftKey: false, controlKey: false, message: 'back' } 
                }
                } } );

                break;
            default:
                Util.Assert( false, 'Invalid Display Type' );
                break;
        } // end switch.
        return objRetVal;
    },
    
    _getListDisplayConfig: function()
    {
   		var objConfig = {
            factory: app.genericfactory,
            type: 'NoteDisplayCollection',
            config: {
                m_strTemplate: 'NotesMainList',
                m_strListItemAreaSelector: 'elementDisplayArrayContainer',
                m_strNoteDisplayType: 'listview',
                m_bAttachDomOnInit: false
            },
            Plugins: [ /*{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strItemSelector: 'popuphoverarea',
                m_strMessage: 'show',
                m_strSendToAddress: app.sharenotedisplay.m_strMessagingID
            } },{
            *//* this cancels the show if it hasn't happened yet */
            /*type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_strItemSelector: 'popuphoverarea',
                m_strMessage: 'cancelshow',
                m_strSendToAddress: app.sharenotedisplay.m_strMessagingID
            } },{
            *//* this starts the hide timer if the show has happened */
            /*type: 'ListMouseEventPlugin', config: {
                m_bIgnoreHandled: false,
                m_strDOMEvent: 'mouseout',
                m_strItemSelector: 'popuphoverarea',
                m_strMessage: 'starthidetimer',
                m_strSendToAddress: app.sharenotedisplay.m_strMessagingID
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strItemSelector: 'checkbox',
                m_strMessage: 'addclassname',
                m_strArguments: '{#ITEMID}, showcheck'
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_bControlKey: true,    *//** a control key over the note will highlight the select checkbox **/
               /* m_strMessage: 'addclassname',
                m_strArguments: '{#ITEMID}, showcheck'
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',  
                *//** We have the ctrl key as null because we can let up on the ctrl key and still
                *   want to remove the classname 
                *//*
                m_bControlKey: null,
                m_strMessage: 'removeclassname',
                m_strArguments: '{#ITEMID}, showcheck'
            } },*/{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strItemSelector: 'important',
                m_strMessage: 'addclassname',
                m_strArguments: '{#ITEMID}, showstar'
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_bIgnoreHandled: false, /* set ignored handled because the above mouseout will get the handler first */
                m_strMessage: 'removeclassname',
                m_strArguments: '{#ITEMID}, showstar'
            } },{
            type: 'ListClassnamePlugin', config: {
            } },/*{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strMessage: 'registerdroptarget'
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_strMessage: 'unregisterdroptarget'
            } },{
            type: 'ListDragReceiverPlugin', config: {
                m_objDragService: app.drag,
                m_strMessage: 'requestnotetaggedadd'
            } },{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_strItemSelector: 'checkbox',
                m_strMessage: 'listitemclick',
                m_strArguments: '{#ITEMID}'
            } },*/{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_strItemSelector: 'important',
                m_strMessage: 'requestnotetogglestar',
                m_bItemIDAsSendToAddress: true
            } },/*{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_bControlKey: true,
                m_strMessage: 'selectlistitem'
            } },*/{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_strMessage: 'requestsinglenoteview',
                m_strArguments: '{#ITEMINDEX}'
            } }/*,{
            type: 'ListSelectionPlugin', config: {
                m_strListenMessage: 'listitemclick'
            } },{
            type: 'NoteDisplayCollectionCommandsPlugin', config: {
            } },{ 
            type: 'NoteDisplayCollectionTagsDropdownPlugin', config: {
                m_objTagsMenu: app.notecategoriesmenu,
                m_objNotesCollection: app.notes,
				m_strBindingCollectionID: 'tagged'
            } },{ 
            type: 'NoteDisplayCollectionTagsDropdownPlugin', config: {
                m_objTagsMenu: app.notecontactsmenu,
                m_objNotesCollection: app.notes,
				m_strBindingCollectionID: 'sharedbyperuser'
            } },*//*{ 
            type: 'ButtonPlugin', config: { 
               m_strSelector: 'elementSelectAll',
               m_strOnPressMessage: 'selectallnotes'
            } },{ 
            type: 'ButtonPlugin', config: { 
               m_strSelector: 'elementSelectNone',
               m_strOnPressMessage: 'unselectallnotes'
            } },{ 
            type: 'ButtonPlugin', config: { 
               m_strSelector: 'elementTrashSelected',
               m_strOnPressMessage: 'trashselectednotes'
            } },{
            type: 'ButtonPlugin', config: { 
               m_strSelector: 'elementSelectOpen', 
               m_strOnPressMessage: 'showselectednotes'
            } }, {
            type: 'MenuPlugin', config: { 
                m_objMenu: app.listviewcommandsmenu,
                m_strButtonAttachmentSelector: 'elementCommandsMenu' 
            } }, {
            type: 'MenuPlugin', config: { 
                m_objMenu: app.notecontactsmenu,
                m_strButtonAttachmentSelector: 'elementShareMenu' 
            } }, {
            type: 'MenuPlugin', config: { 
                m_objMenu: app.notecategoriesmenu,
                m_strButtonAttachmentSelector: 'elementTagsMenu' 
            } }, {
            type: 'KeyListenerPlugin', config: { 
                m_objKeys: {
       */  /* DEL *//*  46: [ { altKey: false, shiftKey: false, controlKey: false, message: 'trashselectednotes' }, 
                          { altKey: false, shiftKey: true, controlKey: false, message: 'untrashselectednotes' },
                          { altKey: true,  shiftKey: true, controlKey: true, message: 'deleteselectednotes' } ],
         *//* A */   /* 65: [ { altKey: false, shiftKey: false, controlKey: false, message: 'selectallnotes' }, 
                          { altKey: false, shiftKey: true, controlKey: false, message: 'unselectallnotes' } ],
        */ /* E */  /*  69:   { altKey: false, shiftKey: false, controlKey: false, message: 'showselectednotes' },  
       */  /* H */  /*  72: [ { altKey: false, shiftKey: false, controlKey: false, message: 'hiddenselectednotes' }, 
                          { altKey: false, shiftKey: true, controlKey: false, message: 'unhiddenselectednotes' } ],
        */ /* I */  /*  73: [ { altKey: false, shiftKey: false, controlKey: false, message: 'starselectednotes' }, 
                          { altKey: false, shiftKey: true, controlKey: false, message: 'unstarselectednotes' } ]
                }
            } }
			*/
            ]
		};
        return objConfig;
    },

    _getExpandedDisplayConfig: function()
    {
   		var objConfig = {
            factory: app.genericfactory,
            type: 'NoteDisplayCollection',
            config: {
                m_strTemplate: 'NotesMain',
                m_strListItemAreaSelector: 'elementDisplayArrayContainer',
                m_strNoteDisplayType: 'fulleditor',
                m_bAttachDomOnInit: false
            },
            Plugins: [ 
            /*{ 
            type: 'ListMouseEventPlugin', config: { 
               m_strDOMEvent: 'onclick',
               m_strItemSelector: 'elementAddComment',
               m_strMessage: 'addcommentshow',
               m_bIgnoreHandled: false
            } },*/{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'onclick',
                m_strMessage: 'forcefocus',
                m_bItemIDAsSendToAddress: true
            } },/*{
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_strMessage: 'registerdroptarget'
            } }, {
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_strMessage: 'unregisterdroptarget'
            } }, {
            type: 'ListDragReceiverPlugin', config: {
                m_objDragService: app.drag,
                m_strMessage: 'requestnotetaggedadd'
            } },*/ {
            type: 'ListClassnamePlugin', config: {
            } },/* {
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseout',
                m_bIgnoreHandled: false,
                m_strItemSelector: 'elementAddComment',
                m_strMessage: 'removeclassname',
                m_strArguments: '{#ITEMID}, commentbuttonhighlight'
            } }, {
            type: 'ListMouseEventPlugin', config: {
                m_strDOMEvent: 'mouseover',
                m_bIgnoreHandled: false,
                m_strItemSelector: 'elementAddComment',
                m_strMessage: 'addclassname',
                m_strArguments: '{#ITEMID}, commentbuttonhighlight'
            } }, */{ 
            type: 'ListMouseEventPlugin', config: { 
               m_strDOMEvent: 'mousedown',
			   m_bStopPropagation: true,	/* Makes it so we can highlight comments */
               m_strMessage: 'ignoredmessage',
               m_bIgnoreHandled: false
            } }
        ]
		};
        return objConfig;
    }
} );
