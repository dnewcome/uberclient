/**
* Note  Update
*       Delete
*       New

At this point I don't think we want to indicate to a user, if things are deleted, 
updated or added.  At least not in their face.  Maybe they could view a log, or their 
would be a small status idicator (like windows updates) show up somewhere that 
lets them know something has been updated from somewhere else... It's something we 
can wait on and as we move forward with sharing and other potential out of view changes 
and updates can be looked at as one solution.
 
The new batch of calls
WS call is:  GetActivityUpdates(sessionID, browserID)
 
BrowserID is a unique ID created on startup of the default.aspx page in client.  it 
should be a hidden value called "BID".  It's used to keep tabs on the last update 
call from any browser instance.
 
Format comes back in the form of 2 tables returned
 
1.  Note
2.  Datestamp from the DB
 
You only have to worry about 1.  They are in the following format for columns
 
ItemID, Type, Action, Update_Dt
 
Type = "Note", "View", "UserCategory", "ViewNode", "Folder"
Action = "Add","Update", "Delete"
 
The information is optimized as much as possible.  There should not be any 
duplicates of a unique combination of ItemID, Type, and Action.  In a case 
where there is more than one, the Update_Dt will refect the most recent 
Update Dt.  Also, the webservice automatically handles the update reference 
data, when you make a call to the service, it marks the datetime stamp when 
you called it, so the next call will only give you what has changed since your last call.
 
For your other updates there is now.
UserViewBatchGet
UserViewNodeBatchGet
UserCategoryBatchGet
 
They all work like NotesGet, where they take a sessionID and their ID or IDs 
where the ID can be add more on in series for batch calls.
*/

function ActivityUpdates()
{
    this.m_nCurrentInterval;
    this.m_strQueryDate;    
    ActivityUpdates.Base.constructor.apply( this );
};
UberObject.Base( ActivityUpdates, Model );

