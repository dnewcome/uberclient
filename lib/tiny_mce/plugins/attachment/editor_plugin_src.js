/**
 * $Id: editor_plugin_src.js
 *
 * @author Ubernote/Shane Tomlinson
 * @copyright Copyright © 2009, Ubernote.
 */

(function() {
	tinymce.create('tinymce.plugins.AttachmentPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceAttachment', function() {
				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
					return;

				ed.windowManager.open({
					file : url + '/attachment.aspx?noteID=' + ed._uberID,
					width : 480 + parseInt(ed.getLang('attachment.delta_width', 0)),
					height : 385 + parseInt(ed.getLang('attachment.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton( 'image', {
				title : 'advimage.image_desc',
				cmd : 'mceAttachment'
			});
		},

		getInfo : function() {
			return {
				longname : 'Inline Attachments',
				author : 'Ubernote/Shane Tomlinson',
				authorurl : 'http://www.ubernote.com/',
				infourl : 'http://www.ubernote.com/',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('attachment', tinymce.plugins.AttachmentPlugin);
})();