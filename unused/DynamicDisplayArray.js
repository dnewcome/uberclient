
/**
* DynamicDisplayArray - a display array with a scroll bar.  Can configurably attempt 
*   to conserve memory by setting the maximum number of created displays and the
*   size of the cache.  This will cause the display array to "slide" - ie, 
*   will shift displays from end to end to appear seamless.
*/
function DynamicDisplayArray()
{
    /**
    * Maximum number of displays to hold in memory/cache at one time.
    */
    this.m_nCacheDisplays = undefined;

    /**
    * Maximum number of displays to have visible at a time.
    */
    this.m_nVisibleDisplays = undefined;
    
    /**
    * The total number of possible items in the collection.
    */    
    this.m_nCollectionCount = undefined;
    
    /**
    * Default display size in pixels.
    */
    this.m_nDefaultDisplaySize = undefined;

    /**
    * Display array stuffs
    */    
    this.m_objDisplayArray = undefined;
    this.m_objDisplayArrayContainerElement = undefined;
    this.m_objElementScrollBarContainerPlaceholder = undefined;

    Display.apply( this );
}
// Inherit from Display
DynamicDisplayArray.prototype = new Display;

/**
* used as a status for add
*/
DynamicDisplayArray.additionType =
{
    FAILURE: 0,
    NEW:     1,
    MOVED:   2,
    CACHED:  3
};

/**
* initialization/teardown functions
*/


/**
* init - Initialization, set up the DOM, register the message/dom event handlers
* @param {Object} in_objInsertionPoint - HTMLElement to use as the insertion point
* @param {String} in_strTemplate - file name of the template to use for us.
* @param {String} in_strDisplayArrayTemplate - file name of the template to use for the DisplayArray.
* @param {Number} in_CacheDisplays - Maximum number of displays to have in memory/cache at any given time.
* @param {Number} in_VisibleDisplays - Maximum number of displays to display at a given time.  Must be <= in_nCacheDisplays
*/
DynamicDisplayArray.prototype.init = function( in_objInsertionPoint, in_strTemplate, in_strDisplayArrayTemplate, 
    in_nCacheDisplays, in_nVisibleDisplays )
{
    Util.Assert( false == this.isInitialized() );
    Util.Assert( in_objInsertionPoint );
    Util.Assert( typeof( in_strTemplate ) == 'string' );
    Util.Assert( typeof( in_strDisplayArrayTemplate ) == 'string' );
    Util.Assert( typeof( in_nCacheDisplays ) == 'number' && in_nCacheDisplays >= 0 );
    Util.Assert( ( typeof( in_nVisibleDisplays ) == 'number' ) && ( in_nVisibleDisplays >= 0 ) && ( in_nVisibleDisplays <= in_nCacheDisplays ) );

    // apply our parent constructor which does the initial setup.
    //  This will find the insertion location for the DisplayArray.
    Display.prototype.init.apply( this, [ in_objInsertionPoint, in_strTemplate ] );
    
    this.m_objDisplayArray = new DisplayArray();
    this.m_objDisplayArray.init( this.m_objDisplayArrayContainerElement, in_strDisplayArrayTemplate, 
        in_nCacheDisplays );

    //this.m_objDisplayArrayContainerElement = DOMElement.getSingleElementByClassName( this.$(), "elementDisplaysContainer", 0 );
    this.m_objDisplayArrayContainerElement = this.$( 'elementDisplaysContainer' );

    this.m_nCacheDisplays = in_nCacheDisplays;
    this.m_nVisibleDisplays = in_nVisibleDisplays;
};


DynamicDisplayArray.prototype.teardown = function()
{
    Util.Assert( true == this.isInitialized() );
    
    this.m_objDisplayArray.teardown();
    this.m_objDisplayArray = undefined;
    
    var objBuffer = this.m_objBufferDisplay;
    if( objBuffer && typeof( objBuffer ) == 'object' )
    {   // Tell our callbacks to tear down the display.
        this.teardownDisplay( objBuffer );
    } // end if
    
    Display.prototype.teardown.apply( this );    
};


/**
* findDomElements - populate local variables for individual DOM elements
*/
DynamicDisplayArray.prototype.findDomElements = function()
{
    Util.Assert( this.isInitialized() );
    Display.prototype.findDomElements.apply( this );
    
    this.m_objDisplayArrayContainerElement = DOMElement.getSingleElementByClassName( this.$(), "elementDisplayArray", 0 );
    this.m_objElementScrollBarContainerPlaceholder = DOMElement.getSingleElementByClassName( this.$(), "elementScrollBarElementFakeContent", 0 );

    /* These HAVE to exist */
    Util.Assert( this.m_objDisplayArrayContainerElement ); 
};





/**
* interface functions
*/




