function BindingsList()
{
    BindingsList.Base.constructor.apply( this );
};
UberObject.Base( BindingsList, MetaTagsList );

Object.extend( BindingsList.prototype, {
    loadConfigParams: function()
    {
        BindingsList.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strNoteID: { type: 'string', bReqired: true }
        } );
    },
    
    /**
    * addMetaTagFromModel - creates and adds a metatag to the dropdown menu.
    * @param {Object} in_objMetaTag - metatag being added.
    * @param {Number} in_vExtraInfo (optional) - Potential extra info to attach to 
    *   the display.
    */
    addMetaTagFromModel: function( in_objMetaTag, in_objBindingInfo )
    {
        Util.Assert( TypeCheck.MetaTag( in_objMetaTag ) );
        
        this.m_objDisplayFactory.config = this.m_objDisplayFactory.config || {};
        this.m_objDisplayFactory.config.m_objBindingInfo = in_objBindingInfo;
        this.m_objDisplayFactory.config.m_strNoteID = this.m_strNoteID;

        BindingsList.Base.addMetaTagFromModel.apply( this, [ in_objMetaTag ] );
    },

    /**
    * addMetaTagFromID - Adds a tag from the MetaTagID.  If a tag already exists 
    *   for this metatag, the new tag will not add.
    * @param {String} in_strMetaTagID - ID of metatag to add
    * @returns {bool} true if successfully added, false otw.
    */
    addMetaTagFromID: function( in_strMetaTagID, in_objBindingInfo )
    {
        Util.Assert( TypeCheck.String( in_strMetaTagID ) );
        var objMetaTag = this.getByID( in_strMetaTagID );
        var bRetVal = ! objMetaTag;
        if( bRetVal )
        {   // a new meta tag
            function fncCallback( in_objMetaTag )
            {
                this.addMetaTagFromModel( in_objMetaTag, in_objBindingInfo );
            };
            
            var objConfig = {
                metatagid: in_strMetaTagID,
                callback: fncCallback,
                context: this
            };
            this.m_objCollection.getMetaTagWithCallback( objConfig );
        } // end if
        else if( objMetaTag.getBindingInfo() != in_objBindingInfo )
        {   // an updated meta tag.
            objMetaTag.setBindingInfo( in_objBindingInfo );
        } // end if
        
        return bRetVal;
    }
});