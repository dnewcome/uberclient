function UberError()
{
    UberError.Base.constructor.apply( this );
};
UberObject.Base( UberError, UberObject );

Object.extend( UberError.prototype, {
    /**
    * raiseError - Raise an error, log it if we have a log assigned to us.
    * @param {String} in_strSubsystem - subsystem error occured in.
    * @param {Enum_value} in_eErrorType - value in ErrorLevels.eErrorType
    * @param {Enum_value} in_eErrorLevel - value in ErrorLevels.eErrorLevel
    * @param {String} in_strDescription - Description of event
    * @param {String} in_strValue (optional) - Error value
    * @returns {Object} returns the UberErrorEntry object created for this error 
    *   if we are not currently ignoring all errors.
    */
    raiseError: function( in_strSubsystem, in_eErrorType, in_eErrorLevel, in_strDescription, in_strValue )
    {
        Util.Assert( true === this.isInitialized() );
        Util.Assert( TypeCheck.String( in_strSubsystem ) );
        Util.Assert( TypeCheck.EnumKey( in_eErrorType, ErrorLevels.eErrorType ) );
        Util.Assert( TypeCheck.EnumKey( in_eErrorLevel, ErrorLevels.eErrorLevel ) );
        Util.Assert( TypeCheck.String( in_strDescription ) );

        var objRetVal = undefined;
        
        if( false === this.m_bIgnoreErrors )
        {
            objRetVal = new UberErrorEntry( in_strSubsystem, in_eErrorType, 
                in_eErrorLevel, in_strDescription, in_strValue );
            
            this._processLog( objRetVal );            
            this._processPopup( objRetVal );
            this._processFirebug( objRetVal );
            this._processLogout( objRetVal );
        } // end if
        
        return objRetVal;
    },
    
    /**
    * init - initialize the object
    * @param {Object} in_objConfig - Configuration object
    * @returns {bool} true if successful, false otw.
    */
    init: function( in_objConfig )
    {
        Util.Assert( false === this.isInitialized() );
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        this.m_bIgnoreErrors = false;
        return this.initWithConfigObject( in_objConfig );
    },
    
    /**
    * ignoreAll - if set to true, ignore all errors
    * @param {bool} in_bIgnore (optional) - if set to true, ignores all errors.  
    *   Assumed to be false.
    */
    ignoreAll: function( in_bIgnore )
    {
        Util.Assert( true === this.isInitialized() );
        Util.Assert( TypeCheck.Undefined( in_bIgnore ) || TypeCheck.Boolean( in_bIgnore ) );
        
        this.m_bIgnoreErrors = !!in_bIgnore;
    },

    loadConfigParams: function()
    {
        UberError.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aLogLevels: { type: 'object', bRequired: false, 
                default_value: [ ErrorLevels.eErrorLevel.INFO, ErrorLevels.eErrorLevel.LOW, 
                ErrorLevels.eErrorLevel.MEDIUM, ErrorLevels.eErrorLevel.HIGH, 
                ErrorLevels.eErrorLevel.EXTREME, ErrorLevels.eErrorLevel.CRITICAL
            ] },
            m_aDisplayLevels: { type: 'object', bRequired: false, 
                default_value: [ ErrorLevels.eErrorLevel.MEDIUM, ErrorLevels.eErrorLevel.HIGH, 
                ErrorLevels.eErrorLevel.EXTREME, ErrorLevels.eErrorLevel.CRITICAL
            ] },
            m_aLogoutLevels: { type: 'object', bRequired: false, 
                default_value: [ ErrorLevels.eErrorLevel.EXTREME, ErrorLevels.eErrorLevel.CRITICAL ] },
            m_bLogoutAllErrors: { type: 'boolean', bRequired: false, default_value: false },
            m_objMessagePopup: { type: 'object', bRequired: false },
            m_strLogID: { type: 'string', bRequired: true },
            m_bLogFirebug: {type: 'boolean', bRequired: false, default_value: true }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'raiseerror', Messages.all_publishers_id, this.raiseError );
        this.RegisterListener( 'setignore', Messages.all_publishers_id, this.ignoreAll );
        
        UberError.Base.RegisterMessageHandlers.apply( this );
    },
    
    /**
    * _processFirebug - add an entry to firebug if needed
    * @param {Object} in_objEntry - UberErrorEntry object with configuration
    */
    _processFirebug: function( in_objEntry )
    {
        Util.Assert( in_objEntry instanceof UberErrorEntry );
        
        // Firebug 
        try {   
            // Sometimes the browsers say there is a console and then a console.trace
            // and then go and blow up.  This is problematic in both FF without firebug
            // and IE.
            if( true == this.m_bLogFirebug 
             && window.console
             && window.console.error
             && window.console.trace )
            {   // Firebug extensions
                var strTotalDescription = in_objEntry.toString();

                console.error( strTotalDescription );
                console.trace();
            } // end if
        } // end try
        catch ( e )
        { // do nothing
        } // end try-catch
    },
    
    /**
    * _processLog - add an entry to the error log if needed
    * @param {Object} in_objEntry - UberErrorEntry object with configuration
    */
    _processLog: function( in_objEntry )
    {
        Util.Assert( in_objEntry instanceof UberErrorEntry );

        var strDescription = in_objEntry.toString( true ); // Shortened version
        
        // Log it
        if( -1 < this.m_aLogLevels.indexOf( in_objEntry.m_eErrorLevel ) )
        {
            this.RaiseForAddress( 'log', this.m_strLogID, [ Logger.eLogType.error, 
                in_objEntry.m_strSubsystem, strDescription ], true );
        } // end if

    },
    
    /**
    * _processPopup - Display system error popup if needed
    * @param {Object} in_objEntry - UberErrorEntry object with configuration
    */
    _processPopup: function( in_objEntry )
    {
        Util.Assert( in_objEntry instanceof UberErrorEntry );
        
        // Popup                
        if( ( -1 < this.m_aDisplayLevels.indexOf( in_objEntry.m_eErrorLevel ) )
         && ( this.m_objMessagePopup ) )
        {   
            var strTotalDescription = in_objEntry.toString();
            
            this.m_objMessagePopup.showMessage( strTotalDescription, 'error' );
        } // end if
    },

    /**
    * _processLogout - log out of the system if need be.
    * @param {Object} in_objEntry - UberErrorEntry object with configuration
    */
    _processLogout: function( in_objEntry )
    {
        Util.Assert( in_objEntry instanceof UberErrorEntry );
        
        // Logout if needed
        if( ( -1 < this.m_aLogoutLevels.indexOf( in_objEntry.m_eErrorLevel ) )
         || ( true === this.m_bLogoutAllErrors ) )
        {
            this.ignoreAll( true );
            Util.logout( 'LOGOUTSESSION' );
        } // end if
    }
    
} );

