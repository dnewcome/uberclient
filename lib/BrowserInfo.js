// This file holds some basic browser information!
// BrowserInfo is a global that can be accessed anywhere!
// code based from http://www.javascripter.net/faq/browsern.htm

var BrowserInfo =
{
	m_tBrowserType: undefined, 
    m_tOS: undefined,
    
    m_astrOSs: [
        'linux',
        'mac',
        'win'    
    ],
    
	m_astrBrowsers: [
	    'ie',
	    'ie6',
	    'ie7',
	    'opera',
	    'gecko',
	    'gecko2',
	    'gecko3',
	    'gecko31',
	    'webkit',
	    'konqueror'
	],

	isIE: function()
	{
		return this.ie;
	},
	isOpera: function()
	{
		return this.opera;
	}, // end isOpera
	isMozilla: function()
	{
		return this.gecko;
	}, // end isMozilla
	isSafari: function()
	{
		return this.webkit;
	}, // end isMozilla

	isKonqueror: function()
	{
		return this.konqueror;
	}, // end isMozilla
	
	
	init: function()
	{
	    for( var i=0, strBrowser, objRegExp; strBrowser = this.m_astrBrowsers[ i ]; i++ )
	    {
	        objRegExp = new RegExp( strBrowser, 'gi');
	        this[ strBrowser ] = objRegExp.test( this.m_tBrowserType );	        
	    } // end for

	    for( var i=0, strOS, objRegExp; strOS = this.m_astrOSs[ i ]; i++ )
	    {
	        objRegExp = new RegExp( strOS, 'gi');
	        this[ strOS ] = objRegExp.test( this.m_tOS );	        
	    } // end for
	    
	},
	
	majorVersion: function()
	{
	    return this.m_nMajorVersion;
	}
}

// Do our own initialization
//BrowserInfo.init();


// CSS Browser Selector   v0.2.5
// Documentation:         http://rafael.adm.br/css_browser_selector
// License:               http://creativecommons.org/licenses/by/2.5/
// Author:                Rafael Lima (http://rafael.adm.br)
// Contributors:          http://rafael.adm.br/css_browser_selector#contributors
var css_browser_selector = function() {
	var 
		ua=navigator.userAgent.toLowerCase(),
		is=function(t){ return ua.indexOf(t) != -1; },
		h=document.getElementsByTagName('html')[0],
		b=(!(/opera|webtv/i.test(ua))&&/msie (\d)/.test(ua))?('ie ie'+RegExp.$1):is('gecko/')? is('firefox/2\.0')? 'gecko2 gecko' : is('firefox/3\.0')? 'gecko3 gecko' : is('minefield/3\.1')? 'gecko31 gecko' : 'gecko':is('opera/9')?'opera opera9':/opera (\d)/.test(ua)?'opera opera'+RegExp.$1:is('konqueror')?'konqueror':is('applewebkit/')?'webkit safari':is('mozilla/')?'gecko':'',
		os=(is('x11')||is('linux'))?' linux':is('mac')?' mac':is('win')?' win':'';
    BrowserInfo.m_tOS = os;
	BrowserInfo.m_tBrowserType = b;    // Set this in browserinfo.
	BrowserInfo.m_nMajorVersion = parseInt( RegExp.$1, 10 );
	BrowserInfo.init();
	var c=b+os+' js';
	h.className += h.className?' '+c:c;
}();

