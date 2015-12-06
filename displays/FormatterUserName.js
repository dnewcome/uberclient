
(function() {

var UserNameFormat = 
{
    username: function( in_strName, in_objElement, in_objDataSet )
    {
        var strRetVal, objModel;
        
        if( Ubernote.m_strUserName == in_strName )
        {
            strRetVal = _localStrings.ME;
        } // end if
        else if( objModel = app.contact.getByUserName( in_strName ) )
        {
            strRetVal = objModel.getName();
            
            // this function is run in the context of the ExtraInfoDataPlugin, 
            //  so we can add listeners when we need them.
            this.m_abAdd = this.m_abAdd || [];
            if( !this.m_abAdd[ in_strName ] )
            {
                [ 'load', 'delete' ].each( function( in_strCommand ) {
                    this.RegisterListenerObject( { 
                        message: 'contact' + in_strCommand, from: in_strName, 
                        listener: this.OnReloadCurrentData, context: this } );
                }, this );
                    
                this.m_abAdd[ in_strName ] = true;
            } // end if
        } // end if
        else
        {   // There is no contact for this username at the moment, 
            //  wait to see if one gets added.
            strRetVal = in_strName;
            this.m_abAdd = this.m_abAdd || [];
            if( !this.m_abAdd[ in_strName ] )
            {   
                this.RegisterListenerObject( { message: 'contactload', from: in_strName, 
                    listener: this.OnReloadCurrentData, context: this } );
            } // end if
            this.m_abAdd[ in_strName ] = true;
        } // end if-else

		return strRetVal;
    }
};
    
    ExtraInfoDataPlugin.addFormatters( UserNameFormat );
})();