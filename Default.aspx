<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="Default.aspx.cs" Inherits="_Default" EnableEventValidation="false" ValidateRequest="false" Debug="true" TraceMode="SortByTime" %>
<!doctype html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=100" > 
    <title>Online Web Notes - UberNote</title>  
    <link rel="shortcut icon" href="../wwwimages/shared/uberlogo_16x16.png" type="image/x-icon" />
    
	<script type="text/javascript" src="lib/modernizr.js"/></script>
	
    <%
      generateStylesheetHeaders("stylesheets");
      generateStylesheetHeaders("templates");
    %>
    
</head>
    
<body class='fullapp' >
    
	<header id="topStatus">
		<nav>
			<span id="elementHi"></span><span id="elementUsername"></span>
			<ul>
				<li> | <a href="#" id="elementDashboard"></a></li>
				<li> | <a id="elementFeedback" href="../pages/feedback.aspx" target= "_new1"></a></li>
				<li> | <a href="#" id="elementSettings" ></a></li>
				<li> | <a href="#" id="elementLogout"></a></li>
			</ul>
		</nav>

		<a href="../pages/default.aspx"><img id="mainlogo" src='../wwwImages/Shared/logomainreplace.png'/></a>
		
		<fieldset>
            
            <span class ="boxit">
			    <input type="text" placeholder="Search" size="30" maxlength="300" class="elementSearchInput" name="searchTerm"/>
                <img src="images/searchbw24x24.png" style="position:relative; top: 5px; left:25px"/>
                <input type="button" class="elementSearchButton" value=""/>
			</span>
            &nbsp;
            <span id="MainControlStarred"><a href="#" ><img alt="star" src="images/bookmark32x32.png" class="iconbutton" /><span class="elementStarredCount"></span></a></span>
                <a href="#" id="elementSearchTags"><img alt="star" src="images/tagblue32x32.png" class="iconbutton" /></a>
                <a href="#" id="elementSearchShare"><img alt="star" src="images/share32x32.png" class="iconbutton" /></a>
             
		</fieldset>
        
		
	</header>


	<div id="main" >
		<div id="notehelper" class="right-padding" visible="false" ></div>
		<nav id="catpane">
           
			<a href="#" id="NoteAddButton" class="button">New Note</a><br /><br />
			<!--a href="#" id="elementNewNote" class="button"><span>New Note</span></a><br /><br />-->
            
			<ul id="catcontrols" class="unfiled"></ul>
            <span style="padding-bottom:5px; font-size:.85em">&nbsp;</span><a href="#" id="elementFoldersEdit" class="ButtonWidgetTrans">Edit Folders</a>
			<ul id="folders" class="folders"></ul>
			
			
			<%PremiumAd(); %>
		</nav>				    

		<div id="noteside" class="noteside" >
			<noscript>
				Ubernote requires Javascript to be enabled for use.
				<META http-equiv="refresh" content="0;URL=../pages/" />
			</noscript>
		</div> 
	</div><!-- main -->

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
	
	<div id="lightbox" class="dialog hide" >
	</div>
	
	
</body>
<script type="text/javascript">
    function InitApp()
    {
        Ubernote.m_bFullApp = true;
        Ubernote.m_strNoteID = '<% GetNoteID(); %>';
        Ubernote.m_strUserName = '<% GetUID(); %>'; 
        Ubernote.m_strVersion = '<% Version(); %>'; 
        Ubernote.m_strUpdateString = '<% UpdateString(); %>';     
        InitFullApp();
    };
    
    var objElement = document.createElement( 'script' );
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    objElement.src = gaJsHost + 'google-analytics.com/ga.js';
    objElement.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild( objElement );    
    
    trackPageview();
    
    function trackPageview()
    {
        if( 'undefined' == typeof( window._gat ) )
        {
            window.setTimeout( function() { trackPageview(); }, 100 );
        } // end if-else
        else
        {
            try {
                var pageTracker = _gat._getTracker("UA-2068305-1");
                pageTracker._trackPageview();
            } catch (e) {};
        } // end if-else
    }
<% 
    writeDevelopmentScriptEnd();
    generateJavascriptHeaders("lib");
    generateJavascriptHeaders("script");
    generateJavascriptHeaders("models");
    generateJavascriptHeaders( "displays" );
    writeProductionScriptEnd();
%>
</html>

