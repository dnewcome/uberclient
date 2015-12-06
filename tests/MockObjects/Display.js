function Display( in_objElement ) {
    this.m_bShown;
	this.m_objContainer = in_objElement;
    Display.Base.constructor.apply( this, arguments );
};
UberObject.Base( Display, UberObject );

Object.extend( Display.prototype, {
    $: function( in_strSelector )
    {
		// selector, then container, then the outer container.
		var objElement = in_strSelector ? fireunit.id( in_strSelector ) : 
			this.m_objContainer ? this.m_objContainer : fireunit.id( 'container' );
        return objElement;
    },
    // Show and hide are sometimes called in the context of the containing element
    show: function(){ this.m_bShown = true; if( 'undefined' != typeof( this.className ) ) this.show(); },
    hide: function(){ this.m_bShown = false; if( 'undefined' != typeof( this.className ) ) this.hide(); },
    setDomContainer: function( in_objDomContainer ) {
        this.m_objDomContainer = in_objDomContainer;
    },
    
    setChildHTML: function( in_strSearchClassName, in_strHTML )
    {
        this.$( in_strSearchClassName ).innerHTML = in_strHTML;
    }
} );



function DisplayAltConfig( )
{
    DisplayAltConfig.Base.constructor.apply( this );
};
UberObject.Base( DisplayAltConfig, Display );

Object.extend( DisplayAltConfig.prototype, {
    init: function( in_objConfig )
    {
        this.initWithConfigObject( in_objConfig );
        return this;
    }
} );
