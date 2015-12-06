var AttachmentResponseDialog = {
	preInit : function() {
		tinyMCEPopup.requireLangPack();
	},
    
    insert : function() {
        var f = document.forms[0], value=f.src.value;
        AttachmentCommon.insert(value);
    }
};

AttachmentResponseDialog.preInit();
tinyMCEPopup.onInit.add(AttachmentResponseDialog.insert, AttachmentResponseDialog);
