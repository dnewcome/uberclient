
/**
* Object HashArray - An object that acts as both a hash table and an ordered array.
*   The user shouldn't care, but this works as there is a Hash (Object) table, and there is an Array (Array).
*   The Hash is accessed by Key, the Array by Index.  For speed and efficiency, our Array does not point to the
*   objects we are trying to store, only the Hash does, the Array stores keys to the hash.  This allows us to access
*   by key or index, delete by key or index, add by key or index, etc.
*/

function HashArray()
{
    this.m_objHash = undefined;
    this.m_objArray = undefined;
    this.length = undefined;
}

/**
* TypeCheck.HashArray - Check to see if item is a HashArray type
* @param {Variant} in_vCheck - item to check.
* @returns {Boolean} true if a HashArray, false otw.
*/
TypeCheck.HashArray = function( in_vCheck )
{
    return ( in_vCheck instanceof HashArray );
};

/**
* init - Initialize the object.  If the object previously existed, it is reinitialized.
*/
HashArray.prototype.init = function()
{
    var bRetVal = true;
    
    if( this.isInitialized() )
    {
        this.teardown();
    } // end if
    
    this.m_objHash = {};
    this.m_objArray = [];
    this.length = 0;
        
    return bRetVal;
};

/**
* teardown - Frees our references.  
*/
HashArray.prototype.teardown = function()
{
    Util.Assert( this.isInitialized() );

    this.m_objHash = null;
    delete this.m_objHash;
    
    this.m_objArray = null;
    delete this.m_objArray;
    
    this.length = null;
    delete this.length;
};

/**
* isInitialized - checks to see if we are currently initialized
*   returns true if yes, false otw.
*/
HashArray.prototype.isInitialized = function()
{
    var bRetVal = !!this.m_objHash;
    return bRetVal;
};


/**
* add - Add an object to the dataset.  
*   This will only add if there is not already an item with the same key.
* @param {String} in_strKey - Key of object to add.
* @param {Variant} in_vObject - object to add - can include null
* @param {Number} in_nIndex {integer} (optional) - Index of where to insert the object. 
*       If undefined or null, the object will be added to the end.
* @returns {Number} index in the Array if successful, -1 otw.
*/
HashArray.prototype.add = function ( in_strKey, in_vObject, in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strKey ) );
    Util.Assert( in_vObject );
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    
    var nRetVal = -1;

    if( false === this.isValidKey( in_strKey ) )
    {
        this.m_objHash[ in_strKey ] = in_vObject;
            
        // if no index, means add on to the end (push)
        if( TypeCheck.Undefined( in_nIndex ) || ( null === in_nIndex ) )
        {
            in_nIndex = this.m_objArray.length;
        } // end if

        this.m_objArray.splice( in_nIndex, 0, in_strKey );    
        this.length++;    
        nRetVal = in_nIndex;
    } // end if
    return nRetVal;
};

/**
* getByKey - retrieve an object from the collection.  
* @param {String} in_strKey - Key of the object to retrieve.
* @returns {Object} the object if found, undefined otw.
*/
HashArray.prototype.getByKey = function ( in_strKey )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strKey ) );
    
    var vRetVal = this.m_objHash[ in_strKey ];
    return vRetVal;
};

/**
* getByIndex - retrieve an object from the collection.  
* @param {Number} in_nIndex {integer} - index of the object to retrieve
* @returns {Object} the object if found, undefined otw.
*/
HashArray.prototype.getByIndex = function ( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nIndex ) );

    var vRetVal = this.isValidIndex( in_nIndex ) ? 
        this.m_objHash[ this.m_objArray[ in_nIndex ] ] : undefined;

    return vRetVal;
};

/**
* removeByKey - remove an object from the collection.  
*   Note, this does NOT delete the object.  That should be taken care of elsewhere.
* @param {String} in_strKey - Key of the object to remove.
* @returns {Object} the removed object on successful (index exists, able to delete, etc), undefined otw.
*/
HashArray.prototype.removeByKey = function ( in_strKey )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strKey ) );
    
    var nIndex = this.m_objArray.indexOf( in_strKey );
    var vRetVal = this.removeByIndex( nIndex );
    
    return vRetVal;
};


