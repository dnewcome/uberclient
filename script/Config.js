﻿/**
* Configuration variables for the client
*/

/* 
* Base config is our base configuration that gets copied to all the others. 
* Override individual fields in the derived object itself. 
*/
var Config;

(function() {

    function BaseConfig()
    {
        this.bEnableStandaloneEditor = true;
	    this.bBrowseAwayWarning = false;
	    this.bSuppressAssertions = true;
	    this.bDisplaySystemCategories = false;
	    this.bAlertOnError = true;
	    this.nMinimumNoteSize = 100;
	    this.href = window.location.href;
	    this.strBasePath = this.href.slice( 0, this.href.lastIndexOf("/") + 1 );
	    this.m_nUndoDepth = 5;
	    this.bLogoutOnError = false;
	    this.bDBLogOnError = true;
	    this.bLocalLog = false;
	    this.bLogFirebug = false;
        this.aLogoutErrorLevels = []; // set up in Application.js so there is no dependency on ErrorLevels.js
        this.nMessageBoxDisplayTime = 2000;
        this.nMenuHideDelayMS = 2000;
        this.nMenuNoEnterDelayMS = 1500;
        this.nPopupWidth = 650;
        this.nPopupHeight = 500;
        this.bEnableCommentHighlighting = false;

		this.strProxyURL = document.location.protocol+"//"+window.location.hostname+'/ubernote/proxy/default.aspx?url=';
		this.bSSL = 'https:' === document.location.protocol;

    }


    var DebugConfig = new BaseConfig();
    Object.extend( DebugConfig, { // extend debugconfig with baseconfig.
	    webServiceUrl : document.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/ubernote/services/Webservice/Service.asmx/",
	    /*bDBLogOnError: false,*/
	    bSuppressAssertions: false,
	    bLocalLog: true,
	    bLogFirebug: true,
        aLogoutErrorLevels: [],    /* don't log out for anything */
        nMessageBoxDisplayTime: 5000,
        nMenuHideDelayMS: 2000,
        nMenuNoEnterDelayMS: 1500
    } );  

    var TestConfig = new BaseConfig();
    Object.extend( TestConfig, {
	    webServiceUrl : document.location.protocol+"//"+window.location.host+"/ubernote-test/Webservice/Service.asmx/",
	    bLogFirebug: true
    } );

    var ProductionConfig = new BaseConfig();
    Object.extend( ProductionConfig, {
	    webServiceUrl : document.location.protocol+"//"+window.location.host+"/ubernote/Webservice/Service.asmx/",
	    /*bBrowseAwayWarning : false,*/
	    bAlertOnError: false
    } );

    Config = DebugConfig;
    
})();


