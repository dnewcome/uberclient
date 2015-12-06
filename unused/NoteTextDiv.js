
function NoteTextDiv()
{
    NoteTextDiv.Base.constructor.apply( this );
};
UberObject.Base( NoteTextDiv, Display );

Object.extend( NoteTextDiv.prototype, {
    loadConfigParams: function()
    {
        var ConfigParams = {
            m_bCreateEditor: { type: 'boolean', bRequired: false, default_value: true },
            m_strTemplate: { type: 'string', bRequired: false },        // We don't NEED a template for this
            m_objParentElement: { type: 'object', bRequired: true },
            m_bEditable: { type: 'boolean', bRequired: false, default_value: true },
            m_abProvides: { type: 'object', bReqired: false, default_value: 
                { nativeundo: true } }
        };

        NoteTextDiv.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, ConfigParams, true );
    },
    
    init: function( in_objConfig )
    {
        Util.Assert( in_objConfig );
        
        var vRetVal = this.initWithConfigObject( in_objConfig );
        this.m_nTries = 0;
        
        return vRetVal;
    },
    
    childInitialization: function()
    {   
        this.m_objDomContainer.innerHTML = '<br /> ';
        var strID = this.m_objDomContainer.id = this.m_strMessagingID;
        
        NoteTextDiv.Base.childInitialization.apply( this );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'documentresize', Messages.all_publishers_id, this.OnDocumentResize ); 

        NoteTextDiv.Base.RegisterMessageHandlers.apply( this );
    },

    
    /* When we have a new document height, we have to let the editor know */
    OnDocumentResize : function()
    {
        this.resizeTextArea( 1 );
    },
    
    OnKeyDown: function( in_objEditor, in_objEvent )
    {
        if( false == this.m_bEditable )
        {
            DOMEvent( in_objEvent );
            in_objEvent.cancelEvent();
        } // end if
    },
    
    OnContextMenu: function( in_objEditor, in_objEvent )
    {
        DOMEvent( in_objEvent );
        if( true == this.m_bCancelContextMenu )
        {
            in_objEvent.cancelEvent();
        } // end if
    },

    OnMouseUp: function( in_objEditor, in_objEvent )
    { 
        DOMEvent( in_objEvent );
        if ( Event.isLeftClick( in_objEvent ) )
        {
            this.m_bLeftDown = false;
        } // end if

	    if( true == app.drag.dragging )
	    {
        	DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
	    } // end if
        
    },    

    OnMouseMove: function( in_objEditor, in_objEvent )
    { 
	    if( true == app.drag.dragging )
	    {
            DOMEvent( in_objEvent );
        	DOMElement.applyEvent( this.m_objDomContainer, in_objEvent );
            in_objEvent.cancelEvent();
	    } // end if
	},    
        
    OnMouseDown: function( in_objEditor, in_objEvent )
    {   
        DOMEvent( in_objEvent );
        
        // always reset this.
        this.m_bCancelContextMenu = false;
        
        // See if we clicked on a link with the CTRL key down.
        var strHref;
        if( true == in_objEvent.ctrlKey )
        {
            this._openLinkAtEvent( in_objEvent, true );
        } // end if
        else if ( Event.isLeftClick( in_objEvent ) )
        {
            this.m_bLeftDown = true;
        } // end else-if
        else if( ( BrowserInfo.ie && ( 3 == in_objEvent.button ) )  // ie is special 3 = both.
              || ( ( true == this.m_bLeftDown ) 
               && ( Event.isRightClick( in_objEvent ) ) ) )
        {
            in_objEvent.cancelEvent();
            this.m_bCancelContextMenu = true;
        } // end if-else if
        
    },
        
    
    _openLinkAtEvent: function( in_objEvent, in_bCancel )
    {   
        var strHref = DOMElement.findAnchorHref( in_objEvent.target );
        if( strHref )
        {
            window.open( strHref );
            in_bCancel && in_objEvent.cancelEvent();
        } // end if     
    },
    
    
        
    setXML: function( in_strXML )
    {
        Util.Assert( TypeCheck.String( in_strXML ) );
        
        try {
            // We do this create the div, remove the first child, etc
            //  because IE sometimes has problems assignign directly 
            //  to the innerHTML on an element that already has children.
            //  why?  who knows.  Found this solution in several places 
            //  on the net.
            var objDiv = document.createElement( 'div' );
            objDiv.innerHTML = in_strXML;
            var objParent = this.$();
            if( objParent.firstChild ) 
            {
                objParent.removeChild( objParent.firstChild );
            }
            objParent.appendChild( objDiv );
        } 
        catch (e) {
            this.m_nTries++;
            this.Raise( 'addmessage', [ e.message + ': ' + this.m_nTries.toString() ] );
            if( 10 > this.m_nTries )
            {
                Timeout.setTimeout( this.setXML, 100, this, arguments );
            } // end if
        }
    },
    
    getXML: function()
    {
        var strRetVal = this.$().innerHTML;
        return strRetVal;    
    },
    
    setActive: function( in_bActive )
    {
        Util.Assert( TypeCheck.Boolean( in_bActive ) );
        
        this.m_bActive = in_bActive;
    },
    
    setEditable: function( in_bEditable )
    {
        Util.Assert( TypeCheck.Boolean( in_bEditable ) );
        
        this.m_bEditable = in_bEditable;
    },
    
    focus: function()
    {
    },
    
    cancelFocus: function()
    {
    },
    
    resizeTextArea: function( )
    {
        var nMaxHeight = Math.min( document.body.clientHeight - 250, 500 );
        var nHeight = Element.getHeight( this.$() );
        var nNewHeight = Math.min( nMaxHeight, nHeight );
        this.setHeight( nNewHeight );
    },
    
    print: function()
    {
    }
    
    
});