/**
* setCollection - sets the basic collection info.
* @param {Number} in_CollectionCount - Number of displays in the collection.  Used to estimate window size.
* @param {Number} in_DisplaySize - Default size of an individual display.  Used to estimate window size.
*/
DynamicDisplayArray.prototype.setCollection = function( in_nCollectionCount, in_nDisplaySize )
{
    Util.Assert( true == this.isInitialized() );
    Util.Assert( typeof( in_nCollectionCount ) == 'number' );
    Util.Assert( typeof( in_nDisplaySize ) == 'number' );
    
    this.m_nCollectionCount = in_nCollectionCount;
    this.m_nDefaultDisplaySize = in_nDisplaySize;
    
    if( this.m_objElementScrollBarContainerPlaceholder )
    {   
        // For the placeholder content window, we are going to do something ghetto.  We are going to make the
        //  content window be N times larger than the window's natural height, where N is the m_nCollectionCount.
        //  This allows us to scroll nicely, smoothly, as well as snap to place.  Doing it this way means we
        //  do not have to worry about the height of any individual element unless that element is GIGANTIC.  
        //  Hmm, maybe I SHOULD think about that.  BUGBUG (bugbug?  I think it is WAYTODOITWAYTODOIT)
        this.m_objElementScrollBarContainerPlaceholder.style.height = (this.m_nCollectionCount * 100).toString() + "%";
    } // end if
};

/**
* setHeight - set the height of the container.
* @param {Number} in_nHeight - height in pixels to set the container.
*/
DynamicDisplayArray.prototype.setHeight = function( in_nHeight )
{
    Util.Assert( TypeCheck.Number( in_nHeight ) );

    this.$().style.height = in_nHeight.toString() + 'px';
};

/**
* setScrollIndex - Sets the current scroll position to a display index.
* @param {Number} in_Index - Index to scroll to.
*/
DynamicDisplayArray.prototype.setScrollIndex = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( in_nIndex <= this.m_nCollectionCount );

    // set it like this in case we aren't using dynamic mode.
    var objScrollBar = this.$( 'elementScrollBarContainer' ) || this.m_objDisplayArrayContainerElement;

    // Have to position this in case we were scrolled before.
    this.m_objDisplayArrayContainerElement.style.top = "0px";
    objScrollBar.scrollTop = 0;
    if( this.m_nCollectionCount > 0 )
    {
        var nSizePerDisplay = objScrollBar.scrollHeight / this.m_nCollectionCount;
        objScrollBar.scrollTop = in_nIndex * nSizePerDisplay;
    } // end if
    this.focus( in_nIndex );
};

/**
* scroll - Handles scroll events.  Takes the current position of the scroll bar, figures out
*   which percentage from the bottom (screen top) it is located, and then sets the bottom (screen top) display to 
*   correspond to an ID at that percentage in the collection.  Make sense?  No.  Good.
*/
DynamicDisplayArray.prototype.scroll = function( in_objEvent )
{
    var objScrollBar = this.$( 'elementScrollBarContainer' );
    if( objScrollBar )
    {
        var nCurrDisplay = 0;
        if( this.m_nCollectionCount > 0 )
        {
	        var nScrollPercent = objScrollBar.scrollTop / objScrollBar.scrollHeight;
            
            var nScrollBy = ( this.m_objDisplayArrayContainerElement.scrollHeight ) * nScrollPercent;
            this.m_objDisplayArrayContainerElement.style.top = (-nScrollBy).toString() + "px";
        } // end if
	} // end if
};


/**
* scrollToTop - Reset the scrolling - because sometimes we are just off.
*/
DynamicDisplayArray.prototype.scrollToTop = function()
{
    this.setScrollIndex( 0 );
};

/**
* addAndShowDisplay - Adds a display to the DisplayArray.  When completed, it shows it
*   and calls an optional "LoadFinished" callback.
* @param {String} in_strCurrID - DisplayID of what we want to display.  Add function will
*   create the display if needed.
* @param {Number} in_InsertionIndex - Location of where to add.
*/
DynamicDisplayArray.prototype.addAndShowDisplay = function( in_strCurrID, in_nInsertionIndex )
{
    var vRetVal = this.add( in_strCurrID, in_nInsertionIndex );
    if( vRetVal )
    {
	    this.m_objDisplayArray.show( in_nInsertionIndex );
    } // end if
};

