/**
* NotesPagingNewNotePlugin object.
*/
function NotesPagingNewNotePlugin()
{
    NotesPagingNewNotePlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingNewNotePlugin, Plugin );

Object.extend(NotesPagingNewNotePlugin.prototype, {
    RegisterMessageHandlers: function () {
        NotesPagingNewNotePlugin.Base.RegisterMessageHandlers.apply(this);

        this.RegisterListener('childinitialization', this.OnChildInitialization, this);
        this.RegisterListener('configchange', this.OnConfigChange, this);
        this.RegisterListener('displaynotes', this.OnDisplayNotes, this);

        this.RegisterListenerObject({ message: 'requestnewnote', from: Messages.all_publishers_id,
            listener: this.OnRequestNewNote, context: this
        });
    },

    /**
    * childInitialization - Take care of child initializatiopn.
    */
    OnChildInitialization: function () {
        this.getPlugged().setChildHTML('NoteAddButton', '<span>' + _localStrings.NEW_NOTE + '</span>');
    },

    /**
    * OnConfigChange - OnConfigChange
    */
    OnConfigChange: function (in_objConfig) {
        // save this off in case we get a new note in expanded mode, 
        //  we want to display the same set of notes.
        this.m_aobjNoteIDs = in_objConfig.noteids;
        this.m_bSaveNoteIDs = ('singlenote' == in_objConfig.view);
    },

    OnDisplayNotes: function (in_objDisplayConfig) {
        if (this.m_bSaveNoteIDs) {
            this.m_aobjNoteIDs = in_objDisplayConfig.noteids;
        } // end if
    },

    /**
    * OnRequestNewNote - request the creation of a new note.
    */
    OnRequestNewNote: function () {
        var objPlugged = this.getPlugged();
        this.RegisterListenerObject({ message: 'noteadd', from: Note.new_note_id,
            listener: this.OnRequestNewNoteComplete, context: this
        });

        // If we are already in a category, tag the new note with that category.
        var strCategoryID = (objPlugged.m_objConfig.collectionid == MetaTags.eCollections.folders) ?
            objPlugged.m_objConfig.metatagid : undefined;

        objPlugged.Raise('requestnotenew', [strCategoryID]);
    },

    /**
    * OnRequestNewNoteComplete - handler for 'noteadd'.  Tags note if user category
    *   currently selected, otherwise re-displays current category.
    * @param {Object} in_objNote - Note to display.
    */
    OnRequestNewNoteComplete: function (in_objNote) {
        Util.Assert(TypeCheck.Note(in_objNote));

        var objPlugged = this.getPlugged();
        this.UnRegisterListener('noteadd', Note.new_note_id, this.OnRequestNewNoteComplete);
        top.app.externalpage.hide();
        var bGoToMainOnAdd = false;

        // If we are in a system category that is not the all notes category.
        if ((true == bGoToMainOnAdd)
         || ((objPlugged.m_objConfig.collectionid == MetaTags.eCollections.systemcategories) && (objPlugged.m_objConfig.metatagid != SystemCategories.Categories.nofolder))
         || ((objPlugged.m_objConfig.collectionid != MetaTags.eCollections.systemcategories) && (objPlugged.m_objConfig.collectionid != MetaTags.eCollections.folders))) {   // Go to the main category and highlight the new note.
            objPlugged.m_objConfig.collectionid = MetaTags.eCollections.systemcategories;
            objPlugged.m_objConfig.metatagid = SystemCategories.Categories.nofolder;
            // the requestdisplaynotes will clear any selections there are,
            //  and the categorysetall will set to "All Notes"
            objPlugged.Raise('categorysetall');
        } // end if

        if (1) //Automatically going to normal view vs new note on top of existing notes
        {
            objPlugged.Raise('requestdisplaynotes', [{ noteids: [in_objNote.m_strID]}]);
        } // end if
        else if (this.m_aobjNoteIDs) {   // put the new id on the front.
            this.m_aobjNoteIDs.splice(0, 0, in_objNote.m_strID);
            objPlugged.Raise('requestdisplaynotes', [{ page: 0,
                focusnoteid: in_objNote.m_strID,
                noteids: this.m_aobjNoteIDs
            }]);
        } // end if-else if
        else {
            objPlugged.Raise('requestdisplaynotes', [{ page: 0,
                focusnoteid: in_objNote.m_strID,
                sortorder: Notes.eNoteSortOrder.CREATEDT_NEWFIRST
            }]);
        } // end if
    }
});
