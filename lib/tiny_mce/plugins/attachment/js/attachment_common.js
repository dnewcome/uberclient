var AttachmentCommon = {
	insert : function(file) {
		var ed = tinyMCEPopup.editor, t = this;

		if (file === '') {
			if (ed.selection.getNode().nodeName == 'IMG') {
				ed.dom.remove(ed.selection.getNode());
				ed.execCommand('mceRepaint');
			}

			this._close();
			return;
		}
		t.insertAndClose(file);
	},

	insertAndClose : function(file) {
		var ed = tinyMCEPopup.editor, args = { src: file }, el;

		tinyMCEPopup.restoreSelection();

		// Fixes crash in Safari
		if (tinymce.isWebKit)
			ed.getWin().focus();
		el = ed.selection.getNode();

		if (el && el.nodeName == 'IMG') {
			ed.dom.setAttribs(el, args);
		} else {
			ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" />', {skip_undo : 1});
			ed.dom.setAttribs('__mce_tmp', args);
			ed.dom.setAttrib('__mce_tmp', 'id', '');
			ed.undoManager.add();
		}

		this._close();
	},
	
	_close : function()
	{
        // Do this in a timeout so MCE has time to finish the 
        //  initialization processing before we close
		setTimeout( function() { tinyMCEPopup.close(); }, 0 );
	}
};
