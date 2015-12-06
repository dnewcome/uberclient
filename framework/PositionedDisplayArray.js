/**
* Version of DisplayArray that uses absolute positioning to show elements
*	within its container.
* @param {DOMElement} in_domContainer the dom element to use as the outermost container
*/
function PositionedDisplayArray( in_domContainer )
{
	this.m_objDomContainer = in_domContainer;
	
	// the offset of the first displayed note from 
	// the start of the noteID array
	this.m_nNotesArrayOffset = undefined;
	
	// the set of note ids that we are displaying
	this.m_astrNoteIDs = undefined;
	
	// remember note display heights
	this.m_anNoteDisplaySizes = new Array();
	
	// max number of displays to create
	this.m_nDisplayPoolSize = undefined;

	// of displays that are visible
	this.m_nVisibleDisplays = undefined;

	// keep an array of displays
	this.m_aDisplays = new Array();
	
	// the number of displays that we are actually showing
	this.m_visibleDisplayCount;

	// UID for SMPS
	this.m_strMessagingID = Messages.generateID();
	
	// holding pen for the displays that we don't use
	this.m_aUnusedDisplays = new Array();
	
	// indicate whether we need to be reusing displays
	// we can calculate this each time, but using a member for clarity
	this.m_bRecycleMode = undefined;
}

/**
* initializer
* @param {Number} in_nMaxDisplays limit the number of displays to use
*/
PositionedDisplayArray.prototype.init = function( in_nMaxDisplays )
{
	// TODO: maybe this should be in CSS
	this.m_objDomContainer.style.position = "relative";
	
	// TODO: DisplayPoolSIze is now sort of misleading, may want to 
	// rename this
	this.m_nDisplayPoolSize = in_nMaxDisplays;
	
	this.registerMessageHandlers();
}

/**
* takes all displays back to top and sets scroll position
*/
PositionedDisplayArray.prototype.reset = function()
{
	var offset = this.m_aDisplays[0].m_objDomContainer.scrollTop;
	for( var i=0; i < this.m_aDisplays.length; ++i )
	{
		this.m_aDisplays[i].m_objDomContainer.style.top = 
			this.m_aDisplays[i].m_objDomContainer.offsetTop - offset + "px";
	}
	this.m_objDomContainer.scrollTop = 0;
}

/**
* set the height of the scrollable contents 
* TODO: this maybe doesn't need to be public?
* @param {Number} in_scrollHeight height of scrollable area
*/
PositionedDisplayArray.prototype.setScrollHeight = function( in_scrollHeight )
{
	this.m_objDomContainer.style.height = in_scrollHeight + "px";
}

// @param {Number} in_difference the amount to change scroll height, may be negative
PositionedDisplayArray.prototype.adjustScrollHeight = function( in_difference )
{
	var previousValue = this.m_objDomContainer.offsetHeight;
	this.m_objDomContainer.style.height = ( previousValue + in_difference ) + "px";
}


/*
* addToTop takes the bottom element and moves it to the top
*/
PositionedDisplayArray.prototype.addToTop = function()
{
	// already at the top, don't add another note
	if( this.m_nNotesArrayOffset == 0 )
	{
		return;
	}

	
	// pop off the last item in the array
	var newItem = this.m_aDisplays.pop();
	
	// save height of note we are taking off the bottom for reuse
	this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset + (this.m_nDisplayPoolSize - 1) ] = newItem.m_objDomContainer.offsetHeight;	
	
	
	// this is the current offset of the top note
	var offsetTop = this.m_aDisplays[0].m_objDomContainer.offsetTop;

	
	// check to see if we have cached the height of this note
	if( this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset - 1 ] )
	{
		newItem.m_objDomContainer.style.top = 
			( offsetTop - this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset - 1 ] ) + "px";
			
		// manually set the height now also
		newItem.m_objDomContainer.style.height = this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset - 1 ] + "px";
	
	}
	else
	{
		// todo: hardcoded value
		newItem.m_objDomContainer.style.top = ( offsetTop - 200 ) + "px";
	}
	
	
	// put the item at the beginning of the array
	this.m_aDisplays.unshift( newItem );
	
	// load up note data based on the next note id
	newItem.setNoteModelID( this.m_astrNoteIDs[ this.m_nNotesArrayOffset - 1 ], true );
	
	// decrement the offset
	this.m_nNotesArrayOffset -= 1;
};

