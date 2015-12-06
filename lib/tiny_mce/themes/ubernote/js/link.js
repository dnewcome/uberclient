tinyMCEPopup.requireLangPack();

var LinkDialog = {
	preInit : function() {
		var url;

		if (url = tinyMCEPopup.getParam("external_link_list_url"))
			document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
	},

	init : function() {
		var f = document.forms[0], ed = tinyMCEPopup.editor;
		var selected_text = ed.selection.getContent( { format: 'text'} );
		
		// Setup browse button
		document.getElementById('hrefbrowsercontainer').innerHTML = getBrowserHTML('hrefbrowser', 'href', 'file', 'theme_advanced_link');
		if (isVisible('hrefbrowser'))
			document.getElementById('href').style.width = '180px';

		this.fillClassList('class_list');
		this.fillFileList('link_list', 'tinyMCELinkList');
		this.fillTargetList('target_list');

		if (e = ed.dom.getParent(ed.selection.getNode(), 'A')) {
			f.href.value = ed.dom.getAttrib(e, 'href');
			f.linktitle.value = ed.dom.getAttrib(e, 'title');
			f.insert.value = ed.getLang('update');
			selectByValue(f, 'link_list', f.href.value);
			selectByValue(f, 'target_list', ed.dom.getAttrib(e, 'target'));
			selectByValue(f, 'class_list', ed.dom.getAttrib(e, 'class'));
		} else if (selected_text) {
			f.href.value = LinkDialog.createUrlFromText(selected_text);
			f.linktitle.value = selected_text;
		}  		
	},

	update : function() {
		var f = document.forms[0], ed = tinyMCEPopup.editor, e, b;

		tinyMCEPopup.restoreSelection();
		e = ed.dom.getParent(ed.selection.getNode(), 'A');

		// Remove element if there is no href
		if (!f.href.value) {
			if (e) {
				tinyMCEPopup.execCommand("mceBeginUndoLevel");
				b = ed.selection.getBookmark();
				ed.dom.remove(e, 1);
				ed.selection.moveToBookmark(b);
				tinyMCEPopup.execCommand("mceEndUndoLevel");
				tinyMCEPopup.close();
				return;
			}
		}

		tinyMCEPopup.execCommand("mceBeginUndoLevel");

		// Create new anchor elements
		if (e == null) {
			ed.getDoc().execCommand("unlink", false, null);
			var container = ed.dom.create( 'div' );
			
            var anchor = ed.dom.create( 'a', {
						href : f.href.value,
						title : f.linktitle.value,
						target : f.target_list ? f.target_list.options[f.target_list.selectedIndex].value : null,
						'class' : f.class_list ? f.class_list.options[f.class_list.selectedIndex].value : null
					}, f.linktitle.value || ed.selection.getContent() || f.href.value );
			container.appendChild( anchor );
			ed.selection.setContent( container.innerHTML );
		} else {
			ed.dom.setAttribs(e, {
				href : f.href.value,
				title : f.linktitle.value,
				target : f.target_list ? f.target_list.options[f.target_list.selectedIndex].value : null,
				'class' : f.class_list ? f.class_list.options[f.class_list.selectedIndex].value : null
			});
			
		    // Don't move caret if selection was image
		    if (e.childNodes.length != 1 || e.firstChild.nodeName != 'IMG') {
			    ed.selection.select(e);
			    ed.selection.collapse(0);
			    tinyMCEPopup.storeSelection();
		    }
		}
        
        ed.focus();		
        
        tinyMCEPopup.execCommand("mceEndUndoLevel");
		tinyMCEPopup.close();
	},

	checkPrefix : function(n) {
		if (n.value && Validator.isEmail(n) && !/^\s*mailto:/i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_email')))
			n.value = 'mailto:' + n.value;

		if (/^\s*www./i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_external')))
			n.value = 'http://' + n.value;
	},

	fillFileList : function(id, l) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		l = window[l];

		if (l && l.length > 0) {
			lst.options[lst.options.length] = new Option('', '');

			tinymce.each(l, function(o) {
				lst.options[lst.options.length] = new Option(o[0], o[1]);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillClassList : function(id) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
			cl = [];

			tinymce.each(v.split(';'), function(v) {
				var p = v.split('=');

				cl.push({'title' : p[0], 'class' : p[1]});
			});
		} else
			cl = tinyMCEPopup.editor.dom.getClasses();

		if (cl.length > 0) {
			lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

			tinymce.each(cl, function(o) {
				lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillTargetList : function(id) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v;
        
		if (v = tinyMCEPopup.getParam('theme_advanced_link_targets')) {
		    lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');
		    lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('advanced_dlg.link_target_same'), '_self');
		    lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('advanced_dlg.link_target_blank'), '_blank');

			tinymce.each(v.split(','), function(v) {
				v = v.split('=');
				lst.options[lst.options.length] = new Option(v[0], v[1]);
			});
		} else 
		    dom.remove(dom.getParent(id, 'tr'));
	},
    
    createUrlFromText : function(link_text)
    {
        var url = '';
        if (link_text) {
            url = link_text;
            // Match the typical types.
            var protocol_list = 'http|https|ftp|ftps|telnet|ssh|scp|torrent|email';
            var protocol_regexp = new RegExp('^(?:'+protocol_list+')\:\/\/', 'gi');

            // We only want to check for the www|ftp, etc if we DON'T specify a protocol
            if (false === protocol_regexp.test(link_text)) {   
                var prefix = '^(?:(?:'+protocol_list+'\:\/\/)?(?:www|ftp|mail|gmail))';
                var prefix_regexp = new RegExp(prefix, 'gi');

                if (false === prefix_regexp.test(link_text))
                    url = 'www.' + url;

                // Do this here or else we get it www.http://
                url = 'http://' + url;
                
                // Match end of line, go for common ones.
                // Match domains, match common file extensions
                var tld_list = '\.(?:asp|aspx|cgi|cfm|htm|html|php|com|net|edu|org|us|gov|mil|tv|ar|au|br|ca|cl|cz|de|fr|mx|nz|pe|ru|se|uk|/)/*$';
                var tld_regexp = new RegExp(tld_list, 'mgi');
                if (false === tld_regexp.test(link_text))
                    url += '.com';
            } 
        } 
        return url;
    }
};

LinkDialog.preInit();
tinyMCEPopup.onInit.add(LinkDialog.init, LinkDialog);
