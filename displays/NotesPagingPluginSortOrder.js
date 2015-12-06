/**
* NotesPagingSortOrderPlugin object.
*/
function NotesPagingSortOrderPlugin()
{
    NotesPagingSortOrderPlugin.Base.constructor.apply( this );
};
UberObject.Base( NotesPagingSortOrderPlugin, Plugin );

Object.extend( NotesPagingSortOrderPlugin.prototype, {
    loadConfigParams: function()
    {
        NotesPagingSortOrderPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strDefaultSortOrder: { type: 'string', bRequired: true }
        } );
    },

    RegisterMessageHandlers: function()
    {
        NotesPagingSortOrderPlugin.Base.RegisterMessageHandlers.apply( this );

        this.RegisterListener( 'displaynotes', this.OnDisplayNotes, this );
        this.RegisterListener( 'configchange', this.OnConfigChange, this );
        this.RegisterListener( 'childinitialization', this.OnChildInitialization, this );
    },

    /**
    * childInitialization - Take care of child initializatiopn.
    */
    OnChildInitialization: function()
    {
        this.getPlugged().m_objConfig.sortorder = this.m_strDefaultSortOrder;
    },

    OnConfigChange: function( in_objConfig )
    {
        this.m_bEnabled = ! in_objConfig.noteids;
        
       // this._updateUI( this.m_bEnabled );           
    },
    
    OnDisplayNotes: function( in_objConfig )
    {
        var bEnabled = ( ( this.m_bEnabled ) && ( in_objConfig.noteids ) && ( in_objConfig.noteids.length > 1 )
                      && ! ( ( TypeCheck.Number( in_objConfig.totalcount ) ) 
                          && ( in_objConfig.totalcount <= 1 ) ) );

        this._updateUI( bEnabled );           
    },
   
    /**
    * _updateUI - Update the user interface
    * @param {bool} in_bEnabled - true enables the sort order menu, false disables it.
    */ 
    _updateUI: function( in_bEnabled )
    {
        var objPlugged = this.getPlugged();
        var strSortOrder = objPlugged.m_objConfig.sortorder;
        
        if( in_bEnabled )
        {
            objPlugged.$().addClassName( 'sortorderenabled' );
            objPlugged.setChildHTML( 'elementSortOrderText', _localStrings[ strSortOrder ] );
        } // end if-else
        else
        {
            objPlugged.$().removeClassName( 'sortorderenabled' );
        } // end if
        this._updateSortOrderClassname( strSortOrder );
    },
    
    /**
    * @private
    * _updateSortOrderClassname - updates the sort order class namee
    * @param {String} in_strNewSortOrder - the new sort order.
    */
    _updateSortOrderClassname: function( in_strNewSortOrder )
    {
        var objPlugged = this.getPlugged();

        // add the sort order class name so we can display different things based on 
        //  sort order.
        if( this.m_strSortOrder )
        {
            objPlugged.$().removeClassName( this.m_strSortOrder );
        } // end if
        objPlugged.$().addClassName( in_strNewSortOrder );
        this.m_strSortOrder = in_strNewSortOrder;
    }
} );
