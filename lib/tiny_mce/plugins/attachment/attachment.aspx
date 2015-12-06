<%@ Page Language="C#" AutoEventWireup="true" CodeFile="attachment.aspx.cs" Inherits="attachment" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>{#attachment.attachment_title}</title>
	<script type="text/javascript" src="../../../prototype-1.6.0.2.js"></script>
	<script type="text/javascript" src="../../../../script/config.js"></script>
	<script type="text/javascript" src="../../tiny_mce_popup.js"></script>
	<script type="text/javascript" src="js/attachment_common.js"></script>
	<script type="text/javascript" src="js/attachment.js"></script>
	<link href="css/attachment.css" rel="stylesheet" type="text/css" />
	<base target="_self" />
</head>
<body id="elementBody" >
    <p>{#attachment.select_file}</p>
    <form 
	    id="dlgFrmFileUpload" 
	    action=""
	    method="post" 
	    enctype="multipart/form-data"
	    onsubmit="return AttachmentDialog.OnSubmit();"
    >
	    <div><div class="label">{#attachment.file}</div><input id="filename" type="file" name="filename" size="50" onchange="AttachmentDialog.OnValidate();" /></div>
	    <div><div class="label">{#attachment.url}</div><input id="url" type="text" name="url" size="50" onchange="AttachmentDialog.OnValidate();" /></div>
	    <div>&nbsp;</div>
	    <input id="elementSubmit" type="submit" value="{#attachment.insert_image}"/>	
	    <div class='errorResponse'>{#attachment.error}<span id="elementErrorMessage" class='error_message'></span></div>
	    <div id='errorSecondaryMessage'></div>
	    <input id="noteID" name="noteID" type="hidden" value="<% getNoteID(); %>" />
	    <input id="sessionID" type="hidden" name="sessionID" value="<% getSID(); %>" />
	    <input id="inlineFlag" type="hidden" name="inlineFlag" value="1" />
	    <input id="redirectUrl" type="hidden" name="redirectUrl" value="" />
	    
    </form>
</body>
</html>
