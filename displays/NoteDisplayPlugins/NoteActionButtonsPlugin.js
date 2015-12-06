function NoteActionButtonsPlugin( in_objNoteDisplay )
{
    return NoteActionButtonsPlugin.Base.constructor.apply( this, arguments );
}
UberObject.Base( NoteActionButtonsPlugin, Plugin );

Object.extend( NoteActionButtonsPlugin.prototype, {
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'registerdomeventhandlers', this.OnRegisterDOMEventHandlers, this )
            .RegisterListener( 'setstar', this.OnSetStar )
            .RegisterListener( 'unsetstar', this.OnUnsetStar );
        
        NoteActionButtonsPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    OnRegisterDOMEventHandlers: function()
    {
        var objPlugged = this.getPlugged();
        objPlugged.attachButton( 'elementDelete', 'requestdelete' )
            .attachButton( 'elementStar', 'requeststar' )
            .attachButton( 'elementMinimize', 'requestminimize' )
            .attachButton( 'elementMaximize', 'requestmaximize' )
            .attachButton( 'elementClose', 'requestclose' )
            .attachButton( 'elementCategories', 'requestnotetags' )
            .attachButton( 'elementFolders', 'requestnotefolders' )
            .attachButton( 'elementShare', 'requestnoteshare' );
    },

    /**
    * displays a full star
    */
    OnSetStar: function()
    {
        DOMElement.setTooltip( this.$( 'elementStar' ), 
            _localStrings.UNMARK_IMPORTANT.toLowerCase() );
    },

    /**
    * displays an empty star
    */
    OnUnsetStar: function()
    {
        DOMElement.setTooltip( this.$( 'elementStar' ), 
            _localStrings.MARK_IMPORTANT.toLowerCase() );
    }
} );    
