/**
 * $Id: editor_plugin_src.js 201 2008-02-28 stomlinson
 *
 * @author Shane Tomlinson/Ubernote
 * @copyright Copyright © 2004-2008, Ubernote, All rights reserved.
 */

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('email');

	tinymce.create('tinymce.plugins.Email', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
			ed.addCommand('mceEmail', function() {
			    ed.onEmail.dispatch();
			});

			// Register email button
			ed.addButton('email', {
				title : 'email.desc',
				cmd : 'mceEmail'
			});
			
			ed.onEmail = new tinymce.util.Dispatcher(ed);
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Email plugin',
				author : 'Ubernote/Shane Tomlinson',
				authorurl : 'http://www.ubernote.com',
				infourl : 'http://www.ubernote.com',
				version : "0.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('email', tinymce.plugins.Email);
})();