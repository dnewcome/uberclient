/**
* ArrayIterator - Iterator over an Array-like object - object must have a length field.
*/
function ArrayIterator()
{
    this.m_objArray = undefined;   
    this.m_nCurrIndex = undefined;
    this.m_strMessagingID = undefined;
    this.m_bWrapAround = undefined;
}

ArrayIterator.cUnitializedValue = -1;

/**
* init - Initialize the iterator
* @in_objArray {object} - Array-like object to start an iterator for.  If it is a HashArray, do not
*   have to worry about things like manually updating the iterator on insertion and deletion.
*/
ArrayIterator.prototype.init = function( in_objArray, in_bWrapAround )
{
    Util.Assert( in_objArray && TypeCheck.Number( in_objArray.length ) );
    Util.Assert( false == this.isInitialized() );
    Util.Assert( TypeCheck.Undefined( in_bWrapAround ) || TypeCheck.Boolean( in_bWrapAround ) );
    
    this.m_objArray = in_objArray;   
    this.m_nCurrIndex = ArrayIterator.cUnitializedValue;
    this.m_strMessagingID = Messages.generateID();
    this.m_bWrapAround = in_bWrapAround;
    
    this.RegisterMessageHandlers();
};

/**
* teardown - Lose our references
*/
ArrayIterator.prototype.teardown = function()
{
    this.m_nCurrIndex = ArrayIterator.cUnitializedValue;
    this.UnRegisterMessageHandlers();
    this.m_objArray = undefined;
};

/**
* isInitialized - check if iterator can be processed.
*   returns true if yes, false otw.
*/
ArrayIterator.prototype.isInitialized = function()
{
    var bRetVal = TypeCheck.Defined( this.m_objArray );
    return bRetVal;
};

/**
* set - Sets the iterator position. Will set position to be "undefined" if invalid index.
* @param {Number} in_nIndex - index to set iterator to.
* @returns {Number} old iterator position
*/
ArrayIterator.prototype.set = function( in_nIndex )
{
    var nRetVal = this.m_nCurrIndex;  
    this.m_nCurrIndex = this.m_objArray.isValidIndex( in_nIndex ) ? in_nIndex : undefined;    
    return nRetVal;
};

/**
* get - get the iterator position
* @returns {Number} index of the location if successul, ArrayIterator.cUnitializedValue if length of the array is 0 
*/
ArrayIterator.prototype.get = function()
{   
    return this.m_nCurrIndex;
};

/**
* increment - increment the iterator.
* @returns {Number} index of the location if successul, ArrayIterator.cUnitializedValue if length of the array is 0 
*/
ArrayIterator.prototype.increment = function()
{
    Util.Assert( this.isInitialized() );
    var nRetVal = ArrayIterator.cUnitializedValue;
    
    if( ( this.m_nCurrIndex > ArrayIterator.cUnitializedValue ) // check to see if we can process (have been set)
     && ( this.m_objArray.length > 0 ) )  
    {   
        ++this.m_nCurrIndex;
        if( this.m_nCurrIndex >= this.m_objArray.length )
        {
            this.m_nCurrIndex = this.m_objArray.length - 1;
            if( true === this.m_bWrapAround )
            {   // wrap around - we know length is a number > 0, no NaN errors
                this.m_nCurrIndex %= this.m_objArray.length;  
            } // end if
        } // end if
        nRetVal = this.m_nCurrIndex;
    } // end if

    return nRetVal;
};

/**
* decrement - decrement the iterator.
*   returns the index of the new location if successul, ArrayIterator.cUnitializedValue if length of the array is 0
*/
ArrayIterator.prototype.decrement = function()
{
    Util.Assert( this.isInitialized() );
    var nRetVal = ArrayIterator.cUnitializedValue;
    
    if( ( TypeCheck.Number( this.m_nCurrIndex ) ) // check to see if we can process (have been set)
     && ( this.m_objArray.length > 0 ) )  
    {
        --this.m_nCurrIndex;
        if( this.m_nCurrIndex < 0 )
        {   
            this.m_nCurrIndex = 0;
            if( true === this.m_bWrapAround )
            {   // wrap around
                this.m_nCurrIndex = this.m_objArray.length - 1;
            } // end if
        } // end if
        nRetVal = this.m_nCurrIndex;
    } // end if
    
    return nRetVal;
};

/**
* isValidIndex - check to see if an index is valid for the associated Array-like object
* @param {Number} in_nIndex - Index to check.
*/
ArrayIterator.prototype.isValidIndex = function( in_nIndex )
{
    Util.Assert( TypeCheck.Number( in_nIndex ) );

    var bRetVal = ( in_nIndex >= 0 && in_nIndex < this.m_objArray.length );
    return bRetVal;    
};


/**
* Message Handling
*/
ArrayIterator.prototype.RegisterMessageHandlers = function()
{
    // Only go if array-like object has a messaging ID
    if( this.m_objArray.m_strMessagingID )
    {
        Messages.RegisterListener( 'arrayadd', this.m_objArray.m_strMessagingID, this.m_strMessagingID, this.OnArrayAdd, this );
        Messages.RegisterListener( 'arrayremove', this.m_objArray.m_strMessagingID, this.m_strMessagingID, this.OnArrayRemove, this );
    } // end if
};

ArrayIterator.prototype.UnRegisterMessageHandlers = function()
{
    // Only go if array-like object has a messaging ID
    if( this.m_objArray.m_strMessagingID )
    {
        Messages.UnRegisterListener( 'arrayadd', this.m_objArray.m_strMessagingID, this.m_strMessagingID );
        Messages.UnRegisterListener( 'arrayremove', this.m_objArray.m_strMessagingID, this.m_strMessagingID );
    } // end if
};

ArrayIterator.prototype.OnArrayAdd = function( in_nIndex )
{
    if( this.isInitialized() )
    {   // if we insert before or up to us, follow what we pointed at.
        this.m_nCurrIndex = in_nIndex;
    } // end if
};

ArrayIterator.prototype.OnArrayRemove = function( in_nIndex )
{
    if( this.isInitialized() && in_nIndex <= this.m_nCurrIndex )
    {   // decrement if we deleted before us.
        this.decrement();
    } // end if
};
