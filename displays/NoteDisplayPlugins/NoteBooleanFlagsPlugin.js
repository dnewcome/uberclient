function NoteBooleanFlagsPlugin( in_objNoteDisplay )
{
    return NoteBooleanFlagsPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( NoteBooleanFlagsPlugin, Plugin );

NoteBooleanFlagsPlugin.m_aobjNoteMessage = {
    notestar: [ true, 'starred', 'setstar' ],
    noteunstar: [ false, 'starred', 'setstar' ],
    notetrash: [ true, 'trash', 'settrash' ],
    noteuntrash: [ false, 'trash', 'settrash' ],
    notehidden: [ true, 'hidden', 'sethidden' ],
    noteunhidden: [ false, 'hidden', 'sethidden' ]
};

Object.extend( NoteBooleanFlagsPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'loaddataobject', this.OnLoadData, this )
            .RegisterListener( 'registermessagehandlers', this.OnRegisterMessageHandlers, this )
            .RegisterListener( 'setnotemodelidpre', this.OnSetNoteModelIDPre, this )
            .RegisterListener( 'setnotemodelidpost', this.OnSetNoteModelIDPost, this );

        NoteBooleanFlagsPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterMessageHandlers: function()
    {
        if( this.getPlugged().m_strNoteID )
        {
            this.OnSetNoteModelIDPost();
	    } // end if
    },
    
    OnSetNoteModelIDPre: function()
    {
        var strNoteID =  this.getPlugged().m_strNoteID;
        for( var strKey in NoteBooleanFlagsPlugin.m_aobjNoteMessage )
        {
            this.UnRegisterListener( strKey, strNoteID, this.processFlagChange );
        } // end for
    },

    OnSetNoteModelIDPost: function()
    {
        var strNoteID =  this.getPlugged().m_strNoteID;
        if( strNoteID )
        {
            for( var strKey in NoteBooleanFlagsPlugin.m_aobjNoteMessage )
            {
                var aItem = NoteBooleanFlagsPlugin.m_aobjNoteMessage[ strKey ];
                this.RegisterListenerObject( { message: strKey, from: strNoteID, 
                    listener: this.processFlagChange, arguments: aItem, context: this } );
            } // end for
        } // end if
    },

    OnLoadData: function( in_objNoteData )
    {
        Util.Assert( TypeCheck.Object( in_objNoteData ) );

        this.processFlagChange( in_objNoteData.Trash, 'trash', 'settrash' );
        this.processFlagChange( in_objNoteData.Star, 'starred', 'setstar' );
        this.processFlagChange( in_objNoteData.Hidden, 'hidden', 'sethidden' );
    },
    
    /**
    * processFlagChange - Process the change of a note flag - 
    *   if in_bAdd = true, adds the class name and raises the message in_strMessage.
    *   if in_bAdd = false, removes the class name and raises the message 'un' + in_strMessage.
    * @param {Boolean} in_bAdd - if true, add class name, if false, remove.
    * @param {String} in_strClassName - class name to add or remove.
    */
    processFlagChange: function( in_bAdd, in_strClassName, in_strMessage )
    {
        Util.Assert( TypeCheck.Boolean( in_bAdd ) );
        Util.Assert( TypeCheck.String( in_strClassName ) );
        
        var objPlugged = this.getPlugged();
        
        var strFunction = in_bAdd ? 'addClassName' : 'removeClassName';
        objPlugged.$()[ strFunction ]( in_strClassName );
        
        var strMessage = in_bAdd ? in_strMessage : 'un' + in_strMessage;
        objPlugged.Raise( strMessage );
    }
} );    
