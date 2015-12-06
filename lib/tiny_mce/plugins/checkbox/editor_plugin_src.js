/**
 * $Id: editor_plugin_src.js 201 2008-02-28 shane tomlinson
 *
 * @author Shane Tomlinson/Ubernote
 * @copyright Copyright © 2008, Ubernote, All rights reserved.
 */

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('checkbox');

	tinymce.create('tinymce.plugins.Checkbox', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
		    var t=this, editor=t.editor=ed;
			ed.addCommand('mceCheckbox', function() {
			    // do work here.
			    t.createContent();
			});
			
			ed.onClick.add(t.OnClick, t);
            ed.onCheckBoxChange = new tinymce.util.Dispatcher(ed);
            
			// Register button
			ed.addButton('checkbox', {
				title : 'checkbox.desc',
				cmd : 'mceCheckbox',
                'class': 'elementUncheck'
			});
            
            ed.onPreInit.add( this.editorPreInit, this );
            ed.onNodeChange.add( this.updateButton, this );
		},
        
        editorPreInit: function(ed)
        {   
            // We use these functions to override/add status to the checkbox and list buttons.
            
            // We have to do this on editor pre-init because on plugin creation, 
            // the EditorCommands are not created.  We are overriding this command
            //  so that the unordered list button doesn't highlight whenever we are in
            //  a checkbox list.  We are saving these instead of directly overriding them
            //  because we still want to use them!
            ed.editorCommands._queryStateInsertUnorderedList = ed.editorCommands.queryStateInsertUnorderedList;
            ed.editorCommands.queryStateInsertUnorderedList = this.queryStateInsertUnorderedList;
            
            ed.editorCommands._origQueryStateOutdent = ed.editorCommands.queryStateOutdent;
            ed.editorCommands.queryStateOutdent = this.queryStateOutdent;
            
            // hook up our button.
            ed.addQueryStateHandler('mceCheckbox', this.queryStateInsertCheckboxList, ed.editorCommands);
            ed.editorCommands.queryStateInsertCheckboxList = this.queryStateInsertCheckboxList;
        },
        
        queryStateOutdent: function()
        {
            return this.queryStateInsertCheckboxList() || this._origQueryStateOutdent();
        },
        
        queryStateInsertUnorderedList: function()
        {   // this runs in the context of the tinyMCE.EditorCommands
            var ed=this.editor;
            var node = ed.selection.getNode();
            var parentULNode = ed.dom.getParent(node, 'UL');
            return ((parentULNode) && (!ed.dom.hasClass(parentULNode, 'uberCheckboxList')));
        },
        
        queryStateInsertCheckboxList: function()
        {   // this runs in the context of the tinyMCE.EditorCommands
            var ed=this.editor;
            var node = ed.selection.getNode();
            var parentULNode = ed.dom.getParent(node, 'UL');
            return ((parentULNode) && (ed.dom.hasClass(parentULNode, 'uberCheckboxList')));
        },
      
        updateButton: function(ed, cm, n, co) {
            var c;
			if (c = cm.get('checkbox')) {
			    var checkbox = ed.editorCommands.queryStateInsertCheckboxList ? 
			        ed.editorCommands.queryStateInsertCheckboxList.call( this ) : false;
				c.setActive(checkbox);
			}            
        },
        
        createContent: function()
        {
            var t=this, ed=t.editor, content=ed.selection.getContent();
            var insertion_html=t._convertToList(content, 'checkboxUnselected');
            
            insertion_html = '<ul id="uberSelect" class="uberCheckboxList">'+insertion_html+'</ul>';

            ed.selection.setContent(insertion_html);
            // Give us time to insert, then look for the element and select it.
            setTimeout( function() { t.createContentContinuation(); }, 100 );
        },
        
        createContentContinuation: function()
        {
            var t=this, ed=t.editor, doc=ed.getDoc();
            var node=doc.getElementById( 'uberSelect' );
            
            if(node) {
                // clear the ID so we can reuse it.  Then select the node
                // or it's contents in W3C compatible browsers.
                node.id='';
                ed.selection.select(node, true);
            } 
            
            ed.nodeChanged();
            ed.onCheckBoxChange.dispatch();
        },
        
        OnClick: function(ed, event)
        {
            var t=this, node = DOMEvent(event).target;
     
            if ((true == t._isCheckboxElement(node))
             && (true == t._clickedOnCheckbox(event)))
            {
                if (true == ed.dom.hasClass(node, 'checkboxSelected')) {
                    ed.dom.addClass(node, 'checkboxUnselected');
                    ed.dom.removeClass(node, 'checkboxSelected');
                } else {
                    ed.dom.addClass(node, 'checkboxSelected');
                    ed.dom.removeClass(node, 'checkboxUnselected');
                } // end if-else
                ed.nodeChanged();
                ed.onCheckBoxChange.dispatch();
            }
        },

        _isCheckboxElement: function(element)
        {
            var ret_val = ((true == DOMElement.isTagType(element, 'li'))
             && (true == DOMElement.ancestorHasClassName(element, 'uberCheckboxList'))); 
            return ret_val;
        },
        
        _clickedOnCheckbox: function(event)
        {
            // The basic idea is this, get the item we clicked on, get the left-padding size.
            //  Find where we clicked on the document.
            //  Find where the element is on the document.
            //  See if the click is inside the lefthand border of the element + it's padding.
            var t=this, ed=t.editor;
            var ret_val = false;
            var list_item = event.target;
            var margin_width = parseInt(ed.dom.getStyle(list_item, 'margin-left'), 10) || 20;
            var element_pos = Position.cumulativeOffset(list_item);  
            var event_pos = Event.pointer(event);
            
            ret_val = ((event_pos.x >= (element_pos[0] - margin_width))
                     && (event_pos.x <= element_pos[0]));
            
            return ret_val;
        },
        
        _convertToList: function(in_strHTML, item_classname)
        {
            Util.Assert(TypeCheck.String(in_strHTML));
            var t=this, ed=t.editor;
            var list_html = in_strHTML.replace(/[\r\n]+/gi, '');                     // newlines
            list_html = list_html.replace(/<br[^>]*>/gi, '<MCE_LI>');
            list_html = list_html.replace(/<li[^>]*>(&nbsp;)+<\/li>/gi, '');    // <LI>'s that only have spaces. get rid of extra info
            list_html = list_html.replace(/<li[^>]*>[\t ]+<\/li>/gi, '');    // <LI>'s that only have spaces. get rid of extra info
            list_html = list_html.replace(/<li[^>]*>/gi, '<MCE_LI>');           // reformat any old list items to remove class info.
            list_html = list_html.replace(/<\/li>/gi, '');                      // 
            list_html = list_html.replace(/<p[^>]*><\/p>/gi, '');               // empty <P>'s
            list_html = list_html.replace(/<p[^>]*>(&nbsp;)+<\/p>/gi, '');      // <P>'s that only have spaces. get rid of extra info
            list_html = list_html.replace(/<p[^>]*>[\t ]+<\/p>/gi, '');         // <P>'s that only have whitespace. get rid of extra info
            list_html = list_html.replace(/<p[^>]*>/gi, '<MCE_LI>');
            list_html = list_html.replace(/<\/p>/gi, '');

            if(!list_html) // Give our list item SOMETHING to display
                list_html = ed.translate('checkbox.insert_item');
            
            var item_html = '<li>';
            if(item_classname)
                item_html = '<li class="'+ item_classname +'">';
            
            list_html = item_html + list_html.replace(/<MCE_LI>/g, '</li>'+item_html)+ '</li>';
            list_html = list_html.replace(/<li[^>]*><\/li>/g, '');                 // finally, any empty li's. (the first one may be empty)
            
            return list_html;
        },

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Selectable Checkbox',
				author : 'Ubernote/Shane Tomlinson',
				authorurl : 'http://www.ubernote.com',
				infourl : 'http://www.ubernote.com',
				version : "0.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('checkbox', tinymce.plugins.Checkbox);
})();