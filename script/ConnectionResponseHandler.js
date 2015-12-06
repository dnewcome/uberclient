function ConnectionResponseHandler()
{
    this.m_bOffline = undefined;
    
    ConnectionResponseHandler.Base.constructor.apply( this );
}
UberObject.Base( ConnectionResponseHandler, UberObject );

Object.extend( ConnectionResponseHandler.prototype, {
    loadConfigParams: function()
    {
        ConnectionResponseHandler.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_n404Count: { type: 'number', bRequired: false, default_value: 0 },
            m_n404Threshold: { type: 'number', bRequired: false, default_value: 2 },
            type: { type: 'string', bRequired: false, default_value: 'ConnectionResponseHandler' }
        } );
    },
    
    /**
    * init - do some initialization.
    * @param {Object} in_objConfig (optional) - configuration object.
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.UObject( in_objConfig ) );
        
        this.initWithConfigObject( in_objConfig || {} );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'ajaxresponse', Messages.all_publishers_id, this.OnResponse );
        
        ConnectionResponseHandler.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnResponse - called for any AJAX response.
    * @param {Object} in_objResponse - response object.
    * @param {String} in_strHeading - Normally the web service called
    * @param {Object} in_objArguments - arguments request was called with.
    */
    OnResponse: function( in_objResponse, in_strHeading, in_objArguments )
    {
        switch( in_objResponse.status )
        {
            case 0:
            case 404:
                this.On404();
                break;
            case 200:
                this.On200();
                break;
            default:
                /** 
                * These two give us issues when we are behind squid caches for some unknown reason.  Have
                *   to investigate this. Have a feeling it has to do with making too many requests in too short
                *   a timeframe.  For GetActivityUpdates, do a regular expression since it is called with a 
                *   timestamp attached on the end.
                */
                if( ( 'userSessionLog' != in_strHeading ) 
                 && (  false == /^GetActivityUpdates/.test( in_strHeading ) ) )
                {
                    this.Raise( 'raiseerror', [ 'XMLHTTPResponse failure: ' + in_strHeading, 
                        ErrorLevels.eErrorType.ERROR, ErrorLevels.eErrorLevel.CRITICAL, 
                        ( in_objArguments || '' ) + ': ' + in_objResponse.responseText ], true );
                    bRetVal = false;
                } // end if
                break;
        } // end switch
    },
    
    
    /**
    * Called for a 404 error.  If we pass our m_n404Threshold, show the warning dialog.
    */
    On404: function()
    {
        this.m_n404Count++;
        if( this.m_n404Count >= this.m_n404Threshold )
        {
            this.Raise( 'offline' );
            this.m_bOffline = true;
        } // end if
    },
    
    /**
    * On200 - Called for a successful DB response.
    */
    On200: function()
    {
        if( true === this.m_bOffline )
        {
            this.m_n404Count = 0;
            this.m_bOffline = false;
            this.Raise( 'online' );
        } // end if
    }
} );