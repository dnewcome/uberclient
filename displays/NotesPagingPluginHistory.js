/*
* NotesPagingHistoryPlugin - 
*/
function NotesPagingHistoryPlugin()
{
    NotesPagingHistoryPlugin.Base.constructor.apply( this );
}
UberObject.Base( NotesPagingHistoryPlugin, Plugin );

Object.extend( NotesPagingHistoryPlugin.prototype, {
    loadConfigParams: function()
    {
        NotesPagingHistoryPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strURLHandlerID: { type: 'string', bRequired: true },
            m_strSingleNoteView: { type: 'string', bRequired: true }
        } );
    },
    
    init: function()
    {
        NotesPagingHistoryPlugin.Base.init.apply( this, arguments );

        this.extendPlugged( 'redisplay', this );
        this.extendPlugged( 'redisplayInPlace', this );
        //this.extendPlugged( 'OnRequestNewNoteComplete', this );
   },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'back', from: Messages.all_publishers_id,
            listener: this.OnBack, context: this } );
        
        this.RegisterListener( 'beforeconfigchange', this.OnBeforeConfigChange, this );
        this.RegisterListener( 'configchange', this.OnConfigChange, this );
        this.RegisterListener( 'displaynotes', this.OnDisplayNotes, this );

	    NotesPagingHistoryPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    m_astrNoteMessages: [ 'notetrash', 'notedelete', 'noteuntrash', 
        'notehidden', 'noteunhidden' ],
    
    RegisterNoteMessageHandlers: function( in_strNoteID )
    {
        for( var nIndex = 0, strMessage; strMessage = this.m_astrNoteMessages[ nIndex ]; ++nIndex )
        {
            this.RegisterListenerObject( { message: strMessage, from: in_strNoteID,
                listener: this.OnBack, context: this } );
        } // end for
    },

    UnRegisterNoteMessageHandlers: function( in_strNoteID )
    {
        for( var nIndex = 0, strMessage; strMessage = this.m_astrNoteMessages[ nIndex ]; ++nIndex )
        {
            this.UnRegisterListener( strMessage, in_strNoteID, this.OnBack );
        } // end for
    },
    

    
    /**
    * OnBeforeConfigChange - Takes care of if we select a group of notes to 
    *   display in expanded mode, add a history item so we can easily go back
    *   to the list.
    */
    OnBeforeConfigChange: function( in_objNewConfig )
    {
        Util.Assert( TypeCheck.UObject( in_objNewConfig ) );
        
        var objOldConfig = this.getPlugged().m_objConfig;
        if( ( in_objNewConfig )
         && ( in_objNewConfig.noteids || this.m_strSingleNoteView == in_objNewConfig.view ) 
         && ( ! objOldConfig.noteids ) )
        {   
            this._saveHistoryItem( in_objNewConfig.url, in_objNewConfig.title );
            this.m_bOverrideBack = true;
        } // end if
        else if( ( in_objNewConfig && in_objNewConfig.noteids && objOldConfig.noteids )
              || ( ( this.m_strSingleNoteView == objOldConfig.view )
                && ( ! ( in_objNewConfig && TypeCheck.String( in_objNewConfig.metatagid ) ) ) ) )
        {   // We are in already single note mode, override the back so we don't go back to list view.
            // If we had a meta tag id, that means we are switching meta tags, go back to former view.
            this.m_bOverrideBack = true;
        } // end if
    },
    
    /**
    * OnConfigChange - The two ways to display notes are via "displayNotes"
    *   and "displaySingleNote".  If we are calling displayNotes and we
    *   had a lastItem, it means we are currently in single note mode but we
    *   requested a set of notes via paging/tag selection/category selection, etc.
    *   and must come out of single note mode to the previous mode.
    */
    OnConfigChange: function()
    {
        // if m_bOverrideBack is set, it means we just set single note mode and do
        //  note want to go back.
        if( ! this.m_bOverrideBack )
        {
            var objPlugged = this.getPlugged();
            var objItem = this.getLastItem();
            if( objItem )
            {   // If we have a last item, it means we are in single note mode and
                // want to go back to what the last view was.
                objPlugged.m_objConfig.view = objItem.view;
            } // end if
            else
            {   // displaying normally, one of the views, set the view accordingly.
                // If we are calling displayNotes with a new view, the config will not
                //  yet be updated, so we have to save from the new config first, then from
                //  the old config.
                Cookies.set( 'view', objPlugged.m_objConfig.view, 365 );
                Cookies.set( 'sortorder', objPlugged.m_objConfig.sortorder, 365 );
            } // end if
        } // end if
        this.m_bOverrideBack = false;
    },
    
    /**
    * OnDisplayNotes - if there is only one note displayed, if it is deleted, hidden, etc,
    *   go back.
    * @param {Object} in_objConfig - display configuration.
    */
    OnDisplayNotes: function( in_objConfig )
    {
        if( this.m_strRegisteredNoteID )
        {
            this.UnRegisterNoteMessageHandlers( this.m_strRegisteredNoteID );
        } // end if
        
        if( 1 == in_objConfig.noteids.length )
        {
            this.m_strRegisteredNoteID = in_objConfig.noteids[ 0 ];
            this.RegisterNoteMessageHandlers( this.m_strRegisteredNoteID );
        } // end if
    },

    /**
    * OnBack - handler for 'back'  Takes us back in time.
    */
    OnBack: function()
    {
        var objPlugged = this.getPlugged();
        var objItem = this.getLastItem();
        
        if( objItem )
        {   
            this._processURL( objItem );
            objPlugged.OnDisplayNotes( objItem, true );
        } // end if
    },
    
    /**
    * @private
    * _saveHistoryItem - Save a history item.
    * @param {Variant} in_strURL (optional) - If a string, used as a URL to open up when going "back".
    *   in the external page.
    * @param {String} in_strTitle (optional) - If string, used for the "go back to" title.
    */
    _saveHistoryItem: function( in_strURL, in_strTitle )
    {
        /**
        * We do not want to re-add a history item for single note mode
        *   because if we go one single note, then another single note via
        *   "new note" or some other faculty, we want to go back to the 
        *   previous state before the first single note request.
        * We do not add a history item if we have no view.  this can be
        *   the case if we call ubernote with a noteid.
        */
        var objPlugged = this.getPlugged();
        if( ( ! this.m_objHistoryItem )
         && ( objPlugged.m_objConfig )
         && ( objPlugged.m_objConfig.view ) )
        {
            var objItem = Object.clone( this.getPlugged().m_objConfig );
            this.addItem( objItem );
        } // end if
        
        // If we have a URL, we ALWAYS want to add it.
        if( this.m_objHistoryItem )
        {
            // If we do not have these coming in, reset them.
            this.m_objHistoryItem.URL = TypeCheck.String( in_strURL ) ? in_strURL : undefined;
            this.m_objHistoryItem.Title = TypeCheck.String( in_strTitle ) ? in_strTitle : undefined;
        } // end if

        
        this.m_bOverrideBack = true;
        this.updateUI();
    },
    
    /**
    * _processURL - if there is a URL in the item, try and raise the show message
    *    for the URL processor.  Remove the URL from the item so we don't keep
    *    going back to it.
    */
    _processURL: function( in_objItem )
    {
        if( in_objItem.URL )
        {
            if( this.m_strURLHandlerID )
            {
                this.RaiseForAddress( 'show', this.m_strURLHandlerID, [ in_objItem.URL ] );
            } // end if
            
            delete in_objItem.URL;
        } // end if
    },
    
    addItem: function( in_objItem )
    {
        Util.Assert( TypeCheck.Object( in_objItem ) );
        
        this.m_objHistoryItem = in_objItem;
        // entering single note mode, set the view to what it was before we entered single note mode.
        Cookies.set( 'view', in_objItem.view, 365 );
    },
    
    getLastItem: function()
    {
        var objRetVal = this.m_objHistoryItem;
        this.m_objHistoryItem = undefined;
        
        this.updateUI();
        
        return objRetVal;
    },
    
    /**
    * updateUI - update the UI.
    */
    updateUI: function()
    {
        var objPlugged = this.getPlugged();
        var strFunction = this.m_objHistoryItem ? 'addClassName' : 'removeClassName';
        var strBackToName = this._findBackToName();
        
        objPlugged.$()[ strFunction ]( 'historyavailable' );
        
        if( this.m_strBackToName )
        {
            objPlugged.$().removeClassName( this.m_strBackToName );
        } // end if
        
        this.m_strBackToName = strBackToName.toLowerCase();
        objPlugged.$()[ strFunction ]( objPlugged.m_objConfig.view.toLowerCase() );
        
        objPlugged.$( 'elementViewName' ).update( strBackToName );
    },
    
    /**
    * @private
    * _findBackToName - finds the name to put in "Back to..."
    * @returns {String} If there is a history item and a title in the history item, use that.
    *   otherwise, if there is a URL in the history item, use "Dashboard", otherwise use teh 
    *   current view.
    */
    _findBackToName: function()
    {
        var objPlugged = this.getPlugged();
        function getViewTitle( in_strViewName )
        {
            return _localStrings[ in_strViewName && in_strViewName.toUpperCase() ] 
            || _localStrings.UNDEFINED;
        };
        var strRetVal = getViewTitle( objPlugged.m_objConfig.view );
        
        if( this.m_objHistoryItem )
        {
            if( 'singlenote' == objPlugged.m_objConfig.view )
            {   // if we came from a single note, go back to the thing that was there before.
                strRetVal = this.m_objHistoryItem.Title || getViewTitle( this.m_objHistoryItem.view );
            } // end if
            else if( this.m_objHistoryItem.Title )
            {
                strRetVal = this.m_objHistoryItem.Title;
            } // end if
        } // end if
        return strRetVal;
    },
    
    /**
    * redisplay - We override this to take care of when we are in single note mode.
    *   If in single note mode, we take care of this using "OnBack", if not in single note
    *   mode, go to the normal redisplayInPlace function.  This is the handler for
    *   'notetrash', 'noteuntrash' etc.
    */
    redisplay: function()
    {
        if( !this.m_objHistoryItem )
        {
            this.m_objSavedFuncs.redisplay.apply( this.getPlugged(), arguments );
        } // end if
    },
    
    /**
    * redisplayInPlace - We override this to take care of when we are in single note mode.
    *   If in single note mode, we take care of this using "OnBack", if not in single note
    *   mode, go to the normal redisplayInPlace function.  This is the handler for
    *   'notetrash', 'noteuntrash' etc.
    */
    redisplayInPlace: function()
    {
        if( !this.m_objHistoryItem )
        {
            this.m_objSavedFuncs.redisplayInPlace.apply( this.getPlugged(), arguments );
        } // end if
    }
} );