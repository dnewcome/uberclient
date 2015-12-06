function Shares()
{
    Shares.Base.constructor.apply( this, arguments );
};
UberObject.Base( Shares, MetaTags );

Object.extend( Shares.prototype, {
    init: function( in_objConfig )
    {   // MetaTags based things to not call loadConfigParams, so we have to do this all manually.
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        Util.Assert( TypeCheck.Object( in_objConfig.m_objContacts ) );
        
        this.m_objContacts = in_objConfig.m_objContacts;
        Shares.Base.init.apply( this, arguments );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'requestnotes' + this.m_strModelType, Messages.all_publishers_id, this.OnShareBindingAdd );

        // For each contact, listen for an update so we can set the name.
        this.RegisterListener( 'contactload', Messages.all_publishers_id, this.OnContactLoad );
        
        Shares.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * @private
    * _preProcessItem - Pre process a DB item so we can use it.
    *   For the shares, it replaces the Name with a contact Name if available.
    *   Saves the original name in User_Name.
    * @param {Object} in_objItem - DB item to process.
    */
    _preProcessItem: function( in_objItem )
    {
        var objContact = this.m_objContacts.getByUserName( in_objItem.Name );
        if( objContact )
        {
            in_objItem.User_Name = in_objItem.Name;
            in_objItem.Name = objContact.getName();
        } // end if
        
        return Shares.Base._preProcessItem.apply( this, arguments );
    },
    
    /*
    * dbAdd - overridden for Shares because the these are only made when we add a new
    *	contact and share it with a note.  The contact is already made, but we are setting
    *	up the binding to share with a note.
    * @param {Object} in_objConfig - configuration object to make the share from.
    */
    dbAdd: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        // Make our own copy so we aren't updating the Note_Counts of the Contact.
        var objConfig = Object.clone( in_objConfig );
        
        // Set the count to 0 because there will be an 'addbinding' request for each note.
        objConfig.Note_Count = 0;
        
        // the default type will be the 'contact' type, so we have to 
        //  change it to our type.
        objConfig.Type = this.m_strModelType;
        return this._createModelFromItem( objConfig );
    },

    /**
    * OnShareBindingAdd - When a share binding is added, see if 
    *   1) that share binding is a contact and
    *   2) there is no binding in our list already.
    * If these conditions are met, add a new MetaTag to our collection
    *   based on the Contact.
    * @param {Object} in_objNoteIDs - Used to get the note count.
    * @param {String} in_strMetaTagID - MetaTagID for the binding being added.
    * @param {EnumKey} in_eShareLevel - unused.
    */
    OnShareBindingAdd: function( in_objNoteIDs, in_strMetaTagID, in_eShareLevel )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        
        var objContactModel = this.m_objContacts.getByID( in_strMetaTagID );
        var objShareModel = this.getByID( in_strMetaTagID );
        
        if( objContactModel && ! objShareModel )
        {
            objShareModel = this.add( objContactModel.m_objExtraInfo );
        } // end if
    },

    /**
    * OnContactLoad - Updates the Name of the model whenever its
    *   associated Contact is updated.  Raises the model load message.
    * @param {Object} in_objContact - Contact model that is being updated.
    */
    OnContactLoad: function( in_objContact )
    {
        Util.Assert( TypeCheck.Object( in_objContact ) );
        
        var objShare = this.getByID( in_objContact.m_strID );
        if( objShare )
        {
            var strName = in_objContact.getField( 'Name' );
            objShare.setName( strName, true );
        } // end if
    }
} );