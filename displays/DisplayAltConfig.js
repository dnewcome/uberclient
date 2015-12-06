
function DisplayAltConfig( )
{
    DisplayAltConfig.Base.constructor.apply( this );
};
UberObject.Base( DisplayAltConfig, Display );

Object.extend( DisplayAltConfig.prototype, {
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        this.initWithConfigObject( in_objConfig );
        return this;
    }
} );
