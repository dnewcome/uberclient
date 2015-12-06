
function HashStack()
{
    this.m_nMaxLength = undefined;
    HashArray.apply( this );
};
HashStack.prototype = new HashArray;


Object.extend( HashStack.prototype, {
    init: function( in_nMaxLength )
    {
        Util.Assert( false == this.isInitialized() );
        
        this.m_nMaxLength = in_nMaxLength;
        
        HashArray.prototype.init.apply( this );
    },
    
    /**
    * getTop - Get the top.
    * @returns {object} - undefined if nothing to pop, object with 3 fields if successful
    *   fields are: index: index of the object popped.
    *               key: Key of the object popped.
    *               object: The object.
    */ 
    getTop: function()
    {
        var nTopIndex = this.getTopIndex();
        var objRetVal = undefined;
        
        if( nTopIndex >= 0 )
        {
            var strPoppedKey = this.getKeyByIndex( nTopIndex );
            var vPoppedObject = this.getByIndex( nTopIndex );

            objRetVal = { index: nTopIndex, key: strPoppedKey, object: vPoppedObject };
        } // end if
        
        return objRetVal;
    },
    
    getTopIndex: function()
    {
        var nTopIndex = this.isInitialized() && ( this.length > 0 ) ? this.length - 1 : -1;
        return nTopIndex;
    },
    
    getBottomIndex: function()
    {
        var nBottomIndex = this.isInitialized() && ( this.length > 0 ) ? 0 : -1;
        return nBottomIndex;
    },
    
    /**
    * push - Add an object to the end of the dataset.  
    *   This will only add if there is not already an item with the same key.
    * @param {String} in_strKey - Key of object to add.
    * @param {Variant} in_vObject - object to add - can include null
    * @returns {Object} with 3 potential fields - undefined if not added.
    *                           if successfully added, values are:
    *                                   index: index into array if none pushed off, -1 otw.
    *                                   key: key of object pushed off item if index = -1
    *                                   object: object pushed off if if index = -1
    */
    push: function( in_strKey, in_vObject )
    {
        Util.Assert( this.isInitialized() );
        Util.Assert( TypeCheck.String( in_strKey ) );
        Util.Assert( TypeCheck.Defined( in_vObject ) );

        var nIndex = HashArray.prototype.add.apply( this, [ in_strKey, in_vObject ] );
        var objRetVal = undefined;
        
        if( nIndex > -1 )
        {
            var strKey = in_strKey;
            var vObject = in_vObject;
            
            if( ( TypeCheck.Number( this.m_nMaxLength ) )
             && ( this.length > this.m_nMaxLength ) )
            {   // One too many, push one off
                var nBottomIndex = this.getBottomIndex();
                strKey = this.getKeyByIndex( nBottomIndex );
                vObject = this.removeByIndex( nBottomIndex );
                nIndex = -1;
            } // end if
            
            objRetVal = { index: nIndex, key: strKey, object: vObject };
        } // end if
        return objRetVal;
    },
    
    /**
    * add - alias for push
    */
    add: function( in_strKey, in_vObject )
    {
        return this.push( in_strKey, in_vObject, this.getTopIndex() + 1 );
    },
   
    /**
    * pop - Pop off the top.
    * @returns {object} - undefined if nothing to pop, object with 3 fields if successful
    *   fields are: index: index of the object popped.
    *               key: Key of the object popped.
    *               object: The object.
    */ 
    pop: function()
    {
        var objRetVal = this.getTop();
        
        if( objRetVal )
        {   // get rid of it now.
            var vPoppedObject = this.removeByIndex( objRetVal.index );
        } // end if
        
        return objRetVal;
    }
    
} );
