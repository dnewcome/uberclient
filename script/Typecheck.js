var TypeCheck =
{
    /**
    * Defined - check to see if the inputted value is defined.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is defined, false otw.
    */
    Defined: function( in_vCheckValue )
    {
        var bRetVal = ( 'undefined' != typeof( in_vCheckValue ) );
        return bRetVal;
    },

    /**
    * Undefined - check to see if the inputted value is undefined.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is undefined, false otw.
    */
    Undefined: function( in_vCheckValue )
    {
        var bRetVal = ( 'undefined' == typeof( in_vCheckValue ) );
        return bRetVal;
    },


    /**
    * Boolean - check to see if the inputted value is a boolean.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a boolean, false otw.
    */
    Boolean: function( in_vCheckValue )
    {
        var bRetVal = ( 'boolean' == typeof( in_vCheckValue ) );
        return bRetVal;
    },

    /**
    * UBoolean - check to see if the inputted value is a boolean or undefined.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a boolean or undefined, false otw.
    */
    UBoolean: function( in_vCheckValue )
    {
        var strType = typeof( in_vCheckValue );
        var bRetVal = ( 'boolean' == strType || 'undefined' == strType );
        return bRetVal;
    },
    
    /**
    * Object - check to see if the inputted value is an Object.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a Object, false otw.
    */
    Object: function( in_vCheckValue )
    {
        var bRetVal = ( 'object' == typeof( in_vCheckValue ) );
        return bRetVal;
    },

    /**
    * UObject - check to see if the inputted value is an Object or undefined.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a Object, false otw.
    */
    UObject: function( in_vCheckValue )
    {
        var strType = typeof( in_vCheckValue );
        var bRetVal = ( 'object' == strType || 'undefined' == strType );
        return bRetVal;
    },

    /**
    * Function - check to see if the inputted value is an Function.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a Function, false otw.
    */
    Function: function( in_vCheckValue )
    {
        var bRetVal = ( 'function' == typeof( in_vCheckValue ) );
        return bRetVal;
    },

    /**
    * UFunction - check to see if the inputted value is an Function or undefined.
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a Function or undefined, false otw.
    */
    UFunction: function( in_vCheckValue )
    {
        var strType = typeof( in_vCheckValue );
        var bRetVal = ( 'function' == strType || 'undefined' == strType );
        return bRetVal;
    },
    
    /**
    * String - check to see whether the inputted value is a valid string
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a string, false otw.
    */
    String: function( in_vCheckValue )
    {
        var bRetVal = ( 'string' == typeof( in_vCheckValue ) );
        return bRetVal;
    },

    /**
    * UString - check to see whether the inputted value is a valid string or undefined
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a string or undefined, false otw.
    */
    UString: function( in_vCheckValue )
    {
        var strType = typeof( in_vCheckValue );
        var bRetVal = ( ( 'string' == strType )
                     || ( 'undefined' == strType ) );
        return bRetVal;
    },

    /**
    * Number - check to see whether the inputted value is a valid number
    * @param {variant} in_vCheckValue - value to check.
    * @param {number} in_nMin (optional) - Minimum value
    * @param {number} in_nMax (optional) - Maximum value
    * @returns {bool} - true if type of value is a number and within the range, false otw.
    */
    Number: function( in_vCheckValue, in_nMin, in_nMax )
    {
        var bRetVal = ( ( 'number' == typeof( in_vCheckValue ) ) 
                     && ( this._Range( in_vCheckValue, in_nMin, in_nMax ) ) );
        return bRetVal;
    },

    /**
    * UNumber - check to see whether the inputted value is a valid number or undefined
    * @param {variant} in_vCheckValue - value to check.
    * @param {number} in_nMin (optional) - Minimum value
    * @param {number} in_nMax (optional) - Maximum value
    * @returns {bool} - true if type of value is a number and within the range or undefined, 
    *   false otw.
    */
    UNumber: function( in_vCheckValue, in_nMin, in_nMax )
    {
        var strType = typeof( in_vCheckValue );
        var bRetVal = ( ( 'number' == strType ) 
                     && ( this._Range( in_vCheckValue, in_nMin, in_nMax ) ) 
                   || ( 'undefined' == strType ) );
        return bRetVal;
    },
 
    /**
    * Array - check to see whether the inputted value is an array
    * @param {variant} in_vCheckValue - value to check.
    * @param {number} in_nMin (optional) - Minimum length
    * @param {number} in_nMax (optional) - Maximum length
    * @returns {bool} - true if type of value is an array and within the size range, false otw.
    */
    Array:  function( in_vCheckValue, in_nMinSize, in_nMaxSize )  
    {
        var bRetVal = ( ( in_vCheckValue instanceof Array )
                     && ( TypeCheck._Range( in_vCheckValue.length, in_nMinSize, in_nMaxSize ) ) ); 
        return bRetVal;
    },

    /**
    * UArray - check to see whether the inputted value is an array or undefined.
    * @param {variant} in_vCheckValue - value to check.
    * @param {number} in_nMin (optional) - Minimum length
    * @param {number} in_nMax (optional) - Maximum length
    * @returns {bool} - true if type of value is undefined or an array and within the size range, false otw.
    */
    UArray:  function( in_vCheckValue, in_nMinSize, in_nMaxSize )  
    {
        var bRetVal = ( ( 'undefined' === typeof( in_vCheckValue ) )
                     || ( ( in_vCheckValue instanceof Array )
                       && ( TypeCheck._Range( in_vCheckValue.length, in_nMinSize, in_nMaxSize ) ) ) ); 
        return bRetVal;
    },
    
    /**
    * ArrayLike - check to see whether the inputted value is an array-like object (has a length)
    * @param {variant} in_vCheckValue - value to check.
    * @param {number} in_nMin (optional) - Minimum length
    * @param {number} in_nMax (optional) - Maximum length
    * @returns {bool} - true if type of value is an array and within the size range, false otw.
    */
    ArrayLike: function( in_vCheckValue, in_nMinSize, in_nMaxSize )  
    {
        var bRetVal = ( ( TypeCheck.Number( in_vCheckValue.length ) )
                     && ( TypeCheck._Range( in_vCheckValue.length, in_nMinSize, in_nMaxSize ) ) ); 
        return bRetVal;
    },

    /**
    * Date - check to see whether the inputted value is a valid date
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a date, false otw.
    */
    Date:  function( in_vCheckValue )
    {
        var bRetVal = ( in_vCheckValue instanceof Date );
        return bRetVal;
    },

    /**
    * UDate - check to see whether the inputted value is undefined or a valid date
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is undefined or a date, false otw.
    */
    UDate:  function( in_vCheckValue )
    {
        var bRetVal = ( 'undefined' == typeof( in_vCheckValue ) ) 
                   || ( in_vCheckValue instanceof Date );
        return bRetVal;
    },

    /**
    * RegExp - check to see whether the inputted value is a valid Regular Expression
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is a RegExp, false otw.
    */    
    RegExp: function( in_vCheckValue )
    {
        var bRetVal = ( in_vCheckValue instanceof RegExp );
        return bRetVal;
    },


    /**
    * URegExp - check to see whether the inputted value is undefined or 
    *   a valid Regular Expression
    * @param {variant} in_vCheckValue - value to check.
    * @returns {bool} - true if type of value is undefined or a RegExp, false otw.
    */    
    URegExp: function( in_vCheckValue )
    {
        var bRetVal = ( 'undefined' == typeof( in_vCheckValue ) ) 
                   || ( in_vCheckValue instanceof RegExp );
        return bRetVal;
    },

    _Range: function( in_vCheckValue, in_nMinSize, in_nMaxSize )
    {
        var bRetVal = true;

        if( bRetVal && ( 'number' == typeof( in_nMinSize ) ) ) 
        {
            bRetVal = in_vCheckValue >= in_nMinSize;
        } // end if

        if( bRetVal && ( 'number' == typeof( in_nMaxSize ) ) )
        {
            bRetVal = in_vCheckValue <= in_nMaxSize;
        } // end if

        return bRetVal;
    },
    
    
    /**
    * createForObject - Creates TypeChecks for an object.
    * @param {String} in_strType - Name of type to create for.
    */
    createForObject: function( in_strType )
    {
        TypeCheck[ in_strType ] = function( in_vCheck )
        {
            return ( in_vCheck instanceof window[ in_strType ] );
        };

        TypeCheck[ 'U' + in_strType ] = function( in_vCheck )
        {
            return ( ( 'undefined' == typeof( in_vCheckValue ) )
                  || ( in_vCheck instanceof window[ in_strType ] ) );
        };
    }
};

