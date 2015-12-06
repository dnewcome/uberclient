/**
* AttachmentTagDisplay - Used to to display an Attachment model.
*/
function AttachmentTagDisplay( )
{
    AttachmentTagDisplay.Base.constructor.apply( this );
}
UberObject.Base( AttachmentTagDisplay, MetaTagDisplay );

TypeCheck.createForObject( 'AttachmentTagDisplay' );

Object.extend( AttachmentTagDisplay.prototype, {
    _HTMLLoadData: function ()
    {   
        var objMetaTag = this.getMetaTag();
        if( objMetaTag )
        {
            this.setChildHTML( 'elementFilename', objMetaTag.m_strFilename );
            this.setChildHTML( 'elementExtension', objMetaTag.m_strExtension );
            this.setChildHTML( 'elementByteSize', ( objMetaTag.m_nByteSize/1024 ).format( '0,000' ) 
                + _localStrings.SIZE_INDICATOR );
            this.setChildHTML( 'elementCreateDt', dateFormat.toLocaleDateTimeString( objMetaTag.m_dtCreate ) );
            this.setChildHTML( 'elementUpdateDt', dateFormat.toLocaleDateTimeString( objMetaTag.m_dtUpdate ) );
        } // end if
        
        return AttachmentTagDisplay.Base._HTMLLoadData.apply( this, arguments );
    }
} );