/**
* removeByIndex - remove an object from the collection.  
*   Note, this does NOT delete the object.  That should be taken care of elsewhere.
* @param {Number} in_nIndex {integer} - Index of the object to remove.
* @returns {Object} the removed object on successful (index exists, able to delete, etc), undefined otw.
*/
HashArray.prototype.removeByIndex = function ( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    
    var vRetVal = undefined;
    if( true === this.isValidIndex( in_nIndex ) )
    {
        var szKey = this.m_objArray[ in_nIndex ];
        vRetVal = this.m_objHash [ szKey ];

        this.m_objArray.splice( in_nIndex, 1 );     // remove the index.
        this.m_objHash[ szKey ] = null;
        delete this.m_objHash[ szKey ];             // remove the hash.
    
        this.length--;
    } // end if
    
    return vRetVal;
};



/**
* reid - re-id an item.
* @param {String} in_strOldKey - Old key to replace
* @param {String} in_strNewKey - New key to replace with
* @returns {Object} the reid'd object on successful, undefined otw.
*/
HashArray.prototype.reid = function ( in_strOldKey, in_strNewKey )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strOldKey ) );
    Util.Assert( TypeCheck.String( in_strNewKey ) );
   
    var vRetVal = this.m_objHash[ in_strOldKey ];
    
    if( TypeCheck.Defined( vRetVal ) )
    {
        var nIndex = this.m_objArray.indexOf( in_strOldKey );
        this.m_objArray[ nIndex ] = in_strNewKey;
        
        this.m_objHash[ in_strNewKey ] = vRetVal;
        delete this.m_objHash[ in_strOldKey ];
    } // end if

    return vRetVal;
};


/**
* replacing indexOf with our own that works well with sparse arrays.
* http://hexmen.com/blog/2006/12/iterating-over-sparse-arrays/
*/
Array.prototype.indexOf = function( key )
{
    for (var property in this) {
        if (String(property >>> 0) == property &&
                property >>> 0 != 0xffffffff && 
                this[ property ] == key) {
                return parseInt(property,10);
        }
    }
    return -1;
};

/**
* getIndexByKey - find the index of a specified key.
*   VERY EXPENSIVE!
* @param {String} in_strKey - Key to find index for.
* @returns {Number} index if succesful, -1 otw.
*/
HashArray.prototype.getIndexByKey = function( in_strKey )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.String( in_strKey ) );

    // indexOf provided JS 1.6 or by Prototype if not in there.
    var nRetVal = this.m_objArray.indexOf( in_strKey );
    return nRetVal;    
};

/**
* getIndexByKey - find the index of a specified key.
* @param {Number} in_nIndex - Index to find the key for.
* @returns {String} key if succesful, undefined otw.
*/
HashArray.prototype.getKeyByIndex = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nIndex ) );
    
    var strRetVal = this.m_objArray[ in_nIndex ];
    return strRetVal;    
};

/**
* isValidIndex - check to see if valid index
* @param {Number} in_nIndex - Index to check.
* @returns {bool} true if yes, false otw.
*/
HashArray.prototype.isValidIndex = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );

    var bRetVal = TypeCheck.Number( in_nIndex, 0, this.m_objArray.length - 1 );
    return bRetVal;    
};

/**
* isValidKey - check to see if valid key
* @param {String} in_strKey - key to check.
* @returns {bool} true if yes, false otw.
*/
HashArray.prototype.isValidKey = function( in_strKey )
{
    Util.Assert( this.isInitialized() );
    
    var bRetVal = ( ( TypeCheck.String( in_strKey ) )
                 && ( TypeCheck.Defined( this.m_objHash[ in_strKey ] ) ) );
   
    return bRetVal;    
};

/**
* each - run an iterator function on each value.  Does not guarantee ordering.
*   Iterator takes the value as input.  ie - function Iterator( in_vValue )
* @param {Function} in_fncIterator - iterator
* @param {Object} in_objScope (optional) - scope to call the iterator in.  
*   If undefined, call it in the scope of the object
*/
HashArray.prototype.each = function( in_fncIterator, in_objScope )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Function( in_fncIterator ) );
    Util.Assert( TypeCheck.UObject( in_objScope ) );
  
    for ( var strKey in this.m_objHash )  
    {
        var vObject = this.m_objHash[ strKey ];
        in_fncIterator.apply( in_objScope || vObject, [ vObject, strKey ] );
    } // end for
};