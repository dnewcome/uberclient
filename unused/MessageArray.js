
function MessageArray()
{
    this.m_astrMessages = undefined;
    this.m_nCurrentMessage = undefined;
    this.m_strTimeoutID = undefined;
        
    MessageArray.Base.constructor.apply( this );
};
UberObject.Base( MessageArray, Display );

MessageArray._localStrings = {
    CLEAR: 'Clear',
    BACK_ONE: 'Show older message',
    FORWARD_ONE: 'Show newer message'
};

Object.extend( MessageArray.prototype, {
    init: function( in_objConfig )
    {
        Util.Assert( in_objConfig );

        var vRetVal = this.initWithConfigObject( in_objConfig );
        this.clear();
        
        return vRetVal;
    },
    
    childInitialization: function()
    {
        this.attachButton( 'elementForward', this.forward );
        DOMElement.setTooltip( this.$( 'elementForward' ), MessageArray._localStrings.FORWARD_ONE );
        
        this.attachButton( 'elementBack', this.back );
        DOMElement.setTooltip( this.$( 'elementBack' ), MessageArray._localStrings.BACK_ONE );
        
        this.attachButton( 'elementClear', this.clear );
        this.setChildHTML( 'elementClear', MessageArray._localStrings.CLEAR );
    },
    
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_nMaxItemsToStore: { type: 'number', bRequired: false, default_value: 10 },
            m_nMaxItemsToDisplay: { type: 'number', bRequired: false, default_value: 1 },
            m_nDisplayTimeout: { type: 'number', bRequired: false, default_value: 1000 }
        };
        
        MessageArray.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, objConfigParams, true );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'addmessage', Messages.all_publishers_id, this.add );
        this.RegisterListener( 'setmessage', Messages.all_publishers_id, this.set );
        this.RegisterListener( 'clearmessages', Messages.all_publishers_id, this.clear );
        
        MessageArray.Base.RegisterMessageHandlers.apply( this );       
    },

    /**
    * add - Adds a message to the array.
    * @param {String} in_strMessage - message to add.  Can be any well formatted HTML.
    */
    add: function( in_strMessage )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        var objDate = new Date();
        this.m_astrMessages[ this.m_astrMessages.length ] = objDate.toLocaleTimeString() + ': ' + in_strMessage;
        if( this.m_astrMessages.length > this.m_nMaxItemsToStore )
        {   // remove the oldest one if needed.
            this.m_astrMessages.shift();
        } // end if

        this._updateMessage();
        this._updateButtons();  // do this for good measure.
    },

    /**
    * sets current message without reguard to the array.
    * @param {String} in_strMessage - message to display.  Can be any well formatted HTML.
    */
    set: function( in_strMessage )
    {
        Util.Assert( TypeCheck.String( in_strMessage ) );
        
        this.setChildHTML( 'elementMessage', in_strMessage );
        this._updateButtons();  // do this for good measure.
    },

    /**
    * clear - clear all the messages and blank the message area.
    */
    clear: function()
    {
        this.m_astrMessages = [];
        this.m_nCurrentMessage = 0;
        this.set( '' );
    },
    
    /**
    * forward - move forward one item in the array
    */
    forward: function()
    {
        if( ( this.m_astrMessages.length > 1 ) 
         && ( ( this.m_nCurrentMessage + 1 ) < this.m_astrMessages.length ) )
        {
            ++this.m_nCurrentMessage;
            this._showCurrentMessage();
        } // end if
    },
    
    /**
    * back - move back one item in the array
    */
    back: function()
    {
        if( ( this.m_astrMessages.length > 1 ) 
         && ( this.m_nCurrentMessage >= 1 ) )
        {
            --this.m_nCurrentMessage;
            this._showCurrentMessage();
        } // end if
    },
    
    /**
    * _showCurrentMessage - shows the currently set message
    */
    _showCurrentMessage: function()
    {
        Util.Assert( TypeCheck.Number( this.m_nCurrentMessage, 0, this.m_astrMessages.length - 1 ) );
        
        this.set( this.m_astrMessages[ this.m_nCurrentMessage ] );
    },
    
    /**
    * _updateMessage - update the message if the display timeout has expired.
    */
    _updateMessage: function()
    {        
        if( ! this.m_strTimeoutID )
        {   // Either we have no timeout or it has passed or expired, 
            // display new message.
            this.m_nCurrentMessage = this.m_astrMessages.length - 1;
            this._showCurrentMessage();
            this._updateTimeout();
        } // end if
    },
    
    /**
    * _updateTimeout - update the timeout if one is configured.
    */
    _updateTimeout: function()
    {
        if( this.m_nDisplayTimeout )
        {   // update timer if we have one.
            this.m_strTimeoutID = Timeout.setTimeout( this._cancelTimeout, 
                this.m_nDisplayTimeout, this );
        } // end if
    },
    
    /**
    * _cancelTimeout - cancel the message delay timeout.
    */
    _cancelTimeout: function()
    {
        Timeout.clearTimeout( this.m_strTimeoutID );
        this.m_strTimeoutID = undefined;
    },
    
    /**
    * _updateButtons - work on displaying and hiding the arrows
    */
    _updateButtons: function()
    {
        // do foward button.
        var bDisplay = ( ( this.m_astrMessages.length > 1 ) 
                      && ( this.m_nCurrentMessage < ( this.m_astrMessages.length - 1 ) ) );
        this._displayElement( 'elementForward', bDisplay );

        bDisplay = ( ( this.m_astrMessages.length > 1 ) 
                  && ( this.m_nCurrentMessage > 0 ) );
        this._displayElement( 'elementBack', bDisplay );
        
        bDisplay = this.m_astrMessages.length > 0;
        this._displayElement( 'elementClear', bDisplay );
        this._displayElement( 'elementSeparator', bDisplay );
    },

    /**
    * _displayElement - display or hide an arrow 
    * @param {String} in_strElementName - Element to display or hide.
    * @param {bool} in_bDisplay - whether to display the element.
    */    
    _displayElement: function( in_strElementName, in_bDisplay )
    {
        Util.Assert( TypeCheck.String( in_strElementName ) );
        Util.Assert( TypeCheck.Boolean( in_bDisplay ) );
        
        var strFunction = in_bDisplay ? 'show' : 'hide';
        DOMElement[ strFunction ]( this.$( in_strElementName ) );
    }
    
} );