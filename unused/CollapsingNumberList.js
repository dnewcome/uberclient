
function CollapsingNumberList()
{
    this.m_nSize = undefined;
    this.m_nCurrentSelection = undefined;

    CollapsingNumberList.Base.constructor.apply( this );
}
UberObject.Base( CollapsingNumberList, Display );

Object.extend( CollapsingNumberList.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_nSize: { type: 'number', bRequired: false, default_value: 0 },
            m_nCurrentSelection: { type: 'number', bRequired: false, default_value: -1 },
            m_bHighlight: { type: 'boolean', bRequired: false, default_value: true },
            m_nEndSize: { type: 'number', bRequired: false, default_value: 4 },
            m_nEndMargin: { type: 'number', bRequired: false, default_value: 1 },
            m_nSelectionPadding: { type: 'number', bRequired: false, default_value: 2 },
            m_strTooltipText: { type: 'string', bRequired: false, default_value: '' }
        };

        CollapsingNumberList.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },

    init: function( in_objConfig )
    {
        Util.Assert( false == this.isInitialized() );
        
        var bRetVal = this.initWithConfigObject( in_objConfig );
        
        return bRetVal;
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'setsize', Messages.all_publishers_id, this.setSize );
        this.RegisterListener( 'setselection', Messages.all_publishers_id, this.setSelection );
    },

    /**
    * _clear - internal helper to clear the current number list
    */
    _clear: function()
    {
        Util.Assert( true == this.isInitialized() );
        
        for( var nIndex = 0, objElement; objElement = this.$( nIndex.toString() ); ++nIndex )
        {
            if( objElement._button )
            {    // Not all of the elements are buttons.
                this.detachButton( objElement, this.OnNumberSelection );
            } // end if
            
            this.detachHTMLElement( nIndex.toString() );
            objElement.parentNode.removeChild( objElement );
        } // end for
    },

    /**
    * _create - internal helper to create the list
    * @param {Number} in_nSelection - Number that is currently selected.
    */
    _create: function( in_nSelection )
    {
        Util.Assert( true == this.isInitialized() );
        Util.Assert( TypeCheck.Number( in_nSelection ) );

        var objListElement = this.$( 'NumberList' );
        /* find our set then create an element for each number in the set */
        var anSet = this._findSet( this.m_nSize - 1, in_nSelection ).uniq();    
        var nPreviousValue = undefined;
        
        for( var nIndex = 0, nSize = anSet.length, nElementNum = 0; nIndex < nSize; nIndex++ )
        {
            var nValue = anSet[ nIndex ];
            
            if( TypeCheck.Defined( nPreviousValue ) && ( ( nPreviousValue + 1 ) != nValue ) )
            {   // If there is a gap in numbers, put in a ...
                var objElement = document.createElement( 'span' );
                objElement.innerHTML = '...';
                objListElement.appendChild( objElement );
                this.attachHTMLElement( nElementNum.toString(), objElement );
                nElementNum++;            
            } // end if
            
            var objElement = document.createElement( 'span' );
            objListElement.appendChild( objElement );
            
            objElement.innerHTML = this._getNumberString( nValue, ( nValue == in_nSelection ) );
            /* Use _uberSelectionNumber to keep track of the value so we can get the value simply and still
             *  set the innerHTML to anything we want 
             */
            objElement._uberSelectionNumber = nValue;
            objElement.title = this.m_strTooltipText + objElement.innerHTML;
            
            this.attachHTMLElement( nElementNum.toString(), objElement );
            this.attachButton( objElement, this.OnNumberSelection, this, false );
            nElementNum++;
            nPreviousValue = nValue;
        } // end if
    },

    /**
    * _getNumberString - get the display string for the selection.
    * @param {Number} in_nNumber - Number to display.
    * @param {bool} in_bHighlighted - Says whether it is highlighted or not.
    */
    _getNumberString: function( in_nNumber, in_bHighlighted )
    {
        Util.Assert( TypeCheck.Number( in_nNumber ) );
        Util.Assert( TypeCheck.Boolean( in_bHighlighted ) );
        
        var strRetVal = ( in_nNumber + 1 ).toString();
        
        if( true == in_bHighlighted )
        {
            strRetVal = '[' + strRetVal + ']';
        } // end if
        
        return strRetVal;
    },

    /**
    * _populateSet - adds numbers in_nMin through in_nMax to an array
    *   Called in the scope of an array
    * @param {Number} in_nMin - minimum number
    * @param {Number} In_nMax - maximum number
    * @returns {Array} Array that was passed in.
    */
    _populateSet: function( in_nMin, in_nMax )
    {
        Util.Assert( TypeCheck.Array( this ) );
        Util.Assert( TypeCheck.Number( in_nMin ) );
        Util.Assert( TypeCheck.Number( in_nMax ) );
        Util.Assert( in_nMin <= in_nMax );
        
        for( var nIndex = in_nMin; nIndex <= in_nMax; nIndex++ )
        {
            this[ this.length ] = nIndex;
        } // end for
        
        return this;
    },
    
    /**
    * _findSet - finds the set of numbers to display
    * @param {Number} in_nMax - maximum number in list
    * @param {Number} in_nCurrent - currently selected number
    * @returns {Array} set of numbers to display.
    */
    _findSet: function( in_nMax, in_nCurrent )
    {
        Util.Assert( TypeCheck.Number( in_nMax ) );
        Util.Assert( TypeCheck.Number( in_nCurrent ) );
        
        var anSet = [];
        // extend the array with the populateSet function
        anSet.populateSet = this._populateSet;
        
        if( in_nMax < this.m_nEndSize )
        {   // set = [0,..,count]  up to 5 elements
            anSet.populateSet( 0, in_nMax );
        } // end if
        else if( in_nCurrent < Math.ceil( this.m_nEndSize/2 ) )     
        {   /* From here down count > 4 */
            // set = [0,...,4,count]
            anSet.populateSet( 0, this.m_nEndSize - 1 );
            anSet.populateSet( in_nMax - ( this.m_nEndMargin - 1 ), in_nMax );
        } // end else-if
        else if( in_nCurrent < ( in_nMax - Math.ceil( this.m_nEndSize/2 ) ) ) 
        {   /* From here selection >= 3 but < count - 3, we are somewhere in the middle */
            // set = [1,selection-2,...,selection+2,count]
            anSet.populateSet( 0, this.m_nEndMargin - 1 );
            anSet.populateSet( in_nCurrent - this.m_nSelectionPadding, in_nCurrent + this.m_nSelectionPadding );
            anSet.populateSet( in_nMax - ( this.m_nEndMargin - 1 ), in_nMax );
        } // end else-if
        else
        {   /* If we are here, we are within the last 3 */
            anSet.populateSet( 0, this.m_nEndMargin - 1 );
            anSet.populateSet( in_nMax - ( this.m_nEndSize - 1 ), in_nMax );
        } // end if-else
        
        return anSet;
    },
    
    /**
    * setSize - set the size of the list - grows or shrinks the list, 
    *   hides the list if the size is less than 2.
    * @param {Number} in_nSize - Size of the list.
    */
    setSize: function( in_nSize )
    {
        Util.Assert( true == this.isInitialized() );
        Util.Assert( TypeCheck.Number( in_nSize ) );
        Util.Assert( 0 <= in_nSize );

        this.m_nSize = in_nSize;
    },

    /**
    * OnNumberSelection - The callback when a number is selected.
    * @param {Object} in_objEvent - W3C compatible event object.
    */
    OnNumberSelection: function( in_objEvent )
    {
        Util.Assert( true == this.isInitialized() );
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        Util.Assert( in_objEvent.target );
        
        var objElement = in_objEvent.target;
        var nIndex = Number( objElement._uberSelectionNumber );
        this.setSelection( nIndex );
    },

    /**
    * setSelection - set which item is selected.
    * @param {Number} in_nIndex - index to select.
    * @param {bool} in_bForce - Force to update.
    */
    setSelection: function( in_nIndex, in_bForce )
    {
        Util.Assert( true == this.isInitialized() );
        Util.Assert( TypeCheck.Number( in_nIndex ) );
        Util.Assert( ( 0 <= in_nIndex ) && ( this.m_nSize > in_nIndex ) );

        if( ( this.m_nCurrentSelection != in_nIndex ) || ( true == in_bForce ) )
        {
            this._clear();
            this._create( in_nIndex );
            
            if( this.m_nCurrentSelection != in_nIndex )
            {
                this.Raise( 'CollapsingNumberListNewSelection', [ in_nIndex ] );
            } // end if
            this.m_nCurrentSelection = in_nIndex;
        } // end if
    }
});
