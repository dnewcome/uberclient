/**
* class Share: This is a Share model.  Subclassed from MetaTag.
*/
function Share()
{
    this.m_strNoteID = undefined;
    this.m_eShareLevel = undefined;
    
    Share.Base.constructor.apply( this, arguments );
}
UberObject.Base( Share, MetaTag );

TypeCheck.createForObject( 'Share' );

Share._dbConversion = {
    Note_ID: 'm_strNoteID',
    Share_Level: 'm_eShareLevel'
};

Object.extend( Share.prototype, {
    RegisterMessageHandlers: function()
    {
        return Share.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * init - initialize the Share.
    * @param {Object} in_objConfig - Configuration object.
    * @returns {Object} - 'this'
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );    

        this.convertFromDBValues( Share._dbConversion, in_objConfig );

        return Share.Base.init.apply( this, arguments );
    },

    /**
    * updateFromItem - Update model from DB item.
    * @param {Object} in_objConfig - DB Item.
    */
    updateFromItem: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );    
    
        this.convertFromDBValues( Share._dbConversion, in_objConfig );
        
        return Share.Base.updateFromItem.apply( this, arguments );
    },
    
    /**
    * deleteMe - delete theyself.  From the database too.  
    * @param {String} in_strModelID - the model ID - ignored.
    * @param {Date} in_dtUpdate - update date - ignored.
    * @param {bool} in_bSkipDBSave - If true, skip the DB save.  Assumes false.
    * @returns {bool} true and raises a "Sharedelete" message if successful, returns false otw.
    */
    deleteMe: function( in_strModelID, in_dtUpdate, in_bSkipDBSave )
    {
        var objConfig = {
            ShareID: this.m_strModelID
        };
            
        var bRetVal = false;//Share.Base.deleteMe.apply( this, [ 'ShareRemove', objConfig, in_bSkipDBSave ] );    
        return bRetVal;
    }
} );