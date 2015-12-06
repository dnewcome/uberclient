function NotesPagingMenuViewType()
{
    NotesPagingMenuViewType.Base.constructor.apply( this, arguments );
};
UberObject.Base( NotesPagingMenuViewType, ListMenuPlugin );

Object.extend( NotesPagingMenuViewType.prototype, {
    loadConfigParams: function()
    {
        NotesPagingMenuViewType.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [
                { string: _localStrings.LIST, callback: 'setview', arguments: [ 'list' ] },
                { string: _localStrings.EXPANDED, callback: 'setview', arguments: [ 'expanded' ] }
            ] },
            type: { type: 'string', bReqired: false, default_value: 'NotesPagingMenuViewType' }
        } );
    }
} );
