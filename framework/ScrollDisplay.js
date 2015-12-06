// constructor.. sets dom container but does not initialize
function ScrollDisplay( in_domContainer )
{
	// TODO: config variables, should probably get these from somewhere else
	// sets display pool size
	this.m_nNumDisplays = 20;
	
	
	// size of our hysteresis window, in pixels
	// todo: this value is sort of odd, see the calculations, this is really the 
	// `half window' size..
	this.m_windowSize = undefined;
	
	// outermost DOM element of this display
	this.m_objDomContainer = in_domContainer;
	
	// UID for message passing
	this.m_strMessagingID = Messages.generateID();
	
	// keep initialization status
	this.m_isInitialized = undefined;
	
	// the inner DisplayArray that we are controlling
	this.m_positionedDisplayArray = undefined;
	
	this.m_centerOfScrollWindow = undefined;
	this.m_scrollWindowUpperThreshold = undefined;
	this.m_scrollWindowLowerThreshold = undefined;
	
	
	// the Dom container for the inner scroll area
	this.m_objDomScrollContents = undefined;
	
	// TODO: we may not want to call init right here
	this.init();
}

// initialize
ScrollDisplay.prototype.init = function()
{	
	this.m_objDomContainer.onscroll = this.onScroll.bind( this );
	
	// create a div for the inner DisplayArray
	this.m_objDomScrollContents = this.m_objDomContainer.appendChild( document.createElement( "div" ) );
	this.m_positionedDisplayArray = new PositionedDisplayArray( this.m_objDomScrollContents );
	this.m_positionedDisplayArray.init( this.m_nNumDisplays );
	
	// calculate the rest of the scroll parameters
	this.calculateWindow();
	
	// create all note displays, but we don't load any data yet
	this.createItems();
	
	this.m_isInitialized = true;
};


ScrollDisplay.prototype.onScroll = function()
{
	// FF will call scrollhandler before init if scrollbar is not at top
	if( !this.m_isInitialized )
	{
		return;
	}
	
	// we want the items in the list
	// todo: firstitem/lastitem need to be the VISIBLE displays, this is a bug
	var firstItem = this.m_positionedDisplayArray.m_aDisplays[0];
	
	// var lastItem = m_contents.lastChild;
	var lastItem = this.m_positionedDisplayArray.m_aDisplays[ this.m_positionedDisplayArray.m_aDisplays.length - 1 ];
	
	// we want to know the position of items relative to viewport
	if( firstItem )
	{
		// distance from top of item to top of its content container
		//   minus
		// distance that we are scrolled down 
		var firstItemTopPosition = firstItem.m_objDomContainer.offsetTop - this.m_objDomContainer.scrollTop;
		var firstItemBottomPosition = firstItemTopPosition + firstItem.m_objDomContainer.offsetHeight;
	}
	if( lastItem )
	{
		var lastItemTopPosition = lastItem.m_objDomContainer.offsetTop - this.m_objDomContainer.scrollTop;
		var lastItemBottomPosition = lastItemTopPosition + lastItem.m_objDomContainer.offsetHeight;
	}
	
	
	
	// when scrolling up we want to add to top and remove from bottom
	if( firstItemTopPosition > this.m_scrollWindowUpperThreshold )
	{
		this.m_positionedDisplayArray.addToTop();
	}
	
	// scrolling down
	if( lastItemBottomPosition < this.m_scrollWindowLowerThreshold )
	{
		this.m_positionedDisplayArray.addToBottom();
	}
		
};


// when we resize dom container, need to recalculate everything.
ScrollDisplay.prototype.onResize = function()
{
	this.calculateWindow();
};

// calculate window center + threshold positions
ScrollDisplay.prototype.calculateWindow = function()
{
	// set the hysteresis window according to the dom container height
	this.m_windowSize = this.m_objDomContainer.offsetHeight;
	
	// find the center of our viewport
	this.m_centerOfScrollWindow = this.m_objDomContainer.clientHeight / 2;
	
	// calculate our hysteresis window for adding and removing items
	this.m_scrollWindowUpperThreshold = this.m_centerOfScrollWindow - this.m_windowSize;
	this.m_scrollWindowLowerThreshold = this.m_centerOfScrollWindow + this.m_windowSize;
};


/**
* For lack of a better name, create empty note displays and add them to the 
*	scrolldisplay
* TODO: this should be part of PositionedDisplayArray somehow
*/
ScrollDisplay.prototype.createItems = function()
{
	for( var i=0; i < this.m_nNumDisplays; ++i )
	{
		// have to put dummy noteID in for some reason
		var newItem = new NoteDisplay( null, "xxx", true );

		// this is odd.. positioning is not set via css.. we must manually do it
		newItem.m_objDomContainer.style.position = "absolute";

		// note: setting width to 100% causes horizontal scrollbar in FF..
		// here we need to set width, compensating for borders,hence 2px adjustment
		newItem.m_objDomContainer.style.width = this.m_positionedDisplayArray.m_objDomContainer.offsetWidth - 2 + "px";
		this.m_positionedDisplayArray.addDisplay( newItem );
	}
}

/**
* main binding method to display some notes
*	@param {String[]} in_aNotes array of note IDs
*/
ScrollDisplay.prototype.displayNotes = function( in_aNotes )
{
	// hang on to our list of note ids
	this.m_positionedDisplayArray.m_astrNoteIDs = in_aNotes;
	
	// reset offset to zero.. offset is just the position of our 
	// limited size `view' into the list of note
	this.m_positionedDisplayArray.m_nNotesArrayOffset = 0;
	
	// initialize length of note sizes array
	this.m_positionedDisplayArray.m_anNoteDisplaySizes.length = in_aNotes.length;
	
	this.m_positionedDisplayArray.reset();
	
	// iterate over all available displays
	for( var i=0; i < this.m_positionedDisplayArray.m_nDisplayPoolSize; ++i )
	{
		if( i < in_aNotes.length )
		{
			var noteDisplay = this.m_positionedDisplayArray.getByIndex( i );
			// make sure we make display visible
			noteDisplay.show();
			
			// set the size of the noteDisplay
			noteDisplay.setHeight( 200 );
			
			
			
			// note that we don't raise `requestnoteload' unless forcereload=true
			noteDisplay.setNoteModelID( in_aNotes[i], true );
		}		
		else
		{
			// hide unused displays
			this.m_positionedDisplayArray.getByIndex( i ).hide();
		}
		
	}
	
	// set visible displays count of our inner PositionedDisplayArray
	this.m_positionedDisplayArray.m_nVisibleDisplays = 
		Math.min( in_aNotes.length, this.m_positionedDisplayArray.m_nDisplayPoolSize );
		
	// set scrollbar height - TODO: do we need anything better than a gross
	// estimation? the scrollable area will adjust as notes expand themselves
	
	this.m_positionedDisplayArray.setScrollHeight( in_aNotes.length * 200 );
	
	Messages.Raise( 'notesdisplayed', this.m_strMessagingID );
};

/**
* Should only be used when user creates a new note that is not in the database
* probably need to run thru and see if we already are showing an unsaved note,
* since the implementation of DisplayArray looks to see if the note is already 
* there.
*	@param {String} in_newNoteID temp ID assigned to new note
*/
ScrollDisplay.prototype.addNewNote = function( in_newNoteID )
{
	// add the id to our array of note ids
	// note we are pusing onto the end, this may change if we want
	// to flip to top loading
	this.m_positionedDisplayArray.m_astrNoteIDs.push( in_newNoteID );
	this.m_positionedDisplayArray.addToBottom( in_newNoteID );
};