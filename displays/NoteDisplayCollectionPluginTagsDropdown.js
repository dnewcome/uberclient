/**
* NoteDisplayCollectionTagsDropdownPlugin object.
*/
function NoteDisplayCollectionTagsDropdownPlugin()
{
    this.m_objNoteCounts = undefined;
    NoteDisplayCollectionTagsDropdownPlugin.Base.constructor.apply( this );
};
UberObject.Base( NoteDisplayCollectionTagsDropdownPlugin, Plugin );

Object.extend( NoteDisplayCollectionTagsDropdownPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteDisplayCollectionTagsDropdownPlugin.Base.loadConfigParams.apply( this, arguments );
        this.extendConfigParams( {
            m_objTagsMenu: { type: 'object', bReqired: true },
            m_objNotesCollection: { type: 'object', bReqired: true },
			m_strBindingCollectionID: { type: 'string', bRequired: true }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'menushow', this.OnMenuShow, this );

        this.RegisterListenerObject( { 
            message: 'listitemselected',
            from: this.m_objTagsMenu.m_strMessagingID,
            listener: this.OnListItemSelected,
            context: this
        } );

        
        NoteDisplayCollectionTagsDropdownPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnMenuShow - takes care of the OnMenuShow command for the tags menu.
    * @param {Object} in_objMenu - menu being shown.
    */
    OnMenuShow: function( in_objMenu )
    {
        Util.Assert( TypeCheck.Object( in_objMenu ) );
        
        if( in_objMenu === this.m_objTagsMenu )
        {
            this._findBindingsForAllNotes();
            this._setItemSelections();
        } // end if
    },
    
    /**
    * OnListItemSelected - called when a list item is selected so that we can clear
    *   the partial class name on it.
    * @param {String} in_strItemID
    */
    OnListItemSelected: function( in_strItemID )
    {
        Util.Assert( TypeCheck.String( in_strItemID ) );
    
        this.m_objTagsMenu.removeClassName( in_strItemID, 'partial' );
    },
    
    /**
    * @private
    * _findBindingsForAllNotes - finds the list of bindings for all the selected items.
    */
    _findBindingsForAllNotes: function()
    {
        this.m_objNoteCounts = {};
        var objPlugged = this.getPlugged();
        var objSelected = objPlugged.getSelected();
        this.m_nNoteCount = 0;
        
        for( var strNoteID in objSelected )
        {
            this.m_nNoteCount++;
            var objNote = this.m_objNotesCollection.getByID( strNoteID );
            this._findBindingCountsForNote( objNote );
        } // end for
    },

    /**
    * @private
    * _findBindingCountsForNote - finds the bindings for the note.  Increments
    *   the note count for each meta tag the note is bound with.
    * @param {Object} in_objNote (optional) - Optional note to get bindings for
    */    
    _findBindingCountsForNote: function( in_objNote )
    {
        Util.Assert( TypeCheck.UObject( in_objNote ) );
        
        if( in_objNote )
        {
            var objBindings = in_objNote.getBindings( this.m_strBindingCollectionID );
            for( var nIndex = 0, strMetaTagID; strMetaTagID = objBindings[ nIndex ]; ++nIndex )
            {
                this.m_objNoteCounts[ strMetaTagID ] = this.m_objNoteCounts[ strMetaTagID ] || 0;
                this.m_objNoteCounts[ strMetaTagID ]++;
            } // end for
        } // end if
    },
    
    /**
    * @private
    * _setItemSelections - either selected the item if every note is tagged with a meta tag, or 
    *   add the class name 'partial' to those that are selected by 'some' of the items but not all.
    */
    _setItemSelections: function()
    {
        for( var strMetaTagID in this.m_objNoteCounts )
        {
            var nCount = this.m_objNoteCounts[ strMetaTagID ];
            if( nCount === this.m_nNoteCount )
            {   // select META TAGS from the meta tags menu
                this.m_objTagsMenu.selectItem( strMetaTagID, true );
            } // end if
            else
            {   // partially selected object
                this.m_objTagsMenu.addClassName( strMetaTagID, 'partial' );
            } // end if-else
        } // end for
    }
} );
