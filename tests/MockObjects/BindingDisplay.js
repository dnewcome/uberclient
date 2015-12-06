/**
* BindingDisplay
*/
function BindingDisplay( )
{
	this.m_objBindingInfo = undefined;
	this.m_objExtraInfo = undefined;
	
    BindingDisplay.Base.constructor.apply( this );
}
UberObject.Base( BindingDisplay, Display );

Object.extend( BindingDisplay.prototype, {
	getBindingInfo: function( in_objBindingInfo )
	{
		return this.m_objBindingInfo;
	},
	
	setBindingInfo: function( in_objBindingInfo )
	{
		this.m_objBindingInfo = in_objBindingInfo;
	},
	
	getExtraInfo: function( in_objExtraInfo )
	{
		return this.m_objExtraInfo;
	},
	
	setExtraInfo: function( in_objExtraInfo )
	{
		this.m_objExtraInfo = in_objExtraInfo;
	},
    
    getField: function( in_strField )
    {
        return this.m_objExtraInfo[ in_strField ];
    }
} );
