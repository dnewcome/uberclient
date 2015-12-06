function Accordion()
{
    this.m_nOpenIndex = undefined;
    this.m_strPrefix = undefined;
    this.m_nTimeout = 500;
    this.m_nHeaderDeltaPx = 0;
    
    Accordion.Base.constructor.apply( this, arguments );
};
UberObject.Base( Accordion, UberObject );

Object.extend( Accordion.prototype, {
    
    /**
    * init - initialize the instance
    * @param {String} in_strPrefix - ID prefix of the elements to look for.  
    *   number_from_beginning is 0 based.
    *   Headers need to be ID's prefix+number_from_beginning+_header,
    *   Content needs to be ID's prefix+number_from_beginning+_content,
    */
    init: function( in_strPrefix )
    {
        Util.Assert( TypeCheck.String( in_strPrefix ) );

        Accordion.Base.init.apply( this, arguments );
        
        this.m_strPrefix = in_strPrefix;
        for( var objElement, nIndex = 0; 
            objElement = document.getElementById( in_strPrefix + nIndex + '-header' ); ++nIndex )
        {
            objElement.accordion_index = nIndex;
            this.RegisterListener( 'onclick', objElement, this.OnHeaderClicked );

            var objSize = Element.getDimensions( objElement );
            this.m_nHeaderDeltaPx += objSize.height;

	        if( BrowserInfo.opera )
	        {
                objElement && Timeout.setTimeout( Nifty, this.m_nTimeout, window, [ 'div#' + objElement.id, 'top' ] );
            } // end if
        } // end for
        
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'setHeight', Messages.all_publishers_id, this.setHeight );
        
        Accordion.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * setHeight - set the height of the accordion.
    * @param {Number || String} in_vHeight - height in pixels to set the container.
    */
    setHeight: function( in_vHeight )
    {
        Util.Assert( TypeCheck.Number( in_vHeight ) );
        
        for( var objElement, nIndex = 0; 
            objElement = document.getElementById( this.m_strPrefix + nIndex + '-content' ); 
            ++nIndex )
        {
            var nHeight = in_vHeight - this.m_nHeaderDeltaPx;
            DOMElement.setDimensionStyle( objElement, 'height', nHeight );
        } // end for        
    },
    
    /**
    * run - run the accordion, change which one is currently shown.  If the accordion
    *   is run on the same element that is currently open, it will close the element
    * @param {Number} in_nIndex = 0 based number to show/close.
    */
    run: function( in_nIndex )
    {
        Util.Assert( TypeCheck.Number( in_nIndex ) );

        if( in_nIndex == this.m_nOpenIndex )
        {   // If we select the same to open as was formerly open,
            // it means close it.
            in_nIndex = undefined;
        } // end if

        this._processElements( in_nIndex, '-content', 'accordion_open' );
        this._processElements( in_nIndex, '-header', 'header_highlight' );        
        
        this.m_nOpenIndex = in_nIndex;
    },

    /**
    * OnHeaderClicked - bridge between event handler and run.  Takes an event,
    *   calls run for the appropriate element.
    * @param {Object} in_objEvent - DOM event that triggered the handler
    */
    OnHeaderClicked: function( in_objEvent )
    {
        Util.Assert( TypeCheck.Object( in_objEvent ) );
        
        this.run( in_objEvent._currentTarget.accordion_index );
    },

    
    /**
    * _processElements - takes care of processing the actual elements.
    *   It adds the in_strClassName to the element to open, it removes the in_strClassName
    *   from the element currently opened.  Total IDs that will be looked for are defined by:
    *   Open: Prefix (defined by init) + in_nIndexToOpen + in_strPostfix.
    *   Close: Prefix (defined by init) + element_already_open + in_strPostfix.
    * @param {Number} in_nIndexToOpen - Index of the content to open
    * @param {String} in_strPostfix - postfix addition to ID name to look for.
    * @param {String} in_strClassName - Class name to add and remove.
    */
    _processElements: function( in_nIndexToOpen, in_strPostfix, in_strClassName )
    {
        var strElementToOpenID = TypeCheck.Defined ( in_nIndexToOpen ) ? 
            this.m_strPrefix + in_nIndexToOpen + in_strPostfix : '';
        var strElementToCloseID = TypeCheck.Defined ( this.m_nOpenIndex ) 
            ? this.m_strPrefix + this.m_nOpenIndex + in_strPostfix : '';

        var objOpenElement = strElementToOpenID ? document.getElementById( strElementToOpenID ) : null;
        var objCloseElement = strElementToCloseID ? document.getElementById( strElementToCloseID ) : null;

        objOpenElement && DOMElement.addClassName( objOpenElement, in_strClassName );
        objCloseElement && DOMElement.removeClassName( objCloseElement, in_strClassName );

        if( ( BrowserInfo.opera ) && ( '-header' == in_strPostfix ) )
        {
            objOpenElement && Timeout.setTimeout( Nifty, this.m_nTimeout, window, [ 'div#' + strElementToOpenID, 'top' ] );
            objCloseElement && Timeout.setTimeout( Nifty, this.m_nTimeout, window, [ 'div#' + strElementToCloseID, 'top' ] );
        }               
        
    }
    
} );