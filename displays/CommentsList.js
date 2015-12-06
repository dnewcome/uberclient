/**
* CommentsList
*/
function CommentsList( )
{
    CommentsList.Base.constructor.apply( this );
}
UberObject.Base( CommentsList, BindingsList );

Object.extend( CommentsList.prototype, {
    loadConfigParams: function()
    {
        CommentsList.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
			m_nDisplaysShown: { type: 'number', bReqired: true }
		} );
	},
	
	RegisterMessageHandlers: function()
	{
		this.RegisterListener( 'showall', Messages.all_publishers_id, this.OnShowAll );
		this.RegisterListener( 'hideextras', Messages.all_publishers_id, this.OnHideExtras );
		
		CommentsList.Base.RegisterMessageHandlers.apply( this, arguments );
	},
	
	/**
	* findInsertionIndex - comments come from the DB already sorted by date,
	*	so we want these in reverse date here.  If a new one comes in, we
	*	automatically want it at the beginning.
	* @param {Object} in_objMetaTag - Comment meta tag being added.
	* @returns {Number} - index, always 0 for a comment.
	*/
	findInsertionIndex: function( in_objMetaTag )
	{
		return 0;
	},
	
	/**
	* addDisplay - add a display to the comments list.  Shows
	*	only the first this.m_nDisplaysShown displays, hide the rest.  
	*	If any displays are hidden, add the 'morecomments' class name
	*	to list container.
	*/
	addDisplay: function()
	{
		CommentsList.Base.addDisplay.apply( this, arguments );
		this._limitShown();
	},
	
	/**
	* removeItem - removes an item from the list. Shows
	*	only the first this.m_nDisplaysShown displays, hide the rest.  
	*	If any displays are hidden, add the 'morecomments' class name
	*	to list container.
	*/
	removeItem: function()
	{
		CommentsList.Base.removeItem.apply( this, arguments );
		this._limitShown();
	},
	
	/**
	* OnShowAll - shows all the comments, removes the 'morecomments' 
	*	classname from the container if already added.
	*/
	OnShowAll: function()
	{
		this.$().removeClassName( 'morecomments' );
		this.$().addClassName( 'lesscomments' );
		this.Raise( 'listheightchange' );
		this.showAll();
	},

	/**
	* OnHideExtras - called to hide the extra displays
	*/
	OnHideExtras: function()
	{
		this._limitShown();
	},
	
	/**
	* @private
	* _limitShown - limit the number of displays shown to the number in this.m_nDisplaysShown.
	*/
	_limitShown: function()
	{
		this.$().removeClassName( 'morecomments' );
		this.$().removeClassName( 'lesscomments' );

		this.Raise( 'listheightchange' );
		
		for( var nIndex = 0; objElement = this.getElementByIndex( nIndex ); ++nIndex )
		{
			if( nIndex < this.m_nDisplaysShown )
			{
				objElement.removeClassName( 'hide' );
			} // end if
			else
			{
				objElement.addClassName( 'hide' );
				this.$().addClassName( 'morecomments' );
				this.$( 'elementExtraCount' ).innerHTML = ( nIndex - this.m_nDisplaysShown + 1 ).toString();
			} // end if-else
		} // end for
	}
} );