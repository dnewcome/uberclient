
/**
* Scrollable - A Scrollable where the content size can 
*   be larger than the maximum size and the extra
*   must be hidden.  Content is movable meaning
*   different parts of content can be displayed.
*/
function Scrollable()
{
    Display.apply( this );
}
Scrollable.prototype = new Display;

Scrollable.eDirection = new Enum(
    "UP", 
    "DOWN", 
    "LEFT", 
    "RIGHT"
);

Object.extend( Scrollable.prototype, {
    loadConfigParams: function()
    {
        var objConfigParams = {
            m_nXStepSize: { type: 'number', bRequired: false, default_value: '0' },    /* Can be +,0,- in pixels */
            m_nYStepSize: { type: 'number', bRequired: false, default_value: '0' },   /* Can be +,0,- in pixels */
            m_nXOverscrollLimit: { type: 'number', bRequired: false, default_value: 0 },   /* Can be +,0,- in pixels */
            m_nYOverscrollLimit: { type: 'number', bRequired: false, default_value: 0 },   /* Can be +,0,- in pixels */
            m_nMaxHeightViewport: { type: 'number', bRequired: false, default_value: 0 },  /* 0 means make it as big as it wants to be */
            m_bResizeViewport: { type: 'boolean', bRequired: false, default_value: false },
            type: { type: 'string', bRequired: false, default_value: 'Scrollable' }
        };

        Display.prototype.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, objConfigParams, true );
    },

    /**
    * findDomElements - populate local variables for individual DOM elements
    */
    findDomElements: function()
    {
        // No behaviors
        this.attachButton( 'elementUpButton', this.OnMouseDown, this, true, undefined, 
            [ Scrollable.eDirection.UP ], 'mousedown' );
        this.attachButton( 'elementDownButton', this.OnMouseDown, this, true, undefined, 
            [ Scrollable.eDirection.DOWN ], 'mousedown' );
        this.attachButton( 'elementLeftButton', this.OnMouseDown, this, true, undefined, 
            [ Scrollable.eDirection.LEFT ], 'mousedown' );
        this.attachButton( 'elementRightButton', this.OnMouseDown, this, true, undefined, 
            [ Scrollable.eDirection.RIGHT ], 'mousedown' );

        Util.Assert( TypeCheck.Defined( this.$( 'elementContent' ) ) );
        
        Display.prototype.findDomElements.apply( this );
    },
    
    init: function( in_objConfig )
    {
        // apply our parent constructor which does the initial setup
        bRetVal = Display.prototype.initWithConfigObject.apply( this, [ in_objConfig ] );
        
        // Do initial sizing.
        if( this.m_nMaxHeightViewport < 0 )
        {
            this.m_nMaxHeightViewport = 0;
        } // end if
        // Do the sizeing and initial hiding/showing of buttons
        this.updateButtonVisibility();
        
        return bRetVal;
    },
    
    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'setmaxheight', Messages.all_publishers_id, this.setMaxHeight );
        this.RegisterListener( 'forceresize', Messages.all_publishers_id, this.OnContentResize );
        this.RegisterListener( 'scrolltotop', Messages.all_publishers_id, this.OnScrollToEnd, [ Scrollable.eDirection.UP ] );
        this.RegisterListener( 'scrolltobottom', Messages.all_publishers_id, this.OnScrollToEnd, [ Scrollable.eDirection.DOWN ] );
        this.RegisterListener( 'scrolltoleft', Messages.all_publishers_id, this.OnScrollToEnd, [ Scrollable.eDirection.LEFT ] );
        this.RegisterListener( 'scrolltoright', Messages.all_publishers_id, this.OnScrollToEnd, [ Scrollable.eDirection.RIGHT ] );
    },
    
    RegisterDomEventHandlers: function()
    {
        var objViewport = this.$( 'elementViewport' );
        
        if( this.m_bResizeViewport && objViewport )
        {
            var objContent = this.$( 'elementContent' );
            this.RegisterListener( 'resize', objContent, this.OnContentResize );
        } // end if
        
        // If we are holding the button down, we want to stop scrolling on either a mouse up
        //  or any mouse out.
        this.RegisterListener( 'mouseup', this.$(), this.OnMouseUpOut );
        this.RegisterListener( 'mouseout', this.$(), this.OnMouseUpOut );
        
        Display.prototype.RegisterDomEventHandlers.apply( this );
    },
    
    /**
    * setMaxHeight - set the maximum height of the viewport
    * @param {Number} in_nMaxHeight - maximum height
    */
    setMaxHeight: function( in_nMaxHeight )
    {
        Util.Assert( TypeCheck.Number( in_nMaxHeight ) );
        // force 0 to be the smallest height        
        in_nMaxHeight = in_nMaxHeight >= 0 ? in_nMaxHeight : 0;
        
        if( in_nMaxHeight != this.m_nMaxHeightViewport )
        {
            this.m_nMaxHeightViewport = in_nMaxHeight;
            this.OnContentResize();
        } // end if
    },
    
    /**
    * OnContentResize - resize the viewport if the content got resized.
    */
    OnContentResize: function( in_objEvent )
    {
        if( true == this.m_bResizeViewport )
        {
            var objViewport = this.$( 'elementViewport' );
            var objContent = this.$( 'elementContent' );

            // Set the viewport size to the smaller of the content height or max height
            var objContentSize = Element.getDimensions( objContent );
            var nHeight = Math.min( objContentSize.height, this.m_nMaxHeightViewport );
            objViewport.style.height = nHeight.toString() + 'px';
        
            // Show or hide button containers
            var strFunc = objContentSize.height <= this.m_nMaxHeightViewport ? 'hide' : 'show';
            DOMElement[ strFunc ]( this.$( 'navYButtons' ) );
            
            // This bit re-adjusts the top so that if we are scrolled past the new bottom
            //  after shrinking, we readjust ourselves.
            var nTop = parseInt( objContent.style[ 'top' ], 10 ) || 0;
            var nNewTop = this._adjustScrollPos( nTop, this.m_nYOverscrollLimit, 'y' );
            if( nTop != nNewTop )
            { 
                objContent.style[ 'top' ] = nNewTop.toString() + 'px';
            } // end if
        } // end if
        this.updateButtonVisibility();
    },
    
    /**
    * applyStep - Do some scrolling Scroll by one step in any direction.
    * @param {String} in_eDirection - enumeration key from Scrollable.eDirection
    */
    applyStep: function( in_eDirection )
    {
        Util.Assert( TypeCheck.EnumKey( in_eDirection, Scrollable.eDirection ) );
        
        var objDiff = this._getStepInfo( in_eDirection );
        return this.applyDiff( objDiff );
    }, // end applyStep

    /**
    * applyDiff - Do some scrolling.  Apply a diff on the content.
    * @param {Object} in_objDiff - enumeration key from Scrollable.eDirection
    * @returns {bool} - returns true if we are at an end.
    */
    applyDiff: function( in_objDiff )
    { 
        bRetVal = false;
        if( in_objDiff.diff )
        {   
            var objContentElement = this.$( 'elementContent' );
            var nScrollPos = ( parseInt( objContentElement.style[ in_objDiff.field ], 10 ) || 0 ) + in_objDiff.diff;
            
            var nAdjustedScrollPos = this._adjustScrollPos( nScrollPos, in_objDiff.overscroll, in_objDiff.diff_axis );
            
            objContentElement.style[ in_objDiff.field ] = nAdjustedScrollPos.toString() + 'px';

            bRetVal = this.updateButtonVisibility();
        } // end if
        
        return bRetVal;
    },
    
    /**
    * _adjustScrollPos - Perform an override on the diff to make sure we are still in bounds.
    * @in_nValue {Number} - New requested position.
    * @in_nOverscroll {Number} - overscroll in the direction 
    * @in_strAxis {String} - which axis to look at for the width of the items.
    */
    _adjustScrollPos: function( in_nValue, in_nOverscroll, in_strAxis )
    {
        var nRetVal = in_nValue;
        var objViewportElement = this.$( 'elementViewport' );
        
        if( objViewportElement )
        {
            var objContentElement = this.$( 'elementContent' );
            this.m_objSizeDelta = DOMElement.sizeDifference( objContentElement, objViewportElement );
            // takes care of scrolling down - we only want to be as far as the "overscroll" away from the top.
            nRetVal = Math.min( nRetVal, in_nOverscroll );
            
            // takes care of scrolling up - we are in essense finding the bottom of the element and how far
            //  away from the buffer away from the bottom of the viewport.
            nRetVal = Math.max( nRetVal, -( in_nOverscroll + this.m_objSizeDelta[ in_strAxis ] ) );
        } // end if

        return nRetVal;
    },

    /**
    * _getStepInfo - Get the step info for a particular direction.
    * @param {String} in_eDirection - enumeration key from Scrollable.eDirection
    */    
    _getStepInfo: function( in_eDirection )
    {
        var objRetVal = {};
        switch( in_eDirection )
        {   
            case Scrollable.eDirection.DOWN:
                objRetVal = {
                    field: 'top', 
                    diff: -this.m_nYStepSize, 
                    overscroll: this.m_nYOverscrollLimit, 
                    diff_axis: 'y'
                };
                break;
            case Scrollable.eDirection.UP:
                objRetVal = {
                    field: 'top', 
                    diff: this.m_nYStepSize, 
                    overscroll: this.m_nYOverscrollLimit, 
                    diff_axis: 'y'
                };
                break;
            case Scrollable.eDirection.RIGHT:
                objRetVal = {
                    field: 'left', 
                    diff: -this.m_nXStepSize, 
                    overscroll: this.m_nXOverscrollLimit, 
                    diff_axis: 'x'
                };
                break;
            case Scrollable.eDirection.LEFT:
                objRetVal = {
                    field: 'left', 
                    diff: this.m_nXStepSize, 
                    overscroll: this.m_nXOverscrollLimit, 
                    diff_axis: 'x'
                };
                break;
        } // end switch
        
        return objRetVal;
     }, // end _getStepInfos
     
     /**
     * updateButtonVisibility - update the button visibility.
     */
     updateButtonVisibility: function()
     {
        var objViewportElement = this.$( 'elementViewport' );
        var bRetVal = false;
        if( objViewportElement )
        {
            var objContentElement = this.$( 'elementContent' );
            // We may have gotten this before - so check for it.
            var objSizeDelta = DOMElement.sizeDifference( objContentElement, objViewportElement );

            // Y Axis
            var nYScrollPos = ( parseInt( objContentElement.style[ 'top' ], 10 ) || 0 );
            var bVisibleUpButton = nYScrollPos < this.m_nYOverscrollLimit;
            var bVisibleDownButton = -nYScrollPos < ( objSizeDelta.y + this.m_nYOverscrollLimit );
            this.showChild( 'elementUpButton', bVisibleUpButton );
            this.showChild( 'elementDownButton', bVisibleDownButton );
            bRetVal = bVisibleDownButton && bVisibleUpButton;
            
            // X Axis
            var nXScrollPos = ( parseInt( objContentElement.style[ 'left' ], 10 ) || 0 );
            var bVisibleLeftButton = nXScrollPos < this.m_nXOverscrollLimit;
            var bVisibleRightButton = -nXScrollPos < ( objSizeDelta.x + this.m_nXOverscrollLimit );
            this.showChild( 'elementLeftButton', bVisibleLeftButton );
            this.showChild( 'elementRightButton', bVisibleRightButton );
        } // end if
        return bRetVal;
     }, // end updateButtonVisibility

     /**
     * OnScrollToEnd - scroll to one of the ends.
     * @param {String} in_eDirection - enumeration key from Scrollable.eDirection
     */
     OnScrollToEnd: function( in_eDirection )
     {
        Util.Assert( TypeCheck.EnumKey( in_eDirection, Scrollable.eDirection ) );
        
        var bRetVal = true;
        do { // nothing to do
        } while ( this.applyStep( in_eDirection ) );
        
        return bRetVal;
     }, // end OnScrollToEnd

    /**
    * applyStep - Do some scrolling Scroll by one step in any direction.
    * @param {String} in_eDirection - enumeration key from Scrollable.eDirection
    */
    OnMouseDown: function( in_eDirection )
    {   // Do it once, then do it subsequent times.  
        // We put the apply step inside of a timer because
        // if not, IE takes too long doing the work and the mouseup doesn't get
        // fired right.
        var me=this;
        setTimeout( function() { me.applyStep( in_eDirection ); }, 0 );
        this.m_objScrollTimer = setInterval( function() { me.applyStep( in_eDirection ); }, 200 );
    }, // end applyStep
    
    OnMouseUpOut: function()
    {
        if( this.m_objScrollTimer )
        {
            clearInterval( this.m_objScrollTimer );
        } // end if
    },
    
    /**
    * getContentElement - get the content element to attach other things to.
    * @returns {Object} - DOM Element that holds the content
    */
    getContentElement: function()
    {
        var objRetVal = this.$( 'elementContent' );
        return objRetval;
    }

});

