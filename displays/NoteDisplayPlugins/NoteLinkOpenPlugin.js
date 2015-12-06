/**
* NoteLinkOpenPlugin - If the user clicks a link in the note that has an href that
*   has noteid:NOTEID, open the note in single note view.
*/
function NoteLinkOpenPlugin()
{
    NoteLinkOpenPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteLinkOpenPlugin, Plugin );

Object.extend( NoteLinkOpenPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'registerdomeventhandlers', this.OnRegisterDOMEventHandlers, this );
        this.RegisterListener( 'notelinkopenevent', this.OnLinkOpenEvent, this );
        this.RegisterListener( 'opennotelink', this.OnOpenLink, this );
        
        NoteLinkOpenPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnRegisterDOMEventHandlers: function()
    {
        var objElement = this.getPlugged().$();
        this.RegisterListenerObject( { message: 'click', from: objElement,
            listener: this.OnLinkOpenEvent, context: this } );
    },
    
    /**
    * OnLinkOpenEvent - looks at the passed in event, if the event's target
    *       is part of an anchor, open the anchor and cancel the event.
    * @param {Object} in_objEvent - event causing this.
    */
    OnLinkOpenEvent: function( in_objEvent )
    {
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        this.m_bPreventOpen = false;
        var strHRef = DOMElement.findAnchorHref( in_objEvent.target );
        if( strHRef )
        {
            var bCancel = this.OnOpenLink( strHRef );
            if( bCancel )
            {   // if we don't prevent the default, the browser tries to open the link.
                in_objEvent.preventDefault();
            } // end if
        } // end if
    },

    /**
    * OnOpenLink - opens a link.
    * @param {String} in_strHRef - href to open.
    * @returns {bool} true if link opened, false otw.
    */
    OnOpenLink: function( in_strHRef )
    {
        var bRetVal = !/^javascript/.test( in_strHRef );
        if( /^note:/.test( in_strHRef ) )
        {   
            var strNoteID = in_strHRef.replace( /^note:/, '' );
            if( true === Ubernote.m_bStandaloneEditor )
            {
                this.getPlugged().Raise( 'requestnoteexternal', [ strNoteID ] );
            } // end if
            else
            {
                this.getPlugged().Raise( 'requestdisplaynotes', [ { noteids: [ strNoteID ] } ] );
            } // end if
        } // end if
        else if( bRetVal )
        {   // normal link, open it.
            window.open( in_strHRef );
        } // end if-else
        
        return bRetVal;
    }
    
} );
