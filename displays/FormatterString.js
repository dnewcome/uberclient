
(function() {
// set these up once so they are cached and forget about them.
var RE_email = /^[a-z0-9_\-]+(\.[_a-z0-9\-]+)*@([_a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)$/i;
var RE_url   = /^((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|localhost)(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-z][a-z0-9_]*)?$/i;
    
var StringFormat = 
{
    multiline: function( in_vDataItem, in_objElement )
    {
        var strRetVal = in_vDataItem.replace( /\n$/g, '' ); // strip off trailing \n
        strRetVal = strRetVal.replace( /\n/g, '<br />' );	// convert the rest.
        strRetVal = ExtraInfoDataPlugin.getFormatter( 'string' )( strRetVal );  //convert URLs
        return strRetVal;
    },

    string: function( in_strString, in_objElement, in_objDataSet )
    {
        var strRetVal = in_strString;

        var aobjWords = in_strString.split( /\s/g );
        for( var nIndex = 0, strWord; strWord = aobjWords[ nIndex ]; ++nIndex )
        {
            var matchURL = strWord.match( RE_url );
            
            if( matchURL ) 
            {
                aobjWords[ nIndex ] = '<a target="_blank" href="' + (matchURL[1] ? '' : 'http://') + matchURL[0] + '">' +  matchURL[0] + '</a>';
            }
        } // end for
        
        strRetVal = aobjWords.join( ' ' );
        
		return strRetVal;
    }
};
    
    ExtraInfoDataPlugin.addFormatters( StringFormat );
})();