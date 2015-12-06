/**
* class Attachment: This is a Attachment model.  Subclassed from Category.
*/
function Attachment()
{
   Attachment.Base.constructor.apply( this, arguments );
}
UberObject.Base( Attachment, MetaTag );

TypeCheck.createForObject( 'Attachment' );

Object.extend( Attachment.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'requestattachmentdownload', Messages.all_publishers_id, this.attachmentDownload );
        return Attachment.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    /**
    * attachmentDownload - Download the attachment.
    */
    attachmentDownload: function()
    {
        var strURL = Config.webServiceUrl + 'AttachmentDownload?attachmentID=' + this.m_strID + 
            '&sessionID=' + Util.getSID();
        this.RaiseForAddress( 'setsource', 'externalpage', [ strURL ] );
    },
    
    /**
    * deleteMe - delete theyself.  From the database too.  
    * @param {String} in_strModelID - the model ID - ignored.
    * @param {Date} in_dtUpdate - update date - ignored.
    * @param {bool} in_bSkipDBSave - If true, skip the DB save.  Assumes false.
    * @returns {bool} true and raises a "attachmentdelete" message if successful, returns false otw.
    */
    deleteMe: function( in_strModelID, in_dtUpdate, in_bSkipDBSave )
    {
        var objConfig = {
            attachmentID: this.m_strID
        };
            
        var bRetVal = Attachment.Base.deleteMe.apply( this, [ 'AttachmentRemove', objConfig, in_bSkipDBSave ] );    
        return bRetVal;
    },

    /**
    * getExtraInfoObject - get an extra info object to store our
    *   model information in.
    * @returns {Object} object with fields for the extra info.
    */
    getExtraInfoObject: function() {
        var objExtraInfo = {
                Extension: undefined,
                Byte_Size: undefined,
                Create_Dt: undefined,
                Update_Dt: undefined
            };
        Object.extend( objExtraInfo, Attachment.Base.getExtraInfoObject.apply( this ) );
        return objExtraInfo;
    }    
} );