<%@ Page Language="C#" AutoEventWireup="true" CodeFile="attachment_response.aspx.cs" Inherits="attachment_response" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
	<title>{#attachment.attachment_response_title}</title>
	<script type="text/javascript" src="../../../prototype-1.6.0.2.js"></script>
	<script type="text/javascript" src="../../tiny_mce_popup.js"></script>
	<script type="text/javascript" src="js/attachment_common.js"></script>
	<script type="text/javascript" src="js/attachment_response.js"></script>
	<link href="css/attachment.css" rel="stylesheet" type="text/css" />
	<base target="_self" />
</head>
<body id="attachment" style="display: none">
    <div style="color:red">{#attachment.upload_successful}</div>
    <div>Attachment ID:</div><div><% getAttachmentID(); %></div>
    <form name="uploadInformation" action="_">
	    <input id="src" type="hidden" name="src" value="<% getAttachmentID(); %>"/>
    </form>
</body> 
</html> 
