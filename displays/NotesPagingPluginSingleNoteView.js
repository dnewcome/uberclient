/**
* NotesPagingSingleNoteViewPlugin class - 
* NotesPagingSingleNoteViewPlugin will display the Xth index after the current page's base index.
*  so if we are in page 10 and maxrows is set to 50, and we want index 10, 
*  it will set us to "single note view", and set the page to 510, with 1 as the maxrows.
*/
function NotesPagingSingleNoteViewPlugin()
{
    NotesPagingSingleNoteViewPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingSingleNoteViewPlugin, Plugin );

Object.extend( NotesPagingSingleNoteViewPlugin.prototype, {
    loadConfigParams: function()
    {
        NotesPagingSingleNoteViewPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strSingleNoteView: { type: 'string', bRequired: true },
            type: { type: 'string', bReqired: false, default_value: 'NotesPagingSingleNoteViewPlugin' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        NotesPagingSingleNoteViewPlugin.Base.RegisterMessageHandlers.apply( this );
        
        this.RegisterListener( 'configchange', this.OnConfigChange, this );
        this.RegisterListener( 'requestsinglenoteview', this.OnSingleNoteView, this );
        this.RegisterListenerObject( { message: 'requestsinglenoteview', 
            from: Messages.all_publishers_id,
            listener: this.OnSingleNoteView, context: this } );
    },

    /**
    * OnConfigChange - make sure we set the header to "selected note"
    */
    OnConfigChange: function()
    {
        var objConfig = this.getPlugged().m_objConfig;
        if( this.m_strSingleNoteView == objConfig.view )
        {
            objConfig.header = _localStrings.VIEWING_SELECTED_NOTE;
        } // end if
    },
    
    /**
    * OnSingleNoteView - for the current category/sort order, etc, display the Xth index 
    *   after the current page's base index. so if we are in page 10 and maxrows is set 
    *   to 50, and we want index 10, it will set us to "single note view", and set the 
    *   page to 510, with 1 as the maxrows.
    * @param {Number} in_nIndex - index in the current page being requested.
    */
    OnSingleNoteView: function( in_nIndex )
    {
        Util.Assert( TypeCheck.Number( in_nIndex ) );
        
        var objPlugged = this.getPlugged();
        var objConfig = objPlugged.m_objConfig;
        var nNote = objConfig.page * objConfig.maxrows + in_nIndex;
        
        objPlugged.OnDisplayNotes( {
            view: this.m_strSingleNoteView,
            page: nNote,
            maxrows: 1,
			scrolltotop: true
        } );
		
    }
} );
