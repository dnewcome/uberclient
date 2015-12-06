
function ShareLevelMenu()
{
    ShareLevelMenu.Base.constructor.apply( this, arguments );
};
UberObject.Base( ShareLevelMenu, ListMenuPlugin );

Object.extend( ShareLevelMenu.prototype, {
    loadConfigParams: function()
    {
        ShareLevelMenu.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                    { id: 'read', string: _localStrings.READ, callback: this.requestRead },
                    { id: 'write', string: _localStrings.WRITE, callback: this.requestWrite },
                    { string: _localStrings.REMOVE, callback: this.requestRemove }
            ] }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'onbeforeshow', this.OnBeforeShow, this );        
        
        ShareLevelMenu.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * requestRead - Request a share be read-only.
    * @returns {bool} true request successfully sent, false otw.
    */
    requestRead: function()
    {
        var strMetaTagID = this.getMetaTagID();
        var bRetVal = this.RaiseForAddress( 'requestnotesharedbyperuserread', this.getBindingInfo().Note_ID, [ strMetaTagID ] );
        
        return bRetVal;
    },

    /**
    * requestWrite - Request a Share be write.
    * @returns {bool} true request successfully sent, false otw.
    */
    requestWrite: function()
    {
        var strMetaTagID = this.getMetaTagID();
        var bRetVal = this.RaiseForAddress( 'requestnotesharedbyperuserwrite', this.getBindingInfo().Note_ID, [ strMetaTagID ] );
        
        return bRetVal;
    },

    /**
    * requestRemove - Request a delete of the share.  
    * @returns {bool} true request successfully sent, false otw.
    */
    requestRemove: function()
    {
        var strMetaTagID = this.getMetaTagID();
        var bRetVal = this.RaiseForAddress( 'requestnotesharedbyperuserremove', this.getBindingInfo().Note_ID, [ strMetaTagID ] );
        
        return bRetVal;
    },
    
    /**
    * OnBeforeShow - When being shown, if selectItem exists, set Read/Write status appropriately
    */
    OnBeforeShow: function()
    {
        var objPlugged = this.getPlugged();
        
        if( objPlugged.selectItem )
        {
            var objContext = this.getContext();
            objPlugged.unselectAll();
            objPlugged.selectItem( objContext.getBindingInfo().Share_Level, true );
        } // end if
    }
} );
