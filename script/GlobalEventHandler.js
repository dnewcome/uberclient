/**
* Register window level events and container for global handlers
*/

GlobalEventHandler = (function() {
	"use strict";
	
	var GlobalEventHandler = function()
	{
		this.bValidLogout = false;
		
		GlobalEventHandler.Base.constructor.apply( this );
	};
	UberObject.Base( GlobalEventHandler, UberObject );

	Object.extend( GlobalEventHandler.prototype, {
		init: function( in_objConfig )
		{
			return this.initWithConfigObject( in_objConfig );
		},
		
		RegisterMessageHandlers: function()
		{	
			this.RegisterListener( 'onmousedown', document.body, this._mouseDown );
			this.RegisterListener( 'onmouseover', document, this._userInput );
			this.RegisterListener( 'onclick', document, this._bodyClick );
			this.RegisterListener( 'onkeyup', document.body, this._keyCommandHandler );
			this.RegisterListener( 'noteKeyUp', Messages.all_publishers_id, this._keyCommandHandler );
			this.RegisterListener( 'resize', window, this._resize );

			this.RegisterListener( 'notesave', Messages.all_publishers_id, this._userInput );
			this.RegisterListener( 'validlogout', Messages.all_publishers_id, this._validLogout );
			this.RegisterListener( 'noteemail', Messages.all_publishers_id, this._noteEmail );
			this.RegisterListener( 'requestnoteexternal', Messages.all_publishers_id, this.requestNoteExternal );

			if( Config.bBrowseAwayWarning ) 
			{
				// Have to do this directly on the window or else Safari/Chrome to not listen for it.
				var me=this;
				window.onbeforeunload = function( in_objEvent ){ me._checkClose( in_objEvent ); };
			} // end if

			// attach a global error handler
			window.onerror = Util.OnJavascriptError;
			GlobalEventHandler.Base.RegisterMessageHandlers.apply( this, arguments );
		},
		
		teardown: function()
		{
			window.onbeforeunload = null;
			window.onerror = null;
			window.onload = null;
			
			GlobalEventHandler.Base.teardown.apply( this, arguments );
		},
		
		/**
		* Event handler for keyboard commands at the application level
		*/
		_keyCommandHandler: function( event )
		{	
			this._userInput();
			// CHECK OUT THESE KEYCODES!
			switch ( event.keyCode )
			{
				case KeyCode.N :
					if( event.altKey == true )
					{
						// Don't need to cancel default action using alt-n, just if ctl-n
						// this.parentWindow.event.returnValue = false;
						this.Raise( 'requestnewnote' );
					}
					break;	        
				case KeyCode.D :
					if( event.ctrlKey == true && event.shiftKey == true )
					{
						// null returned if we cancel
						var debugUrl = prompt( 'Enter URL:' );
						
						if( debugUrl )
						{
							Util.launchDebugPage( debugUrl );
						} // end if
					}
					break;
				case KeyCode.ESC :
				{   
					// if the external page is open, hide that, otherwise hit "back"
					if( 'none' != app.externalpage.$().getStyle( 'display' ) )
					{
						this.RaiseForAddress( 'hide', 'externalpage' );
					} // end if
					break;
				}
			}  // end switch
		},
		
		/**
		* Event handler for clicks that reach the application level
		* @param event pass event in for firefox compatibility
		* HACK: we need to explicitly name `app' here.. maybe should use events? 
		*/
		_bodyClick: function( event )
		{	
			this._userInput();
			if( ( true === Ubernote.m_bFullApp ) 
			 && ( app.externalpage )
			 && ( app.externalpage.m_strMessagingID ) )
			{
				this.RaiseForAddress( 'hide', app.externalpage.m_strMessagingID );
			} // end if
			
			this.Raise( 'close', undefined, true );
		},
			
		/**
		* catch browser close and browse away event
		*/
		_checkClose: function( in_objEvent )
		{
			//alert( 'unloading' );
			// just setting the return value to an empty space will show the popup in IE and FF
			if( ( true === Ubernote.m_bFullApp ) 
			 && ( ! this.bValidLogout ) )
			{
				var objEvent = in_objEvent || event || window.event;
				objEvent.returnValue = ' ';
				if( BrowserInfo.webkit )
				{   // fix for Safari.
					return ' ';
				} // end if        
			} // end if
		},
		
		_validLogout: function()
		{
			this.bValidLogout = true;
		},

		_userInput: function()	
		{
			this.Raise( 'resetinactivytimeout' );		
		},

		/**
		* adjusts the size of the container when the browser is resized	
		*/
		_resize: function()	
		{	
			var nDocumentHeight = getWindowHeight();
			this.Raise( 'documentresize', [ nDocumentHeight ] );
		},
		
		_noteEmail: function()
		{
			app.showMessage( _localStrings.NOTE_SENT, 'ok' );
		},
		
		/**
		* requestNoteExternal - load a note up in an external window.
		* @param {String} in_strNoteID - NoteID to display.
		*/
		requestNoteExternal: function( in_strNoteID )
		{
			Util.Assert( TypeCheck.String( in_strNoteID ) );
			
			Util.openWindow( 'StandaloneEditor.aspx?noteid=' + in_strNoteID );
		},
		
		/**
		* _mouseDown - cancel the event to keep us from highlighting everything.
		*/
		_mouseDown: function( in_objEvent )
		{
			// This prevents us from highlighting everything, but we cannot 
			//	cancel mousedown on an input box or else it never focuses.
			if( !/input|textarea/i.test( in_objEvent.target.tagName ) )
			{
				in_objEvent.preventDefault();
			} // end if
		}

	} );

	function getWindowHeight() {
		var height = Util.getWindowSize().height;
		return height;
	}
	
	return GlobalEventHandler;
}() );