/**
* class MetaTag: This is a MetaTag "model".  This is the base for any meta tag
*   info that is tagged to a note - ie a category, an attachment, a share name.
*/
function MetaTag()
{
    MetaTag.Base.constructor.apply( this, arguments );
}
UberObject.Base( MetaTag, Model );
TypeCheck.createForObject( 'MetaTag' );

Object.extend( MetaTag.prototype, { 
    /**
    * init - initialize the Attachment.
    * @param {Object} in_objConfig - Configuration object.
    * @returns {Object} - 'this'
    */
    init: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );    
        
        // We set this here instead of waiting for ModelCollection.postProcessItem
        //  so we can do a name compare on insertion.
        this.m_objExtraInfo = in_objConfig;
        
        // XXX - Why is this stored 2 times?  
        //  m_strMessagingID, and m_strID
        this.m_strMessagingID = in_objConfig.ID;

        return MetaTag.Base.init.apply( this, [ in_objConfig.Type, in_objConfig.ID ] );
    },
    
    /**
    * updateFromItem - Update model from DB item.
    * @param {Object} in_objConfig - DB Item.
    */
    updateFromItem: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );    

        if( in_objConfig.Name != this.m_objExtraInfo.Name )
        {   // We don't actually call the setName because the copying of the name
            // will get done by the ModelCollection.
            this.Raise( this.m_strModelType + 'setname', [ this.m_strID ] );
        } // end if
        
        this.raiseModelUpdate();
    },
    
    /**
    * Register our message handlers 
    */
    RegisterMessageHandlers: function()
    {
	    this.RegisterListener( 'request' + this.m_strModelType + 'addnote', Messages.all_publishers_id, this.addNote )
	        .RegisterListener( 'request' + this.m_strModelType + 'deletenote', Messages.all_publishers_id, this.deleteNote );
    	
	    MetaTag.Base.RegisterMessageHandlers.apply( this );
    },

    /**
    * addNote - Add a note to the MetaTag.
    *   Must be overridden.
    * @param {Boolean} in_bTrashed - trashed flag of the note.
    */
    addNote: function( in_bTrashed ) {},

    /**
    * deleteNote - Remove a note from the MetaTag.
    *   Must be overridden.
    * @param {Boolean} in_bTrashed - trashed flag of the note.
    */
    deleteNote: function( in_bTrashed ) {},

    /**
    * getField - get the value of a field.
    * @param {String} in_strField - Field to get value for.
    * @returns {Variant} value of field, undefined if doesn't exist.
    */
    getField: function( in_strField )
    {
        Util.Assert( TypeCheck.String( in_strField ) );
        
        return this.m_objExtraInfo[ in_strField ];
    },
    
    /**
    * getName - get the name
    * @returns {String} - the name of the MetaTag
    */
    getName: function()
    {
        return this.m_objExtraInfo.Name;
    },

    /**
    * setName - Set the name of the MetaTag.  If successful, returns true and 
    *   raises a this.type + "setname" message.
    * @param {String} in_strName - Name to set.
    * @param {Boolean} in_bSkipDBSave (optional) - if true, skips the DB save, 
    *   saves to DB otw.  Assumes false.
    * @returns {Boolean} true if successful update, false otw.
    */
    setName: function( in_strName, in_bSkipDBSave )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        Util.Assert( TypeCheck.UBoolean( in_bSkipDBSave ) );
        
        var bRetVal = true;
        
        if( in_strName != this.m_strName )
        {
            bRetVal = !!in_bSkipDBSave;
            if( false === bRetVal )
            {   
                bRetVal = this.dbSetName( in_strName );
            } // end if
            
            if( true === bRetVal )
            {   // end if
                this.m_objExtraInfo.Name = in_strName;
                this.Raise( this.m_strModelType + 'setname', [ this.m_strID ] );
                this.raiseModelUpdate();
            } // end if
        } // end if
        
        return bRetVal;
    },
    
    /**
    * dbSetName - Sets the name in the DB, by default, does nothing.  
    *   Must be overridden.
    * @param {String} in_strName - Name to set in DB.
    */
    dbSetName: function( in_strName ) {},

    /**
    * compareName - used for sorting/searching.
    * @param {String} in_strName - Name to compare against.
    * @returns {Number} - 0 if ( in_strName == tag.m_strName ), 
    *   -1 if in_strName < tag.m_strName, +1 otw.
    */
    compareName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        var strName = in_strName.toLowerCase();
        var strTagName = this.m_objExtraInfo.Name.toLowerCase(); 
        var nRetVal = 0;

        if( strName < strTagName )
        {
            nRetVal = -1;
        } // end if
        else if( strName > strTagName )
        {
            nRetVal = 1;
        } // end if-else if
        return nRetVal;
    },

    /**
    * comparePartialName - used for sorting/searching.  Compares if the 
    *   given name matches the beginning of this meta tag's name.
    * @param {String} in_strName - Name to compare against.
    * @returns {Number} - 0 if this meta tag name starts with in_strName, 
    *   non 0 otherwise.
    */
    comparePartialName: function( in_strName )
    {
        Util.Assert( TypeCheck.String( in_strName ) );
        
        var strName = in_strName.toLowerCase();
        var strTagName = this.m_objExtraInfo.Name.toLowerCase(); 
        var nRetVal = strTagName.indexOf( strName );
        
        return nRetVal;
    },

    /**
    * getExtraInfo - gets the current extra info object.
    * @returns {Object} - the extra info object.
    */
    getExtraInfo: function()
    {
        return this.m_objExtraInfo;
    },
    
    /**
    * getExtraInfoObject - get an extra info object to store our
    *   model information in.
    * @returns {Object} object with fields for the extra info.
    */
    getExtraInfoObject: function() {
        return {
            ID: undefined,
            Name: undefined,
            Type: undefined
        };
    }
} );