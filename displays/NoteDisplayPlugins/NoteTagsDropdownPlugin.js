function NoteTagsDropdownPlugin( in_objNoteDisplay )
{
    return NoteTagsDropdownPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteTagsDropdownPlugin, Plugin );

Object.extend( NoteTagsDropdownPlugin.prototype, {
    loadConfigParams: function()
    {
        NoteTagsDropdownPlugin.Base.loadConfigParams.apply( this, arguments );
        this.extendConfigParams( {
            m_objMenu: { type: 'object', bRequired: true },
			m_strCollectionID: { type: 'string', bRequired: true }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'menushow', this.OnMenuShow, this );
        NoteTagsDropdownPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnMenuShow - checks to see if it is the m_objMenu being shown, and if so,
    *   set the appropriate categories
    * @param {Object} in_objMenu - Menu being shown.
    */
    OnMenuShow: function( in_objMenu )
    {
        Util.Assert( TypeCheck.Object( in_objMenu ) );
        
        if( in_objMenu === this.m_objMenu )
        {   
            this._selectBindingsForNote();
        } // end if
    },
    
    /**
    * _selectBindingsForNote - selects the bindings for the note
    */
    _selectBindingsForNote: function()
    {
        var astrBindings = this.getPlugged().m_objNote.getBindings( this.m_strCollectionID ) || [];
	    for( var nIndex = 0, strMetaTagID; strMetaTagID = astrBindings[ nIndex ]; ++nIndex )
	    {   
		    this.m_objMenu.selectItem( strMetaTagID, true );
	    } // end for
    }
    
} );    
