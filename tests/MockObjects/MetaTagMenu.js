function MetaTagMenu()
{
};

Object.extend( MetaTagMenu.prototype, {
    loadConfigParams: function()
    {
        
    },

    extendConfigParams: function( in_objConfig )
    {
        for( var strKey in in_objConfig )
        {
            this[ strKey ] = in_objConfig[ strKey ].default_value;
        } // end for
    },
    
    requestRemove: function()
    {   /** This is run in the context of the meta tag! **/
        this.m_bRequestRemove = true;
    }
} );