/**
* add - Adds a display the display array.  If displayID is already added, it moves it.  If not added,
*   either creates it or uses the buffer display.
* Returns false if failure.  Returns true if added and length < max_displays.  
*   Returns a display if one has been "pushed out".
* @param {String} in_strDisplayID - ID of display to create.
* @param {Number} in_Index (optional) - Index to insert at.  If undefined or null, inserts at end.
*/	      
DynamicDisplayArray.prototype.add = function( in_strDisplayID, in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( typeof( in_strDisplayID ) == 'string' );
    Util.Assert( typeof( in_nIndex ) == 'number' ? in_nIndex >= 0 : true );
    var vRetVal = DynamicDisplayArray.additionType.FAILURE;
    var nOldIndex = this.m_objDisplayArray.getIndexByID( in_strDisplayID );
    if( -1 == nOldIndex )
    {   // note added, prepare a display for addition.
        var objDisplay = this.prepareDisplay( in_strDisplayID );
        vRetVal = this.m_objDisplayArray.insert( in_strDisplayID, objDisplay, in_nIndex );
        if( true == Config.bUseBufferDisplay )
        {
            this.m_objBufferDisplay = vRetVal;  // Saves off the buffer display if there is one.
        } // end if
        else if( vRetVal && vRetVal.teardown )
        {
            vRetVal.teardown();
        } // end if
        
        if( true === vRetVal )
        {
            vRetVal = DynamicDisplayArray.additionType.NEW;
        } // end if
    } // end if
    else
    {   
        var nNewIndex = in_nIndex;   // Already in the collection somewhere, now move it.
        if( typeof( nNewIndex ) != 'number' )
        {   // move it to the end (if we have one);
            nNewIndex = 0;
            if( this.m_objDisplayArray.length > 0 )
            {
                nNewIndex = this.m_objDisplayArray.length - 1;
            } // end if
        } // end if
        this.m_objDisplayArray.move( nOldIndex, nNewIndex );
        vRetVal = DynamicDisplayArray.additionType.MOVED;
    } // end if-else        

    return vRetVal;
};




/**
* prepareDisplay - prepares a display for addition.  If there is a buffer display, it uses that. 
*   If not, it creates a display.  
*   Returns prepared display
* @param {String} in_strDisplayID - ID of display to prepare
* @private
*/	      
DynamicDisplayArray.prototype.prepareDisplay = function( in_strDisplayID )
{
    var objRetVal = this.m_objBufferDisplay;
    
    if( objRetVal && typeof( objRetVal ) == 'object' )
    {   // reuse a display
        this.updateDisplay( objRetVal, in_strDisplayID );
    } // end if
    else
    {   // create a new one.
        objRetVal = this.createDisplay( in_strDisplayID );
    } // end if-else
    
    return objRetVal;
};


/**
* hideAll - Hides all of our displays.
*/
DynamicDisplayArray.prototype.hideAll = function()
{
    Util.Assert( this.isInitialized() );
    
    this.m_objDisplayArray.hideAll();
};

/**
* showAll - shows all of our displays.
*/
DynamicDisplayArray.prototype.showAll = function()
{
    Util.Assert( this.isInitialized() );
    
    this.m_objDisplayArray.showAll();
};

/**
* focus - set focus a display.
*   returns true if supported by display, false otw.
* @param {Number} in_Index - Index to focus.
*/
DynamicDisplayArray.prototype.focus = function( in_nIndex )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Number( in_nIndex ) );
    
    var bRetVal = this.m_objDisplayArray.focus( in_nIndex );
    
    return bRetVal;
};



/**
* Message/DOM Event handling
*/

DynamicDisplayArray.prototype.RegisterMessageHandlers = function()
{
    this.RegisterListener( 'setHeight', Messages.all_publishers_id, this.setHeight );
    this.RegisterListener( 'scrollToTop', Messages.all_publishers_id, this.scrollToTop );

    Display.prototype.RegisterMessageHandlers.apply( this );
};


DynamicDisplayArray.prototype.RegisterDomEventHandlers = function()
{
    var objScrollBar = this.$( 'elementScrollBarContainer' );
    if( objScrollBar )
    {
        this.RegisterListener( 'onscroll', objScrollBar, this.scroll );
    } // end if

    Display.prototype.RegisterDomEventHandlers.apply( this );
};

/**
* They don't do a thing, these need to be overridden!
*/
DynamicDisplayArray.prototype.updateDisplay = function( in_objDisplay, in_strDisplayID )
{
    Util.Assert( false, 'DynamicDisplayArray.prototype.updateDisplay must be overridden' );
};

DynamicDisplayArray.prototype.createDisplay = function( in_strDisplayID )
{
    Util.Assert( false, 'DynamicDisplayArray.prototype.createDisplay must be overridden' );
};

/**
* should be overridden if in_objDisplay does not have a teardown mechanism.
*/
DynamicDisplayArray.prototype.teardownDisplay = function( in_objDisplay )
{
    Util.Assert( this.isInitialized() );
    Util.Assert( TypeCheck.Object( in_objDisplay ) );
    
    if( in_objDisplay.teardown )
    {
        in_objDisplay.teardown();
    } // end if
};