ExternalSourceIframeDisplay = (function() {
	"use strict";
	
	var ExternalSourceIframeDisplay = function()
	{
		this.m_bShown = undefined;
		this.m_bNiftyApplied = undefined;
		this.m_strSource = undefined;
		
		ExternalSourceIframeDisplay.Base.constructor.apply( this );
	};
	UberObject.Base( ExternalSourceIframeDisplay, DisplayAltConfig );

	Object.extend( ExternalSourceIframeDisplay.prototype, {

		RegisterMessageHandlers: function()
		{
			var me=this, all=Messages.all_publishers_id;
			
			me.RegisterListener( 'setsource', all, me.setSource );
			me.RegisterListener( 'setheader', all, me.setHeader );
			me.RegisterListener( 'focus', all, me.focus );
			me.RegisterListener( 'documentresize', all, me.onDocumentResize );
			
			ExternalSourceIframeDisplay.Base.RegisterMessageHandlers.apply( me, arguments );
		},

		RegisterDomEventHandlers: function()
		{
			var me=this;
			
			me.attachButton( 'elementCloseButton', me.hide );
			
			me.RegisterListener( 'onclick', me.$( 'elementTitlebar' ), me.OnTitlebarClick );
			
			ExternalSourceIframeDisplay.Base.RegisterDomEventHandlers.apply( me, arguments );
		},

		loadConfigParams: function()
		{
			ExternalSourceIframeDisplay.Base.loadConfigParams.apply( this );
			this.extendConfigParams( {
				m_strHeaderSelector: { type: 'string', bRequired: false, default_value: 'elementHeader' },
				m_bResizeOnDocumentResize: { type: 'boolean', bRequired: false, default_value: true }
			} );
		},

		/**
		* show - Show the iframe external source, setting the URL to the input
		* @param {String} in_strURL - URL to set as the source of the iframe.
		* @param {String} in_strHeader (optional) - Header to set.
		*/
		show: function( in_strURL, in_strHeader )
		{
			Util.Assert( TypeCheck.String( in_strURL ) );
			Util.Assert( TypeCheck.UString( in_strHeader ) );
			
			this.setSource( in_strURL );
			// Use &nbsp; so that the header still has width.
			this.setHeader( in_strHeader || '&nbsp;' );

			this.m_bShown = true;
	/*
			this.$().id = this.m_strMessagingID;
			if( window.Nifty && ! Nifty.csscorners && ! this.m_bNiftyApplied )
			{
				this.m_bNiftyApplied = true;
				Nifty( 'div#' + this.m_strMessagingID, 'top' );
			}        
			*/
			ExternalSourceIframeDisplay.Base.show.apply( this );
		},

		/**
		* setSource - Set the src attribute of the iframe.
		* @param {String} in_strURL - URL to set as the source of the iframe.
		*/
		setSource: function( in_strURL )
		{
			Util.Assert( TypeCheck.String( in_strURL ) );
			try {   // Every once in a while FF3 gives an error message doing this.
				var objIframe = this.$( 'elementContents' );
				this.m_strSource = objIframe.src = in_strURL;
			} // end try
			catch( e ) { /* do nothing */ }
		},
		
		/**
		* getSource - returns the currently set source.
		* @returns {String} - currently set source.
		*/
		getSource: function()
		{
			return this.m_strSource;
		},
		
		/**
		* hide - hide the iframe
		*/
		hide: function()
		{
			if( false !== this.m_bShown )
			{
				this.setSource( 'about:blank' );
				this.m_bShown = false;
				
				ExternalSourceIframeDisplay.Base.hide.apply( this );
			}
		},
		
		/**
		* setHeader - set the header of the iframe.
		*   Note - MUST be set after "show" or else will be erased.
		* @param {String} in_strHeader - text to display in the header.
		*/
		setHeader: function( in_strHeader )
		{
			Util.Assert( TypeCheck.String( in_strHeader ) );
			
			this.setChildHTML( this.m_strHeaderSelector, in_strHeader );
		},
		
		/**
		* OnTitlebarClick - called when the user clicks on the title bar
		*   cancels the event so that this does not cause the iframe
		*   to close.
		*/
		OnTitlebarClick: function( in_objEvent )
		{
			Util.Assert( TypeCheck.Object( in_objEvent ) );
			
			in_objEvent.cancelEvent();
		},
		
		/**
		* focus - focus the iframe window.
		*/
		focus: function()
		{
			this.$( 'elementContents' ).contentWindow.focus();
		},
		
		onDocumentResize: function( documentSize ) {
			// use elementContents because it is the iframe that contains the data and
			//	it's height is set to 100%
			if( this.m_bResizeOnDocumentResize ) {
				var top = this.$( 'elementContents' ).cumulativeOffset()[ 1 ];
				//this.setHeight( documentSize - top );
			}
		}
		
	} );
	
	return ExternalSourceIframeDisplay;
}() );