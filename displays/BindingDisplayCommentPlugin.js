/**
* BindingDisplayCommentPlugin
*/
function BindingDisplayCommentPlugin( )
{
    BindingDisplayCommentPlugin.Base.constructor.apply( this );
}
UberObject.Base( BindingDisplayCommentPlugin, Plugin );

Object.extend( BindingDisplayCommentPlugin.prototype, {
	loadConfigParams: function()
	{
		BindingDisplayCommentPlugin.Base.loadConfigParams.apply( this );
		this.extendConfigParams( { 
			m_strUserName: { type: 'string', bRequired: true },
            m_astrColors: { type: 'object', bRequired: false, default_value: [] }
		} );
	},
	
	RegisterMessageHandlers: function()
	{
		this.RegisterListener( 'loaddataobject', this.OnLoadDataObject, this );
		
		BindingDisplayCommentPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
	},
	
	/**
	* OnLoadDataObject - called when the data object is loaded on the binding.
	* 	Checks to see if the comment's name is the same as the current user name, if
	*	it is, add the 'commentowner' class name onto the comments container.
	*/
	OnLoadDataObject: function()
	{
		var objPlugged = this.getPlugged();
		var objExtraInfo = objPlugged.getExtraInfo();
        var strUserName = objExtraInfo.Name;
        /*
        var strColor = this.m_astrColors[ objExtraInfo.Name ] = 
            this.m_astrColors[ objExtraInfo.Name ] || this._calcColor( objExtraInfo.Name );
        objPlugged.$().addClassName( strColor );
		*/ 
		var strFuncName = ( objExtraInfo.Name == this.m_strUserName ) ? 'addClassName' : 'removeClassName';
		objPlugged.$()[ strFuncName ]( 'commentowner' );
	}/*,
    
    _calcColor: function( in_strUserName )
    {
        var nHash = 0;
        // use the characters in the username to determine the initial seed
        for ( var i = 0; i < in_strUserName.length; i++ ) 
        {
            nHash += ( in_strUserName.charCodeAt( i ) * 181 );
        } // end for;
        nHash = nHash % 6;
        
        return 'usercolor' + nHash.toString();
    }
    */
} );