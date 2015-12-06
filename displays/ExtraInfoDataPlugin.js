function ExtraInfoDataPlugin( in_objNoteDisplay )
{
    this.m_objElements = undefined;
    
    return ExtraInfoDataPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( ExtraInfoDataPlugin, Plugin );

Object.extend( ExtraInfoDataPlugin.prototype, {
    loadConfigParams: function()
    {
        ExtraInfoDataPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjLoadDataMessages: { type: 'object', bRequired: false, default_value: {
                    /* format of m_aobjLoadDataMessages: object { message: from_address },
                     *  If from_address not given, assume from the 'plugged' object.
                     *  If overriding this and want data loaded on 'loaddataobject', must
                     *  respecify it in the passed in configuration.
                     */
                    'loaddataobject': undefined
                }
            },
            m_bSupressErrors: { type: 'boolean', bRequired: false, default_value: true }
        } );
    },
    
    RegisterMessageHandlers: function()
    {   
        for( var strMessage in this.m_aobjLoadDataMessages )
        {   // load up each message, the from is optional.
            var strFrom = this.m_aobjLoadDataMessages[ strMessage ];
            Util.Assert( TypeCheck.UString( strFrom ) );

            this.RegisterListenerObject( { message: strMessage, from: strFrom,
                listener: this.OnLoadData, context: this } );
        } // end if
        
		this.RegisterListener( 'domavailable', this._findElements, this );

        ExtraInfoDataPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    teardown: function()
    {
        this.m_objElements = undefined;
        
        ExtraInfoDataPlugin.Base.teardown.apply( this, arguments );
    },
    
    /**
    * OnLoadData - take care of loading the data into ourselves.
    * @param {Object} in_objDataSet (optional) - Data to load.  
    *   If not given, use the plugged's m_objExtraInfo
    */
    OnLoadData: function( in_objDataSet )
    {
        Util.Assert( TypeCheck.UObject( in_objDataSet ) );
        
        var objElements = this.m_objElements || this._findElements();
        var objDataSet = in_objDataSet || this.getPlugged().m_objExtraInfo;
        
        for( var objElement, nIndex = 0; objElement = objElements[ nIndex ]; ++nIndex )
        {
            this._updateElement( objElement, objDataSet );
        } // end for
    },
    
    /**
    * OnReloadCurrentData - causes a reload of the current data set
    */
    OnReloadCurrentData: function()
    {
        this.OnLoadData();
    },

    /**
    * _findElements - Get the elements that have the 'extrainfo' class name, populates
	*	the internal cache.
	* @returns {Array} returns array of elements that have the 'extrainfo' class name, 
	*	empty array if there are none.
    */
    _findElements: function()
    {
        this.m_objElements = this.getPlugged().$$( 'extrainfo' ) || [];
		return this.m_objElements;
    },
        
    /**
    * _updateElement - Do the update on an element
    * @param {Object} in_objElement - The element to update
    * @param {Object} in_objDataSet (optional) - 
    *  First, use the template as the definative source.  It will look under 
    *   the element's _dataSource attribute.  If the strDataSourceName exists, 
    *   it looks for the data under that object in this.getPlugged().
    *  If that is not named or does not exist, go to the in_objDataSet
    *  If that is not given, go the the plugged's extra info.
    */
    _updateElement: function( in_objElement, in_objDataSet )
    {
        Util.Assert( TypeCheck.Object( in_objElement ) );
        Util.Assert( TypeCheck.UObject( in_objDataSet ) );
        
        // this could be an intermediate state where a timer was called before
        // the data is ready.  So make sure we have data before we continue.
        var strDataSourceName = in_objElement.getAttribute( '_dataSource' );
        var strDataFieldName = in_objElement.getAttribute( '_dataField' );

        var objDataSet = ( strDataSourceName && this.getPlugged()[ strDataSourceName ] ) 
            || in_objDataSet;
            
        // this could be an intermediate state where a timer was called before
        // the data is ready.  So make sure we have data before we continue.        
        if( objDataSet && strDataFieldName )
        {
            this._writeData( in_objElement, objDataSet, strDataFieldName );
        } // end if
    },

    /**
    * _writeData - write the data to the element.
    * @param {Object} in_objElement - element to write to
    * @param {Object} in_objDataSet - Data set to read from
    * @param {Object} in_strDataField - Data to use to write to element.
    */    
    _writeData: function( in_objElement, in_objDataSet, in_strDataField )
    {
        Util.Assert( TypeCheck.Object( in_objElement ) );
        Util.Assert( TypeCheck.Object( in_objDataSet ) );
        Util.Assert( TypeCheck.String( in_strDataField ) );
        
        // Default to string.
        var vDataItem = TypeCheck.Defined( in_objDataSet[ in_strDataField ] ) ? in_objDataSet[ in_strDataField ] : '';
        var strFillString = '';
        
        if( TypeCheck.Defined( vDataItem ) )
        {   
            strFillString = this._formatData( in_objElement, vDataItem, in_objDataSet );
        } // end if
        else if( false === this.m_bSupressErrors )
        {
            strFillString = _localStrings.DATA_FIELD_NOT_FOUND + ': ' + in_strDataField;
        } // end if
        
        in_objElement.innerHTML = strFillString;
    },
    
    /**
    * _formatData - format the input data.
    * @param {Object} in_objElement - element to get type from
    * @param {Variant} in_vDataItem - data to format.
    * @param {Object} in_objDataSet - The data set the data comes from.
    */
    _formatData: function( in_objElement, in_vDataItem, in_objDataSet )
    {
        Util.Assert( TypeCheck.Object( in_objElement ) );
        
        var strRetVal = in_vDataItem;
        var strType = in_objElement.getAttribute( '_type' );
        if( strType )
        {   // If type type is specified, format it.
            var fncFormatter = ExtraInfoDataPlugin._dataFormatters[ strType ];
            if( fncFormatter )
            {
                strRetVal = fncFormatter.apply( this, [ in_vDataItem, in_objElement, in_objDataSet ] );
            } // end if
            else if( false === this.m_bSupressErrors )
            {
                strRetVal = _localStrings.INVALID_DATA_FORMAT_SPECIFIED + ': ' + strType;
            } // end if-else
        } // end if
        
        return strRetVal;
    }
} );    


