/**
* Enum - create an enum out of the inputted list of strings.
* Must use new operator - eg:
*
*  var eHammerTypes = new Enum( "ballpeen", "carpenter", "SLEDGE", "destroy_computer" );
*
*  Members can be accessed such as: eHammerTypes.SLEDGE
*   and you can use the TypeCheck functions Enum and EnumKey to check values if are valid.
*
*   eg:
*   Util.Assert( TypeCheck.Enum( eHammerTypes ) );
*   Util.Assert( TypeCheck.EnumKey( "destroy_computer", eHammerTypes ) );
*
*
* @param {Array of strings} arguments - List of strings to create
* @returns {Object} - Object with key:value pairs of strings.
*/
function Enum()
{
    for( var nIndex = 0, strKey; strKey = arguments[ nIndex ]; nIndex++ )
    {
        this[ strKey ] = strKey;
    } // end for
    return this;
}

TypeCheck.createForObject( 'Enum' );

/**
* EnumKey - check to see if the inputted value is in an enum.
* @param {variant} in_vCheckValue - value to check.
* @param {enum} in_eEnumDefinition - Enum to check against.
* @returns {bool} - true if value is in enum, false otw.
*/    
TypeCheck.EnumKey = function( in_vCheckValue, in_eEnumDefinition )
{
    Util.Assert( TypeCheck.Defined( in_vCheckValue ) );
    Util.Assert( TypeCheck.Enum( in_eEnumDefinition ) );

    bRetVal = TypeCheck.Defined( in_eEnumDefinition[ in_vCheckValue ] );
    
    return bRetVal;
};


/**
* EnumKey - check to see if the inputted value is in an enum or undefined.
* @param {variant} in_vCheckValue - value to check.
* @param {enum} in_eEnumDefinition - Enum to check against.
* @returns {bool} - true if value is in the enum or undefined, false otw.
*/    
TypeCheck.UEnumKey = function( in_vCheckValue, in_eEnumDefinition )
{
    Util.Assert( TypeCheck.Enum( in_eEnumDefinition ) );

    bRetVal = ( 'undefined' == typeof( in_vCheckValue ) )
           || ( TypeCheck.Defined( in_eEnumDefinition[ in_vCheckValue ] ) );
    
    return bRetVal;
};
