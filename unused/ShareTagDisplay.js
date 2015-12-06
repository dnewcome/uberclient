/**
* ShareTagDisplay - Used to to display an Share model.
*/
function ShareTagDisplay( )
{
    ShareTagDisplay.Base.constructor.apply( this );
}
UberObject.Base( ShareTagDisplay, MetaTagDisplay );

TypeCheck.createForObject( 'ShareTagDisplay' );

Object.extend( ShareTagDisplay.prototype, {
    _HTMLLoadData: function ()
    {   
        var objBinding = this.getExtraInfo();
        if( objBinding )
        {
            this.setChildHTML( 'elementNoteID', objBinding.Note_ID );
            this.setChildHTML( 'elementShareLevel', objBinding.Share_Level);
        } // end if
        
        return ShareTagDisplay.Base._HTMLLoadData.apply( this, arguments );
    }
} );
