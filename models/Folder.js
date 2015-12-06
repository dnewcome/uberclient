/**
* Folder - This is a Folder model
*/
function Folder()
{
    Folder.Base.constructor.apply( this, arguments );
}
UberObject.Base( Folder, MetaTag );


Object.extend( Folder.prototype, {
    /**
    * Register our message handlers 
    */
    RegisterMessageHandlers: function()
    {
	    this.RegisterListener( 'request' + this.m_strModelType + 'setcount', Messages.all_publishers_id, this.setCount );
    	
	    Folder.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * addNote - Add a note to the folder.
    * @param {bool} in_bTrashed - trashed flag of the note.  Tells us where to put the note.
    */
    addNote: function( in_bTrashed )
    {
        if( ! in_bTrashed ) {
            this.m_objExtraInfo.Note_Count++;
            this.raiseModelUpdate();
        } // end if
        return Folder.Base.addNote.apply( this, arguments );
    },

    /**
    * deleteNote - Remove a note from the folder.
    * @param {bool} in_bTrashed - trashed flag of the note.  Tells us where to put the note.
    */
    deleteNote: function( in_bTrashed )
    {
        if( ! in_bTrashed ) {
            this.m_objExtraInfo.Note_Count--;
            this.raiseModelUpdate();
        } // end if
        
        return Folder.Base.deleteNote.apply( this, arguments );
    },


    /**
    * dbSetName - db interface to set the name
    * @param {String} in_strName - Name to set.
    */
    dbSetName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
    
        var objConfig = {
            folderID: this.m_strID,
            name: in_strName
        };
                    
        var bRetVal = this.dbSaveAction( 'FolderRename', objConfig, 
            undefined, undefined );
        
        return bRetVal;
    },

    /**
    * setCount - set count value.  Raises a foldersetcount if counts are different.
    * @param {Number} in_nCount - untrashed note count value
    * @param {Boolean} in_bForce (optional) - force the message raising even if counts are the same.
    * @returns {Boolean} true if new count different from old count, false otw.
    */
    setCount: function( in_nCount, in_bForce )
    {
        Util.Assert( TypeCheck.Number( in_nCount ) );
        Util.Assert( TypeCheck.UBoolean( in_bForce ) );
        
        var bRetVal = ( in_nCount != this.m_objExtraInfo.Note_Count ) || ( 0 === in_nCount );
        
        if( bRetVal || in_bForce )
        {
            this.m_objExtraInfo.Note_Count = in_nCount;
            this.raiseModelUpdate();
        } // end if
        return bRetVal;
    },

    /**
    * deleteMe - delete theyself.  From the database too.  
    * @param {String} in_strModelID - the model ID - ignored.
    * @param {Date} in_dtUpdate - update date - ignored.
    * @param {bool} in_bSkipDBSave - If true, skip the DB save.  Assumes false.
    * @returns {bool} true and raises a "folderdelete" message if successful, returns false otw.
    */
    deleteMe: function( in_strModelID, in_dtUpdate, in_bSkipDBSave )
    {
        var objConfig = {
            folderID: this.m_strID
        };
            
        var bRetVal = Folder.Base.deleteMe.apply( this, [ 'FolderRemove', objConfig, in_bSkipDBSave ] );    
        return bRetVal;
    },
    
    /**
    * getExtraInfoObject - get an extra info object to store our
    *   model information in.
    * @returns {Object} object with fields for the extra info.
    */
    getExtraInfoObject: function() {
        var objExtraInfo = {
                Note_Count: undefined
            };
        Object.extend( objExtraInfo, Folder.Base.getExtraInfoObject.apply( this ) );
        return objExtraInfo;
    }
} );