/**
* addToBottom takes the top element and moves it to the bottom
* TODO: is this really the right place to bind noteID to dipsplay?
*	@param {String} in_noteID 
*/
PositionedDisplayArray.prototype.addToBottom = function()
{
	// already at the bottom, don't add another note
	if( (this.m_nNotesArrayOffset + this.m_nVisibleDisplays) == this.m_astrNoteIDs.length )
	{
		return;
	}

	var newItem;
	// check to see if we need to recycle a display
	if( this.m_nVisibleDisplays < this.m_nDisplayPoolSize )
	{
	
		
		// NOTE: we are assuming that we have initialized things
		// so that our unused displays are at the end of our array
		// not sure if this is good or not, probably depends on whether 
		// we ever `flip' things around to load top down. It may be worth
		// implementing a separate deadpool area rather than just hiding
		// unused displays among the used
		
		// start looking at the bottom, work up, break when we find the first one
		for( var i = this.m_aDisplays.length - 1; i >= 0; --i )
		{
			var domElement = this.m_aDisplays[i].m_objDomContainer;
			if( Element.hasClassName( domElement, "hide" ) )
			{
				newItem = this.m_aDisplays[i];
				// make it visible for god's sake!!
				newItem.show();
				
				// increment visible displays count
				this.m_nVisibleDisplays += 1;
				break;
			}
		}
		
	}
	else
	{
		// reuse an item from the top
		newItem = this.m_aDisplays.shift();
		
		// save position of note we are taking off the top
		// m_nNotesArrayOffset will point to the correct index we should use
		this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset ] = newItem.m_objDomContainer.offsetHeight;	
		
	}
		
	this.addToEnd( newItem );

/*
	// calculate positioning information based on the last visible display
	// we wouldn't have to go to this trouble if we kept a separate pool
	var lastNode;	
	
	// start looking at the bottom, work up, break when we find the first one
	for( var i = this.m_aDisplays.length - 1; i >= 0; --i )
	{
		var domElement = this.m_aDisplays[i].m_objDomContainer;
		if( !Element.hasClassName( domElement, "hide" ) )
		{
			lastNode = domElement;
			break;
		}
	}
	
	var offsetTop = lastNode.offsetTop + lastNode.offsetHeight;
	
	this.m_aDisplays.push( newItem );
	
	newItem.m_objDomContainer.style.top = offsetTop + "px";
	
	
	// check to see if we had stored the size of this note off
	if( this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ] )
	{	
		// manually set the height now also
		newItem.m_objDomContainer.style.height = this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ] + "px"
	}
	else
	{
		// todo: hard coded value
		newItem.m_objDomContainer.style.height = 200 + "px"
	}
*/	
	
	
	
	
	
	// load up note data based on the next note id
	newItem.setNoteModelID( this.m_astrNoteIDs[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ], true );
	
	// increment the offset
	this.m_nNotesArrayOffset += 1;

};

PositionedDisplayArray.prototype.getFirstDisplayOffsetTop = function()
{
	// todo: need to handle cases where we have no visible displays
	return m_aDisplays[0];
	
};

PositionedDisplayArray.prototype.getLastDisplayOffsetTop = function()
{
	// todo: need to handle cases where we have no visible displays
	return m_aDisplays[ m_aDisplays.length - 1 ]
};

/**
* Since we want this to be sort of generic, we don't create note displays,
*	we provide an interface where we can add some displays.  maybe we should
*	have a callback that we can wire up externally so that this can be part of 
*	init. 
* @param {Display} in_newItem display to add to the pool
*/
PositionedDisplayArray.prototype.addDisplay = function( in_newItem )
{
	
	var lastNode = this.m_aDisplays[ this.m_aDisplays.length - 1 ];
		
	if( this.m_aDisplays.length > 0 )
	{
		var offsetTop = lastNode.m_objDomContainer.offsetTop + lastNode.m_objDomContainer.offsetHeight;
		in_newItem.m_objDomContainer.style.top = offsetTop + "px";
	}
	
	// add to the dom, and also add to array
	this.m_objDomContainer.appendChild( in_newItem.m_objDomContainer );
	
	this.m_aDisplays.push( in_newItem );
	
	// dead pool code.. may not use this
	/*
	in_newItem.hide();
	this.m_aUnusedDisplays.push( in_newItem );
	this.m_objDomContainer.appendChild( in_newItem.m_objDomContainer );
	*/
};

/**
* @private
*/
PositionedDisplayArray.prototype.registerMessageHandlers = function() 
{
	// we want to be notified of any note resize, in order to shift notes down in proportion
	Messages.RegisterListener( "noteresized", Messages.all_publishers_id, this.m_strMessagingID, this.adjustElementOffsets, this );
	Messages.RegisterListener( "notedelete", Messages.all_publishers_id, this.m_strMessagingID, this.OnNoteDelete, this );
	Messages.RegisterListener( "noteclosed", Messages.all_publishers_id, this.m_strMessagingID, this.OnNoteClosed, this );
};

