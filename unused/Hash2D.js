/**
* Hash2D - A 2D named array (hash) object.
*/

/** 
* Public interface:
*
* constructor (Hash2D)
* init()
* teardown()
* initialized()
* exists( in_strFirstDimKey, in_strSecondDimKey )
* get( in_strFirstDimKey, in_strSecondDimKey )
* getByFirstKey( in_strFirstDimKey )
* getSecondKeysByFirstKey( in_strFirstDimKey )
* add( in_strFirstDimKey, in_strSecondDimKey, in_vVariant )
* remove( in_strFirstDimKey, in_strSecondDimKey )
* removeByFirstKey( in_strFirstDimKey )
*
*/

function Hash2D()
{
    this.m_objHashTable = undefined;
}

/**
* init - Initialize if the object is not.  Returns true if able to initialize, false otw.
*/
Hash2D.prototype.init = function()
{
    var bRetVal = false;
    if( ! this.m_objHashTable )
    {
        this.m_objHashTable = new Object();
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* teardown - teardown the object and free the memory.  
*   Returns true if object has been initialized and is able to delete, false otw.
*/
Hash2D.prototype.teardown = function()
{
    var bRetVal = false;
    if( this.m_objHashTable )
    {
        bRetVal = delete this.m_objHashTable;
    } // end if
    
    return bRetVal;
};

/**
* initialized - Check to see if the object is initialized
*   Returns true if yes, false otw.
*/
Hash2D.prototype.initialized = function()
{
    var bRetVal = false;
    if( this.m_objHashTable )
    {
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* exists - Check to see if a key pair exists.  
*   Returns true if yes, false otw.
* @in_strFirstDimKey {string} - Key of the first dimension
* @in_strSecondDimKey {string} - Key of the second dimension
*/
Hash2D.prototype.exists = function( in_strFirstDimKey, in_strSecondDimKey )
{
    Util.Assert( this.initialized() );
    Util.Assert( in_strFirstDimKey );
    Util.Assert( in_strSecondDimKey );

    var bRetVal = false;
    var vObjVal = this.get( in_strFirstDimKey, in_strSecondDimKey );
    
    // do this typeof because the get could return null
    if( typeof( vObjVal ) != 'undefined' )
    {
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* get - Get an Item from the Hash.
*   Returns the Item if successful, undefined otw.
* @in_strFirstDimKey {string} - Key of the first dimension
* @in_strSecondDimKey {string} - Key of the second dimension
*/
Hash2D.prototype.get = function( in_strFirstDimKey, in_strSecondDimKey )
{
    Util.Assert( this.initialized() );
    Util.Assert( in_strFirstDimKey );
    Util.Assert( in_strSecondDimKey );

    var vRetVal = undefined;
    
    if( this.m_objHashTable[ in_strFirstDimKey ] )
    {
        vRetVal = this.m_objHashTable[ in_strFirstDimKey ][ in_strSecondDimKey ];
    } // end if
    
    return vRetVal;
};

/**
* getByFirstKey - Return the hash (object) for the specified in_strFirstDimKey
*   Returns the hash (row) if successful, undefined otw.
* @in_strFirstDimKey {string} - Key of the first dimension
*/
Hash2D.prototype.getByFirstKey = function( in_strFirstDimKey )
{
    Util.Assert( this.initialized() );
    Util.Assert( in_strFirstDimKey );

    var objRetVal = undefined;
    
    if( this.m_objHashTable[ in_strFirstDimKey ] )
    {
        objRetVal = this.m_objHashTable[ in_strFirstDimKey ];
    } // end if
    
    return objRetVal;
};

/**
* getSecondKeysByFirstKey - Return an array of keys for the specified in_strFirstDimKey
*   Returns the undefined if nonexistent, an array of keys otw.
* @in_strFirstDimKey {string} - Key of the first dimension
*/
Hash2D.prototype.getSecondKeysByFirstKey = function( in_strFirstDimKey )
{
    Util.Assert( in_strFirstDimKey );
    Util.Assert( this.initialized() );

    var aRetVal = undefined;
    var objFirstRow = this.getByFirstKey( in_strFirstDimKey );

    // create the array    
    if( objFirstRow )
    {
        aRetVal = [];
    } // end if
    
    // take each property and push it onto the array.
    for( var strKey in objFirstRow )
    {
        aRetVal[ aRetVal.length ] = strKey;
    } // end for
    
    return aRetVal;
};

/**
* add - add an item to the Hash.  If key pair does not exist, creates it.
*   If item already exists for key pair, does not overwrite.
*   returns false if already exists, true otw.
* @in_strFirstDimKey {string} - Key of first dimension
* @in_strSecondDimKey {string} - Key of second dimension
* @in_vVariant {variant} (optional) - 
*/
Hash2D.prototype.add = function( in_strFirstDimKey, in_strSecondDimKey, in_vVariant )
{
    Util.Assert( in_strFirstDimKey );
    Util.Assert( in_strSecondDimKey );
    Util.Assert( typeof( in_vVariant ) != 'undefined' );
    Util.Assert( this.initialized() );
      
    var bRetVal = false;

    if( false == this.exists(  in_strFirstDimKey, in_strSecondDimKey ) )
    {
        if( ! this.m_objHashTable[ in_strFirstDimKey ] )
        {   // No danger of re-adding a key if it already exists
            this.m_objHashTable[ in_strFirstDimKey ] = new Object();
        } // end if
        if( ! this.m_objHashTable[ in_strFirstDimKey ][ in_strSecondDimKey ] )
        {
            this.m_objHashTable[ in_strFirstDimKey ][ in_strSecondDimKey ] = in_vVariant;
            bRetVal = true;
        } // end if
    } // end if
    return bRetVal;
};

/**
* remove - remove an item from the Hash.
*   Returns the item if exists, "undefined" otw.
* @in_strFirstDimKey {string} - Key of first dimension
* @in_strSecondDimKey {string} - Key of second dimension
*/
Hash2D.prototype.remove = function( in_strFirstDimKey, in_strSecondDimKey )
{
    Util.Assert( in_strFirstDimKey );
    Util.Assert( in_strSecondDimKey );
    Util.Assert( this.initialized() );
      
    var vRetVal = this.get( in_strFirstDimKey, in_strSecondDimKey );

    if( typeof( vRetVal ) != 'undefined' )
    {
        delete this.m_objHashTable[ in_strFirstDimKey ][ in_strSecondDimKey ];
    } // end if
    
    return vRetVal;
};


/**
* removeByFirstKey - remove a "row" from the Hash.
*   Returns the row if exists, "undefined" otw.
* @in_strFirstDimKey {string} - Key of first dimension
*/
Hash2D.prototype.removeByFirstKey = function( in_strFirstDimKey )
{
    Util.Assert( this.initialized() );
    Util.Assert( in_strFirstDimKey );

    var objRetVal = undefined;
    
    if( this.m_objHashTable[ in_strFirstDimKey ] )
    {
        objRetVal = this.m_objHashTable[ in_strFirstDimKey ];
        delete this.m_objHashTable[ in_strFirstDimKey ];
    } // end if
    
    return objRetVal;
};
