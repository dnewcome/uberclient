

function DebugWindow( in_objAttachmentPoint )
{
    if( true == Config.bShowMessageTrace )
    {
        this.m_objHead = TemplateManager.GetTemplate( "MessagePassing" );
        this.m_nCount = 0;
        this.m_objParent = undefined;
    
        this.attachToContainer( in_objAttachmentPoint );
    } // end if
}

DebugWindow.prototype.AddEntry = function( in_strMessage )
{
    if( this.m_objParent )
    {
        var objMessage = document.createElement( 'div' );

        // regular expression to filter out
        objMessage.innerHTML = String(this.m_nCount) + '. ' + in_strMessage;

        if( this.m_objHead.firstChild )
        {
            this.m_objHead.insertBefore( objMessage, this.m_objHead.firstChild );
        } // end if
        else
        {
            this.m_objHead.appendChild( objMessage );
        } // end if-else
        this.m_nCount++;
    } // end if
};

DebugWindow.prototype.RaiseMessage = function( in_strMessage, in_strPublisher, in_strSubscriber, in_atArguments ) 
{
    if( this.m_objParent && ( ! (/mouse/g.test( in_strMessage ) ) ) )
    {
        if( ! in_strSubscriber )
        {
            in_strSubscriber = "all_subscribers";
        } // end if
        
        var strMessage = String(this.m_nCount)+'. RaiseMessage: '+in_strMessage+' from '+in_strPublisher+' to '+in_strSubscriber;
        this.AddEntry( strMessage );
    } // end if
};

DebugWindow.prototype.attachToContainer = function( in_objContainer )
{
    if( ( typeof( in_objContainer ) != 'undefined' ) && ( in_objContainer != null ) )
    {
        in_objContainer.appendChild( this.m_objHead );
        this.m_objParent = in_objContainer;
    } // end if
};

var DW = new DebugWindow();


