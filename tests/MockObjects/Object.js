
Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.clone = function(object) {
    return Object.extend({}, object);
};

/**
* equalValues - check to see if two objects are "equal" in the sense that they
*   have all the same fields and each field has the same value.
*/
Object.equalValues = function( object1, object2 )
{
    var objObject1 = Object.clone( object1 );
    var objObject2 = Object.clone( object2 );
    
    for( var strKey in objObject1 )
    {
        if( objObject1[ strKey ] === objObject2[ strKey ] )
        {
            delete objObject1[ strKey ];
            delete objObject2[ strKey ];
        } // end if
        else if( ( 'object' === typeof( objObject1[ strKey ] ) )
              && ( 'object' === typeof( objObject2[ strKey ] ) ) )
        {   // not the same, if item is an object, check its equalValues as well.
            if( !Object.equalValues( objObject1[ strKey ], objObject2[ strKey ] ) )
            { 
                return false;
            } // end if
        } // end if
        else
        {   // neither objects nor of the same type.  Abort, abort, ABORT!
            return false;
        } // end if-else if-else
    } // end for
    
    return !Util.objectHasProperties( objObject2 );
};