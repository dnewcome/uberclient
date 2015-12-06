

/***
* XXX TODO - get rid of all manual DOM Element calls, they do not belong here!
*/

/**
* DisplayArray - a Display that itself is an array of Displays
*/

function DisplayArray()
{
    this.m_objDisplays = undefined;
    this.m_objTopPosition = undefined;
    this.m_nMaxLength = undefined;
    this.m_nLastModifiedIndex = undefined;
    this.m_objDisplaysContainerElement = undefined;
    this.length = 0;
    // apply our parent constructor which does the rest of the setup
    Display.apply( this );
}
// Inherit from Display
DisplayArray.prototype = new Display;


/**
* Initialization/teardown - the rest of it is taken care of in Display.
*/

/**
* init - Initialize ourselves
*   returns true if template successfully loaded and attached, false otw.
* @in_objInsertionPoint {object} - Parent DOM Element to attach to.
* @in_strTemplate {string} - Name of the template to use for collection.
* @in_nMaxLength {number} (optional) - Maximum length.  
*/
DisplayArray.prototype.init = function( in_objInsertionPoint, in_strTemplate, in_nMaxLength )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( in_objInsertionPoint );
    Util.Assert( typeof( in_strTemplate ) == 'string' );
    
    Util.Assert( typeof( in_nMaxLength ) != 'undefined' ? typeof( in_nMaxLength ) == 'number' : true );
    Util.Assert( typeof( in_nMaxLength ) != 'undefined' ? in_nMaxLength > 0 : true );

    // apply our parent constructor which does the initial setup
    Display.prototype.init.apply( this, [ in_objInsertionPoint, in_strTemplate ] );
    
    this.m_objDisplays = new HashArray();
    this.m_objDisplays.init();
    
    this.m_nMaxLength = in_nMaxLength;
    
    this.m_objTopPosition = new ArrayIterator( this.m_objDisplays );
};

/**
* teardownData - free our references
*/
DisplayArray.prototype.teardownData = function()
{
    Util.Assert( false == this.isInitialized() );

    Display.prototype.teardownData.apply( this );
        
    this.m_objDisplays.teardown();
    this.m_objDisplays = undefined;
    
    this.m_objTopPosition.teardown();
    this.m_objTopPosition = undefined;
};


/**
* findDomElements - populate local variables for individual DOM elements
*/
DisplayArray.prototype.findDomElements = function()
{
    Util.Assert( this.isInitialized() );
    Display.prototype.findDomElements.apply( this );
    
    this.m_objDisplaysContainerElement = DOMElement.getSingleElementByClassName( this.m_objDomContainer, "elementDisplaysContainer", 0 );
    // There had BETTER be a Displays container element!  But it could be the same as 
    //  
    Util.Assert( this.m_objDisplaysContainerElement ); 
};




/**
* Public interface functions
*/


/**
* insert - Like add, but will not "move" an already added member.  Will just return false.
*   Returns true if successful and no displays are "pushed off".
*       Returns a display if successful and one is "pushed off"
*   Returns false otw.
*   Pushing off: If max-displays is set and the limit is reached before this add, a display is pushed off the cliff.
*           This display is defined as:  First display if inserting into the highest index.  Last display otw.
*   This display must be handled properly outside of here because it is not torn down and could pose a memory leak.
* @in_objDisplayID {string} - ID of the display to add.
* @in_objDisplay {object} - Display to add.
* @in_nIndex {number} (optional) - index of where to place the element in the display.  
*   if undefined or null, places at the end of the list
*/
DisplayArray.prototype.insert = function( in_objDisplayID, in_objDisplay, in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_objDisplayID ) == 'string' );
    Util.Assert( in_objDisplay instanceof Display || in_objDisplay instanceof ViewBase );
    var vRetVal = false;
    
    if( -1 == this.getIndexByID( in_objDisplayID ) )
    {
        // insert at the end by default.
        var objInsertBefore = this.helperGetDOMElement( in_nIndex ) || null; 
        
        this.m_objDisplaysContainerElement.insertBefore( in_objDisplay.m_objDomContainer, objInsertBefore );
        this.m_objDisplays.add( in_objDisplayID, in_objDisplay, in_nIndex );
        // Make sure we don't clean the display we just added
        in_objDisplay._uberHidden = undefined;
        delete in_objDisplay._uberHidden;

        this.length++;

        // if we have an objInsertBefore, it means remove the LAST one.  If none were
        //  removed, set us to true.
        vRetVal = this._cleanExtraDisplay( objInsertBefore ) || true;

        // have to do this last or else we won't know the true length;
        this.m_nLastModifiedIndex = objInsertBefore ? in_nIndex : this.length - 1;
    } // end if
    
    return vRetVal;
};