/**
* Reposition elements following an element whose display has been resized
*/
PositionedDisplayArray.prototype.adjustElementOffsets = function( in_objDisplay )
{
	// todo: is it possible that we won't find our note display?
	var resizedDisplayIndex = this.m_aDisplays.indexOf( in_objDisplay );
	
	// scrollbar compensation
	var previousSize;
	if( this.m_anNoteDisplaySizes[ resizedDisplayIndex + this.m_nNotesArrayOffset ] )
	{
		previousSize = this.m_anNoteDisplaySizes[ resizedDisplayIndex + this.m_nNotesArrayOffset ];
	}
	else
	{
		// todo: hardcoded size
		previousSize = 200;
	}
	if( in_objDisplay.m_objDomContainer.offsetHeight != previousSize )
	{
		var offset = in_objDisplay.m_objDomContainer.offsetHeight - previousSize;
		this.adjustScrollHeight( offset );
		
		// save the new size
		this.m_anNoteDisplaySizes[ resizedDisplayIndex + this.m_nNotesArrayOffset ] = 
			in_objDisplay.m_objDomContainer.offsetHeight;
	}
	
	
	for( var i=resizedDisplayIndex + 1; i < this.m_aDisplays.length; ++i )
	{
		// offset display based on previous display.. it may be faster to precompute
		// offset, not sure. TODO: if we ever have borders around the notes, the offsets will
		// be off in FF
		this.m_aDisplays[i].m_objDomContainer.style.top = ( this.m_aDisplays[i-1].m_objDomContainer.offsetTop + this.m_aDisplays[i-1].m_objDomContainer.offsetHeight ) + "px";
	}
}

/**
* Return display at given index
*	@param {Number} in_index the index of the display to retrieve
*	@returns {Display} returns a Display instance 
*/
PositionedDisplayArray.prototype.getByIndex = function( in_index )
{
	if( in_index < this.m_aDisplays.length )
	{
		return this.m_aDisplays[ in_index ];
	}
}

/**
* We need to readjust notes if we delete a note
*/
PositionedDisplayArray.prototype.OnNoteDelete = function( in_strNoteID )
{
	var nNoteIndex;
	
	// find the note in our array.. todo: is there a way that we can get
	// a displayID reference in here? maybe we don't care about actual note deletion
	for( var i=0; i < this.m_aDisplays.length; ++i )
	{
		if( this.m_aDisplays[i].m_strNoteID == in_strNoteID )
		{
			nNoteIndex = i;
			break;
		}
	}
	
	// save height of the removed display
	var removedDisplayHeight = this.m_aDisplays[ nNoteIndex ].m_objDomContainer.offsetHeight;
	
	
	
	
	// now we need to load up another note at the end ... but only if we have more to display
	if( this.m_nNotesArrayOffset + this.m_nDisplayPoolSize < this.m_astrNoteIDs.length )
	{
		// position the removed display at the bottom
		this.addToEnd( this.m_aDisplays[ nNoteIndex ] )

		// get the last display
		var noteDisplay = this.m_aDisplays[ this.m_aDisplays.length - 1 ];
								
		// note that we don't raise `requestnoteload' unless forcereload=true
		noteDisplay.setNoteModelID( this.m_astrNoteIDs[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ], true );
	}
	

	
	
	
	// shift everything up to fill the hole
	for( var i=nNoteIndex + 1; i < this.m_aDisplays.length; ++i )
	{	
		this.m_aDisplays[i].m_objDomContainer.style.top = 
			this.m_aDisplays[i].m_objDomContainer.offsetTop - removedDisplayHeight + "px";
	}
	
	
	// take the display out of the array and put it on the end.
	this.m_aDisplays.push( this.m_aDisplays.splice( nNoteIndex, 1 )[0] );
	
	// compensate the scrollbar.. wait shouldn't have to do this
	this.adjustScrollHeight( -(removedDisplayHeight) );
	
	
	// also remember to remove the entry from the note sizes array, and the note ids array
	this.m_anNoteDisplaySizes.splice( nNoteIndex + this.m_nNotesArrayOffset, 1 );
	this.m_astrNoteIDs.splice( nNoteIndex + this.m_nNotesArrayOffset, 1 );
	
	
	
}

PositionedDisplayArray.prototype.OnNoteClosed = function( in_strNoteID )
{
	var foo = "bar";
	
	
	this.OnNoteDelete( in_strNoteID );
}



///////////////////

// refactored out of addto bottom .. we want to use this in other places
PositionedDisplayArray.prototype.addToEnd = function( in_newItem )
{
	// calculate positioning information based on the last visible display
	// we wouldn't have to go to this trouble if we kept a separate pool
	var lastNode;	
	
	// start looking at the bottom, work up, break when we find the first one
	for( var i = this.m_aDisplays.length - 1; i >= 0; --i )
	{
		var domElement = this.m_aDisplays[i].m_objDomContainer;
		if( !Element.hasClassName( domElement, "hide" ) )
		{
			lastNode = domElement;
			break;
		}
	}
	
	var offsetTop = lastNode.offsetTop + lastNode.offsetHeight;
	
	this.m_aDisplays.push( in_newItem );
	
	in_newItem.m_objDomContainer.style.top = offsetTop + "px";
	
	
	// check to see if we had stored the size of this note off
	if( this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ] )
	{	
		// manually set the height now also
		in_newItem.m_objDomContainer.style.height = this.m_anNoteDisplaySizes[ this.m_nNotesArrayOffset + this.m_nDisplayPoolSize ] + "px"
	}
	else
	{
		// todo: hard coded value
		in_newItem.m_objDomContainer.style.height = 200 + "px"
	}
}