var SysError = new UberError();

function UberErrorEntry( in_strSubsystem, in_eErrorType, in_eErrorLevel, in_strDescription, in_strValue ) 
{
    Util.Assert( TypeCheck.String( in_strSubsystem ) );
    Util.Assert( TypeCheck.EnumKey( in_eErrorType, ErrorLevels.eErrorType ) );
    Util.Assert( TypeCheck.EnumKey( in_eErrorLevel, ErrorLevels.eErrorLevel ) );
    Util.Assert( TypeCheck.String( in_strDescription ) );

    this.m_strSubsystem = in_strSubsystem;
    this.m_eErrorType = in_eErrorType;
    this.m_eErrorLevel = in_eErrorLevel;

    this.message = this.m_strDescription = in_strDescription;
    this.value = in_strValue;
};

UberErrorEntry.prototype.toString = function( in_bShort )
{
    var strRetVal = '';
    
    strRetVal = this.m_eErrorType + ': ' + this.m_eErrorLevel;
    if( this.m_strValue )
    {
        strRetVal += ': ' + this.m_strValue;
    } // end if
    
     strRetVal += ' - ' + this.m_strDescription;
    
    if( ! in_bShort )
    {
        strRetVal = this.m_strSubsystem + ': ' + strRetVal;
    } // end if
    return strRetVal;
};

