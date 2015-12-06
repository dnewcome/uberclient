/**
* Using two form elements, a filename, and a URL, a filename takes precedence over the URL, 
*   but only if it is valid.  If invalid, check the URL, if URL is valid submit that to
*   the insertion function and close the window.  If Filename is valid, call AttchmentAdd
*   web service with the attachment_response.aspx as the redirectURL.  This then inserts
*   the image into the note and closes the window.
*/
var AttachmentDialog = {
    INVALID: 0,
    FILE: 1,
    URL: 2,
    MAX_FILE_SIZE: 5*1024*1024,
        
	preInit : function() {
		tinyMCEPopup.requireLangPack();
	},

    init: function()
    {
        var strBase = tinyMCEPopup.getWindowArg('plugin_url') || tinyMCEPopup.getWindowArg('theme_url');
        var strRedirectURL = strBase + '/attachment_response.aspx';
        $( 'redirectUrl' ).value = strRedirectURL;
        
	    $( 'dlgFrmFileUpload' ).action = Config.webServiceUrl + "AttachmentAdd";
    },
    
    OnSubmit : function()
    {
        var vType = this.OnValidate();
        // bRetVal == true means submit the form, let the redirect 
        //  take care of sending us to the response.
        var bRetVal = ( vType == this.FILE );
        
        if( vType == this.URL )
        {   // Take care of URL inserts directly, update and close
            var strURL = $( 'url' ).value;
            
            AttachmentCommon.insert( strURL );            
        } // end if
        
        return bRetVal;
    }, 
    
    OnValidate : function() {
        var strFilename = $( 'filename' ).value;
        var strURL = $( 'url' ).value;
        var vRetVal = this.INVALID;
        
        this._setErrorStatus( '', '' );
        
        if( strFilename )
        {
            if( ( /(?:png|gif|jpg)$/i ).test( strFilename ) )
            {   // this works for firefox only.
                var objFile = $( 'filename' ).files && $( 'filename' ).files[ 0 ];
                if( objFile && ( objFile.fileSize > ( this.MAX_FILE_SIZE ) ) )
                {
                    this._setErrorStatus( tinyMCEPopup.getLang( 'attachment.file_too_large' ), 
                        tinyMCEPopup.getLang( 'attachment.file_size' ) + objFile.fileSize + tinyMCEPopup.getLang( 'attachment.bytes' ));
                } // end if
                else
                {
                    vRetVal = this.FILE;
                } // end if
            } // end if
            else
            {
                this._setErrorStatus( tinyMCEPopup.getLang( 'attachment.invalid_extension_error' ), 
                    tinyMCEPopup.getLang( 'attachment.valid_extensions' ) );
            } // end if-else
        } // end if
        
        if( strURL && ( this.INVALID === vRetVal ) )
        {
            vRetVal = this.URL;
        } // end if
        
        if( !strURL && !strFilename )
        {
            this._setErrorStatus( tinyMCEPopup.getLang( 'attachment.empty_filename_error' ), '' );
        } // end if
        
        return vRetVal;
    },
    
    _setErrorStatus: function( in_strError, in_strSecondary )
    {
        var objError = $( 'elementErrorMessage' );
        var objSecondary = $( 'errorSecondaryMessage' );
        var objBody = $( 'elementBody' );
        
        objBody.removeClassName( 'haserror' ).removeClassName( 'hassecondary' );
        
        objError.update( in_strError || '' );
        objSecondary.update( in_strSecondary || '' );
        
        if( in_strError )
        {
            objBody.addClassName( 'haserror' );
        } // end if
        
        if( in_strSecondary )
        {
            objBody.addClassName( 'hassecondary' );
        } // end if
    }
};

AttachmentDialog.preInit();
tinyMCEPopup.onInit.add(AttachmentDialog.init, AttachmentDialog);
