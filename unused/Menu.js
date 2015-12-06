/**
* Class for context menus in the application
* @param in_objInsertionPoint (optional) - Optional attachment point.  
    If not given, will attach to the body
* @constructor
*/
function Menu()
{
    this.m_strItemTemplate = 'BasicMenuItem';
	this.m_objDeleteTimer = undefined;
	this.m_nHideDelayMS = 750;
	this.m_nNoEnterDelayMS = 2000;
    this.m_aobjDisplayCallbacks	= undefined;

    this.m_objCurrentSelection = undefined;
    
    Menu.Base.constructor.apply( this, arguments );
}
UberObject.Base( Menu, UberObject );

Object.extend( Menu.prototype, {
    init: function( in_objInsertionPoint )
    {
        this.m_aobjDisplayCallbacks	= [];

	    this.domElement = document.createElement("div");
    /*    this.domElement.tabIndex = "-1";*/
        
	    if( ! in_objInsertionPoint )
	    {
	        in_objInsertionPoint = document.getElementsByTagName('body')[0];
	    } // end if
    	
	    Util.Assert( in_objInsertionPoint );
    	
	    in_objInsertionPoint.appendChild( this.domElement );
        DOMElement.addClassName( this.domElement, 'mnu' );
        DOMElement.addClassName( this.domElement, 'popup' );
        DOMElement.hide( this.domElement );
        
        Menu.Base.init.apply( this, arguments );

	    this.type = 'menu';
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'onmousedown', this.domElement, this.OnMouseDown )
            .RegisterListener( 'onmouseover', this.domElement, this.OnMouseOver )
            .RegisterListener( 'onmouseout', this.domElement, this.delayHide )
            .RegisterListener( 'onkeydown', this.domElement, this.OnKeyDown );
        
        Menu.Base.RegisterMessageHandlers.apply( this );
    },

    OnMouseDown: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        var objElement = this.findElement( in_objEvent.target );

        this._handleMenuItemSelection( objElement );
        
        if( in_objEvent.cancelEvent )
        {
            in_objEvent.cancelEvent();
        } // end if
    },

    findElement: function( in_objHead )
    {
        var element = in_objHead;
        while ( element.parentNode 
            && ( !element._uberSelectInfo ) 
            && ( element != this.domElement ) )
        {
            element = element.parentNode;
        } // end while
        return element;
    },

    OnMouseOver: function( in_objEvent )
    {
        Util.Assert( in_objEvent );
        
        var objElement = this.findElement( in_objEvent.target );
        if( objElement._uberSelectInfo )
        {
            this.setCurrSelected( objElement );
        } // end if
        this.clearHideTimer();
    },

    OnKeyDown: function( in_objEvent )
    {

        /**
        * _findNext - helper function that helps us find the next menu item.
        * @param {object} in_objStartElement - HTMLElement to start the search from
        * @param {String} in_strTagType (optional) - Tag type to search for.  If none given, search any tag.
        * @param {String} in_strSelector - Should be an HTMLElement propery that allows us to walk the DOM tree.
        *       Examples - parentNode, previousSibling, nextSibling.
        * @param {bool} in_bInclusive (optional) - Whether to search the start element.
        */
        function findNext( in_objStartElement, in_strTagType, in_strSelector, in_bInclusive )
        {
            var objCurrSelection = ( false == in_bInclusive ) ? 
                in_objStartElement[ in_strSelector ] : in_objStartElement;
            var bFound = false;
            
            if( objCurrSelection )
            {        
                do
                {
                    bFound = ( false == DOMElement.hasClassName( objCurrSelection, 'hide' ) );
                    // check to see if we have the optional tag type.                
                    if( bFound && in_strTagType ) 
                    {
                        bFound = DOMElement.isTagType( objCurrSelection, in_strTagType );
                    } // end if
                } while( !bFound && ( objCurrSelection = objCurrSelection[ in_strSelector ] ) )
            } // end if
            return objCurrSelection;
        } // end findNext
        
        var objNewSelection = this.m_objCurrentSelection;
        this.clearHideTimer();
        
        if( in_objEvent.keyCode == KeyCode.DOWN_ARROW )
        {
            /* If there is no current selection, and we hit down, we want
             * the first item that does not have the hidden style
             */
            /* If there is a current selection, we want the next item that
             * does not have the hidden style.
             */
            if( ! this.m_objCurrentSelection && this.domElement.firstChild )
            {
                objNewSelection = this.domElement.firstChild;
                objNewSelection = findNext( objNewSelection, this.m_strMenuItemTag, "nextSibling", true );
            } // end if
            else if( this.m_objCurrentSelection && this.m_objCurrentSelection.nextSibling )
            {
                objNewSelection = findNext( objNewSelection, this.m_strMenuItemTag, "nextSibling", false );
            } // end if
            
            if( objNewSelection ) 
            {
                this.setCurrSelected( objNewSelection );
            } // end if    
        } // end if-else if
        else if( in_objEvent.keyCode == KeyCode.UP_ARROW )
        {
            if( ! this.m_objCurrentSelection && this.domElement.lastChild )
            {
                objNewSelection = this.domElement.lastChild;
                objNewSelection = findNext( objNewSelection, this.m_strMenuItemTag, "previousSibling", true );
            } // end if
            else if( this.m_objCurrentSelection && this.m_objCurrentSelection.previousSibling )
            {
                objNewSelection = findNext( objNewSelection, this.m_strMenuItemTag, "previousSibling", false );
            } // end if
            
            if( objNewSelection ) 
            {
                this.setCurrSelected( objNewSelection );
            } // end if    
        } // end if-else if
        else if( in_objEvent.keyCode == KeyCode.ENTER )
        {
            this._handleMenuItemSelection( this.m_objCurrentSelection );
        } // end if-else if
        else if( in_objEvent.keyCode == KeyCode.ESC )
        {
            this.hide();
        } // end if
        
        in_objEvent.cancelEvent();
    },

    unsetCurrSelected: function()
    {
        if( this.m_objCurrentSelection )
        {
            DOMElement.unhighlight( this.m_objCurrentSelection );
        } // end if
    },

    setCurrSelected: function ( in_objElement )
    {
        this.unsetCurrSelected();
        this.m_objCurrentSelection = in_objElement;
        DOMElement.highlight( in_objElement );
    },

    /**
    * addItem - Adds a menu item to the menu and defines the function to be called when the menu item 
    * is clicked.
    * @param {String} name string that will display as the menu item text
    * @param {Function} fn reference to a function object, or can be an anonymous function directly passed in.
    * @param {Function} fncDisplayCheck (optional) - Function to call to dynamically check if this item should be displayed.
    * @param {Object} objScope (optional) - Scope to run both fn and fncDisplayCheck.  If not provided, uses "me"
    */
    addItem: function( name, fn, fncDisplayCheck, objScope )
    {
	    var mnuItem = TemplateManager.GetTemplate( this.m_strItemTemplate );
	    this.m_strMenuItemTag = mnuItem.tagName;

        mnuItem.innerHTML = mnuItem.innerHTML.replace(/{TEXT}/g, name );
        mnuItem._uberSelectInfo = new FunctionContainer( fn, objScope );
        
        this._addItem( mnuItem, fncDisplayCheck, objScope );
    },

    /**
    * addSeparator - Adds a separator
    * @param fncDisplayCheck {function} (optional) - Function to call to dynamically check if this item should be displayed.
    * @param objScope {object} (optional) - Scope to run both fn and fncDisplayCheck.  If not provided, uses "me"
    */
    addSeparator: function( fncDisplayCheck, objScope )
    {
	    var mnuItem = document.createElement("hr");
        this._addItem( mnuItem, fncDisplayCheck, objScope );
    },

    /**
    * _addItem - Item added to add a generic item to the menu.
    */
    _addItem: function( mnuItem, fncDisplayCheck, objScope )
    {
        objScope = objScope || this;
	    /*mnuItem.tabIndex = "-1";*/

	    this.domElement.appendChild( mnuItem );
	    this.m_aobjChildren.add( UberObject.IDGenerator.getUniqueID(), mnuItem );
    	
	    /* set up the callback */
	    if( fncDisplayCheck )
	    {
	        var objCallback = new FunctionContainer( fncDisplayCheck, objScope, { element: mnuItem } );
	        this.m_aobjDisplayCallbacks[ this.m_aobjDisplayCallbacks.length ] = objCallback;
	    } // end if
    },

    /**
    * show - display the context menu
    * @in_objPosition {object} (optional) - Position where to place the menu
    *   If not positioned, puts in the default location
    * @in_objScope {object} (optional) - Optional scope to run all of the functions in.
    *   overrides any set previously.
    */
    show: function( in_objPosition, in_objScope )
    {	
        this.m_objScope = in_objScope;
        
        this.displayPoll();      // see which menu items we should display
    	
        this.unsetCurrSelected();           // Take away any highlights
	    this.m_objCurrentSelection = null;    // reset the highlight.
    	
	    DOMElement.show( this.domElement );

        /* Do this after we show it or else the clientWidth is 0 */
	    if( in_objPosition )
	    {
            var nPadding = BrowserInfo.mac ? 45 : 5;
	        var objViewPortSize = Util.getWindowSize();

		    this.domElement.style.top = in_objPosition.y;
    	    this.domElement.style.left = in_objPosition.x;

            // Reposition so we aren't off the end of the screen.    	
    	    if( ( in_objPosition.x + this.domElement.clientWidth ) > objViewPortSize.x )
    	    {
    	        this.domElement.style.left = objViewPortSize.x - this.domElement.clientWidth - nPadding;
    	    } // end if

    	    if( ( in_objPosition.y + this.domElement.clientHeight ) > objViewPortSize.y )
    	    {
    	        this.domElement.style.top = objViewPortSize.y - this.domElement.clientHeight - nPadding;
    	    } // end if
        } // end if
        
        var me=this;
        window.setTimeout( function(){ try{ me.domElement.focus(); }catch(e){}}, 0 );
	    this.m_objDeleteTimer = window.setTimeout( function() { me.hide(); }, this.m_nNoEnterDelayMS );
    },

    clearHideTimer: function()
    {
	    if( this.m_objDeleteTimer )
	    {
	        window.clearTimeout( this.m_objDeleteTimer );
	    } // end if
    },

    delayHide: function( in_objEvent )
    {
        if( true == DOMEvent.checkMouseoutContainer( in_objEvent ) )
        {
            this.unsetCurrSelected();
            var me=this;
            this.m_objDeleteTimer = window.setTimeout( function() { me.hide(); }, this.m_nHideDelayMS );
        } // end if
    },

    hide: function()
    {
        // check for the dom element becasue the menu container may 
        //  have been deleted if this was called from a timer.
        //  i.e. - delayHide or some external function.
        if( this.domElement )
        {
            // this should actually fix any subsequent calls to this from internal timers.
            this.clearHideTimer();
	        DOMElement.hide( this.domElement );
	    } // end if
    },
    
    /**
    * setMaxHeight - set the maximum height of the menu.
    * @param {Number} in_nHeight;
    */
    setMaxHeight: function( in_nHeight )
    {
        Util.Assert( TypeCheck.Number( in_nHeight ) );
        
        this.m_nHeight = in_nHeight;
        DOMElement.setMaxHeight( this.domElement, in_nHeight );
    },

    displayPoll: function()
    {
        // Loop through each function container, ask each function container its
        //  element should display or not.  If a menu item does not have a function container
        //  it is shown by default and this will never query that element.
        for(var nIndex = 0, objCurrCallback; objCurrCallback = this.m_aobjDisplayCallbacks[ nIndex ]; nIndex++ )
        {
            var objElement = objCurrCallback.m_vExtraInfo.element;      
            var strFunction = objCurrCallback.callFunctionScoped( this.m_objScope ) ? 'show' : 'hide';

            DOMElement[ strFunction ]( objElement );
        } // end for
    },

    teardown: function() 
    {
        // If we are tearing down, remove any of our timers
        this.clearHideTimer();
        
        var mnuItem;
        while( mnuItem = this.m_aobjChildren.removeByIndex( 0 ) )
        {        
            mnuItem._uberSelectInfo = null;
            mnuItem.parentNode.removeChild( mnuItem );
        } // end while
        
        this.domElement.parentNode.removeChild( this.domElement );
        this.domElement = null;   
        this.m_aobjDisplayCallbacks = null;
        Menu.Base.teardown.apply( this );
    },

    /**
    * _handleMenuItemSelection - Handle the menu item for a menu item element - if there is
    *   click info available
    * @param {Object} in_objMenuItem - Menu item to check.
    */
    _handleMenuItemSelection: function( in_objMenuItem )
    {
        Util.Assert( TypeCheck.Object( in_objMenuItem ) );
        var objItem = in_objMenuItem._uberSelectInfo;
        if( objItem )
        {   
            objItem.m_fncFunction.apply( objItem.m_objScope );
        } // end if
    }
} );