/**
* getLastModificationIndex - Return the index of the last addition/deletion/move (these are the TO's)
*/
DisplayArray.prototype.getLastModificationIndex = function()
{
    return this.m_nLastModifiedIndex;
};


/**
* add - Adds a Display to the collection and prepare it to receive a load
*   Returns true if successful and no displays are "pushed off".
*       Returns a display if successful and one is "pushed off"
*   Returns false otw.
*   Pushing off: If max-displays is set and the limit is reached before this add, a display is pushed off the cliff.
*           This display is defined as:  First display if inserting into the highest index.  Last display otw.
*   This display must be handled properly outside of here because it is not torn down and could pose a memory leak.
* @in_objDisplayID {string} - ID of the display to add.
* @in_objDisplay {object} - Display to add.
* @in_nIndex {number} (optional) - index of where to place the element in the display.  
*   if undefined or null, places at the end of the list
*/
DisplayArray.prototype.add = function( in_objDisplayID, in_objDisplay, in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_objDisplayID ) == 'string' );
    Util.Assert( in_objDisplay instanceof Display || in_objDisplay instanceof ViewBase );
    
    var strIndexType = typeof( in_nIndex );
    Util.Assert( strIndexType != 'undefined' ? strIndexType == 'number' : true );
    
    var vRetVal = false;
    var nOldIndex = this.getIndexByID( in_objDisplayID );
    if( -1 == nOldIndex )
    {   
        vRetVal = this.insert( in_objDisplayID, in_objDisplay, in_nIndex );
    } // end if
    else
    {   // move it.  Since it is a move, 
        var nNewIndex = in_nIndex;
        if( strIndexType != 'number' )
        {   // move it to the end.
            nNewIndex = this.length - 1;
        } // end if
        this.move( nOldIndex, nNewIndex );
        vRetVal = true;
    } // end if-else
    return vRetVal;
};

/**
* removeByIndex - Removes a Display from the collection and teardown its DOM.
*   returns a Display if successful, false otw.
* @in_strDisplayIndex - Index of Display to remove.
*/
DisplayArray.prototype.remove = function( in_nDisplayIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_nDisplayIndex ) == 'number' );
    
    var objRetVal = this.m_objDisplays.removeByIndex( in_nDisplayIndex );
    if( objRetVal )
    {   
        this.m_objDisplaysContainerElement.removeChild( objRetVal.m_objDomContainer );
        this.length--;
        this.m_nLastModifiedIndex = in_nDisplayIndex;
    } // end if    
    return objRetVal;
};

/**
* move - Change index position of a Display
* @in_nOrigIndex {number} - original index
* @in_nNewIndex {number} - new index (index as defined as before change)
*/
DisplayArray.prototype.move = function( in_nOrigIndex, in_nNewIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nOrigIndex ) );
    Util.Assert( this.isValidIndex( in_nNewIndex ) );
    
    var bRetVal = false;
    
    if( in_nOrigIndex != in_nNewIndex )
    {
        // Figure out who we need to move in front of.  If we are pulling 
        //  from before the new index, we want to look one past the new 
        //  index to find which one we really want.
        var nInsertBeforeIndex = in_nOrigIndex < in_nNewIndex ? in_nNewIndex + 1 : in_nNewIndex;
        var objInsertBeforeDisplay = this.m_objDisplays.getByIndex( nInsertBeforeIndex );
        // If we are inserting into the last position, objInsertBeforeDisplay will be "undefined"
        var objInsertBeforeElement = objInsertBeforeDisplay ? objInsertBeforeDisplay.m_objDomContainer : null;
    
        var objElementToMove = this.m_objDisplays.getByIndex( in_nOrigIndex ).m_objDomContainer;
        if ( bRetVal = this.m_objDisplays.moveByIndex( in_nOrigIndex, in_nNewIndex ) )
        {   
            this.m_objDisplaysContainerElement.insertBefore( objElementToMove, objInsertBeforeElement );
            bRetVal = true;
        } // end if
    } // end if
    // always set this because some functions depend on knowing where this is 
    //  regardless of whether we really move it or not.
    this.m_nLastModifiedIndex = in_nNewIndex;
    return bRetVal;    
};

