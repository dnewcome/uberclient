/**
 * $Id: editor_plugin_src.js 201 2008-02-28 stomlinson
 *
 * @author Ubernote/Shane Tomlinson
 * @copyright Copyright © 2004-2008, Ubernote, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.UIEvents', {
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
            ed.onBeforeRenderUI.add(t.updateControlManager, t);
	    },
	    
	    updateControlManager : function(ed, cm) {
	        var t=this;
		    ed.onButtonPress = new tinymce.util.Dispatcher(ed);
		    ed.onMenuSelect = new tinymce.util.Dispatcher(ed);

		    // save off the old copies, create new copies
		    cm._createDropMenu = cm.createDropMenu;
            cm.createDropMenu = t.createDropMenu;

            cm._createListBox = cm.createListBox;
            cm.createListBox = t.createListBox;

		    cm._createButton = cm.createButton;
            cm.createButton = t.createButton;
            
            cm._createSplitButton = cm.createSplitButton;
            cm.createSplitButton = t.createSplitButton;

            cm._createColorSplitButton = cm.createColorSplitButton;
            cm.createColorSplitButton = t.createColorSplitButton;
            
		},
		
		/**
		 * Creates a drop menu control instance by id.
		 *
		 * @param {String} id Unique id for the new dropdown instance. For example "some menu".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createDropMenu : function(id, s) {
		    var t=this, ed = t.editor;
		    
		    if(s.onclick)
		        s._onclick = s.onclick;
		        
			s.onclick = function(v) {
				// Dispatch the event perss to the world.
				ed.onMenuSelect.dispatch(ed, s.cmd, s.value);

			    if(s._onclick)  // v is the value.
			        s.onclick.call(s.scope, v);
                else
                    ed.execCommand(s.cmd, s.ui || false, s.value);
            };
			return t._createDropMenu(id, s);		
		},
		
		/**
		 * Creates a list box control instance by id. A list box is either a native select element or a DOM/JS based list box control. This
		 * depends on the use_native_selects settings state.
		 *
		 * @param {String} id Unique id for the new listbox instance. For example "styles".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createListBox : function(id, s) {
		    var t=this, ed = t.editor;

	        if(s.onselect)
	            s._onselect = s.onselect;
	            
			s.onselect = function(v) {
			    var retval;
				ed.onMenuSelect.dispatch(ed, s.cmd, v || s.value);
				// direct call with the value but caller uses return value for additional processing.
			    if(s._onselect)  
			        retval = s._onselect.call(s.scope, v);
                else
    				retval = ed.execCommand(s.cmd, s.ui || false, v || s.value);
                
                return retval;
			};
			return t._createListBox(id, s);
		},		
		
		/**
		 * Creates a uievents control instance by id.  This replaces the createButton
		 *  of the controlManager
		 *
		 * @param {String} id Unique id for the new uievents instance. For example "bold".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */		
		createButton : function(id, s) {
		    var t=this, ed = t.editor;
		    
		    if(s.onclick)
		        s._onclick = s.onclick;
		        
			s.onclick = function(e) {
				// Dispatch the uievents press to the world.
				ed.onButtonPress.dispatch(ed, s.cmd, s.value);

				if(s._onclick)    // button uses direct call and passes event.
				    s.onclick.call(s.scope, e);
				else
    				ed.execCommand(s.cmd, s.ui || false, s.value);
			};
			return t._createButton(id, s);
		},

		/**
		 * Creates a split button control instance by id.
		 *
		 * @param {String} id Unique id for the new split button instance. For example "spellchecker".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSplitButton : function(id, s) {
		    var t=this, ed = t.editor;

            if(s.onclick)
                s._onclick = s.onclick;
                
			s.onclick = function(v) {
				ed.onButtonPress.dispatch(ed, s.cmd, v || s.value);

				if(s._onclick)    // split button uses direct call.
				    s.onclick(v);
				else
    				ed.execCommand(s.cmd, s.ui || false, v || s.value);
			};

            if(s.onselect)
                s._onselect = s.onselect;

			s.onselect = function(v) {
				ed.onMenuSelect.dispatch(ed, s.cmd, v || s.value);

			    if(s._onselect)
			        true;       // XXX DO SOMETHING
			    else
    				ed.execCommand(s.cmd, s.ui || false, v || s.value);
			};

			return t._createSplitButton(id, s);
		},
		
		/**
		 * Creates a color split button control instance by id.
		 *
		 * @param {String} id Unique id for the new color split button instance. For example "forecolor".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */		
		createColorSplitButton : function(id, s) {
		    var t=this, ed = t.editor;

            if(s.onclick)
                s._onclick = s.onclick;
                
			s.onclick = function(v) {
				ed.onButtonPress.dispatch(ed, s.cmd, v || s.value);

				if(s._onclick)    // split button uses direct call.
				    s.onclick(v);
				else
				    ed.execCommand(s.cmd, s.ui || false, v || s.value);
			};

            if(s.onselect)
                s._onselect = s.onselect;

			s.onselect = function(v) {
				ed.onMenuSelect.dispatch(ed, s.cmd, v || s.value);

			    if(s._onselect)
			        true;       // XXX DO SOMETHING
			    else
    				ed.execCommand(s.cmd, s.ui || false, v || s.value);
			};

			return t._createColorSplitButton(id, s);
		},
		
		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'UIEvents plugin',
				author : 'Ubernote/Shane Tomlinson',
				authorurl : 'http://www.ubernote.com',
				infourl : 'http://www.ubernote.com',
				version : "0.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('uievents', tinymce.plugins.UIEvents);
})();