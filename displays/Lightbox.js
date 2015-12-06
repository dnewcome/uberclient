/**
* A Lightbox is a combination of a modal dialog and an external iframe.  It is an external iframe shown as
*	a modal
* @class Lightbox
* @extends ExternalSourceIframeDisplay
*/
Lightbox = (function() {
	"use strict";
	
	var Lightbox = function() {
		Lightbox.Base.constructor.apply( this );
	};
	
	UberObject.Base( Lightbox, ExternalSourceIframeDisplay );

	Object.extend( Lightbox.prototype, {
		init: function() {
			Lightbox.Base.init.apply( this, arguments );
			
			this.dialog = new ModalDialog( this.$() );
		},

		loadConfigParams: function() {
			Lightbox.Base.loadConfigParams.apply( this );
			this.extendConfigParams( {
				m_bResizeOnDocumentResize: { type: 'boolean', bRequired: false, default_value: false }
			} );
		},
		
		show: function() {
			var show = Lightbox.Base.show;
			show.apply( this, arguments );
			
			this.dialog.show();
		},
		
		hide: function() {
			Lightbox.Base.hide.apply( this, arguments );
			
			this.dialog.hide();
		}
	} );
	
	return Lightbox;
}() );