Object.extend( ExtraInfoDataPlugin, {
    _dataFormatters: {
        date: function( in_vDataItem, in_objElement )
        {
            var strFormat = in_objElement.getAttribute( '_format' );
            strRetVal = in_vDataItem.format( strFormat );
            return strRetVal;
        },
        
        number: function( in_vDataItem, in_objElement )
        {
            var strRetVal = in_vDataItem.toString();
            return strRetVal;
        },
        
        kb: function( in_vDataItem, in_objElement )
        {
            var strRetVal = ( in_vDataItem / 1024 ).format( '0,000' );
            return strRetVal;
        },
        
        mb: function( in_vDataItem, in_objElement )
        {
            var strRetVal = ( in_vDataItem / ( 1024*1024 ) ).format( '0,000' );
            return strRetVal;
        },

        title: function( in_vDataItem, in_objElement )
        {
            var strEmptyText = in_objElement.getAttribute( '_emptytext' ) || _localStrings.UNTITLED;
            var strRetVal = ( in_vDataItem || strEmptyText );
            return strRetVal;
        }
    },
    
    /**
    * addFormatters - add formatting functions.
    * @param {Object} in_objFormatters - the formatting functions.  This is an object
    *   in the form of 
    *   { 
    *       formatter_name: function( in_vDataItem, in_objElement, in_objDataSet )
    *       { 
    *           do_formatting();
    *           return formatted_output; 
    *       } 
    *   }
    */
    addFormatters: function( in_objFormatters )
    {
        Object.extend( ExtraInfoDataPlugin._dataFormatters, in_objFormatters );
    },
    
    getFormatter: function( in_strFormatter )
    {
        return ExtraInfoDataPlugin._dataFormatters[ in_strFormatter ];
    }
} );