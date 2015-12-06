/**
* HashListNode( elem ) - constructor. Creates unlinked node with elem as data
*	Interface:
*	extract() - unlinks node, linking its predecessor and successor.
*	insertAfter( node ) - insert node after this node, updating links.
* Adapted from http://www.thescripts.com/forum/thread90925.html
*/

function HashListNode( elem ) 
{
	this.elem = elem;
	this.prev = this.next = null;
}

/**
* extract - unlinks the node from the list and updates neighbor links
*/
HashListNode.prototype.extract = function () 
{
	if( this.prev ) 
	{
		this.prev.next = this.next;
	}
	if( this.next ) 
	{
		this.next.prev = this.prev;
	}
	
	this.prev = this.next = null;
};

/**
* Internal - don't call directly, since we assume that newNode
*	is already in the list.  Attempts to add node using this will
*	not be added to the hash
*/
HashListNode.prototype.insertAfter = function( newNode ) 
{
	if (this == newNode) { return; } // don't be daft!
	newNode.extract();
	newNode.prev = this;
	
	// `this' could be a HashList, or a HashListNode
	// depending on how we are called
	if( this.next ) 
	{
		newNode.next = this.next;
		this.next.prev = newNode;
	}
	this.next = newNode;
};


/**
* Interface:
*	getFirst() - returns first node, or null if none
*	getLast() - returns last node, or null if none
*	add( elem[, afterNode] ) - creates new node with elem as data and
*		inserts it at end of list, or optionally
*		after afterNode
*	foreach( func ) - calls func on all elements stored in list
*	find( func[, afterNode] ) - finds first node in list (optionally after
*		afterNode) where func returns true when
*		called on the element.
*/
function HashList() 
{
	this.prev = this.next = this;
	this.hash = new Object();
}

HashList.prototype.insertAfter = HashListNode.prototype.insertAfter;

HashList.prototype.getFirst = function() 
{
	return ( this.next == this ) ? null : this.next;
};

HashList.prototype.getLast = function() 
{
	return ( this.prev == this ) ? null : this.prev;
};

HashList.prototype.add = function( key, elem, afterNode ) 
{
	// create a new node with elem as the data
	var newNode = new HashListNode( elem );
	
	// add node to our hash
	this.hash[ key ] = newNode;
	
	// create proper links to other nodes
	if( !afterNode ) 
	{
		if( this.prev ) 
		{
			afterNode = this.prev;
		} 
		else 
		{
			afterNode = this;
		}
	}

	afterNode.insertAfter(newNode);
	
	return newNode;
};

HashList.prototype.foreach = function( func ) 
{
	for( var node = this.next; node != this; node = node.next ) 
	{
		func( node.elem );
	}
};

HashList.prototype.find = function (func, startNode) 
{
	if (!startNode) { startNode = this; }
	for (var node = startNode.next; node != this;node = node.next) 
	{
		if (func(node.elem)) {return node;}
	}
};