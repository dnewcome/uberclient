/**
* Logger - a basic logging class.  Logs messages to the DB.
*/
function Logger()
{
    this.m_aEntries = undefined;
    this.m_nCount = undefined;
    
    UberObject.apply( this );
};
Logger.prototype = new UberObject;

Logger.eLogType = new Enum( 'feature', 'error' );

Logger.eDBLogType = {
    feature: 0,
    error: 1
};

Object.extend( Logger.prototype, {
    /*
    * log - Log a message
    * @param {Enum} in_eLogType - one of the log types defined in Logger.eLogType
    * @param {String} in_strCaption - The caption ie "trace", "hit", "error", "exception"
    * @param {String} in_strDescription - the description to log.
    */
    log: function( in_eLogType, in_strCaption, in_strDescription )
    {
        Util.Assert( TypeCheck.EnumKey( in_eLogType, Logger.eLogType ) );
        Util.Assert( TypeCheck.String( in_strCaption ) );
        Util.Assert( TypeCheck.String( in_strDescription ) );
        
        var objEntry = this._createEntry( in_eLogType, in_strCaption, in_strDescription );
        if( true === Config.bLocalLog )
        {
            this._storeEntry( objEntry );
        } // end if

        Util.callDBActionAsync( 'userSessionLog', objEntry );
    },
    
    /**
    * _createEntry - Creates a log entry from the parameters.
    * @param {Enum} in_eLogType - one of the log types defined in Logger.eLogType
    * @param {String} in_strCaption - The caption ie "trace", "hit", "error", "exception"
    * @param {String} in_strDescription - the description to log.
    * @returns {Object} - object with 3 fields - logType, Caption and Description
    */
    _createEntry: function( in_eLogType, in_strCaption, in_strDescription )
    {
        Util.Assert( TypeCheck.EnumKey( in_eLogType, Logger.eLogType ) );
        Util.Assert( TypeCheck.String( in_strCaption ) );
        Util.Assert( TypeCheck.String( in_strDescription ) );
        
        var objEntry = 
        { 
            logType: Logger.eDBLogType[ in_eLogType ],
            Caption: in_strCaption,
            Description: in_strDescription + ': useragent: ' + navigator.userAgent
        };
        
        return objEntry;
    },

    /**
    * _storeEntry - store entry locally
    * @param {Object} object to store.
    */    
    _storeEntry: function( in_objObject )
    {
        Util.Assert( TypeCheck.Object( in_objObject ) );
        
        ++this.m_nCount;
        this.m_aEntries[ this.m_nCount ] = in_objObject;
    },
    
    init: function( in_objConfig )
    {
        Util.Assert( false === this.isInitialized() );
        Util.Assert( TypeCheck.Object( in_objConfig ) );

        this.m_aEntries = [];
        this.m_nCount = -1;
        
        return this.initWithConfigObject( in_objConfig );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'log', Messages.all_publishers_id, this.log );
    }
} );


