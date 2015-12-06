
function ViewPlugin()
{
    ViewPlugin.Base.constructor.apply( this );
}
UberObject.Base( ViewPlugin, Plugin );

Object.extend( ViewPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'requestnoteids', from: Messages.all_publishers_id, 
                listener: this.OnRequestNoteIDs, context: this } )
            .RegisterListenerObject( { message: 'requestdisplaynoteset', from: Messages.all_publishers_id, 
                listener: this.OnRequestDisplayNoteSet, context: this } )
            .RegisterListenerObject( { message: 'listitemselected', 
                listener: this.OnMetaTagSelected, context: this } )
            .RegisterListenerObject( { message: 'registermessagehandlers', 
                listener: this.OnRegisterMessageHandlers, context: this } );
        
        ViewPlugin.Base.RegisterMessageHandlers.apply( this );
    },

    OnRegisterMessageHandlers: function()
    {
        var strType = this.getPlugged().type;
        var objPlugged = this.getPlugged();
        
        this.RegisterListenerObject( { message: strType + 'add', 
                from: Messages.all_publishers_id, listener: objPlugged.addMetaTagFromModel } );
        this.RegisterListenerObject( { message: strType + 'addaction', 
                from: Messages.all_publishers_id, listener: this.OnRequestMetaTagAdd, context: this } );
        this.RegisterListenerObject( { message: strType + 'delete', 
                from: Messages.all_publishers_id, listener: this.OnMetaTagDelete, context: this } );
    
    },

    /** 
    * OnMetaTagDelete - Called when a meta tag is deleted so we can go back to 
    *   the all categories if we have to.
    * @param {String} in_strMetaTagID - ID of the viewnode to delete.
    */
    OnMetaTagDelete: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );

        if( in_strMetaTagID == this.m_strCurrMetaTagID )
        {
            var fncCleanup = function()
            {   // We deleted our current MetaTag, go back to the "all notes" MetaTag.
                this.Raise( 'categoryselectall' );
            };
                    
            Timeout.setTimeout( fncCleanup, 0, this );
        } // end if
    },

    /** 
    * OnMetaTagSelected - One of our meta tags has been selected.  Request
    *   the notes be displayed.
    * @param {String} in_strMetaTagID - ID of the viewnode to delete.
    */
    OnMetaTagSelected: function( in_strMetaTagID )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        
        // Save the viewnode ID for later in case we get a message from the maincontrol
        // and need to unselect a MetaTag
        app.drag.cancelDrag();
        this.m_strCurrMetaTagID = in_strMetaTagID;
        this.m_strCurrCollectionID = this.getPlugged().m_objCollection.m_strMessagingID;
        
        this.Raise( 'requestdisplaynotes', [ { 
            collectionid: this.m_strCurrCollectionID,
            metatagid: in_strMetaTagID,
            page: 0
        } ] );

    },

    /**
    * OnRequestDisplayNoteSet - handles the display of a set.
    *   We know if it is a display of a set, that the current
    *   MetaTag is NOT the one selected.  So, get rid of the 
    *   highlight.
    */
    OnRequestDisplayNoteSet: function()
    {
        if( this.m_strCurrMetaTagID )
        {   // unselect old nodes if we get a message from the maincontrol
            this.getPlugged().unselectItem( this.m_strCurrMetaTagID );
        } // end if

        this.m_strCurrMetaTagID = undefined;
        this.m_strCurrCollectionID = undefined;
    },
    
    /**
    * OnRequestNoteIDs - Handles the request display notes.
    *   Unselects the current item if the new item is not the same.
    * @param {Object} in_objConfig - Configuration that holds ID.
    */
    OnRequestNoteIDs: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        Util.Assert( TypeCheck.UString( in_objConfig.metatagid ) );
        Util.Assert( TypeCheck.UString( in_objConfig.collectionid ) );
        
        if( this.m_strCurrMetaTagID && this.m_strCurrCollectionID
         && ( ( in_objConfig.metatagid != this.m_strCurrMetaTagID ) 
           || ( in_objConfig.collectionid != this.m_strCurrCollectionID ) ) )
        {   
            this.getPlugged().unselectItem( this.m_strCurrMetaTagID );
        } // end if
        
        this.m_strCurrMetaTagID = in_objConfig.metatagid;
        this.m_strCurrCollectionID = in_objConfig.collectionid;
    },

    /**
    * OnRequestMetaTagAdd - Raises a message to add a MetaTag if the name is given.
    * @param {String} in_strMetaTagName {String} (optional) - MetaTag name to add.
    */
    OnRequestMetaTagAdd: function( in_strMetaTagName )
    {	
		if( !TypeCheck.UString( in_strMetaTagName ) ) {
			in_strMetaTagName = '';
		}
		
        if( in_strMetaTagName )
        {
            this._processMetaTagString( in_strMetaTagName );
            var objPlugged = this.getPlugged();
            if( objPlugged.setValue )
            {   // A bit of a hack here!
                objPlugged.setValue( '' );
            }
        } // end if
        else
        {
            this.Raise( 'appokmessage', [ _localStrings.EMPTY_VIEWNODE_NAME_ERROR, 'error' ] );
        } // end if-else
    },

    /**
    * _processMetaTagString - handles a request to add some meta tags
    * @param {String} in_strMetaTagName - tag name requested.
    */
    _processMetaTagString: function( in_strMetaTagName )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagName ) );
        
        var astrDuplicateNames = [];
        var aStrings = in_strMetaTagName.split( ',' );
        
        // Have to use a manual loop because we can have empty strings that will
        //  evaluate to false on the assignment.
        for( var nIndex = 0, nLength = aStrings.length; nIndex < nLength; ++nIndex )
        {
            var strCurrent = aStrings[ nIndex ];
            this._processMetaTagName( strCurrent, astrDuplicateNames );
        } // end for
        
        this._displayDuplicates( astrDuplicateNames );
    },

    /**
    * _processMetaTagName - If the given name is not already part of the colleciton,
    *   add it, if it is already part of the collection, add the name to the duplicate
    *   names array.
    * @param {String} in_strName (optional) - Name to add.  If not given, do nothing.
    * @param {Array} in_astrDuplicateNames - Duplicate names array.
    */
    _processMetaTagName: function( in_strName, in_astrDuplicateNames )
    {
        Util.Assert( TypeCheck.UString( in_strName ) );
        Util.Assert( TypeCheck.Array( in_astrDuplicateNames ) );

        var strName = in_strName.strip();
        if( strName )
        {   
            var objPlugged = this.getPlugged();
            var objCollection = objPlugged.m_objCollection;
            
            if( !objCollection.getIDByName( strName ) )
            {   // doesn't exist, add it.
                objPlugged.RaiseForAddress( 'request' + objPlugged.type + 'add', objPlugged.type, [ strName ] );
            } // end if
            else
            {   // Duplicate name
                in_astrDuplicateNames.push( strName );
            } // end if
        } // end if
    },
    
    /**
    * _displayDuplicates - display an error message with the duplicate names provided.
    * @param {Array} in_astrDuplicateNames - an array with duplicate names.  
    *   Empty array if none.
    */
    _displayDuplicates: function( in_astrDuplicateNames )
    {
        Util.Assert( TypeCheck.Array( in_astrDuplicateNames ) );
        
        if( in_astrDuplicateNames.length > 0 )
        {
            var strDuplicates = in_astrDuplicateNames.join( ', ' );
            this.Raise( 'appokmessage', [ _localStrings.DUPLICATE_TAG_NAMES_ADD + strDuplicates, 'error' ] );
        } // end if
    }
} );