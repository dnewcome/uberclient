function NoteDragReceiverPlugin()
{
    return NoteDragReceiverPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteDragReceiverPlugin, Plugin );

Object.extend( NoteDragReceiverPlugin.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_objDragService: { type: 'object', bRequired: true },
            type: { type: 'string', bRequired: false, default_value: 'NoteDragReceiverPlugin' }
        };
        NoteDragReceiverPlugin.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    },
        
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );

        NoteDragReceiverPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    

    OnRegisterDomEventHandlers: function()
    {
        var objPlugged = this.getPlugged();

   	    this.RegisterListenerObject( { message: 'onmouseover', from: objPlugged.$(), 
   	        listener: this.OnMouseOverHandler, context: this } );
   	    this.RegisterListenerObject( { message: 'onmouseout', from: objPlugged.$(), 
   	        listener: this.OnMouseOutHandler, context: this } );
    },
    
    /**
    * OnMouseOverHandler - register our drop handler when we mouse over 
    * @param {Object} in_objEvent - event that triggered this.
    */
    OnMouseOverHandler: function( in_objEvent )
    { 
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        var objDrug = this.m_objDragService.queryDragSource();
        
        if( objDrug )
        {
	        this.m_objDragService.regDropTarget( this.OnDrop, this ); 
	    } // end if
    },

    /**
    * OnMouseOutHandler - When going out, cancel the drag.
    * @param {Object} in_objEvent - event that triggered this.
    */
    OnMouseOutHandler: function( in_objEvent )
    { 
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        if( ( this.m_objDragService.dragging )
         && ( DOMEvent.checkMouseLeave( in_objEvent ) ) 
         && ( in_objEvent.relatedTarget != this.m_objDragService.m_objDragElement ) )
        {
	        this.m_objDragService.unregDropTarget(); 
	    } // end if
    },
    
    /**
    * OnDrop - handler for objects dropped on a note object.
    * @in_objObject {object} this is the object that is being dropped on us.  
    *   For now we only get a ViewNodeDisplay
    */
    OnDrop: function( in_objObject )
    {
        if( in_objObject )
        {   
            var objPlugged = this.getPlugged();
            var strMetaTagID = in_objObject.getMetaTagID();
            // We are doing this directly so that we don't have to 
            // include the NoteActionsPlugin for each of the 50000 list item displays.
 	        this.RaiseForAddress( 'requestnotetaggedadd', objPlugged.m_strNoteID, [ strMetaTagID ] );
        } // end if
    }
} );    