/**
* replace - Replace a Display with another Display.
*   returns the replaced Display if successful, undefined otw.
* @in_objDisplayID {string} - NEW ID of the display
* @in_objDisplay {object} - Display to add.
* @in_nIndex {number} - index of element to replace.  
*/
DisplayArray.prototype.replace = function( in_objDisplayID, in_objDisplay, in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nIndex ) );
    Util.Assert( in_objDisplay );       // Check eventually if it is also a Display
    Util.Assert( typeof( in_objDisplayID ) == 'string' );
    
    //  we don't delete then add because it jacks the iterator
    // replace the item in the hash.  won't let us re-add the same in_objDisplayID.
    var objDisplayToReplace = this.m_objDisplays.replace( in_objDisplayID, in_objDisplay, in_nIndex );  
    
    if( objDisplayToReplace && ( in_objDisplay != objDisplayToReplace ) )
    {   // Do the DOM.
        this.m_objDisplaysContainerElement.insertBefore( in_objDisplay.m_objDomContainer, objDisplayToReplace.m_objDomContainer );
        this.m_objDisplaysContainerElement.removeChild( objDisplayToReplace.m_objDomContainer );
        this.m_nLastModifiedIndex = in_nIndex;
    } // end if

    return objDisplayToReplace;    
};

/**
* show - Add a "show" class to the DOM element of the index
*   returns true if could add the class name, false otw.
* @in_nIndex {number} - index to show.
*/
DisplayArray.prototype.show = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nIndex ) );

    var bRetVal = false;
    var objDisplay = this.m_objDisplays.getByIndex( in_nIndex );
    
    if( objDisplay )
    {
        if( objDisplay.show )
        {   // Display based
            objDisplay.show();
        } // end if-else
        else
        {
            DOMElement.show( objDisplay.m_objDomContainer );
        } // end if-else
        objDisplay._uberHidden = undefined;
        delete objDisplay._uberHidden;
        
        bRetVal = true;
    } // end if

    return bRetVal;
};

/**
* hide - Remove the "show" class to the DOM element of the index
*   returns true if could remove the class name, false otw.
* @in_nIndex {number} - index to show.
*/
DisplayArray.prototype.hide = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nIndex ) );

    var bRetVal = false;
    var objDisplay = this.m_objDisplays.getByIndex( in_nIndex );
    
    if( objDisplay )
    {
        if( objDisplay.hide )
        {   // Display based
            objDisplay.hide();
        } // end if-else
        else
        {
            DOMElement.hide( objDisplay.m_objDomContainer );
        } // end if-else
        objDisplay._uberHidden = true;
        bRetVal = true;
    } // end if

    return bRetVal;
};

/**
* hideAll - Add the "hide" class to all displays.
*   returns number hidden.
*/
DisplayArray.prototype.hideAll = function()
{
    Util.Assert( this.isInitialized() );
    var nIndex = 0;
    
    for( nIndex = 0; nIndex < this.length; nIndex++ )
    {
        this.hide( nIndex );	
    } // end for    
    
    return nIndex;
};

/**
* showAll - Remove the "hide" class to all displays.
*   returns number hidden.
*/
DisplayArray.prototype.showAll = function()
{
    Util.Assert( this.isInitialized() );
    var nIndex = 0;
    
    for( nIndex = 0; nIndex < this.length; nIndex++ )
    {
        this.show( nIndex );
    } // end for    
    
    return nIndex;
};

/**
* scrollIntoView - scroll a display into view.
* @in_nIndex {number} - Index to scroll into view.
* @in_bAlignToTop {boolean} (optional) - false will align with bottom.  true or undefined aligns with top
*/
DisplayArray.prototype.scrollIntoView = function( in_nIndex, in_bAlignToTop )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nIndex ) );

    var objDisplay = this.m_objDisplays.getByIndex( in_nIndex );
    
    Util.Assert( objDisplay );
    objDisplay.scrollIntoView( in_bAlignToTop );
    
};

/**
* focus - set focus a display.
*   returns true if supported by display, false otw.
* @in_nIndex {number} - Index to focus.
*/
DisplayArray.prototype.focus = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( this.isValidIndex( in_nIndex ) );

    var bRetVal = false;
    var objDisplay = this.m_objDisplays.getByIndex( in_nIndex );
    
    Util.Assert( objDisplay );
    
    if( objDisplay.focus )
    {   // not all ViewBases have this.
        objDisplay.focus();
        bRetVal = true;
    } // end if
    
    return bRetVal;
};

