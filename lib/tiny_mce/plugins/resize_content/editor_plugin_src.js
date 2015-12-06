/**
 * $Id: editor_plugin_src.js 201 2008-02-26 
 *
 * @author Shane Tomlinson/Ubernote
 * @copyright Copyright © 2004-2008, Ubernote, All rights reserved.
 */

(function() {

	tinymce.create('tinymce.plugins.ConfigurableResize', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
		    var t=this;
		    // replace the editors resize to content.
		    ed.resizeToContent = t.resizeToContent;
		},
		
		/**
		 *  This will be run in the editors context.
		 *  Resizes the editor to the current contents width and content_height.
		 */
		resizeToContent : function( in_bOverrideResize ) {
 			var t = this, s = t.settings;
            var objContainer = t.getContainer();
            var objSizeContainer = $( t.dom.select( 'table', objContainer )[ 0 ] );
            
			var size = BrowserInfo.opera ? t.getBody().parentNode.clientHeight :
			    BrowserInfo.ie ? t.getBody().scrollHeight : t.getBody().offsetHeight;
			
			// content_resize_buffer - number of pixels to buffer at the bottom of 
			//  the screen.  The 15px is additional buffer so we don't wait until 
			//  the cursor is hidden before we resize.
            var content_height = size + s.content_resize_buffer + 10;

            // Find the original element size
            var frame_height = objSizeContainer.getHeight();
            
            if ('number' == typeof(s.content_resize_delta_height)) {   
                if (content_height > frame_height) // resize in steps
                    content_height += s.content_resize_delta_height;
                else if ((content_height) < (frame_height - s.content_resize_delta_height)) // do the shrink
                    true;
                else 
                    content_height = frame_height; // smaller, but not small enough to shrink
            }
            
            if (('number' == typeof(s.content_resize_max_height)) 
             && (content_height > s.content_resize_max_height)) {
                content_height = s.content_resize_max_height;
            }

            if (('number' == typeof(s.content_resize_min_height)) 
             && (content_height < s.content_resize_min_height)) {
                content_height = s.content_resize_min_height;
            } // end if

            if ('number' == typeof(s.fixed_height)) 
            {   // override it all.
                content_height = s.fixed_height;
            } // end if
                        
			// Calc difference between iframe and container
			var nDelta = objSizeContainer.clientHeight - t.contentAreaContainer.clientHeight;
            var nHeight = content_height - nDelta;

            tinymce.DOM.setStyle( t.contentAreaContainer, 'height', nHeight );
		    tinymce.DOM.setStyle( objSizeContainer, 'height', content_height);

            tinymce.DOM.setStyle( t.contentAreaContainer, 'width', '100%' );
		    tinymce.DOM.setStyle( objSizeContainer, 'width', '100%' );
        },
        

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Configurable Resize content plugin',
				author : 'Ubernote/Shane Tomlinson',
				authorurl : 'http://www.ubernote.com',
				infourl : 'http://www.ubernote.com',
				version : '0.1'
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('resize_content', tinymce.plugins.ConfigurableResize);
})();