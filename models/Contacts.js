/**
* class Contacts: This is Contacts collection model
*/

function Contacts()
{
    Contacts.Base.constructor.apply( this );
}
UberObject.Base( Contacts, MetaTags );

Contacts._fncResultSet = function()
{
    return [ {
        ID: Util.convertSQLServerUniqueID,
        Name: undefined,
        Display_Name: undefined,
        Note_Count: parseInt10
    } ];
};

Object.extend( Contacts.prototype, {
    
    /** 
    * @private
    * _preProcessItem - preprocess an item that comes from the database.
    *   For our case, we are using it to put Display_Name into Name and
    *   Name into User_Name. This makes a lot of the other display stuff
    *   much simpler because we don't have to redo any search functions.
    * @param {Object} in_objItem - Decoded item.
    */
    _preProcessItem: function( in_objItem )
    {
        var strUserName = in_objItem.Name;
        in_objItem.Name = in_objItem.Display_Name;
        in_objItem.User_Name = strUserName;
        
        delete in_objItem.Display_Name;
        
        return Contacts.Base._preProcessItem.apply( this, arguments );
    },

    /**
    * raiseLoad - Raise the load for the contact.  Many items are listening for
    *   the 'load' message and are registered to listen for the load message
    *   from the User_Name (if it exists).  So, we raise the load on the User_Name.
    * @param {Object} in_objModel - model to raise the load for.
    */
    raiseLoad: function( in_objModel )
    {
        var strUserName = in_objModel.getField( 'User_Name' );
        if( strUserName )
        {
            this.Raise( this.m_strModelType + 'load', [ in_objModel, in_objModel.m_strID ], false, strUserName );
        } // end if
        
        Contacts.Base.raiseLoad.apply( this, arguments );
    },
    
    /**
    * getByUserName - get a model based off of the user name
    * @param {String} in_strUserName - User name to search for
    * @returns {Object} Contact model if found, undefined otw.
    */
    getByUserName: function( in_strUserName )
    {
        Util.Assert( TypeCheck.String( in_strUserName ) );
        var vRetVal = undefined;
        
        for( var nIndex = 0, objChild; objChild = this.getByIndex( nIndex ); ++nIndex )
        {   // simple search - no binary search stuff.
            if( in_strUserName === objChild.getField( 'User_Name' ) )
            {
                vRetVal = objChild;
                break;
            } // end if
        } // end for
        
        return vRetVal;
    },
    
    /**
    * dbAdd - Add a Contact to the database and share note(s) with the contact.
    * @param {String} in_strName {string} - Name of the Contact to add
    * @param {Array} in_astrNoteIDs (optional) - noteids to add
    *   this tag to on DB create completion.
    * @param {Enum Key} in_eShareLevel (optional) - Share level for the notes.
    * @Returns {Boolean} a Contact object if successful, undefined otw.
    */
    dbAdd: function( in_strName, in_astrNoteIDs, in_eShareLevel )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        Util.Assert( TypeCheck.UArray( in_astrNoteIDs ) );
        Util.Assert( TypeCheck.EnumKey( in_eShareLevel, Notes.eShareLevels ) );
        
        //ContactAddUpdate(string sessionID, string emailAddress, string displayName)
        var objInputArguments = {
            displayName: in_strName,
            emailAddress: in_strName
        };	

        var objOutputArguments =
        {
            Contact_ID: Util.convertSQLServerUniqueID,
            Reference_ID: Util.convertSQLServerUniqueID,
            Name: undefined
        };

        var me=this;
        var OnComplete = function( in_objOutputArguments )
        {
            if( in_objOutputArguments && in_objOutputArguments.Reference_ID )
            {
                var objConfig = {
                    ID: in_objOutputArguments.Reference_ID,
                    User_Name: in_objOutputArguments.Name.strip(),
                    Name: in_strName,
                    Note_Count: 0,
                    Type: me.m_strModelType
                };
                var objModel = me._createModelFromItem( objConfig );
                me.OnDBAddComplete( objModel );

                if( in_astrNoteIDs && in_astrNoteIDs.length )
                {
                    me.Raise( 'requestnotessharedbyperuser', [ in_astrNoteIDs, objModel.m_strID, in_eShareLevel ] );
                };
            } // end if
        };

        var objRetVal = Util.callDBActionAsync( 'ContactAddUpdate', objInputArguments,
            objOutputArguments, OnComplete );
        return objRetVal;
    }
} );