/**
* isValidIndex - Checks to see if the index we are asking for is valid.
* @in_nIndex - Index to check.
*/
DisplayArray.prototype.isValidIndex = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_nIndex ) == 'number' );
    
    return this.m_objDisplays.isValidIndex( in_nIndex );
};


/**
* getIndexByID - gets the index for a specified ID
* @in_strDisplayID {string} - Display ID to get the index for
*/
DisplayArray.prototype.getIndexByID = function( in_strDisplayID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_strDisplayID ) == 'string' );
    
    return this.m_objDisplays.getIndexByKey( in_strDisplayID );
};

/**
* Message handlers
*/




/**
* Bring these in later
*/

/**
* removeByID - Removes a Display from the collection and teardown its DOM.
*   returns Display if successful, false otw.
* @in_strDisplayID - ID of Display to remove.
*/
DisplayArray.prototype.removeByID = function( in_strDisplayID )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_strDisplayID ) == 'string' );
    
    var objRetVal = this.m_objDisplays.removeByKey( in_strDisplayID );
    if( objRetVal )
    {   
        this.m_objDisplaysContainerElement.removeChild( objRetVal.m_objDomContainer );
    } // end if    
    return objRetVal;
};



/**
* helperGetDOMElement - Gets the DOM element for the specified index.
*   returns the HTMLElement if successful, undefined otw.  Will return undefined if in_nIndex is out of range or not defined.
* @in_nIndex {number} - Index of Display to get DOM Element for.
*/
DisplayArray.prototype.helperGetDOMElement = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    
    var objRetVal = undefined;
    
    if( ( typeof( in_nIndex ) == 'number' ) && this.isValidIndex( in_nIndex ) )
    {
        var objDisplay = this.m_objDisplays.getByIndex( in_nIndex ); 

        // if requesting insert past the current last element, then objDisplay will be "undefined"
        if( objDisplay ) 
        {
            if( objDisplay.m_objDomContainer )
                {objRetVal = objDisplay.m_objDomContainer;}
            else
                {objRetVal = objDisplay.domContainer;}
        } // end if
    } // end if
    return objRetVal;
};

/**
* _cleanExtraDisplay - removes the extra node if we added one too man.
*   returns undefined if we are still undersized, returns a display otw.
* @param {bool} in_bReverseOrder - starts from end if true, starts from beginning if false.
* @returns {object} returns a hidden object if found, returns the last if no hidden found and
*   in_bReverseOrder is true, returns the first if no hidden found and
*   in_bReverseOrder is false
*/
DisplayArray.prototype._cleanExtraDisplay = function( in_bReverseOrder )
{
    Util.Assert( this.isInitialized() );
    var vRetVal = undefined;

    if( ( TypeCheck.Number( this.m_nMaxLength ) ) 
     && ( this.length > this.m_nMaxLength ) )
    {
        // find one which is still hidden.  Start from the end because we are most likely adding to 
        //  the beginning.  (or is this only in reverse?)  We are going to have to think about this.
        if( in_bReverseOrder )
        {   
            for( var nIndex = this.length - 1; nIndex >= 0; nIndex-- )
            {
                var objDisplay = this.m_objDisplays.getByIndex( nIndex );        
                if( true == TypeCheck.Defined( objDisplay._uberHidden ) )
                {   
                    vRetVal = this.remove( nIndex );
                    break;
                } // end if
            } // end for
            // pick the last if one not found.        
            if( TypeCheck.Undefined( vRetVal ) )
            {
                vRetVal = this.remove( this.length - 1 );
            } // end if
        } // end if
        else
        {
            for( var nIndex = 0; nIndex < this.length; nIndex++ )
            {
                var objDisplay = this.m_objDisplays.getByIndex( nIndex );        
                if( true == TypeCheck.Defined( objDisplay._uberHidden ) )
                {   
                    vRetVal = this.remove( nIndex );
                    break;
                } // end if
            } // end for
            // pick the first if one not found.        
            if( TypeCheck.Undefined( vRetVal ) )
            {
                vRetVal = this.remove( 0 );
            } // end if
        } // end if
    }  // end if
        
    return vRetVal;
};

