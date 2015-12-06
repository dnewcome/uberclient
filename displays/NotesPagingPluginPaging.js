/**
* NotesPagingPagingPlugin object.
*/
function NotesPagingPagingPlugin()
{
    this.m_nTotalPages = undefined;
    
    NotesPagingPagingPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingPagingPlugin, Plugin );

Object.extend( NotesPagingPagingPlugin.prototype, {
    RegisterMessageHandlers: function() {
        var me=this, objPlugged = me.getPlugged(), 
			all = Messages.all_publishers_id, pluggedID = objPlugged.m_strMessagingID;

		NotesPagingPagingPlugin.Base.RegisterMessageHandlers.apply( me );
        
        me.RegisterListener( 'configchange', me.OnConfigChange, me );
        me.RegisterListener( 'displaynotes', me.OnDisplayNotes, me );
        me.RegisterListenerObject( { message: 'setpage', 
            from: all, listener: me.OnSetPage, context: me,
            to: pluggedID } );
        me.RegisterListenerObject( { message: 'setnextpage', 
            from: all, listener: me.OnSetNextPage, context: me,
            to: pluggedID } );
        me.RegisterListenerObject( { message: 'setpreviouspage', 
            from: all, listener: me.OnSetPreviousPage, context: me,
            to: pluggedID } );
    },

    OnConfigChange: function()
    {
        var objPlugged = this.getPlugged();
        var objConfig = objPlugged.m_objConfig;
        
        if( objConfig.noteids )
        {
            /*
            * Use the maxrows to keep track of whether this request came in from
            *  a normal category/selection or whether the noteids were specified
            *  directly and OnDisplayNotes was called without requesting noteids from
            *  the DB.  If objPlugged.m_objConfig.maxrows is set, that means OnConfigChange
            *  was set, and we asked the DB for the rows and the DB will give us back
            *  the number of rows.  If maxrows is 0, that means we specified directly
            *  the noteids and we will say there is "1" page.  
            */
            objConfig.page = objConfig.startrow = objConfig.maxrows = 0;
        } // end if
        else
        {
            objConfig.page = objConfig.page || 0;
            objConfig.startrow = objConfig.page * objConfig.maxrows;
        } // end if-else
    },
    
    OnDisplayNotes: function( in_objConfig )
    {
        var objConfig = this.getPlugged().m_objConfig;
        var nTotalCount = in_objConfig.totalcount || 0;
        var nCurrCount = in_objConfig.noteids && in_objConfig.noteids.length || 0;
        this.m_nTotalPages = objConfig.maxrows ? 
            Math.ceil( nTotalCount / objConfig.maxrows ) : 0;
        
        if( ( 0 === nCurrCount ) 
         && ( this.m_nTotalPages > 0 ) )
        {   // If the DB returns 0 notes but there is a totalcount sent back, 
            //  that means we requested an invalid page.  Re-request 
            //  using the highest numbered valid page.
            this.OnSetPage( this.m_nTotalPages - 1, true );
        } // end if
        else
        {
            this.updateUI( nCurrCount, nTotalCount, this.m_nTotalPages );
        } // end if-else
    },

    /**
    * OnSetPage - Set a page - used as a callback as well.
    * @param {Number} in_nPage - Page number to display.
    * @param {bool} in_bForce (optional) - Force an update even if the pages are the same.
    */
    OnSetPage: function( in_nPage, in_bForce )
    {
        Util.Assert( TypeCheck.Number( in_nPage ) );
        Util.Assert( TypeCheck.UBoolean( in_bForce ) );
        
        var objPlugged = this.getPlugged();
        if( ( in_nPage != objPlugged.m_objConfig.page ) || ( true === in_bForce ) )
        {
            objPlugged.OnDisplayNotes( { page: in_nPage, scrolltotop: true } );
        } // end if
    },
    
    /**
    * updateUI - Update the user interface based on the incoming counts.
    * @param {Number} in_nNotesInPage - Number of notes in this page.
    * @param {Number} in_nTotalNoteCount - Total number of notes in all pages.
    * @param {Number} in_nPages - Number of pages.
    */
    updateUI: function( in_nNotesInPage, in_nTotalNoteCount, in_nPages )
    {
        Util.Assert( TypeCheck.Number( in_nNotesInPage ) );
        Util.Assert( TypeCheck.Number( in_nTotalNoteCount ) );
        Util.Assert( TypeCheck.Number( in_nPages ) );
        
        var objPlugged = this.getPlugged();

        objPlugged.Raise( 'setsize', [ in_nPages ] );

        this._updateClassNames( in_nPages, in_nNotesInPage );
        this._updateSelectedPage( in_nPages );
        this._updateFirstLastNotes( in_nTotalNoteCount, in_nNotesInPage );
    }, 

    /**
    * _updateClassNames - adds the 'multiplepages' class on the paging
    *   container if there is more than 1 page, removes it otherwise.
    * @param {Number} in_nTotalPages - Current total number of pages.
    * @param {Number} in_nNotesInPage - Current number of notes shown
    */
    _updateClassNames: function( in_nTotalPages, in_nNotesInPage )
    {
        Util.Assert( TypeCheck.Number( in_nTotalPages ) );
        Util.Assert( TypeCheck.Number( in_nNotesInPage ) );
        
        var objPlugged = this.getPlugged();
        var strFunction = in_nTotalPages > 1 ? 'addClassName' : 'removeClassName';
        
        objPlugged.$()[ strFunction ]( 'multiplepages' );

        if( in_nNotesInPage > 0 )
        {
            objPlugged.$().removeClassName( 'nonotes' );
            objPlugged.$().addClassName( 'hasnotes' );
        } // end if
        else
        {   
            objPlugged.$().addClassName( 'nonotes' );
            objPlugged.$().removeClassName( 'hasnotes' );
        } // end if-else

    },
    
    /**
    * _updateSelectedPage - update the currently selected page.  Gets the information
    *   from the plugged object's m_objConfig.page.
    * @param {Number} in_nTotalPages - the total number of pages.
    */
    _updateSelectedPage: function( in_nTotalPages )
    {
        Util.Assert( TypeCheck.Number( in_nTotalPages ) );
    
        if( in_nTotalPages > 0 )
        {
            var objPlugged = this.getPlugged();
            objPlugged.Raise( 'setselection', [ objPlugged.m_objConfig.page, true ] );
        } // end if
    },
    
    /**
    * _updateFirstLastNotes - update the first and last note display.
    * @param {Number} in_nTotalCount - total number of notes in category
    * @param {Number} in_nNotesInPage - currently displayed count.
    */
    _updateFirstLastNotes: function( in_nTotalCount, in_nNotesInPage )
    {
        Util.Assert( TypeCheck.Number( in_nTotalCount ) );
        Util.Assert( TypeCheck.Number( in_nNotesInPage ) );
        
        if( in_nNotesInPage > 0 )
        {
            var objPlugged = this.getPlugged();
            var objConfig = objPlugged.m_objConfig;
            var nFirstNote = objConfig.page * objConfig.maxrows;
            var nLastNote = nFirstNote + in_nNotesInPage;
            objPlugged.Raise( 'updatenotecounts', [ nFirstNote + 1, nLastNote, in_nTotalCount ] );
        } // end if
    },
    
    /**
    * OnSetNextPage - set the next page.  If no page is set, will set 
    *   to page 0, if already at the highest possible page, does 
    *   not change pages.
    */
    OnSetNextPage: function()
    {
        var objPlugged = this.getPlugged();
        var nPage = 0;
        
        if( true == TypeCheck.Defined( objPlugged.m_objConfig.page ) )
        {
            nPage = objPlugged.m_objConfig.page + 1;
        } // end if
        
        if( ( TypeCheck.Number( this.m_nTotalPages ) ) 
         && ( this.m_nTotalPages > 0 ) )
        {   // total pages does not have to be set?
            nPage = Math.min( nPage, this.m_nTotalPages - 1 );
        } // end if
        
        this.OnSetPage( nPage );
    },
    
    /**
    * OnSetPreviousPage - set the previous page.  If no page is set, will set 
    *   to page 0, if already at the lowest possible page, does 
    *   not change pages.
    */
    OnSetPreviousPage: function()
    {
        var objPlugged = this.getPlugged();
        var nPage = 0;
        
        if( ( true == TypeCheck.Defined( objPlugged.m_objConfig.page ) )
         && ( 1 <= objPlugged.m_objConfig.page ) )
        {
            nPage = objPlugged.m_objConfig.page - 1;
        } // end if
        
        this.OnSetPage( nPage );
    }
} );
