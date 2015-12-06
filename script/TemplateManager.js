/**
* Class TemplateManager: responsible for downloading and caching template resources
* We grab the html and css from server, convert and cache as dom element
* Singleton, static class...
*/
var TemplateManager =
{
	templateDirectory : 'templates/',
	
    /**
    * GetTemplate: returns the DOM element that is the template for the control's view
    * @name {string} Name of the .htm resource on server, sans file extension
    */
    GetFromWebPage: function( in_strName )
    {
        var strBaseName = this.templateDirectory + in_strName;
        var objResponse = UberXMLHTTPRequest.getWebPage( strBaseName + '.htm' );
        var strRetVal = undefined;
        /* check for success, keeps `page not found' text out of app on failure */
        if( objResponse ) 
        {
            strRetVal = objResponse.responseText;

            /*
            * These should be the same set as what is in tools/HTMLTOJSONObject/program.cs
            *   We are doing this so that the output stays consistent whether we are looking
            *   in debug mode or using the program to combine the templates.
            */
            strRetVal = strRetVal.replace( /\"/g, '\'' );
            strRetVal = strRetVal.replace( /\s+/g, ' ' );
            // When we match, we want lazy matching so we 
            //  don't swollow everything between multiple comments
            strRetVal = strRetVal.replace( /<\!--.*?(-->)/g, '' );
            strRetVal = strRetVal.replace( />\s*</g, '><' );
            
        } // end if
        return strRetVal;
    },
    
	GetTemplate : function( in_strName )
	{
	    if( !this[in_strName] ) // check if cached
	    {
	        var strPageText = this.GetFromWebPage( in_strName );
	        if( strPageText && strPageText.length > 0 ) 
	        {
	            this[ in_strName ] = this.ElementFactory( strPageText );	    
	        } // end if
	        else
	        {
	            Util.Assert( false, 'Error retrieving template: ' + in_strName );
	        } // end if
	    }
	    return this[ in_strName ].cloneNode( true ); // make sure to deep clone
	},

    /*
    * Initialize the template manager with a JSON object.
    * @param {Object} in_objObject - object in the format of { key: 'string', key2: 'string2' };
    */
    LoadFromObject : function( in_objObject )
    {
        Util.Assert( TypeCheck.Object( in_objObject ) );
        
        for( var strKey in in_objObject )
        {   // copy each item in the object to our cache.
            Util.Assert( TypeCheck.String( in_objObject[ strKey ] ) );
            this[ strKey ] = this.ElementFactory( in_objObject[ strKey ] );	    
        } // end for
    },
    
    /**
    * Build DOM element from html response string. We need
    * to build a temp DOM element and take the first child.
    * @html {string}
    */
    ElementFactory : function( html )
    {
        var objRetVal = null;
        var el = document.createElement('div');
        
        el.innerHTML = this.DoTranslation( html );
        
        // There is a difference between the way IE/Mozilla handle the DOM breakdown.
        //  IE will not put in text nodes/comments into the DOM but Mozilla will.
        //  We want our first element type node universally.
        var objRetVal = el.firstChild;
        while( objRetVal && ( 1 != objRetVal.nodeType ) )
        {
            objRetVal = objRetVal.nextSibling;
        } // end if
        return objRetVal;
    },
    
    DoTranslation: function ( in_strString )
    {
        Util.Assert( TypeCheck.String( in_strString ) );
        
        var strRetVal = in_strString.replace(/{\#([^}]+)\}/g, function(a, b) {
            var astrParts = b.split( '.' );
            var strTranslation = window;
            for( var nIndex = 0, strPart; strPart = astrParts[ nIndex ]; ++nIndex )
            {
                try 
                {
                    strTranslation = strTranslation[ strPart ];
                } catch( e ) {
                    // Do nothing   
                }
            } // end if
            strTranslation = TypeCheck.String( strTranslation ) ? strTranslation : a;
			return strTranslation;
	    });
			
        return strRetVal;
    }
};

( function() {
    if( window.objTemplates )
    {   // only do this if objTemplates exists - ie, is included
        TemplateManager.LoadFromObject( objTemplates );
    } // end if
})();