Object.extend( ActivityUpdates.prototype, {
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        // The initial request expects an empty query date string.
        this.m_strQueryDate = '';
        
        return this.initWithConfigObject( in_objConfig );
    },
    
    loadConfigParams: function()
    {
        ActivityUpdates.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, {
            // 10 seconds when active
            m_nActiveInterval: { type: 'number', bRequired: false, default_value: 20000 },    
            // Every 10 minutes when inactive
            m_nInactiveInterval: { type: 'number', bRequired: false, default_value: 600000 },   
            // Switch to Inactive interval after 10 minutes of inactivity
            m_nInactivityTimeout: { type: 'number', bRequired: false, default_value: 600000 },
            // Default to all items
            m_strItemID: { type: 'string', bRequired: false, default_value: '' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'requestactivityupdates', Messages.all_publishers_id, this.getUpdates );
        this.RegisterListener( 'resetinactivytimeout', Messages.all_publishers_id, this.resetInactivityTimeout );
        
        ActivityUpdates.Base.RegisterMessageHandlers.apply( this );
    },
    
    /**
    * getUpdates - force an activity update
    */
    getUpdates: function()
    {
        this._dbGetUpdates();
    },

    /**
    * startActiveUpdate - start activity updates on the "active" timer.
    */
    startActiveUpdate: function()
    {
        this._startUpdate( this.m_nActiveInterval );
        this.resetInactivityTimeout();
    },
    
    /**
    * startInactiveUpdate - start activity updates on the "inactive" timer.
    */
    startInactiveUpdate: function()
    {
        this._startUpdate( this.m_nInactiveInterval );
    },
    
    /**
    * stopIntervalUpdate - stop activity update intervals.
    */
    stopIntervalUpdate: function()
    {
        Timeout.clearInterval( this.m_objUpdateInterval );
        this.m_objUpdateInterval = undefined;
        
        Timeout.clearTimeout( this.m_objInactivityTimeout );
        this.m_objInactivityTimeout = undefined;
    },
    
    /**
    * resetInactivityTimeout - stop activity update intervals.
    */
    resetInactivityTimeout: function()
    {
        if( this.m_nCurrentInterval != this.m_nActiveInterval )
        {   // reset to the active update speed.
            this.startActiveUpdate();
        } // end if
        
        this.m_objInactivityTimeout = Timeout.resetTimeout( this.m_objInactivityTimeout, 
            this.startInactiveUpdate, this.m_nInactivityTimeout, this );
    },

    _startUpdate: function( in_nInterval )
    {
        this.stopIntervalUpdate();
        this._startActivityTimer( in_nInterval );
    },
    
    _startActivityTimer: function( in_nInterval )
    {
        Util.Assert( TypeCheck.Number( in_nInterval ) );

        if( ! this.m_objUpdateInterval )
        {   // Start the interval if not already done
            this.m_objUpdateInterval = Timeout.setInterval( this._dbGetUpdates, 
                in_nInterval, this );
            this.m_nCurrentInterval = in_nInterval;
        } // end if
    },
    
    _dbGetUpdates: function()
    {
        var objInputArguments = {
            lastUpdateDt: this.m_strQueryDate,
            itemID: this.m_strItemID
        };
        
        var objOutputArguments =
        {   // An array of Updates with the following fields.
            History: [ {
                FK_Item_ID: Util.convertSQLServerUniqueID,
                Type: undefined,
                Action: undefined,
                Update_Dt: Util.convertSQLServerTimestamp
            } ],
            queryDT: undefined
        };

        // append a timestring on the end of the URL so that we are sure that this is
        //  not cached/blocked by a firewall.
        var objNow = new Date();
	    var objResp = Util.callDBActionAsync( 'GetActivityUpdates?' + objNow.toLocaleString(),
	        objInputArguments, objOutputArguments, this._processUpdates, this );
    },

    /**
    * _processUpdates - process the updates that come from the DB
    * @param {Object} in_objUpdates - object with an array of updates.
    */    
    _processUpdates: function( in_objUpdates )
    {
        Util.Assert( in_objUpdates && in_objUpdates.History );

        this.Raise( 'activityupdatepre' );
        
        this.m_strQueryDate = in_objUpdates.queryDT;
        
        // Raise a 'request' message for each item in the list.
        in_objUpdates.History.each( function( in_objItem ) {
            if( in_objItem.FK_Item_ID )    // if there is no real update, we get one empty set.
            {
                this._processItem( in_objItem );
            } // end if
        }, this );
        
        this.Raise( 'activityupdatepost' );
    },
    
    /**
    * _findModelType - find the message model type string for raising a message.
    * @param {String} in_strType - Type string returned by the DB
    * @returns {String} - string usable for passing a message.
    */    
    _findModelType: function( in_strType )
    {
        //Type = "Note", "View", "UserCategory", "ViewNode", 'Folder'
        var strRetVal = '';
        var strType = in_strType.toLowerCase().strip();
        switch( strType )
        {
            case 'usercategory':
                strRetVal += 'tagged';
                break;
            case 'usercontact':
                strRetVal += 'contact';
                break;
            default: 
                strRetVal += strType;
                break;
        } // end switch   
        return strRetVal;
    },
    
    /**
    * _findModelAction - find the message action string for raising a message.
    * @param {String} in_strAction - Action string returned by the DB
    * @returns {String} - string usable for passing a message.
    */    
    _findModelAction: function( in_strAction )
    {
        //Action = "Add","Update", "Delete"
        var strRetVal = '';
        switch( in_strAction.toLowerCase().strip() )
        {
            case 'delete':
                strRetVal += 'delete';
                break;
            case 'update':
                strRetVal += 'check';
                break;
            default:    // default to load is the safest option.
                strRetVal += 'load';
                break;
        } // end switch
        return strRetVal;    
    },
    
    /**
    * _processItem - process a batch item.
    * @param {Object} in_objItem - Batch item.
    */    
    _processItem: function( in_objItem )
    {
        Util.Assert( in_objItem );
        var dtUpdate = in_objItem.Update_Dt;
	   var strModelType = this._findModelType( in_objItem.Type );
        var strMessage = 'request' + strModelType + this._findModelAction( in_objItem.Action );

        //Actions = "Add","Update", "Delete"
        switch( in_objItem.Action.toLowerCase() )
        {   
            case 'delete':
			if( 'contact' != strModelType && 'folder' != strModelType )
			{	//  Delete gets a RaiseForAddress because models take care of deleting themselves.
				 this.RaiseForAddress( strMessage, in_objItem.FK_Item_ID, 
					[ in_objItem.FK_Item_ID, dtUpdate, true ] );
				break;
			} // end if
			// yes, we want fall through for contacts
            default:        //  Add and Update get a Raise to go to the modelcollection
                this.Raise( strMessage, [ in_objItem.FK_Item_ID, dtUpdate, true ] );
                break;            
        } // end switch
    }
    
} );