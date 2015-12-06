function NotesDisplayCollectionMenuCommands()
{
    NotesDisplayCollectionMenuCommands.Base.constructor.apply( this, arguments );
};
UberObject.Base( NotesDisplayCollectionMenuCommands, ListMenuPlugin );

Object.extend( NotesDisplayCollectionMenuCommands.prototype, {
    loadConfigParams: function()
    {
        NotesDisplayCollectionMenuCommands.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                { string: _localStrings.MARK_IMPORTANT, callback: 'starselectednotes',
                    displaycheck: this._starDisplayCheck, context: this },
                { string: _localStrings.UNMARK_IMPORTANT, callback: 'unstarselectednotes',
                    displaycheck: this._unstarDisplayCheck, context: this },
                { string: _localStrings.HIDE, callback: 'hiddenselectednotes',
                    displaycheck: this._hiddenDisplayCheck, context: this },
                { string: _localStrings.UNHIDE, callback: 'unhiddenselectednotes',
                    displaycheck: this._unhiddenDisplayCheck, context: this },
                { string: _localStrings.TRASH, callback: 'trashselectednotes', 
                    displaycheck: this._trashDisplayCheck, context: this },
                { string: _localStrings.UNTRASH, callback: 'untrashselectednotes',
                    displaycheck: this._untrashDisplayCheck, context: this },
                { string: _localStrings.DELETE, callback: 'deleteselectednotes' }
                    
            ] },
            m_objNotesCollection: { type: 'object', bReqired: true },
            type: { type: 'string', bReqired: false, default_value: 'NotesDisplayCollectionMenuCommands' }
        } );
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'displaypollpre', this.OnDisplayPollPre, this );
        
        NotesDisplayCollectionMenuCommands.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnDisplayPollPre: function()
    {
        // We do this optimiziation and listen for OnDisplayPollPre because in
        //  IE, the .up( '.trashed' ) call is pretty slow.
        this.m_bTrashed = this.getContext().$().up( '.trashed' );
    },
    
    _trashDisplayCheck: function()
    {
        /** See if some service has set the trashed class somewhere above us **/
        var bRetVal = !this.m_bTrashed;
        return bRetVal;
    },

    _untrashDisplayCheck: function()
    {
        /** See if some service has set the trashed class somewhere above us **/
        var bRetVal = this.m_bTrashed;
        return bRetVal;
    },
    
    _hiddenDisplayCheck: function()
    {
        function fncHiddenCheck( in_objNote ) {
            return !in_objNote.m_objExtraInfo.Hidden;
        };
        
        var bRetVal = !this.m_bTrashed && this._testOneSelectedNotesTrue( fncHiddenCheck );
        return bRetVal;
    },

    _unhiddenDisplayCheck: function()
    {
        function fncHiddenCheck( in_objNote ) {
            return in_objNote.m_objExtraInfo.Hidden;
        };
        
        var bRetVal = !this.m_bTrashed && this._testOneSelectedNotesTrue( fncHiddenCheck );
        return bRetVal;
    },
    
    _starDisplayCheck: function()
    {
        function fncStarCheck( in_objNote ) {
            return !in_objNote.m_objExtraInfo.Star;
        };
        
        var bRetVal = !this.m_bTrashed && this._testOneSelectedNotesTrue( fncStarCheck );
        return bRetVal;
    },

    _unstarDisplayCheck: function()
    {
        function fncStarCheck( in_objNote ) {
            return in_objNote.m_objExtraInfo.Star;
        };
        
        var bRetVal = !this.m_bTrashed && this._testOneSelectedNotesTrue( fncStarCheck );
        return bRetVal;
    },
    
    _hideInTrash: function()
    {
        return !this.m_bTrashed;
    },

    /**
    * @private
    * _testOneSelectedNotesTrue - test each of the selected notes for wheather at least one test is true;
    * @param {Function} - Test function to run.
    * @returns {Boolean} - true if there are no selected notes or all notes match test, false otw.
    */
    _testOneSelectedNotesTrue: function( in_fncTest )
    {
        Util.Assert( TypeCheck.Function( in_fncTest ) );
        
        var objContext = this.getContext();
        var objSelected = objContext.getSelected();
        var bRetVal = false;
        var bNoneSelected = true;
                
        for( var strNoteID in objSelected )
        {
            var objNote = this.m_objNotesCollection.getByID( strNoteID );
            bRetVal = !!( objNote && in_fncTest( objNote ) );
            bNoneSelected = false;
            if( bRetVal )
            {
                break;
            } // end if
        } // end for
        
        return bRetVal || bNoneSelected;
    }
    
} );
