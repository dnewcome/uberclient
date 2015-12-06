function NoteDatesPlugin( in_objNoteDisplay )
{
    this.m_objSaveClassTimer = undefined;
    this.m_objSaveDateTimer = undefined;
    
    return NoteDatesPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteDatesPlugin, Plugin );

Object.extend( NoteDatesPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteDatesPlugin.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, {
            m_eUpdateDateFormat: { type: 'string', bRequired: false, default_value: Date.eDateFormat.FUZZY },
            m_eCreateDateFormat: { type: 'string', bRequired: false, default_value: Date.eDateFormat.REGULAR }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'loaddataobject', 
	            listener: this.OnLoadData, context: this } )
            .RegisterListenerObject( { message: 'onsavecomplete', 
	            listener: this.OnSaveComplete, context: this } )
            .RegisterListenerObject( { message: 'notetextedited', 
	            listener: this.OnNoteTextEdited, context: this } )
            .RegisterListenerObject( { message: 'noterefreshupdatedate', 
                from: Messages.all_publishers_id,
	            listener: this.OnRefreshUpdateDate, context: this } );

        NoteDatesPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    teardown: function()
    {
        Timeout.clearTimeout( this.m_objSaveClassTimer );
        Timeout.clearTimeout( this.m_objSaveDateTimer );
        
        NoteDatesPlugin.Base.teardown.apply( this );
    },

    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );

        this.OnRefreshUpdateDate();
        
        var objElement = this.getPlugged().$( 'elementCreateDate' );      
        var strFormat = objElement.getAttribute( '_format' ) || this.m_eCreateDateFormat;

        var strDate = in_objNoteData.Create_Dt ? 
            in_objNoteData.Create_Dt.format( strFormat ) : '';
            
        this.getPlugged().$( 'elementCreateDate' ).update( strDate );
    },
    

    /**
    * Refresh the fuzzy update date based on the this.m_dtUpdateDate
    */        
    OnRefreshUpdateDate: function()
    {
        var objElement = this.getPlugged().$( 'elementUpdateDate' );
        if( ( objElement )
         && ( ! objElement.hasClassName( 'dirty' ) )
         && ( ! objElement.hasClassName( 'recentsave' ) ) )
        {
            // we have saved. We want to save hidden notes as well
            //  because they may reappear at some point!
            var strFormat = objElement.getAttribute( '_format' ) || this.m_eUpdateDateFormat;
            var objPlugged = this.getPlugged();
            var strDate = objPlugged.m_objExtraInfo && objPlugged.m_objExtraInfo.Update_Dt ?
                this.getPlugged().m_objExtraInfo.Update_Dt.format( strFormat ) : '';
            objElement.update( strDate );
        } // end if-else
    },

    /**
    * OnSaveComplete - update the save status
    */
    OnSaveComplete: function()
    {
        var objElement = this.getPlugged().$( 'elementUpdateDate' )
            .update( _localStrings.SAVED ).removeClassName( 'dirty' );
        
        this.m_objSaveClassTimer = DOMElement.addTimedClassName( objElement, 
            'recentsave', 1000 );
        this.m_objSaveDateTimer = Timeout.setTimeout( 
            this.OnRefreshUpdateDate, 1000, this );
        
        this.OnRefreshUpdateDate();
    },
    
    OnNoteTextEdited: function()
    {
        /* Remove these timers and clear their contents or else we
         * get dark black text or green dates at times
        */
        var objElement = this.getPlugged().$( 'elementUpdateDate' );
        
        if( this.m_objSaveClassTimer )
        {
            Timeout.clearTimeout( this.m_objSaveClassTimer );
            objElement.removeClassName( 'recentsave' );  // just in case.
            this.m_objSaveClassTimer = null;
        } // end if
        if( this.m_objSaveDateTimer )
        {
            Timeout.clearTimeout( this.m_objSaveDateTimer );
            this.m_objSaveDateTimer = null;
        } // end if

        objElement.addClassName( 'dirty' ).update( _localStrings.EDITED );
    }
} );    
