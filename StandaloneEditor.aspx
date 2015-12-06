<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="StandaloneEditor.aspx.cs" Inherits="StandAlone" EnableEventValidation="false" ValidateRequest="false" Debug="true" TraceMode="SortByTime" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head runat="server">
    <meta http-equiv="PRAGMA" content="NO-CACHE" />
    <title>UberNote Editor</title>  
    <link rel="shortcut icon" href="../wwwimages/shared/uberlogo_16x16.png" type="image/x-icon" />
    
    <%
      generateStylesheetHeaders("stylesheets");
      generateStylesheetHeaders("templates");
    %>
</head>
    
<body >
    <noscript>
        Ubernote requires Javascript to be enabled for use.
        <META http-equiv="refresh" content="0;URL=../pages/" />
    </noscript>
    <span style="float:right; font-weight:bold; padding:5px;"><a href="Default.aspx"><< Open UberNote</a></span>
    <div class='standaloneeditor <% includePremiumClass(); %>'>
        <div id='elementNoteDisplay'></div>
        <div id='externalpage' class='hide' >external page area</div>
        <div id='notehelper' class='right-padding' visible='false' ></div>

	    <div id='modalDialog'></div>
        <div id="dlgLoadingScreen" class="dialog hide" >
	        <img src="images/ajax-loader.gif" title="loading" alt="loading" />
	        <div>Loading...</div>
	    </div>
        <div id="dlgConnectionScreen" class="dialog hide" >
	        <img src="images/ajax-loader.gif" title="Disconnected... Waiting for connection" alt="Disconnected... Waiting for connection" />
	        <div>Disconnected.... </div>
	        <div>Waiting for connection</div>
	    </div>
    </div>
<script type="text/javascript">
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
    try {
        var pageTracker = _gat._getTracker("UA-2068305-1");
        pageTracker._trackPageview();
    } catch(err) {}
</script>
</body>
    <script type="text/javascript">
        function InitApp()
        {
            Ubernote.m_strNoteID = '<% getNoteID(); %>';
            Ubernote.m_strSID = '<% getSID(); %>';
            Ubernote.m_bStandaloneEditor = true;
            Ubernote.m_strUserName = '<% GetUID(); %>'; 
            Ubernote.m_strVersion = '<% Version(); %>'; 
            Ubernote.m_strUpdateString = '<% UpdateString(); %>';
            InitStandaloneEditorApp();
        } 
    </script>
    <% 
       generateJavascriptHeaders("lib");
       generateJavascriptHeaders("script");
       generateJavascriptHeaders("models"); 
       generateJavascriptHeaders( "displays" );
    %>

</html>

