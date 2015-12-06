NoteText = (function() {

	var NoteText = function() {
		this.m_objEditor = undefined;
		
		NoteText.Base.constructor.call( this );
	};
	UberObject.Base( NoteText, Display );

	NoteText.nSingleNoteHackSize = 87;

	NoteText.initTinyMCE = function( in_fncCallback ) {
		NoteText.tinyMCEPlugins = 'paste,autolink,uievents,checkbox,resize_content,inlinepopups,save,attachment';
		
		if( 'undefined' != typeof( tinyMCE_GZ ) ) {   
			/**
			* we give tinyMCE a fake init to do because if 
			*   not it downloads the script synchronously.
			*/
			tinyMCE_GZ.init( { 
				plugins : NoteText.tinyMCEPlugins,
				themes : 'advanced', 	
				languages : 'en', 	
				disk_cache : true, 	
				debug : false 
			}, function() { NoteText.startTinyMCE( in_fncCallback ); } );
		}
		else {
			NoteText.startTinyMCE( in_fncCallback );
		}
	};

	NoteText.startTinyMCE = function( in_fncCallback ) {
		Util.Assert( tinyMCE, 'TinyMCE Library not loaded' );
		var fncInit = function( in_objEditor ) {
			Messages.RaiseForAddress( 'notedomready', in_objEditor.id, in_objEditor.id, [ in_objEditor ] );    
		};
		
		var fncBeforeRenderEditor = function( in_objEditor, in_objControlManager ) {
			Messages.RaiseForAddress( 'notebeforerender', in_objEditor.id, in_objEditor.id, 
				[ in_objEditor, in_objControlManager ], true );    
		};
		
		var fncSetupCallback = function( in_objEditor ) {
			in_objEditor.onInit.add( fncInit );
			
			in_objEditor.onBeforeRenderUI.add( fncBeforeRenderEditor );
		};
		
		var objSettings = {
			// General options
			constrain_menus: true,        // keeps the menus inside the browser window.
			mode : 'none',
			theme : 'advanced',
			setup : fncSetupCallback,
			entity_encoding: 'raw',
			content_resize_buffer: 20,
			content_resize_delta_height: 45,
			custom_undo_redo_levels: 10,
			doctype : '<!DOCTYPE html>', 
			process_html: false,
			gecko_spellcheck: true,
			strict_loading_mode: false,
			auto_reset_designmode : true,
			fix_list_elements: true,
			iframe_class: 'editor_iframe',  
			button_tile_map : true,
			theme_advanced_toolbar_location : 'top',
			theme_advanced_statusbar_location: 'none',
			theme_advanced_toolbar_align : 'left',
			theme_advanced_buttons1 : 'bold,italic,underline,|,bullist,numlist,checkbox,|,outdent,indent,|,link,unlink,image,|,hr,removeformat,|,save',
			theme_advanced_buttons2 : '',
			theme_advanced_buttons3 : '',
			theme_advanced_styles: '',
			content_css: 'stylesheets/NoteText.css',
			plugins : NoteText.tinyMCEPlugins,
			class_filter : function(cls, rule) {
				// block all auto-importing
					return false;
			},
			user_dom_events : { mousemove : 'onMouseMove' },
			force_br_newlines: false,
			force_p_newlines: true,
			tab_focus: undefined,
			convert_urls: false,    /* never ever convert URLS */
			relative_urls: false,
			submit_patch: false,
			add_form_submit_trigger: false,
			theme_advanced_resizing_use_cookie: false,
			width: '100%',
			cleanup_on_startup: true
		};
		tinyMCE.init( objSettings );
		NoteText.nEditors = 0;
		NoteText.bInitialized = true;
		if( in_fncCallback ) {
			in_fncCallback();
		}
	};

	Object.extend( NoteText.prototype, {
		loadConfigParams: function()
		{
			NoteText.Base.loadConfigParams.call( this );
			this.extendConfigParams( {
				m_bCreateEditorOnInit: { type: 'boolean', bRequired: false, default_value: true },
				m_bCreateEditorOnClick: { type: 'boolean', bRequired: false, default_value: false },
				m_bPlayWellWithOthers: { type: 'boolean', bRequired: false, default_value: true },
				m_strTemplate: { type: 'string', bRequired: false },        // We don't NEED a template for this
				m_bEditable: { type: 'boolean', bRequired: false, default_value: false }
			} );
		},
		
		init: function( in_objConfig )
		{
			Util.Assert( in_objConfig );
			
			this.m_bOverrideSave = false;
			this.m_nDeltaHeight = 42; // Hard coded for NoteBar right now.
			
			var vRetVal = this.initWithConfigObject( in_objConfig );
			return vRetVal;
		},
		
		childInitialization: function()
		{   
			var strID = this.m_objDomContainer.id = this.m_strMessagingID;
			
			NoteText.Base.childInitialization.call( this );

			if( true == this.m_bCreateEditorOnInit )
			{
				Timeout.setTimeout( this.prepareForEditing, 0, this );
			}
			else
			{
				this.m_bDomReady = true;
			}
		},

		RegisterMessageHandlers: function()
		{
			this.RegisterListener( 'notedomready', this.m_strMessagingID, this.OnDomReady );
			this.RegisterListener( 'notebeforerender', this.m_strMessagingID, this.OnBeforeRender ); 
			this.RegisterListener( 'noteprepareforediting', this.m_strMessagingID, this.prepareForEditing ); 
			
			NoteText.Base.RegisterMessageHandlers.call( this );
		},
		/*
		RegisterDomEventHandlers: function()
		{
			this.RegisterListener( 'click', this.$(), this.OnContainerClick );
			
			NoteText.Base.RegisterDomEventHandlers.call( this );
		},
	*/
		teardownDom: function() {
			Timeout.clearTimeout( this.m_objTextResizeTimer );
			Timeout.clearTimeout( this.m_objFocusTimeout );
			
			if( this.m_objEditor )
			{
				var strID = this.$().id;
				tinyMCE.execCommand( 'mceFocus', false, strID );         
				this._destroyEditor();
			}
			
			NoteText.Base.teardownDom.call( this );
		},
		
		/**
		* prepareForEditing - prepare the editor for editing - creates the tinyMCE editor.
		* @param {Boolean} in_bFocus (optional) - If true, focus the editor.  
		*   If not given, assumed true.
		* @returns {Boolean} true if editor created, false if previously created.
		*/
		prepareForEditing: function( in_bFocus ) {
			Util.Assert( TypeCheck.UBoolean( in_bFocus ) );
			
			var bRetVal = ! this.m_objEditor;
			
			if( true === bRetVal ) {
				Timeout.clearTimeout( this.m_objTextResizeTimer );

				if( ! NoteText.bInitialized ) {
					NoteText.initTinyMCE( function() { 
						this._addEditor( in_bFocus ); }.bind( this ) );
				}
				else {
					this._addEditor( in_bFocus );
				}
			
			}

			return bRetVal;
		},

		_addEditor: function( in_bFocus ) {
			tinyMCE.settings.auto_focus = ( false === in_bFocus ) ? '' : this.$().id;
			this._findDocumentSizeSettings( tinyMCE.settings );
			tinyMCE.settings.height = this.getHeight();
			
			this.m_objEditor = tinyMCE.execCommand( 'mceAddControl', 
				false, this.m_strMessagingID );
		},
		
		/**
		* _destroyEditor - Destroy the editor if it already exists.
		*/    
		_destroyEditor: function() {
			Util.Assert( TypeCheck.Object( this.m_objEditor ) );
			
			try 
			{   // Sometimes FF dies a horrible death when we try this.
				tinyMCE.remove( this.m_objEditor );
			} // end try
			catch ( e )
			{ // do nothing
			} // end try-catch
			
			this.m_objEditor = null;
		},
		
		OnBeforeRender: function( in_objEditor, in_objControlManager ) {   // Use this to keep track of which controls there are so we can add events to menu buttons.
			in_objControlManager.onAdd.add( this.OnControlCreated, this );
		},
			
		OnDomReady: function( in_objEditor ) {
			this.m_bDomReady = true;
			this.m_objEditor = in_objEditor;
			
			if( this.m_objEditor ) {   
				in_objEditor.onBeforeExecCommand.add( this.OnBeforeExecCommand, this );
				in_objEditor.onButtonPress.add( this.OnButtonPress, this );
				in_objEditor.onCheckBoxChange.add( this.OnEdited, this );
				in_objEditor.onClick.add( this.OnClick, this );
				in_objEditor.onContextMenu.add( this.OnContextMenu, this );
				in_objEditor.onDblClick.add( this.OnDblClick, this );
				in_objEditor.onExecCommand.add( this.OnExecCommand, this );
				in_objEditor.onKeyDown.add( this.OnKeyDown, this );
				in_objEditor.onKeyUp.add( this.OnKeyUp, this );
				in_objEditor.onMouseDown.add( this.OnMouseDown, this );
				in_objEditor.onMouseMove.add( this.OnMouseMove, this );
				in_objEditor.onMouseUp.add( this.OnMouseUp, this );
				in_objEditor.onNodeChange.add( this.OnNodeChange, this );
				in_objEditor.onBeforeSetContent.add( this.OnBeforeSetContent, this );
				in_objEditor.onSetContent.add( this.OnSetContent, this );
				
				in_objEditor.addShortcut( 'ctrl+l', 'Create Link', 'mceLink', in_objEditor );
				in_objEditor.addShortcut( 'tab', 'Tab', 'indent', in_objEditor );
				this.setID( this.m_strID );
				
				// Kill the save until we actually edit.
				this.setButtonEnabled( 'save', false );

				this.m_objDomContainer.parentNode.removeChild( this.m_objDomContainer );
				// Reset the parent DOM Container to be the editor, the editor does not replace
				//  the old dom element, but puts a new dom element as the old element's nextSibling.
				this.m_objDomContainer = $( in_objEditor.getContainer() );
			}

			// This forces us to re-calculate the delta height because IE sometimes isn't ready.
			try {
				Event.fire( window, 'resize' );
			}catch(e) {
				// IE9 blows up here when in IE7 mode.
			}
			// do this afterwards or we won't resize correctly.        
			if( TypeCheck.String( this.m_strSavedXML ) ) {
				this.setXML( this.m_strSavedXML, false );
				this.m_strSavedXML = null;
			}
			else {   // force a resize even if we don't set the text.
				this.resizeNoteArea( 0 );
			}
		},
		
		OnControlCreated: function( in_objControl, in_objControlManager ) {   // Eventually we'll be able to add the event!
			in_objControl.onPostRender.add( this.OnControlRender, this );
		},
		
		OnControlRender: function( in_objControl, in_objDOMElement ) {
			DOMElement.addClassName( in_objDOMElement, 'showWhenFocused' );
		},
		
		OnNodeChange: function() {
			this.resizeNoteArea( 0 );
		},

		/* When we have a new document height, we have to let the editor know */
		OnDocumentResize : function() {
			if( this.m_objEditor && this.m_objEditor.settings ) {
				this._findDocumentSizeSettings( this.m_objEditor.settings );
			}
			this.resizeNoteArea( 0 );
		},
		
		OnKeyDown: function( in_objEditor, in_objEvent ) {
			DOMEvent( in_objEvent );

			if( false == this.m_bEditable ) {
				// control, alt, and meta keys are generally related to the browser/OS, so
				// don't cancel these.
				// but still don't want to allow ctrl-x (cut) or ctrl-v(copy)
				if( ( in_objEvent.ctrlKey )
				 && ( ( KeyCode.X == in_objEvent.keyCode )
				   || ( KeyCode.V == in_objEvent.keyCode ) )
				 || ( ! ( in_objEvent.ctrlKey || in_objEvent.altKey || in_objEvent.metaKey ) ) )
				{
					in_objEvent.preventDefault();
				}
			}
			else {
				switch( in_objEvent.keyCode )
				{
					// Tab can't be added to the key shortcuts.  So, we have to listen for it here
					//  and add the indent or outdent.
					case KeyCode.TAB:
						this._processTab( in_objEvent );
						break;
					default:
						break;
				}        
			}
			// We have to apply the event because they will not be 
			//  automatically bubbled from within the IFRAME        
			DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
		},
		
		OnKeyUp: function( in_objEditor, in_objEvent ) {
			this.Raise( 'noteKeyUp', [ in_objEvent ], true );
			
			switch( in_objEvent.keyCode ) {
				case KeyCode.LEFT_ARROW:
				case KeyCode.UP_ARROW:
				case KeyCode.RIGHT_ARROW:
				case KeyCode.DOWN_ARROW:
				case KeyCode.PAGE_UP:
				case KeyCode.PAGE_DOWN:
				case KeyCode.END:
				case KeyCode.HOME:
				case KeyCode.INS:
				case KeyCode.CTL:
				case KeyCode.SHIFT:
				case KeyCode.ALT:
				case KeyCode.ESC:
					break;
				default: {
					this.OnEdited();
					break;
				}
			}
			// We have to apply the event because they will not be 
			//  automatically bubbled from within the IFRAME        
			DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
		},
		
		OnBeforeExecCommand: function( in_objEditor, in_strCommand, in_objUI, in_strValue, in_objOutput ) {
			if( false == this.m_bEditable ) {
				in_objOutput.terminate = true;
			}
		},
		
		OnButtonPress: function( in_objEditor, in_strCommand, in_strValue ) {
			Util.Assert( TypeCheck.String( in_strCommand ) );
			this.logFeature( in_strCommand.replace( /mce/gi, '' ) + ' button', 'button' );
		},
		
		OnExecCommand: function( in_objEditor, in_strCommand ) {
			Util.Assert( TypeCheck.String( in_strCommand ) );
			
			/**
			* Add to the top part of case statement if an exec command is called
			*   that should NOT trigger an edit.
			*/
			switch( in_strCommand ) {
				case 'mceOpenLinkNoteSearch':
				case 'mceAttachment':
					break;
				default:
					this.OnEdited();
					break;
			} 
		},
		
		/**
		* OnEdited - Enables the save button, raises the noteEditorEdited message.
		*/
		OnEdited: function()
		{   
			if( ( false == this.m_bOverrideSave )
			 && ( true == this.m_bEditable ) )
			{   // Update the save timer
			
				// keep track of whether editor is on
				//Comments.m_bEditorOn = true;

				this.Raise( 'noteEditorEdited' );
				this.setButtonEnabled( 'save', true );
			}
		},
		
		/**
		* OnSaveComplete - Disables the save button.
		*/
		OnSaveComplete: function() {
			this.setButtonEnabled( 'save', false );
		},

		OnContextMenu: function( in_objEditor, in_objEvent ) {
			DOMEvent( in_objEvent );
			if( true == this.m_bCancelContextMenu ) {
				in_objEvent.cancelEvent();
			}
		},

		OnMouseUp: function( in_objEditor, in_objEvent ) { 
			DOMEvent( in_objEvent );
			if ( Event.isLeftClick( in_objEvent ) ) {
				this.m_bLeftDown = false;
			}

			/* 
			* We have to check to make sure the app exists because there is a chance
			*   we hit trash and the app has closed down when we get here.
			*/
			if( app && app.drag && ( true == app.drag.dragging ) ) {
				DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
			}
			
		},    

		OnMouseMove: function( in_objEditor, in_objEvent ) { 
			if( app && app.drag && ( true == app.drag.dragging ) ) {
				DOMEvent( in_objEvent );
				DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
				in_objEvent.cancelEvent();
			}
		},    
			
		OnMouseDown: function( in_objEditor, in_objEvent ) {   
			DOMEvent( in_objEvent );
			
			// always reset this.
			this.m_bCancelContextMenu = false;
			
			// See if we clicked on a link with the CTRL key down.
			var strHref;
			if( true == in_objEvent.ctrlKey ) {
				this._openLinkAtEvent( in_objEvent );
			}
			else if ( Event.isLeftClick( in_objEvent ) ) {
				this.m_bLeftDown = true;
			} // end else-if
			else if( ( BrowserInfo.ie && ( 3 == in_objEvent.button ) )  // ie is special 3 = both.
				  || ( ( true == this.m_bLeftDown ) 
				   && ( Event.isRightClick( in_objEvent ) ) ) )
			{
				in_objEvent.cancelEvent();
				this.m_bCancelContextMenu = true;
				
				if( this.m_objEditor.last_bg_color )
				{
					this.m_objEditor.execCommand( 'HiliteColor', false, this.m_objEditor.last_bg_color );
				}
				else
				{
					this.m_objEditor.execCommand( 'mceBackColor', false, null );
				}
			}
			
		},
			
		OnContainerClick: function( in_objEvent ) {
			if( ! NoteText.bInitialized ) {
				NoteText.initTinyMCE();
			}
			
			this._openLinkAtEvent( in_objEvent );
/*
			if( ( true === this.m_bCreateEditorOnClick ) 
			 && ( true === this.m_bEditable ) ) {
				this.prepareForEditing();
			}
		*/
		},
		
		OnClick: function( in_objEditor, in_objEvent ) {   // pass it along.
			DOMElement.applyEvent( this.$(), in_objEvent );
		},
		
		/**
		* _openLinkAtEvent - attempt to open the link at the event
		*/
		_openLinkAtEvent: function( in_objEvent, in_bCancel ) {   
			this.Raise( 'noteEditorLinkOpen', [ in_objEvent ], true );
		},
		
		
		OnDblClick: function( in_objEditor, in_objEvent ) {   
			DOMEvent( in_objEvent );
			this._openLinkAtEvent( in_objEvent );
		},

		OnBeforeSetContent: function( in_objEditor, in_objSettings ) {  
			if( BrowserInfo.ie ) {   // IE has a big bug where it will not show an empty DIV within an editor.
				in_objSettings.content = in_objSettings.content.replace(/<p>(?:&nbsp;|\u00A0)<\/p>/g, '<p><br /></p>');
			}
		},
		
		OnSetContent: function( in_objEditor ) {   // when we set the content, give a bit of time before we try to resize.
			this.resizeNoteArea( 1500 );
		},
			
		/**
		* setXML - set the XML of the editor
		* @param {String} in_strXML - the XML to set the editor.
		* @param {Boolean} in_bKeepCursor (optional) - If true, replaces the cursor 
		*       into the same place.  Default to false.
		*/
		setXML: function( in_strXML, in_bKeepCursor ) {
			Util.Assert( TypeCheck.String( in_strXML ) );
			Util.Assert( TypeCheck.UBoolean( in_bKeepCursor ) );

			var strFunction = this.m_objEditor ? '_setXMLEditor' : '_setXMLDiv';
			
			// we have to strip out any scripts that may have made it this far!
			in_strXML = in_strXML.stripScripts();
			
			try {
				// Sometimes javascript code makes it through and blow things up
				this[ strFunction ]( in_strXML, in_bKeepCursor );
			} // end try
			catch ( e ) {
			   this.Raise( 'raiseerror', [ 'NoteTinyMCE.js:setXML', ErrorLevels.eErrorType.EXCEPTION,
					ErrorLevels.eErrorLevel.HIGH, 'could not load the contents of note' ] );
			} // end try-catch
		},
		
		_setXMLEditor: function( in_strXML, in_bKeepCursor ) {
			Util.Assert( this.m_objEditor );
			Util.Assert( TypeCheck.UBoolean( in_bKeepCursor ) );
			
			if( this.m_objEditor.setContent )
			{
				// override the save until we get the setcontent message.  this way 
				// we aren't saving as soon as we do the execCommand
				this.m_bOverrideSave = true;
				
				// Save the bookmark to put the cursor back where it was.
				if( true === in_bKeepCursor )
				{
					try 
					{
						var objBookmark = this.m_objEditor.selection.getBookmark( true );
					} catch (e)
					{   /* Sometimes FF3 blows it's top on this when adding a new note and 
						 * then trashing it before there was a document
						 */
						objBookmark = undefined;
					}
				}
				
				this.m_objEditor.setContent( in_strXML, { format: 'raw', initial: true } );

				if( ( true === in_bKeepCursor ) && objBookmark )
				{
					this.m_objEditor.selection.moveToBookmark( objBookmark );
				}
				
				// Clear the undo or else we go back to the old editor comments.
				this.m_objEditor.undoManager.clear();
				
				// Kill the save until we actually edit.
				this.setButtonEnabled( 'save', false );
				
				this.m_bOverrideSave = false;
			}
			else
			{   // editor not fully ready, save the XML until it is.  It'll get set when the
				// editor DOM is ready.
				this.m_strSavedXML = in_strXML;
			}
		},

		_setXMLDiv: function( in_strXML ) {
			this.$().update( in_strXML );

			// Give the content time to get in there before resizing it, needed for 
			//  IE7, FF3, Chrome, Safari.
			this.resizeNoteArea( 1500 );
		},
			
		/**
		* getXML - get the XML from the editor.
		* @returns {String} - return the XML as a string
		*/
		getXML: function() {
			var strRetVal = '';
			if( this.m_objEditor ) {   // default to saved content, editor in transition mode, then if the editor
				// is ready, use its content.
				strRetVal = this.m_strSavedXML;
				if( this.m_objEditor.getContent ) {
					strRetVal = this.m_objEditor.getContent().stripScripts();
				}
			}
			else {   // editor not instantiated, get it fromt he innerHTML
				strRetVal = this.$().innerHTML;
			}
			
			return strRetVal;
		},
		
		/**
		* setEditable - Make the editor editable.
		* @param {Boolean} in_bEditable - editable flag.
		*/
		setEditable: function( in_bEditable ) {
			Util.Assert( TypeCheck.Boolean( in_bEditable ) );
			
			this.m_bEditable = in_bEditable;
		},
		
		/**
		* focus - focus the editor
		*/
		focus: function() {
			var bRetry = true;
			if( this.m_objEditor ) {   // editor created, attempt focus
				bRetry = ! this._attemptEditorFocus();
			}
			else {   // editor wasn't created, create it, let auto-focus
				// take care of the rest.
				this.prepareForEditing();
				bRetry = false;
			}
			
			if( true === bRetry ) {   // retry until the focus function is ready.
				this.m_objFocusTimeout = Timeout.setTimeout( this.focus, 100, this );            
			}
			
		},

		/**
		* _attemptEditorFocus - attempt to focus the editor.
		* @returns {Boolean} returns true if successful, false otw.
		*/    
		_attemptEditorFocus: function() {
			var bRetVal = false;
			if( this.m_objEditor && this.m_objEditor.focus ) {
				this.m_objEditor.focus();
				this.m_objFocusTimeout = undefined;
				bRetVal = true;
			}
			return bRetVal;
		},
		
		/**
		* cancelFocus - If a focus timeout is pending, cancel it.
		*/
		cancelFocus: function() {
			if( this.m_objFocusTimeout ) {
				Timeout.clearTimeout( this.m_objFocusTimeout );
				this.m_objFocusTimeout = undefined;
			}
		},
		
	 
		/**
		* resizeNoteArea - resize the "body" area of the note.
		* @param {Number} in_nTimeout (optional) - 
		*/
		resizeNoteArea: function( in_nTimeout ) {   
			// We only have to resize one or the other because once we create an editor,
			//  we never destroy it.  Resize the div until we create the editor, and
			//  then resize the editor.
			var nTimeout = in_nTimeout || 50;
			
			// clear the old one, wait for the new.
			Timeout.clearTimeout( this.m_objTextResizeTimer );
			
			var strResize = '';
					
			if( this.m_objEditor ) {
				strResize = '_resizeEditor';
			}
			else {   
				// Reset the height so mozilla can do the resize properly.
				//this.$().style.height = '';
				strResize = '_resizeDiv';
			}
			
			this.m_objTextResizeTimer = Timeout.setTimeout( this[ strResize ], nTimeout, this );
		},
		
		_resizeEditor: function() {
			var editor = this.m_objEditor;
			if( editor.resizeToContent ) {            
				editor.resizeToContent();
			}
		},
		
		_resizeDiv: function() {
			// resize based on client size or 500px max height.
			var nHeight = 0;
			var nViewportHeight = document.viewport.getHeight() || document.body.clientHeight;
			if( false !== this.m_bPlayWellWithOthers )
			{   // Standard behavior.
				nHeight = Math.min( nViewportHeight - 250, 500, this.$().scrollHeight );
			}
			else
			{   // take up the entire screen.  Must be explicitly set.
				nHeight = nViewportHeight - this.m_nDeltaHeight - NoteText.nSingleNoteHackSize;
			}
			
			// Minimum height of the configured note size.
			nHeight = Math.max( Config.nMinimumNoteSize, nHeight );
			
			this.setHeight( nHeight );
		
		},

		_findDocumentSizeSettings: function( in_objSettings ) {
			Util.Assert( in_objSettings );
			
			var nViewportHeight = document.viewport.getHeight() || document.body.clientHeight;
			var bComments = !!this.$().up( '.comments' );
			var nDeltaHeight = bComments ? 0 : Util.AssignIfDefined( this.m_nDeltaHeight, 0 );
			
			if( Ubernote.m_bStandaloneEditor )
			{
				var nHeight = nViewportHeight - nDeltaHeight - ( bComments ? 100 : 12 );
				in_objSettings.fixed_height = nHeight;
			}
			else
			{
				if( this.m_bPlayWellWithOthers )
				{
					in_objSettings.content_resize_min_height = Config.nMinimumNoteSize;
					in_objSettings.content_resize_max_height = Math.min( nViewportHeight - nDeltaHeight - 150, 500 );
					in_objSettings.fixed_height = undefined;
				}
				else
				{
					var nHeight = Math.max( bComments 
											? Math.min( nViewportHeight - 150, 500 ) 
											: nViewportHeight - NoteText.nSingleNoteHackSize - nDeltaHeight,
										   Config.nMinimumNoteSize );
					in_objSettings.fixed_height = nHeight;
				}
			}
			
		},

		
		/**
		* loadOnDisplayMoved - returns whether the data needs reloaded if the display
		*   has been moved.
		* @returns {Boolean} true if data needs reloaded on move, false otw.
		*/
		loadOnDisplayMoved: function() {
			var bRetVal = ( ( false == BrowserInfo.ie )
						 && ( !!this.m_objEditor ) );
			return bRetVal;
		},
		
		/**
		* setID - set the ID of the editor.
		* @param {String} in_strID (optional) - ID to set.
		*/
		setID: function( in_strID ) {
			Util.Assert( TypeCheck.UString( in_strID ) );
			
			if( this.m_objEditor && in_strID )
			{
				this.m_objEditor._uberID = in_strID;
			}
			this.m_strID = in_strID;
		},
		
		/**
		* heightChanged - change the delta height
		* @param {Number} in_nDeltaHeight - height to change by, can be negative.
		*/
		heightChanged: function( in_nDeltaHeight ) {
			Util.Assert( TypeCheck.Number( in_nDeltaHeight ) );

			this.m_nDeltaHeight += in_nDeltaHeight;
			this.OnDocumentResize();
		},

		setDeltaHeight: function( in_nDeltaHeight ) {
			Util.Assert( TypeCheck.Number( in_nDeltaHeight ) );

			// We sometimes have a problem of the delta_height being 0
			//  or of being some obscenely large ( > 130 ) number.  So,
			//  as a hack, we are restricting it.
			if( in_nDeltaHeight > 0 ) {
				this.m_nDeltaHeight = in_nDeltaHeight;
				this.OnDocumentResize();
			}
		},
		
		/**
		* setButtonEnabled - set a menu button enabled.
		* @param {String} in_strButton - id of the button
		* @param {Boolean} in_bEnabled - enabled status of the button.
		*/
		setButtonEnabled: function( in_strButton, in_bEnabled ) {
			Util.Assert( TypeCheck.String( in_strButton ) );
			Util.Assert( TypeCheck.Boolean( in_bEnabled ) );
		
			if( this.m_objEditor && this.m_objEditor.controlManager ) {
				this.m_objEditor.controlManager.setDisabled( in_strButton, ! in_bEnabled );        
			}
		},
		
		/**
		* playWellWithOthers - sets whether this note is allowed to take up as much
		*   screen as possible or not.  If set to false, takes up as much screen real estate
		*   as is possible, if set to true, resize nicely.
		* @param {Boolean} in_bPlayWellWithOthers - says whether to play well with others.
		*/
		playWellWithOthers: function( in_bPlayWellWithOthers ) {
			Util.Assert( TypeCheck.Boolean( in_bPlayWellWithOthers ) );

			this.m_bPlayWellWithOthers = in_bPlayWellWithOthers;
			this.OnDocumentResize();
			this.resizeNoteArea( 0 );
		},
		
		_processTab: function( in_objEvent ) {
			Util.Assert( TypeCheck.Object( in_objEvent ) );
			
			if( ! in_objEvent.ctrlKey && ! in_objEvent.altKey ) {
				// the control-tab or alt-tab are normally associated with the 
				//  switch window in the OS.
				if( in_objEvent.shiftKey ) {   
					if( !BrowserInfo.gecko ) {
						this._detab();
					}
				}
				else {   // indent
					this._tab();
				}
				in_objEvent.cancelEvent();
			}
		},
		
		_tab: function() {
			var strInsertText = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
			var objSelection = this.m_objEditor.selection;
			
			objSelection.collapse( true );        
			objSelection.setContent( strInsertText );
		},
		
		_detab: function() {
			// Put \\u00A0 because Safari, Chrome, and Opera do not put them in their whitespace regexp.
			var strInsertRegExp = '(?:&nbsp;|\\s|\\u00A0)(?:&nbsp;|\\s|\\u00A0)(?:&nbsp;|\\s|\\u00A0)(?:&nbsp;|\\s|\\u00A0)(?:&nbsp;|\\s|\\u00A0)';
			var objSelection = this.m_objEditor.selection;
			
			var objBookmark = objSelection.getBookmark();

			objSelection.collapse( true );        
			// For the marker, have to put a _ as the content or else Safari, Opera and Chrome won't
			//  insert it.
			var strMarker = '<span id="uberSelect" >_</span>';
			// Put ? after the " because IE doesn't insert them.
			var strRegExp = '<span id="?uberSelect"?>_</span>';
			objSelection.setContent( strMarker );

			// Must use a timeout or else FF craps out and puts the bookmark in the wrong spot.
			Timeout.setTimeout( this._continueDetab, 0, this, [ strInsertRegExp, strRegExp, objBookmark ] );
		},
		
		_continueDetab: function( in_strInsertText, in_strMarker, in_objBookmark ) {
			Util.Assert( TypeCheck.String( in_strInsertText ) );
			Util.Assert( TypeCheck.String( in_strMarker ) );
			
			var objSelection = this.m_objEditor.selection;
			// get the parent node for W3C browsers who have the selection in the marker right now.
			// IE does things right.  This ensures we have the node we inserted into.
			var objNode = objSelection.getNode();
			if( objNode != document.body ) {
				objNode = objNode.parentNode;
			}
			var strHTML = objNode.innerHTML;
			var objTabRegExp = new RegExp( in_strInsertText + in_strMarker, 'gi' );
			var objMarkerRegExp = new RegExp( in_strMarker, 'gi' );
			
			// remove the tab we just marked if exists
			var strNewHTML = strHTML.replace( objTabRegExp, '' );
			
			if( strNewHTML != strHTML ) {   // We have to do the check before the objMarkerRegExp replace.
				in_objBookmark.start = Math.max( in_objBookmark.start - 6, 0 );
				if( TypeCheck.Defined( in_objBookmark.end ) ) {
					in_objBookmark.end = in_objBookmark.start;
				}
				else {
					in_objBookmark.length = 0;
				}
			}

			// remove the marker regardless
			strHTML = strNewHTML.replace( objMarkerRegExp, '' );
			objNode.innerHTML = strHTML;
			
			objSelection.moveToBookmark( in_objBookmark );
		}
	});

	return NoteText;

}());
