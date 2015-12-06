function ExtraInfoDataPlugin()
{
    ExtraInfoDataPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( ExtraInfoDataPlugin, UberObject );

Object.extend( ExtraInfoDataPlugin, {
    addFormatters: function( in_objFormatters )
    {
        ExtraInfoDataPlugin.s_afncFormatters = ExtraInfoDataPlugin.s_afncFormatters || {};
        Object.extend( ExtraInfoDataPlugin.s_afncFormatters, in_objFormatters );
    },
    
    getFormatter: function( in_strFormatter )
    {
        ExtraInfoDataPlugin.s_afncFormatters = ExtraInfoDataPlugin.s_afncFormatters || {};
        return ExtraInfoDataPlugin.s_afncFormatters[ in_strFormatter ];
    }
} );
