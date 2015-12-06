/*
* DragPlugin - attaches a menu to a display.
*/
function DragPlugin()
{
    DragPlugin.Base.constructor.apply( this );
}
UberObject.Base( DragPlugin, Plugin );

Object.extend( DragPlugin.prototype, {
    loadConfigParams: function()
    {
        DragPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            /** 
             * What the options mean:
             * m_strDragAttachmentSelector - allows us to specify to attach to a certain element, otherwise 
             *   attaches to the container 
             */
            m_objDragService: { type: 'object', bRequired: true },
            m_strDragIcon: { type: 'string', bRequired: false },
            m_strDragText: { type: 'string', bRequired: false },
            m_strDragAttachmentSelector: { type: 'string', bRequired: false, default_value: '' },
            type: { type: 'string', bRequired: false, default_value: 'DragPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDOMEventHandlers, context: this } )
            .RegisterListenerObject( { message: 'canceldrag', 
	            listener: this.OnDragCancel, context: this } );
	            
	    DragPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterDOMEventHandlers: function()
    {
        var objPlugged = this.getPlugged();

        objPlugged.RegisterListener( 'onmousedown', objPlugged.$( this.m_strDragAttachmentSelector ),
                        this.OnDragStart, undefined, this );
        objPlugged.RegisterListener( 'onmouseup', objPlugged.$( this.m_strDragAttachmentSelector ),
                        this.OnDragCancel, undefined, this );
    },

    OnDragStart: function( in_objEvent )
    {
        var objCoordinates = Event.pointer( in_objEvent );

        this.m_objDragService.start( 
            this.getPlugged(),	            // drag object
            null,	
            null,						    // context for OnDrag
            null, 
            null,					        // context for OnDragEnd
            this.m_strDragIcon,
            this.m_strDragText,
            objCoordinates
        );
        // Cancel the evebnt or we start highlighting text everywhere.
        in_objEvent.cancelEvent();
    },
    
    OnDragCancel: function( in_objEvent )
    {
        this.m_objDragService.cancelDrag();
    }
} );