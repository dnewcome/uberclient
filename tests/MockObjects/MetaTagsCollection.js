function MetaTagsCollection()
{
    MetaTagsCollection.Base.constructor.apply( this, arguments );
};
UberObject.Base( MetaTagsCollection, UberObject );

Object.extend( MetaTagsCollection.prototype, {
    init: function()
    {
        this.m_aobjItems = {};
        MetaTagsCollection.Base.init.apply( this, arguments );
    },
    
    add: function( in_objModelInfo )
    {
        this.m_objModelInfo = in_objModelInfo;
    },
    
    getIDByName: function( in_strName )
    {
        return this.m_aobjItems[ in_strName ];
    },
    
    getByIndex: function( in_nIndex )
    {
        var vRetVal = undefined;
        var nIndex = 0;
        for( var strKey in this.m_aobjItems )
        {
            if( nIndex == in_nIndex )
            {
                vRetVal = this.m_aobjItems[ strKey ];
                break;
            } // end if
            nIndex++;
        } // end for
        return vRetVal;
    },
    
    getByID: function( in_strID )
    {
        function Child() {};
        Child.prototype.getName = function()
        {
            return 'name';
        };
        return new Child();
    }
} );

