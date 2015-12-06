function Note()
{
    this.m_objBindings = {};
    this.m_objExtraInfo = {
        Star: false,
        Hidden: false,
        Trash: false,
        Share_Owner: undefined
    };
        
    Note.Base.constructor.apply( this, arguments );
}
UberObject.Base( Note, UberObject );

/**
* enum used to hold the commands that are sent to the DB
*   to do meta type updates.  Used in NoteMetaUpdate.
*/
Note.eMetaUpdates = {
    star: 0,
    unstar: 1,
    trash: 2,
    untrash: 3,
    hide: 4,
    unhide: 5,
    'public': 6,
    unpublic: 7
};


function SystemCategories() {};
SystemCategories.Categories = {
    'all': 'all', 
    'untagged': 'untagged', 
    'trashed': 'trashed', 
    'starred': 'starred', 
    'bookmarked': 'bookmarked',
    'search': 'search',
    'unchecked': 'unchecked',
    'hidden': 'hidden',
    'public': 'public'
};

Note.MetaUpdateFunctions = {
    OnTrash: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.trash, 
        message: 'notetrash', oncomplete: Note.prototype.OnTrashComplete },
        
    OnUnTrash: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.untrash, 
        message: 'noteuntrash', oncomplete: Note.prototype.OnUntrashComplete },
        
    OnStar: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.star, 
        translation: { Star: true }, message: 'notestar', 
        oncomplete: Note.prototype.OnMetaRequestComplete, 
        arguments: [ 'requestsystemcategoriesaddnote', SystemCategories.Categories.starred ] },
        
    OnUnStar: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.unstar, 
        translation: { Star: false }, message: 'noteunstar', 
        oncomplete: Note.prototype.OnMetaRequestComplete, 
        arguments: [ 'requestsystemcategoriesdeletenote', SystemCategories.Categories.starred ] },
        
    OnHidden: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.hide, 
        translation: { Hidden: true }, message: 'notehidden',
        oncomplete: Note.prototype.OnHiddenComplete },
        
    OnUnHidden: { service: 'NoteMetaUpdate', action: Note.eMetaUpdates.unhide, 
        translation: { Hidden: false }, message: 'noteunhidden', 
        oncomplete: Note.prototype.OnUnHiddenComplete },
        
    OnEmailToSelf: { service: 'NoteEmailToSelf', message: 'noteemail' }
};

Object.extend( Note.prototype, {
    init: function( in_strNoteID )
    {
        this.m_strID = in_strNoteID;
    },
    
    /**
    * clearBindings - clear all the bindings
    */
    clearBindings: function()
    {
        this.m_objBindings = {};
    },
    
    /**
    * addBinding - add a binding to the note.
    */
    addBinding: function( in_strCollectionID, in_strMetaTagID, vBinding )
    {
        var objCollection = this.m_objBindings[ in_strCollectionID ] = this.m_objBindings[ in_strCollectionID ] || {};
        objCollection[ in_strMetaTagID ] = vBinding || true;
    },
    
    /**
    * hasBinding - see if note has a binding
    */
    hasBinding: function( in_strCollectionID, in_strMetaTagID )
    {
        var objCollection = this.m_objBindings[ in_strCollectionID ];
        var objRetVal = objCollection && objCollection[ in_strMetaTagID ];
        return !!objRetVal;        
    },

    /** 
    * getBindings - get an array of all bindings for a collection.
    */
    getBindings: function( in_strCollectionID )
    {
        return Object.keys( this.m_objBindings[ in_strCollectionID || 'tagged' ] );
    },

    OnTagComplete: function()
    {        
        this.m_bOnTagComplete = true;
    },

    OnUntagComplete: function()
    {        
        this.m_bOnUntagComplete = true;
    },
    
    OnSaveResponse: function()
    {
        this.m_bOnSaveResponseComplete = true;
    },
    
    OnMetaRequestComplete: function( in_strMessage, in_strSubscriber )
    {
        this.m_bOnMetaRequestComplete = true;
        this.m_strMetaRequestMessage = in_strMessage;
        this.m_strMetaRequestSubscriber = in_strSubscriber;
    },
    
    /** 
    * resetTestStatus - resets the test status variables
    */
    resetTestStatus: function()
    {
        this.m_bOnTagComplete = false;
        this.m_bOnUntagComplete = false;
        this.m_bOnSaveResponseComplete = false;
        this.m_bOnMetaRequestComplete = false;
        this.m_strMetaRequestMessage = undefined;
        this.m_strMetaRequestSubscriber = undefined;
        this.m_objExtraInfo.Star = false;
        this.m_objExtraInfo.Hidden = false;
        this.m_objExtraInfo.Trash = false;
        this.m_objExtraInfo.Share_Owner = undefined;
        this.m_bDeleteMe = false;
        this.m_bSkipDBDelete = false;
    },
    
    /**
    * setStar - sets the star status
    * @param {Boolean} in_bValue
    */
    setStar: function( in_bValue )
    {
        this.m_objExtraInfo.Star = in_bValue;
    },

    /**
    * setTrash - sets the trash status
    * @param {Boolean} in_bValue
    */
    setTrash: function( in_bValue )
    {
        this.m_objExtraInfo.Trash = in_bValue;
    },

    
    /**
    * setHidden - sets the hidden status
    * @param {Boolean} in_bValue
    */
    setHidden: function( in_bValue )
    {
        this.m_objExtraInfo.Hidden = in_bValue;
    },
    
    /**
    * setShareOwner - sets the share owner.
    * @param {String} in_strShareOwner - new share owner.
    */
    setShareOwner: function( in_strShareOwner )
    {
        this.m_objExtraInfo.Share_Owner = in_strShareOwner;
    },
    
    deleteMe: function( in_bIgnored, in_bIgnored, in_bSkipDBDelete )
    {
        this.m_bDeleteMe = true;
        this.m_bSkipDBDelete = in_bSkipDBDelete;
    }
} );


