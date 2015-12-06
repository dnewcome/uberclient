/*
* MtoNofXCountPlugin - A plugin for diplay a count in the form of:
*   Now displaying notes 1 through 10 of 20.
*/
function MtoNofXCountPlugin()
{
    MtoNofXCountPlugin.Base.constructor.apply( this );
}
UberObject.Base( MtoNofXCountPlugin, Plugin );

Object.extend( MtoNofXCountPlugin.prototype, {
    loadConfigParams: function()
    {
        MtoNofXCountPlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strFirstSelector: { type: 'string', bRequired: true },
            m_strLastSelector: { type: 'string', bRequired: true },
            m_strTotalSelector: { type: 'string', bRequired: true },
            m_strUpdateMessage: { type: 'string', bRequired: false, default_value: 'updatecounts' },
            type: { type: 'string', bRequired: false, default_value: 'MtoNofXCountPlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: this.m_strUpdateMessage, 
	            listener: this.OnUpdateCounts, context: this } );
	            
	    MtoNofXCountPlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },
    
    /**
    * OnUpdateCounts - update the counts
    * @param {Number} in_nFirst - First
    * @param {Number} in_nLast - Last
    * @param {Number} in_nTotal - Total
    */
    OnUpdateCounts: function( in_nFirst, in_nLast, in_nTotal )
    {
        Util.Assert( TypeCheck.Number( in_nFirst ) );
        Util.Assert( TypeCheck.Number( in_nLast ) );
        Util.Assert( TypeCheck.Number( in_nTotal ) );
        var objPlugged = this.getPlugged();
        
        objPlugged.$( this.m_strFirstSelector ).update( in_nFirst.toString() );
        objPlugged.$( this.m_strLastSelector ).update( in_nLast.toString() );
        objPlugged.$( this.m_strTotalSelector ).update( in_nTotal.toString() );
        
        var strFunction = ( in_nFirst == in_nLast ) ? 'removeClassName' : 'addClassName';
        objPlugged.$()[ strFunction ]( 'differentfirstlast' );
    }
} );
