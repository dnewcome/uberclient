/**
* Inline editor control for note titles
*/
function InlineEdit()
{
    this.m_strPreviousValue = undefined;
	this.m_bEditing = undefined;
	
	InlineEdit.Base.constructor.apply( this, arguments );
};
UberObject.Base( InlineEdit, Display );

Object.extend( InlineEdit.prototype, { 
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        var bRetVal = this.initWithConfigObject( in_objConfig );
        
        this.m_bEditing = false;
        
        if( this.m_strTooltip )
        {
            DOMElement.setTooltip( this.$(), this.m_strTooltip );
        } // end if
    },
    
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_bEditable: { type: 'boolean', bRequired: true },
            m_strTooltip: { type: 'string', bRequired: false, default_value: '' },
            type: { type: 'string', bReqired: false, default_value: 'inlineedit' }
        };
        
        InlineEdit.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },
    
	RegisterMessageHandlers: function()
	{	
        this.RegisterListener( 'onclick', this.$(), this.OnMouseDown );
        
        InlineEdit.Base.RegisterMessageHandlers.apply( this, arguments );
	},
	
	/**
	* Return the text displayed in the control
	*/
	GetValue: function()
	{
		return Util.escapeTags( this.$( 'displayElement' ).innerHTML );
	},
	
	/**
	* Set the text to display in the control
	*/
	SetValue: function( value )
	{
	    var strValue = Util.escapeTags( value );
		this.$( 'displayElement' ).innerHTML = strValue;
		
		var strTooltip = '';
        if( this.m_strTooltip )
        {
            strTooltip = this.m_strTooltip + ' - ';
        } // end if
		
		strTooltip += strValue;
        
        DOMElement.setTooltip( this.$(), strTooltip );
	},
	
	/**
	* Put the control into edit mode
	*/
	OnMouseDown: function( in_objEvent )
	{
	    if( true === this.m_bEditing )
	    {
	        // cancel this or else we turn off the editing.
		    if( in_objEvent )
		    {   // sometimes this is called outside of an event handler
		       in_objEvent.cancelEvent();
            } // end if
	    } // end if
	    else if( true === this.m_bEditable )
	    {
    		this.m_strPreviousValue = this.GetValue();
		    this.$( 'inputBox' ).value = Util.unescapeTags( this.m_strPreviousValue );
    		
    		DOMElement.addClassName( this.$(), 'editing');
            
		    this.m_bEditing = true;

            // We do this to let any menus close and all that good
            // stuff so that we can get the focus correct.
		    Timeout.setTimeout( function(){ this.ShowContinuation(); }, 2, this );
		} // end if
	},

	/**
	* We have to do this in new call stack in order to attach event
	* without also calling the handler
	*/
	ShowContinuation: function()
	{
	    this.$( 'inputBox' ).focus();
	    this.$( 'inputBox' ).select(); // selects text contents
            
        this.RegisterListener( 'onkeydown', this.$(), this.OnKeyDownHandler );
        this.RegisterListener( 'onkeyup', this.$(), this.OnKeyUpHandler );
	    this.RegisterListener( 'onclick', document, this.DocumentClickHandler );
	},
	
	/**
	* Handler for the `click away' from control 
	*/
	DocumentClickHandler: function()
	{
		this.Hide( true, true );
	},
	
	/**
	* Exit edit mode
	*/
	Hide: function( commit, in_bClickOut )
	{
		this.Raise( 'inlineeditclose', [ in_bClickOut ] );
		
		if( commit )
		{
		    var strNewValue = this.$( 'inputBox' ).value;
			this.SetValue( strNewValue );
			
			this.Raise( 'inlineeditchanged', [ strNewValue ] );//, true );
		} // end if
		else 
		{
		    this.SetValue( this.m_strPreviousValue );

			this.Raise( 'inlineeditcancelled' );
		} // end if-else
		
	    this.UnRegisterListener( 'onclick', document, this.DocumentClickHandler );
        this.UnRegisterListener( 'onkeydown', this.$(), this.OnKeyDownHandler );
        this.UnRegisterListener( 'onkeyup', this.$(), this.OnKeyUpHandler );

    	DOMElement.removeClassName( this.$(), 'editing');
	    this.m_bEditing = false;
	},
	
	/**
	* Listen for key events on the control to commit/abort
	*/
	OnKeyDownHandler: function( in_objEvent )
	{
		if( ( in_objEvent.keyCode == KeyCode.ENTER ) 
		 || ( in_objEvent.keyCode == KeyCode.TAB ) 
		 || ( in_objEvent.keyCode == KeyCode.ESC ) )
		{
    	    in_objEvent.cancelEvent();

		    this.Hide( in_objEvent.keyCode != KeyCode.ESC );
		} // end if
	},

	/**
	* swallow key up or else
	* otherwise they bubble up and we are always saving the note.
	*/
	OnKeyUpHandler: function( in_objEvent )
	{
        in_objEvent.cancelEvent();
	},
	
	SetEditable: function( in_bEditable )
	{
    	this.m_bEditable = in_bEditable;
	}	
} );
