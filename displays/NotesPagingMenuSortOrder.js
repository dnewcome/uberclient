
function NotesPagingMenuSortOrder()
{
    NotesPagingMenuSortOrder.Base.constructor.apply( this, arguments );
};
UberObject.Base( NotesPagingMenuSortOrder, ListMenuPlugin );

Object.extend( NotesPagingMenuSortOrder.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_aobjMenuItems: { type: 'object', bRequired: false, default_value: [] },
            type: { type: 'string', bReqired: false, default_value: 'NotesPagingMenuSortOrder' }
        };

        for( var strOrderItem in Notes.eNoteSortOrder )
        {
            var objMenuItem = {
                string: _localStrings[ strOrderItem ],
                callback: 'requestdisplaynotes',
                arguments: [ { sortorder: strOrderItem } ]
            };
            
            objConfigParams.m_aobjMenuItems.default_value.push( objMenuItem );
        } // end for
        
        NotesPagingMenuSortOrder.Base.loadConfigParams.apply( this );
        Object.extend( this.m_objConfigParams, objConfigParams );
    }
} );
