 

/**
* NoteText: the editor component of the notes
*/
function NoteText()
{
	this.m_cTextAreaResizeBuffer = 15;	// Number of pixels to "buffer" at the bottom of a text area
	
    this.m_bHeadingCtlKeyTyped = false;
    this.m_bRangeIsLink = false;
    this.m_bRangeIsLinkable = false;
    this.m_bTextSelected = false;
    this.m_bRangeIsTagable = false;
    this.m_bActive = false;

    this.m_bReadyForProcessing = false;
    this.m_aReadyQueue = [];
    
    this.m_objPopup = undefined;
    this.m_objPopupElement = undefined;
    
    var strStylesheet = Util.GetFullHref( 'stylesheets/NoteText.css' );
    this.m_strWrapperHTML = '<html><head><link rel="stylesheet" type="text/css" href="' 
        + strStylesheet + '" id="style"/><title></title></head><body >'
        + '<br \></body></html>';

    NoteText.Base.constructor.apply( this );
};
UberObject.Base( NoteText, Display );

NoteText.eEventList = new Enum( 'DOMLOAD', 'DOMREADY' );

NoteText.prototype.loadConfigParams = function()
{
    var ConfigParams = {
        m_strTemplate: { type: 'string', bRequired: false },        // We don't NEED a template for this
        m_objParentElement: { type: 'object', bRequired: true },
        m_bEditable: { type: 'boolean', bRequired: false, default_value: true },
        m_objPopupElement: { type: 'object', bRequired: false },
        m_abProvides: { type: 'object', bReqired: false, default_value: 
            { nativeundo: ( false === BrowserInfo.ie ) } }
    };

    NoteText.Base.loadConfigParams.apply( this );
    Util.union( this.m_objConfigParams, ConfigParams, true );
};

NoteText.prototype.init = function( in_objConfig )
{
    Util.Assert( in_objConfig );
    return this.initWithConfigObject( in_objConfig );
};

NoteText._localStrings = {
    INSERT_LIST_ITEM: 'Insert item',
    SEARCH_HEADING: 'Please enter the search word',
    URL_NAME_HEADING: 'Please enter the site name',
    URL_HEADING: 'Please enter the URL',
    IMG_URL: 'Please enter the image URL'
};

NoteText.NoteTextEC = new Enum( 
    'WINDOW_NOT_READY', 
    'DOCUMENT_NOT_READY',
    'COMMAND_NOT_SUPPORTED',
    'COMMAND_FAILURE'
);

NoteText.placeholderElementID = '_uber_placeholder';

NoteText.prototype.buildDom = function() 
{
    if( this.m_objDomContainer )
    {
        this.teardownDom();
    } // end if

	this.m_objDomContainer = document.createElement( 'iframe' );
	this.m_objDomContainer.className = "noteText";
	/* Do this so we do not have to load another page from the server */
    var strSource = 'javascript:""';
    if( true === BrowserInfo.gecko )
    {
        strSource = 'data:text/html;charset=utf-8,' + encodeURIComponent( this.m_strWrapperHTML );    
    } // end if
    if( true == Config.bUseBlankHTM )
    {
        strSource = 'blank.htm';
    } // end if
    this.m_objDomContainer.src = strSource;
    
	this.m_objDomContainer.frameBorder = "0"; // only works with IE AFAIK
	this.m_objDomContainer.allowtransparency = true;	
};

NoteText.prototype.childInitialization = function()
{
    this.m_objPopup = new TextInputPopup();    
    this.m_objPopup.init( undefined, 'EditorTextInputPopup', 'TextInput20x200', TextInput.eFocusBehavoir.FB_SELECT );
    this.attachDisplay( this.m_objPopup.m_strMessagingID, this.m_objPopup );
    
    NoteText.Base.childInitialization( this );
};

NoteText.prototype.domAttached = function()
{
    if( false == BrowserInfo.gecko )
    {
        this._bodyInitialWrite();
    } // end if
    this._setDesignMode();
};


/**
* Put the note body text into the note
* Note that this has to be done after adding to the dom 
* @param  {String} in_strXML - XML to set.
*/	
NoteText.prototype.setXML = function( in_strXML )
{    
    var me=this;
    // Do this so that we have a body
    in_strXML = in_strXML || '<br />';

    this.m_bReadyForProcessing = false;
    this.m_aReadyQueue = [];

    if( this.m_objRegisteredDocument )
    {
        // If we are here it means the handlers have been cleared/Document has
        // has been reinitialized, but as well there are old handlers registered.
        // These MUST be detached or else we are going to run into some memory
        // issues.
        this.UnRegisterDomEventHandlers();
    } // end if
  
    if( true == this.m_bActive )
    {
        var fncTest2 = function() { 
            return me._bodySetText( in_strXML );
        };

        var fncAction2 = function() {
            me._checkDOMLoaded();
        };
        me._semaphore( fncTest2, fncAction2 ); 
    } // end if
};

NoteText.prototype._bodyInitialWrite = function()
{
    var objDocument = this.getDocument();
    objDocument.open();
    objDocument.write( this.m_strWrapperHTML );
    objDocument.close();
    return true;
};

/**
* _bodySetText - internal helper function that should not be called directly.  
*  it performs the actual setting of the body text.  Use setXML instead.  
* @param {String} in_strBodyText  - body text.
*/
NoteText.prototype._bodySetText = function( in_strBodyText )
{
    var bRetVal = false;
    try
    {   // We use the trailing BR as a marker to let us know the document has loaded.  We
        // then remove this BR after we find it.
        this.getDocument().body.innerHTML = ( in_strBodyText + '<br id="_uberDocumentLoaded" />' );
        this.m_bUpdateSize = true;
        bRetVal = true;
    } // end try
    catch ( e ) {
    } // end catch
    
    return bRetVal;
};

/**
* getXML - get the XML (HTML) of the document body.
*/
NoteText.prototype.getXML = function()
{
    Util.Assert( this.getDocument() && this.getDocument().body );
    
    return this.getDocument().body.innerHTML;
};

NoteText.prototype._initEditor = function()
{
    // We have to reset designmode for FF3 - maybe.
    this._setDesignMode();

    this.RegisterDomEventHandlers();
    
    // Really IE only, but it is worth a try.
    this.execCommand( 'BackgroundImageCache', true );

    // this makes sure we are using markup that IE can use if we edit in
    //  mozilla.
    if( true == BrowserInfo.gecko )
    {
        this._initEditorMozilla();
    } // end if
    this._resizeTextArea( undefined, true );    // Override the buffer step for the intial sizing.
};

NoteText.prototype._processReadyQueue = function()
{
    for( var nIndex = 0, objFunction; objFunction = this.m_aReadyQueue[ nIndex ]; nIndex++ )
    {
        objFunction.callFunction( undefined, true );
    } // end for
};

NoteText.prototype._checkDOMLoaded = function() 
{
    var me = this;

    var objFuncCont = new FunctionContainer( this._initEditor, this );
    this.m_aReadyQueue[ this.m_aReadyQueue.length ] = objFuncCont;
    
    var fncTest = function() {
        var bRetVal = false;
        var objNode = me.getDocument().getElementById( '_uberDocumentLoaded' );
        
        if( objNode )
        {
            objNode.parentNode.removeChild( objNode );
            me.m_bReadyForProcessing = bRetVal = true;
        } // end if
        
        return bRetVal;
    };
    
    var fncAction = function() {
    
        me._processReadyQueue();
    };

    setTimeout( function() { me._semaphore( fncTest, fncAction ); }, 0 );
};

/**
* _semaphore - a ghettotastic semaphore to wait on certain events to happen.
* @param {Function} in_fncTest - Function - test function.  
*       (success) A non-0, non-null, non-undefined return value calls the action function.
*       (failure) A 0, null, or undefined means this function will be called periodically until
*       a failure signifies this function will be repeatedly called until there is
*           a success.
* @param {Function} in_fncAction (optional) - function to call on in_fncTest success.
* @param {Number} in_nDelay (optional) - Initial delay between intervals.
*/
NoteText.prototype._semaphore = function( in_fncTest, in_fncAction, in_nDelay )
{
    if (typeof in_nDelay == 'undefined') { in_nDelay = 0; }
    if ( in_fncTest() ) {
        if( in_fncAction )
        {
            in_fncAction();
        } // end if
    } else {
        var me=this;
        if (10 > in_nDelay) 
        { 
            ++in_nDelay; 
        } // end if
        else if( in_nDelay < 1000 )
        { 
            in_nDelay += 10; 
        } // end if-else
        // XXX Figure out a way to do this with so many closures - 
        //  if we have to go repeat this many times, this is going
        //  to create a lot of closures that is going to suck up memory.
        
        setTimeout( function() { 
            me._semaphore( in_fncTest, in_fncAction, in_nDelay );
        }, in_nDelay );
    }
};


NoteText.prototype.blur = function( in_objEvent )
{   
	if( this.getContentWindow() )
	{
	    this.getContentWindow().blur();
	} // end if
};

NoteText.prototype.cancelFocus = function( in_objEvent )
{   
    this.m_bRange = undefined;
    this.m_bPerformFocus = false;
    if( this.m_objFocusTimer ) 
    {
        clearTimeout( this.m_objFocusTimer );
        this.m_objFocusTimer = null;
    } // end if
};

/**
* focus - Focus the note text.
* @param {Object} in_objEvent (optional) - event causing focus
*/
NoteText.prototype.focus = function( in_objEvent )
{   // Sometimes focus is called from outside of a 
    //  event handler, so we have to check for input
	if ( false == this.m_bEditable )
	{
	    in_objEvent && in_objEvent.cancelEvent();
		return;
	} // end if

    in_objEvent && in_objEvent.preventDefault();
    this._focus();
};

NoteText.prototype._focus = function()
{
    var me=this;
    
    var objBookmark = undefined;
    
    if( ( true == BrowserInfo.ie ) && ( TypeCheck.Object( this.m_objRange ) ) )
    {   // Put the cursor back where it was in IE.
        try
        {   // sometimes our range is no longer valid (like when we were in a note before but
            //  have just re-come into the note), but we don't really know this when we try.
            objBookmark = this.m_objRange.getBookmark();
        } // end try
        catch( e )
        {   // default to no repositioning the cursor
            objBookmark = undefined;
        } // end try-catch
    } // end if
    
    var fncFocusFunction = function()
    {
	    if( me.getContentWindow() )
	    {
	        this.m_objFocusTimer = null;
	        if( true == BrowserInfo.gecko )
	        {   // This auto-focuses the cursor by placing it at the end of the document.
	            // We only want to move the selection if we lost it in the first place.  If we have
	            //  a range from before, that means we didn't lose the selection.
                var objSelection = me.getSelection();
                var objRange = me.getRange();

                // We are using objRange as a bookmark of sorts.  If we have a range, that
                //  means the note is new.  
                if( ( TypeCheck.Object( objSelection ) )
                 && ( TypeCheck.Undefined( objRange ) ) )
                {
                    // New note scenario
                    objSelection.removeAllRanges();
                    var objReferenceNode = me.getDocument().getElementsByTagName( 'body' ).item(0);
                    objSelection.selectAllChildren( objReferenceNode );
                    objSelection.collapseToEnd();
                } // end if
	        } // end if
	        else if( ( true == BrowserInfo.ie ) && ( 'undefined' != typeof( objBookmark ) ) )
	        {   // Put the cursor back where it was in IE.
	            var objRange = me.getDocument().body.createTextRange();
	            objRange.moveToBookmark( objBookmark );
	            objRange.select();
	        } // end if
	        
            me.getContentWindow().focus();
        } // end if
    }; // end function
    
    this.m_objFocusTimer = setTimeout( fncFocusFunction, 500 );
};

/**
* SetEditable - Turns design mode on to make note editable
* @param {bool} in_bEditable  - if true, set to on.
*/
NoteText.prototype.SetEditable = function( in_bEditable )
{
    this.m_bEditable = in_bEditable;
};

NoteText.prototype._setDesignMode = function()
{
    try
    {
        var objDocument = this.getDocument();
        if( objDocument )
        {   // We can't reset the designMode for FF2 series because it loses the document.  BOOO!
            var strDesignMode = objDocument.designMode;
            if( strDesignMode.toLowerCase() != 'on' )
            {
                objDocument.designMode = 'On';
            } // end if
	    } // end if
	    else
	    {
            SysError.raiseError( 'NoteText.prototype._setDesignMode', ErrorLevels.eErrorType.ERROR, 
                ErrorLevels.eErrorLevel.HIGH, 'Document not ready to set to design mode' );
	    } // end if-else
    } catch ( e ) {
        SysError.raiseError( 'NoteText.prototype._setDesignMode', ErrorLevels.eErrorType.EXCEPTION, 
            ErrorLevels.eErrorLevel.HIGH, e.description || e.message || '' );
    } // end catch
};

/**
* _resizeTextArea - Resizes the note text area as you type.
*   We do this because on a timer because in _doResizeTextArea, finding 
*   the clientHeight and the Viewport Size are super expensive operations.
*   On slow systems, it becomes unusable.  So we set a timer, wait the specified
*   amount of time, then call the resize.  If we are continuously typing keys,
*   this will keep us from resizing all the time, it will resize 1/2 second 
*   after the last key is typed.
* @param {Number} in_nInitialTimeout (optional) timeout to wait before resizing, 
*       if not given, waits half a second.
*/
NoteText.prototype._resizeTextArea = function( in_nInitialTimeout, in_bOverrideStep )
{
    var nTimeout = Util.AssignIfDefined( in_nInitialTimeout, 500 );
    var me=this;
    
    if( this.m_objTextResizeTimer )
    {   // clear the old one, wait for the new.
        clearTimeout( this.m_objTextResizeTimer );
    } // end if
    
    this.m_objTextResizeTimer = setTimeout( function() { me._doResizeTextArea( in_bOverrideStep ); }, nTimeout );
};

NoteText.prototype._doResizeTextArea = function( in_bOverrideStep )
{	
	var cBuffer = this.m_cTextAreaResizeBuffer;
	var cMaxSize = Math.min( document.body.clientHeight - 150, 500 );   // make this a config option!
    var cStepSize = 45;
    
    var objDocument = this.getDocument();
    var objViewportSize = Util.getViewportSize( objDocument );
    var nScrollHeight = objViewportSize.y + cBuffer;
    var objElement = this.$();
    
    if( objElement )
    {
        var bDoResize = false;
	    if( true == BrowserInfo.gecko )
	    {
	        nScrollHeight += 10;
	    } // end if
	    
	    // set the height up to a certain amount.
	   nScrollHeight = Math.min( nScrollHeight, cMaxSize );
        
        // Find the original element size
        var nElementSize = parseInt( objElement.style.height, 10 ) || 0;
        
        if( !in_bOverrideStep )
        {   
            var nBufferAndScroll = nScrollHeight + cStepSize;
            
            // check if we are out of the buffer range.
            bDoResize = ( ( nScrollHeight > nElementSize ) 
                || ( ( nBufferAndScroll + 5 ) < nElementSize ) );
                
            if( bDoResize && ( nScrollHeight > nElementSize ) )
            {   // bigger - grow up to our max size
                nScrollHeight = Math.min( nBufferAndScroll, cMaxSize );
            } // end if
        } // end if
        else if ( nScrollHeight != nElementSize )
        {
            bDoResize = true;
        } // end if
        
        if( bDoResize )
        {
            var strScrollHeight = nScrollHeight.toString() + 'px';
            objElement.style.height = strScrollHeight;        
        } // end if
    } // end if
};

/**
* _initEditorMozilla - makes sure Mozilla uses tags instead of CSS for styling.
*/
NoteText.prototype._initEditorMozilla = function()
{
    // We are doing this directly because apparently mozilla does not
    // know that either of these commands are supported when you do a checksupported
    // call
    var bStyled = false;
    try {   // NEW style
            this.getDocument().execCommand( 'styleWithCSS', false, false );
            bStyled = true;
    } catch ( error ) {} // end try-catch
    //
//    if( false == bStyled )
    {   // OLD style
        try {
            this.getDocument().execCommand( 'useCSS', false, true );
        } catch ( error ) {}// end try-catch
    } // end if
    
    try {   // Even if we are inside of a paragraph, we want a BR instead of a P
            this.getDocument().execCommand( 'insertbronreturn', false, true );
            bStyled = true;
    } catch ( error ) {
    } // end try-catch
    
};

NoteText.prototype.RegisterMessageHandlers = function()
{
    /** These are NOT on the DOM elements because these are not DOM generated for this case.
    */
	this.RegisterListener( 'onlosefocus', Messages.all_publishers_id, this._updateTextSelectionVariables );
	this.RegisterListener( 'onfocus', Messages.all_publishers_id, this.focus );

	this.RegisterListener( 'commandIndent', Messages.all_publishers_id, this.textIndent );
	this.RegisterListener( 'commandOutdent', Messages.all_publishers_id, this.textOutdent );
	this.RegisterListener( 'commandLink', Messages.all_publishers_id, this.textLink );
	this.RegisterListener( 'commandRemoveLink', Messages.all_publishers_id, this.textRemoveLink );
	this.RegisterListener( 'commandCreateTag', Messages.all_publishers_id, this.textTag );
	this.RegisterListener( 'commandInsertBullets', Messages.all_publishers_id, this.textInsertBullets );
	this.RegisterListener( 'commandInsertOutline', Messages.all_publishers_id, this.textInsertOutline );
	this.RegisterListener( 'commandFontSize', Messages.all_publishers_id, this.textFontSize );
	this.RegisterListener( 'commandFontBackground', Messages.all_publishers_id, this.textFontBackground );
	this.RegisterListener( 'commandIncreaseFontSize', Messages.all_publishers_id, this.textIncreaseFontSize );
	this.RegisterListener( 'commandDecreaseFontSize', Messages.all_publishers_id, this.textDecreaseFontSize );
	this.RegisterListener( 'commandBold', Messages.all_publishers_id, this.textBold );
	this.RegisterListener( 'commandUnderline', Messages.all_publishers_id, this.textUnderline );
	this.RegisterListener( 'commandItalics', Messages.all_publishers_id, this.textItalics );
	this.RegisterListener( 'commandCut', Messages.all_publishers_id, this.textCut );
	this.RegisterListener( 'commandCopy', Messages.all_publishers_id, this.textCopy );
	this.RegisterListener( 'commandDelete', Messages.all_publishers_id, this.textDelete );
	this.RegisterListener( 'commandPaste', Messages.all_publishers_id, this.textPaste );
	this.RegisterListener( 'commandUndo', Messages.all_publishers_id, this.textUndoRequest );
	this.RegisterListener( 'commandRedo', Messages.all_publishers_id, this.textRedoRequest );
	this.RegisterListener( 'commandInsertCheckbox', Messages.all_publishers_id, this.textInsertCheckbox );
	this.RegisterListener( 'commandInsertImage', Messages.all_publishers_id, this.textInsertImage );

	this.RegisterListener( 'commandHighlight', Messages.all_publishers_id, this.textHighlight );
	this.RegisterListener( 'commandClearHighlight', Messages.all_publishers_id, this.textCleanXML );

	this.RegisterListener( 'commandOpenLink', Messages.all_publishers_id, this._openLinkAtCurrentRange );
	
	NoteText.Base.RegisterMessageHandlers.apply( this );
};

/**
* getContentWindow - Get the content window for the current IFRAME container.
*   NOTE - will throw an exception if contentWindow or document are not ready.
* @returns {Object} - Content window for the current DOM Container.
*/
NoteText.prototype.getContentWindow = function()
{
    var objRetVal = this.m_objDomContainer ? 
        this.m_objDomContainer.contentWindow : undefined;
    
    if( ! objRetVal )
    {   // At this point, we could be waiting on document creation so it is pretty low.
        var objException = new UberErrorEntry( 'NoteText.prototype.getContentWindow', 
            ErrorLevels.eErrorType.INFO, ErrorLevels.eErrorLevel.LOW, 'Content window not ready',
            NoteText.NoteTextEC.WINDOW_NOT_READY );
        throw objException;
    } // end if

    return objRetVal;
};

/**
* getDocument - Get the document object for the current IFRAME container.
*   NOTE - will throw an exception if contentWindow or document are not ready.
* @returns {Object} - Document object for the current DOM Container.
*/
NoteText.prototype.getDocument = function()
{
    // IE6 on Windows 2000 loses its document, so we have to re-search for it all the time.
    var objContentWindow = this.getContentWindow();
    var objRetVal = objContentWindow ? objContentWindow.document : undefined;

    if( ! objRetVal )
    {
        var objException = new UberErrorEntry( 'NoteText.prototype.getDocument', 
            ErrorLevels.eErrorType.INFO, ErrorLevels.eErrorLevel.LOW, 'Document not ready', 
            NoteText.NoteTextEC.DOCUMENT_NOT_READY );
        throw objException;
    } // end if-else
    
    return objRetVal;
};

/**
* DOMEvents section
*/
NoteText.prototype.RegisterDomEventHandlers = function()
{
    // IE6 on Windows 2000 loses its document, so we have to re-search for it.
    var objDocument = this.getDocument();
    
    UberEvents( objDocument );
	
	this.RegisterListener( 'onkeydown', objDocument, this.OnKeyDownHandler );
	this.RegisterListener( 'onkeyup', objDocument, this.OnKeyUpHandler );
	this.RegisterListener( 'onclick', objDocument, this.OnClickHandler );
	this.RegisterListener( 'ondblclick', objDocument, this.OnDblClickHandler );
	this.RegisterListener( 'onmouseup', objDocument, this.OnMouseUpHandler );
	this.RegisterListener( 'onmousemove', objDocument, this.OnMouseMoveHandler );
	this.RegisterListener( 'onblur', objDocument, this._updateTextSelectionVariables );

    this.RegisterListener( 'oncontextmenu', objDocument, this.OnContextMenuHandler );
    this.RegisterListener( 'onpaste', objDocument.body, this.OnPaste );  // IE extension that works in FF3
    
    this.m_objRegisteredDocument = objDocument;
};
	

NoteText.prototype.UnRegisterDomEventHandlers = function()
{
	var objDocument = this.m_objRegisteredDocument;

    try
    {   // IE 6 in win2000 blows up on this.
        NoteText.Base.UnRegisterDomEventHandlers.apply( this );
        UberEvents.unload( objDocument );
    } catch ( error ) {
        SysError.raiseError( 'NoteText.prototype.UnRegisterDomEventHandlers', ErrorLevels.eErrorType.EXCEPTION, 
            ErrorLevels.eErrorLevel.LOW, 'Could not unload message handlers for document' + ( error.description || error.message || '' ) );
    } // end try-catch
    
    this.m_objRegisteredDocument = undefined;
};


/**
* Just propagate click events to containing page
*/
NoteText.prototype.OnClickHandler = function( in_objEvent ) 
{ 
    Util.Assert( in_objEvent );
    
    if( true == this.m_bHasSearchHighlights )
    {
        this.textCleanXML();
    } // end if

	if ( true == this.m_bEditable )
	{   
        this.textToggleCheckbox( in_objEvent );
	} // end if
    
	DOMElement.applyEvent( this.m_objParentElement, in_objEvent );
};


/**
* Follow links on double click
*/
NoteText.prototype.OnDblClickHandler = function( in_objEvent )
{
    if( true == this._openLinkAtCurrentRange() )
    {
		in_objEvent.preventDefault();
    } // end if

};

/**
* Just forward the mouseup event - used for dropping items on us.
*/
NoteText.prototype.OnMouseUpHandler = function( in_objEvent ) 
{ 
	if ( false == this.m_bEditable )
	{
        in_objEvent.cancelEvent();
		return;
	} // end if

	DOMElement.applyEvent( this.m_objParentElement, in_objEvent );
};

/**
* Forward right clicks to the parent page, canceling default action
*/
NoteText.prototype.OnContextMenuHandler = function( in_objEvent ) 
{
    this._updateTextSelectionVariables();
	DOMElement.applyEvent( this.m_objParentElement, in_objEvent );
    
	if( true == app.userpreferences.m_bNoteContext )
	{
        // do these afterwards or the event never goes anywhere.
        in_objEvent.cancelEvent();
    } // end if
};

/* if we don't forward mousemove events our drag/drop breaks when moving over iframes */
/* note that if we don't cancel default action in the iframe after forwarding event, 
*   we will end up selecting random stuff in the gui 
*/

NoteText.prototype.OnMouseMoveHandler = function( in_objEvent ) 
{ 
	DOMElement.applyEvent( this.m_objParentElement, in_objEvent );

	if( true == app.drag.dragging )
	{
        in_objEvent.cancelEvent();
	} // end if
};


/**
* textCut - command to cut.
*/
NoteText.prototype.textCut = function()
{
    var bRetVal = this.execCommand( 'cut' );
    var bModified = bRetVal;
    
    if( ( true == BrowserInfo.gecko ) && ( false == bRetVal ) ) 
    {   // Letting the browser take care of it.  Don't cancel the
        // event, but mark us as modified.
        bRetVal = false;
        bModified = true;
    } // end if
    return { bRetVal: bRetVal, bModified: bModified };
};

/**
* textCopy - command to indent a block.
*/
NoteText.prototype.textCopy = function()
{
    var bRetVal = this.execCommand( 'copy' );
            
    return { bRetVal: bRetVal, bModified: false };
};

/**
* textPaste - command to indent a block.
*/
NoteText.prototype.textPaste = function()
{
    var bRetVal = this.execCommand( 'paste' );
    var bModified = bRetVal;
    
    if( ( true == BrowserInfo.gecko ) && ( false == bRetVal ) )
    {
        // Letting the browser take care of it.  Don't cancel the
        // event, but mark us as modified.
        bRetVal = false;
        bModified = true;
    } // end if
    return { bRetVal: bRetVal, bModified: bModified };
};

/**
* textTranslate - translate from spanish to english
*/
NoteText.prototype.textTranslate = function( in_strFrom, in_strTo )
{
    var objRange;
    if( objRange = this.getRange() )
    {
	    var strWords = objRange.toString();
        var bRetVal = false;
        var strCharset= document.charset || document.characterSet;
        
        if( strWords )
        {
            var strHref = 'http://translate.google.com/translate_t?text='+strWords+'&hl=en&langpair='+in_strFrom+'|'+in_strTo+'&tbb=1&ie='+strCharset;
    /*        var objResult = UberXMLHTTPRequest.getWebPage( strHref );
            var objDomTree = TemplateManager.ElementFactory( objResult.responseText );
            var strTranslation = DOMElement.getFirstElementByTagNameValue( objDomTree, "result_box", 0 );
            alert( strTranslation ); */
            window.open( strHref );
		    bRetVal = true;
        } // end if
    } // end if
    return { bRetVal: bRetVal, bModified: false };
};

( function() {
    var aobjFunctions = [
        { func: 'textParagraph', command: 'insertparagraph'},
        { func: 'textDecreaseFontSize', command: 'decreasefontsize'},
        { func: 'textIncreaseFontSize', command: 'increasefontsize'},
        { func: 'textDelete', command: 'delete'},
        { func: 'textIndent', command: 'indent'},
        { func: 'textOutdent', command: 'outdent'},
        { func: 'textBold', command: 'bold'},
        { func: 'textItalics', command: 'italic'},
        { func: 'textStrikeThrough', command: 'strikethrough'},
        { func: 'textUnderline', command: 'underline'}
        
        /*,
        { func: 'textFontSize', command: 'fontsize'},
        { func: 'textFontForeground', command: 'forecolor'},
        { func: 'textFontBackground', command: 'backcolor'}*/
    ];
    
    var createFunction = function( in_objEntry ) { // do this to create the function.
        NoteText.prototype[ in_objEntry.func ] = function()
        {
            var bRetVal = this.execCommand( in_objEntry.command, arguments[ 0 ] );
            return { bRetVal: bRetVal, bModified: bRetVal };
        }; // end function
    };

    UberObject.createTemplateFunctions( createFunction, aobjFunctions );
})();


NoteText.prototype.textFontSize = function( in_strFontSize )
{
    this.textFont( 'fontSize', in_strFontSize );
};

NoteText.prototype.textFontBackground = function( in_strBackgroundColor )
{
/*   var strCommand = BrowserInfo.gecko ? 'hilitecolor' : 'backcolor';
    if( this.execCommand( strCommand, in_strBackgroundColor ) )
    {
        this.focus();
        this.Raise( 'noteEditorEdited' );
        this._resizeTextArea();
    } // end if
*/
    this.textFont( 'backgroundColor', in_strBackgroundColor );
};

NoteText.prototype.textFontForeground = function( in_strForegroundColor )
{
    this.textFont( 'foregroundColor', in_strForegroundColor );
};


NoteText.prototype.clearStyleAttributeFromTree = function( in_objHead, in_strStyleAttribute )
{
  // Iterate into this nodes childNodes
    if (in_objHead.hasChildNodes) {
	    var hi_cn;
	    for (hi_cn=0; hi_cn<in_objHead.childNodes.length ;hi_cn++) {
		    this.clearStyleAttributeFromTree(in_objHead.childNodes[hi_cn], in_strStyleAttribute );
	    } // end for
    } // end if
	
    // And do this node itself
    if ( in_objHead.nodeType == Node.ELEMENT_NODE ) 
    { // Normal element
        in_objHead.style[ in_strStyleAttribute ] = '';
        var bFound = false;
        if( ( ! in_objHead.style[ 'fontSize' ] )
         && ( ! in_objHead.style[ 'fontFamily' ] )
         && ( ! in_objHead.style[ 'foregroundColor' ] )
         && ( ! in_objHead.style[ 'backgroundColor' ] ) )
        {
            //var objParent = in_objHead.parentNode;
            DOMElement.unwrap( in_objHead, true );
            //this.clearStyleAttributeFromTree( objParent, in_strStyleAttribute );
        } // end for
    } // end if
};

NoteText.prototype.textFont = function( in_strFontAttribute, in_strFontStyle )
{
    Util.Assert( TypeCheck.String( in_strFontAttribute ) );
    Util.Assert( TypeCheck.String( in_strFontStyle ) );

    var bRetVal = false;    
    var objRange;
    if( objRange = this.m_objRange )
    {
        var strHTML = objRange.htmlText || objRange.text || '&nbsp;';
        
        var objNewHead = this.getDocument().createElement( 'span' );
        objNewHead.id = NoteText.placeholderElementID;
        if( in_strFontStyle ) 
        {
            objNewHead.style[ in_strFontAttribute ] = in_strFontStyle;
        } // end if

        // We create this as a throwaway, because we'll unwrap it and delete 
        //  it in the clearStyleAttributeFromTree.
        var objThrowAway = this.getDocument().createElement( 'span' );
        objThrowAway.innerHTML = strHTML;
        
        objNewHead.appendChild( objThrowAway );
        
        this.clearStyleAttributeFromTree( objThrowAway, in_strFontAttribute );
        
        // Rewrite the contents of the range.
        objRange.deleteContents();
        objRange.insertNode( objNewHead );
        
        this._pasteHTMLContinuation( objRange, undefined );
        bRetVal = false;        
    } // end if    
    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* textRemoveLink - command to remove a link from a range
*/
NoteText.prototype.textRemoveLink = function()
{
    var bRetVal = false;
    var objRange;
    if( objRange = this.getRange() )
    {
        var objElement = objRange.parentElement();
        
        if( true == DOMElement.isTagType( objElement, "A" ) )
        {
            DOMElement.unwrap( objElement, true );
            bRetVal = true;
        } // end if
    } // end if
    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* _textLinkCreate - helper function to create a link at the saved range
* @param  {String} in_strTitle Title of link
* @param  {String} in_strURL URL of link
*/
NoteText.prototype._textLinkCreate = function( in_strTitle, in_strURL )
{
    Util.Assert( TypeCheck.String( in_strTitle ) );
    Util.Assert( TypeCheck.String( in_strURL ) );

    var bRetVal = false;
    var objRange = this.m_objRange;
    if( objRange )
    {
        // if we hit escape or enter with no length, skip the rest.
        var strText = '<a id="' + NoteText.placeholderElementID + '" href="' + in_strURL + '">'+ in_strTitle + '</a>';
        
        // XXX Check for trailing <BR /> here
        objRange.pasteHTML( strText );
        this._pasteHTMLContinuation( objRange );
        
        bRetVal = true;
    } // end if
    else
    {   // We do this one special because it was a saved range.
        SysError.raiseError( 'NoteText._textLinkCreate', ErrorLevels.eErrorType.ERROR, 
            ErrorLevels.eErrorLevel.MEDIUM, 'No saved range to insert link' );
    } // end if
    return bRetVal;    
};

/**
* textLink - command to create or remove a link from a range
* @param {Event} (optional) in_objEvent Event that caused action.
*/
NoteText.prototype.textLink = function( in_objEvent )
{
    var bRetVal = false;
    // We have to save off the range because when we call the 
    //  _urlPopup function after closing the popup, IE isn't focused yet and
    //  breaks, it thinks the range is the parent document.
    var objRange = this.m_objRange = this.getRange();
    if( objRange )
    {    
        var objElement = objRange.parentElement();
        
        if( true == DOMElement.isTagType( objElement, "A" ) )
        {
            DOMElement.unwrap( objElement, true );
            return true;
        } // end if
        else
        {
            var strTitleText = objRange.toString();

            if( ! strTitleText )
            {   // give us a popup to get the text!
                var strHeader = NoteText._localStrings.URL_NAME_HEADING;
                this._showPopup( this._urlPopup, this._popupCancel, strHeader );    
            } // end if
            else
            {   // already have the title, ask for the URL
                this._urlPopup( strTitleText );
            } // end if-else
            
            // always cancel the event
            bRetVal = true;
        } // end if-else
    } // end if
    return { bRetVal: bRetVal, bModified: false };
};

NoteText.prototype._popupCancel = function( in_strValue )
{
    this.focus();
};


NoteText.prototype._urlPopup = function( in_strTitleText )
{
    this.m_strTitleText = in_strTitleText;
    if( in_strTitleText )
    {
        var strHeader = NoteText._localStrings.URL_HEADING;
        var strValue = in_strTitleText.toLowerCase();
        // Match the typical types.
        var strAllProts = 'http|https|ftp|ftps|telnet|ssh|scp|torrent|email';
        
        var strProt = '^(?:'+strAllProts+')\:\/\/';
        var objRegExp = new RegExp( strProt, 'gi');
        if( false === objRegExp.test( in_strTitleText ) )
        {   
            // We only want to check for the www|ftp if we DON'T specify a protocol
            var strType = '^(?:(?:'+strAllProts+'\:\/\/)?(?:www|ftp|mail|gmail))';
            var objTypeRegExp = new RegExp( strType, 'gi' );
            if( false === objTypeRegExp.test( in_strTitleText ) )
            {
                strValue = 'www.' + strValue;
            } // end if

            // Do this last or else we get it www.http://
            strValue = 'http://' + strValue;
            
            // Match end of line, go for common ones.
            // Match domains, match common file extensions
            var strTopLevel = '\.(?:asp|aspx|cgi|cfm|htm|html|php|com|net|edu|org|us|gov|mil|tv|ar|au|br|ca|cl|cz|fr|mx|nz|pe|ru|uk|/)/*$';
            var objTypeRegExp = new RegExp( strTopLevel, 'mgi' );
            if( false === objTypeRegExp.test( in_strTitleText ) )
            {
                strValue += '.com';
            } // end if
        } // end if

        this._showPopup( this.OnUrlPopupClose, this._popupCancel, strHeader, strValue );
    } // end if
};

NoteText.prototype.OnUrlPopupClose = function( in_strValue )
{
    // if we hit escape or enter with no length, skip the rest.
    if( in_strValue )
    {
        this._textLinkCreate( this.m_strTitleText, in_strValue );
    } // end if
};


/**
* textInsertImage - command to insert an image.
* @param {Event} (optional) in_objEvent Event that caused action.
*/
NoteText.prototype.textInsertImage = function( in_objEvent )
{
    var strHeader = NoteText._localStrings.IMG_URL;
    // We have to save off the range because when we call the 
    //  insertImage function after closing the popup, IE isn't focused yet and
    //  breaks, it thinks the range is the parent document.
    this.m_objRange = this.getRange();  
    var strValue = this.m_objRange ? ( this.m_objRange.toString() ) || ' ' : ' ';
    this._showPopup( this.insertImage, this._popupCancel, strHeader, strValue );    
    return { bRetVal: false, bModified: false };
};


NoteText.prototype.insertImage = function( in_strImgURL )
{
    var bRetVal = false;
    
    // if we hit escape or enter with no length, skip the rest.
    if( in_strImgURL )
    {
        if( false === this.execCommand( 'insertimage', in_strImgURL ) )
        {   // Could be IE, could be unsupported
            var objRange = this.m_objRange;
            if( objRange )
            {
                var strImage = '<img id="' + NoteText.placeholderElementID + 
                    '" src="'+ in_strImgURL + '" />';
                objRange.pasteHTML( strImage );
                this._pasteHTMLContinuation( objRange );
            } // end if
        } // end if
        else
        {
            this.Raise( 'noteEditorEdited' );
            this._resizeTextArea();
        } // end if
    } // end if
};

/**
* textEnter - command to make sure a <br/ > is inserted instead of a <p>
*/
NoteText.prototype.textEnter = function()
{
    var bRetVal = false;
    var objRange;
    if( true == BrowserInfo.ie && ( objRange = this.getRange() ) ) 
    {   // Only have to do this for IE, the rest do it right!
	    var objElement = objRange.getElement();
	    if( false == DOMElement.isTagType( objElement, "LI" ) ) // our scheme messes up lists, so check for list first
	    {
		    objRange.pasteHTML("<br />");
		    objRange.collapseToEnd();
		    objRange.select();
		    bRetVal = true; // cancel the event or else IE puts in the P still.
	    } // end if
	} // end if
    
    return { bRetVal: bRetVal, bModified: true };
};

/**
* textRemoveFormat - command to increase the font size of a range.
*/
NoteText.prototype.textRemoveFormat = function()
{
    var bRetVal = this.execCommand( 'removeformat' );
    if( BrowserInfo.ie )
    {
        bRetVal = true;
    } // end if
    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* textTag - create a tag out of the current range.
*/
NoteText.prototype.textTag = function()
{
    var bRetVal = false;
    var objRange;
    if( objRange = this.getRange() )
    {
        var strTagName = objRange.toString();
        
        if( strTagName )
        {   // let whoever takes care of this take care of it.
            this.Raise( 'userrequestviewnodeadd', [ strTagName ] );
            this.logFeature( 'textTag - keyboard shortcut', '' );
            bRetVal = true;
        } // end if
    } // end if    
    return { bRetVal: bRetVal, bModified: false };
};

/**
* textRedo - Redo after Undo
*/
NoteText.prototype.textRedoRequest = function()
{
    this.Raise( 'noteEditorRedo' );
    return { bRetVal: true, bModified: false };
};

/**
* textUndo - Undo last.
*/
NoteText.prototype.textUndoRequest = function()
{
    this.Raise( 'noteEditorUndo' );
    return { bRetVal: true, bModified: false };
};


/**
* textRedo - Redo after Undo
*/
NoteText.prototype.textRedo = function( in_vRedoInfo )
{
    var bRetVal = true;
    var bModified = false;
    
    if( false === this.m_abProvides.nativeundo )
    {
        Util.Assert( in_vRedoInfo );
        this.setUndo( in_vRedoInfo );
    } // end if
    else
    {
        bRetVal = bModified = this.execCommand( 'redo' );
    } // end if-else
    
    return { bRetVal: bRetVal, bModified: bModified };
};

/**
* textUndo - Undo last.
*/
NoteText.prototype.textUndo = function( in_vUndoInfo )
{
    var bRetVal = true;
    var bModified = false;
    
    if( false === this.m_abProvides.nativeundo )
    {
        Util.Assert( in_vUndoInfo );
        this.setUndo( in_vUndoInfo );
    } // end if
    else
    {
        bRetVal = bModified = this.execCommand( 'undo' );
    } // end if-else
    
    return { bRetVal: bRetVal, bModified: bModified };
};

/**
* textInsertBullets - Inserts an unordered list for the current range.
* @param {String} in_strClassName - class name to surround the list with.
* @returns {bool} true if successful, false otw.
*/
NoteText.prototype.textInsertBullets = function( in_strClassname )
{
    Util.Assert( TypeCheck.Undefined( in_strClassname ) || TypeCheck.String( in_strClassname ) || TypeCheck.Object( in_strClassname ) );

    // in_strClassname could actually be the event object if we call this directly from a button.
    var strClassname, strItemClassname;
    if( TypeCheck.String( in_strClassname ) )
    {
        strClassname = in_strClassname;
        strItemClassname = 'checkboxUnselected';
    } // end if
    
    var bRetVal = this._textCreateList( 'ul', strClassname, strItemClassname );
    return { bRetVal: bRetVal, bModified: bRetVal };
};


/**
* textInsertOutline - Inserts an ordered list for the current range.
* @param {String} in_strClassName - class name to surround the list with.
* @returns {bool} true if successful, false otw.
*/
NoteText.prototype.textInsertOutline = function( in_strClassname ) 
{
    Util.Assert( TypeCheck.Undefined( in_strClassname ) || TypeCheck.String( in_strClassname ) || TypeCheck.Object( in_strClassname ) );

    // in_strClassname could actually be the event object if we call this directly from a button.
    var strClassName = TypeCheck.String( in_strClassname ) ? in_strClassname : undefined;
    
    var bRetVal = this._textCreateList( 'ol', strClassName );
    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* _textCreateList - Creates a list item out of the current range for IE.
*   Returns true.
* @param {String} in_strListTypeTag  - 'ul' 'ol' 
* @param {String} in_strClassname (optional) - Class name to add to the list
* @param {String} in_strItemClassname (optional) - Class name to add to list items
*/
NoteText.prototype._textCreateList = function( in_strListTypeTag, in_strClassname, in_strItemClassname )
{
    Util.Assert( TypeCheck.String( in_strListTypeTag ) );
    Util.Assert( TypeCheck.Undefined( in_strClassname ) || TypeCheck.String( in_strClassname ) );
    Util.Assert( TypeCheck.Undefined( in_strItemClassname ) || TypeCheck.String( in_strItemClassname ) );
    
    var bRetVal = false;
    
    this._textWrapRangeWithTag( in_strListTypeTag, undefined, 
        in_strClassname, this.convertToList, in_strItemClassname );

    return bRetVal;
};


/**
* _textWrapRangeWithTag - Wrap the current range with a tag and 
*   perform an optional operation on the range.  Selects the new range.
* in_strTagName  - Tag to wrap HTML with.
* in_fncHTMLModifier {function} (optional) - Range operator function - 
        function is given the Range HTML and must return a string.
*/
NoteText.prototype._textWrapRangeWithTag = function( in_strTagName, in_strID, in_strClassname, 
    in_fncHTMLModifier, in_vModifierArguments, in_aobjStyles )
{
    Util.Assert( TypeCheck.String( in_strTagName ) );
    Util.Assert( TypeCheck.Undefined( in_strClassname ) || TypeCheck.String( in_strClassname ) );
    Util.Assert( TypeCheck.Undefined( in_fncHTMLModifier ) || TypeCheck.Function( in_fncHTMLModifier ) );
    Util.Assert( TypeCheck.Undefined( in_aobjStyles ) || TypeCheck.Object( in_aobjStyles ) );

    var bRetVal = false;
    var objRange;
    if( objRange = this.getRange() )
    {
        var strHTML = objRange.htmlText;

        if( in_fncHTMLModifier )
        {
            strHTML = in_fncHTMLModifier( strHTML, in_vModifierArguments );
        } // end if
        
        // this wraps our HTML inside of a tag with the id defined in NoteText.placeholderElementID.
        //  We then use that ID to find the element, remove the ID, then move our range the last 
        //  child (if exists) in that element.  If it doesn't, we use the element itself.
        
        strHTML = DOMElement.wrapString( strHTML, in_strTagName, 
            NoteText.placeholderElementID, in_strClassname, in_aobjStyles );
        
        objRange.pasteHTML( strHTML );
        this._pasteHTMLContinuation( objRange, in_strID, in_aobjStyles );
        
        bRetVal = true;
    } // end if
    return bRetVal;
};

/**
* _pasteHTMLContinuation - Continuation of the range paste - because sometimes
*   IE just isn't ready right after you do the paste to do the selection.
*   What this does is look for the element with NoteText.placeholderElementID, 
*   update that elements ID, set the optional styles, and select the elements contents
* @param {Object} in_objRange - the range we were working on.
* @param {String} in_strID (optional) - ID to give the placeholder element.  
*       If not given, ID attribute removed from element.
* @param {Array} array of objects that hold the style information.
*/
NoteText.prototype._pasteHTMLContinuation = function( in_objRange, in_strID, in_aobjStyles )
{
    Util.Assert( in_objRange );

    var me=this;
    setTimeout( function() {    // Give time to do the paste.
        me._pasteHTMLContinuationPost( in_objRange, in_strID, in_aobjStyles ) ;
    }, 20 );
    
};

NoteText.prototype._pasteHTMLContinuationPost = function( in_objRange, in_strID, in_aobjStyles )
{
    Util.Assert( in_objRange );
    
    var objElement = this.getDocument().getElementById( NoteText.placeholderElementID );
    var objRange = this.createRange();
    if( objElement )
    {   
        if( in_aobjStyles )
        {
            DOMElement.setStyles( objElement, in_aobjStyles );
        } // end if
        
        if( in_strID )
        {
            objElement.id = in_strID;
        } // end if
        else
        {
            objElement.removeAttribute( 'id' );
        } // end if-else
        
        // Reassign if possible.  Note - we do not want to assign to text nodes, that'll just mess us up.
        objElement = ( objElement.lastChild && ( objElement.lastChild.nodeType != Node.TEXT_NODE ) ) 
            ? objElement.lastChild : objElement;
        
        if( objRange.moveToElementText )
        {
            objRange.moveToElementText( objElement );
            // IE does some goofy things here with the range.  If you select the text 
            //  and then start writing, it deletes what we just created completely, it seems
            //  to have the boundaries messed up.  So to get the spot right, we move one to the right,
            //  then back one to the left.
            // It seems to select closing part of this element also if we select the entire thing, 
            //  so move it back one spot.
            /*objRange.moveStart( 'character', 1 );
            objRange.moveStart( 'character', -1 );
            objRange.moveEnd( 'character', -1 );*/
        } // end if
        else if( objRange.selectNodeContents )
        {
            objRange.selectNodeContents( objElement );
        } // end if-else
    } // end if
    objRange.select();
    this.focus();
    this.Raise( 'noteEditorEdited' );
    this._resizeTextArea();
    
    return bRetVal;
};

/**
* convertToList - Converts the given HTML to a list.  Surrounds text with a <li></li>, 
*       converts all <BR>, <br>, <P>, <p> tags to mean new list item.
*   Returns the string.  Does not modify original string.
* @param {String} in_strHTML  - String to convert to a list.
* @param {String} in_strItemClassName (optional) - Class name to add to list item.
*/
NoteText.prototype.convertToList = function( in_strHTML, in_strItemClassName )
{
    Util.Assert( TypeCheck.String( in_strHTML ) );
    
    var strHTML = in_strHTML.replace( /<br[^>]*>/gi, '<UBER_LI>' );
    strHTML = strHTML.replace( /<li[^>]*>(&nbsp;)+<\/li>/gi, '' );    // <LI>'s that only have spaces. get rid of extra info
    //strHTML = strHTML.replace( /<li[^>]*>[\S]+<\/li>/gi, '' );      // <LI>'s that only have spaces. get rid of extra info
    strHTML = strHTML.replace( /<li[^>]*>/gi, '<UBER_LI>' );          // reformat any old list items to remove class info.
    strHTML = strHTML.replace( /<\/li>/gi, '' );                      // 
    strHTML = strHTML.replace( /<p[^>]*><\/p>/gi, '' );               // empty <P>'s
    strHTML = strHTML.replace( /<p[^>]*>(&nbsp;)+<\/p>/gi, '' );      // <P>'s that only have spaces. get rid of extra info
  //  strHTML = strHTML.replace( /<p[^>]*>[\S]+<\/p>/gi, '' );          // <P>'s that only have whitespace. get rid of extra info
    strHTML = strHTML.replace( /[\r\n]+/gi, '' );                     // newlines
    strHTML = strHTML.replace( /<p[^>]*>/gi, '<UBER_LI>' );
    strHTML = strHTML.replace( /<\/p>/gi, '' );
    //strHTML = strHTML.replace( /[\S]*<UBER_LI>/g, '<UBER_LI>' );        // strip out trailing whitespace before the list items
    // We keep that last space before the closing </li> in case we have
    //  no input HTML so we have SOMETHING to select.
    if( 0 == strHTML.length )
    {   // Give our list item SOMETHING for mozilla to display.
        strHTML = NoteText._localStrings.INSERT_LIST_ITEM;
    } // end if
    
    var strListItem = '<li>';
    if( in_strItemClassName )
    {
        strListItem = '<li class="'+ in_strItemClassName +'">';
    } // end if
    
    strHTML = strListItem + strHTML.replace( /<UBER_LI>/g, '</li>'+strListItem )+ '</li>';
    strHTML = strHTML.replace( /<li[^>]*><\/li>/g, '' );                 // finally, any empty li's. ( the first one may be empty )
    
    return strHTML;
};


/**
* textHeading - Inserts a H1-H6 tag around the current range.
* in_nHeadingSize  - size of heading - Valid range is 1-6.
*/
NoteText.prototype.textHeading = function( in_nHeadingSize )
{
    Util.Assert( TypeCheck.Number( in_nHeadingSize, 1, 6 ) );
    
    var strTag = 'h' + in_nHeadingSize;
    
    var bRetVal = this.execCommand( 'heading', strTag );
    
    if( ( false == bRetVal ) && ( true == BrowserInfo.ie ) )
    {
	    bRetVal = this.textHeadingIE( strTag );
	} // end if

    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* textHeadingIE - Inserts a H1-H6 tag around the current range.
* in_strHeadingTag  - Heading tag
*/
NoteText.prototype.textHeadingIE = function( in_strHeadingTag )
{
    Util.Assert( TypeCheck.String( in_strHeadingTag ) );
    
    var bRetVal = false;
    var objRange;
    if( objRange = this.getRange() )
    {
        var objElement = objRange.parentElement();
        if( objElement )
        {        
            switch( objElement.tagName.toLowerCase() )
            {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    // replaces the current "H" tag with a new one.
                    // By creating the new tag, setting the innerHTML
                    var objNewElement = this.getDocument().createElement( in_strHeadingTag );
                    objNewElement.innerHTML = objElement.innerHTML;
                    // then replacing the old element.
                    objElement.parentNode.replaceChild( objNewElement, objElement );
                    break;
                default:
                    var strHTML = objRange.htmlText || objRange.text;
                    // Creates a new tag.
                    strHTML = DOMElement.wrapString( strHTML, in_strHeadingTag );
                    objRange.pasteHTML( strHTML );
                    objRange.collapse( true );
	                objRange.select();
                    break;            
            } // end switch
	        bRetVal = true;
	    } // end if
    } // end if
    return bRetVal;
};


/**
* textRemoveHeading - Removes an H1-H6 tag around the current range.
*   Returns true if range was already headerfied, false otw.
*/
NoteText.prototype.textRemoveHeading = function()
{

    var bRetVal = false;    
    var objRange;
    if( objRange = this.getRange() )
    {
        var strHTML = objRange.htmlText || objRange.text;
        var objElement = objRange.parentElement();
        
        if( objElement )
        {
            switch( objElement.tagName.toLowerCase() )
            {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    DOMElement.unwrap( objElement, true );
                    bRetVal = true;
                    break;
                default:
                    break;            
            } // end switch
        } // end if        
    } // end if
    return { bRetVal: bRetVal, bModified: bRetVal };
};

/**
* textEscape - handles escape key press
*/
NoteText.prototype.textEscape = function()
{
	var objDocument = this.getDocument();
	var objParentWindow = DOMElement.getParentWindow( objDocument );
    var bRetVal = true;
    
	this.blur();
	
    objParentWindow.focus();
    return { bRetVal: bRetVal, bModified: false };
};

/**
* textSwallow - Does nothing, returns true so that the event is cancelled.
*/
NoteText.prototype.textSwallow = function()
{
    return { bRetVal: true, bModified: false };
};

/**
* textApplyNoModify - Applys the key to the editor, but does not cause the 
*           noteeditormodified message to be raised.
*/
NoteText.prototype.textApplyNoModify = function()
{
    return { bRetVal: false, bModified: false };
};

/**
* textApply - Applys the key to the editor, but prevents it from passing up to the NoteDisplay
*/
NoteText.prototype.textApplyModify = function()
{
    return { bRetVal: false, bModified: true };
};

NoteText.prototype._updateTextSelectionVariables = function()
{
    if( true == this.m_bEditable )
    {
        // If we are deleting or undeleting a note, we lose focus and the ranges are not available.
        this.m_objSelection = this.getSelection();
        this.m_objRange = this.getRange();
        this.m_bRangeIsLink = !!this._getURLAtCurrentRange();
        this.m_bRangeIsLinkable = this._currentRangeIsLinkable();
        this.m_bTextSelected = !!( this.m_objRange && this.m_objRange.toString() && this.m_objRange.toString().length > 0 );
        this.m_bRangeIsTagable = this.m_bTextSelected;
    } // end if
    else
    {   
        this.m_bRangeIsLink = false;
        this.m_bRangeIsLinkable = false;
        this.m_bRangeIsTagable = false;
    } // end if
};


NoteText.prototype.keyMenu = function( in_objEvent )
{
    this._updateTextSelectionVariables();

	this.Raise( 'noteEditorShowMenu' );

    in_objEvent.cancelEvent();
        
    return true;
};

NoteText.prototype.textLoad = function( in_objEvent )
{
    this.Raise( 'noteEditorLoadXML' );
    return { bRetVal: true, bModified: false };
};

NoteText.prototype.textReload = function( in_objEvent )
{
    this.Raise( 'noteEditorReLoadXML' );
    return { bRetVal: true, bModified: false };
};

NoteText.prototype.textCleanXML = function( in_objEvent )
{
    this.Raise( 'noteEditorCleanXML' );

    var objDocument = undefined;    
    if( ( true == this.m_bHasSearchHighlights ) 
     && ( objDocument = this.getDocument() ) )
    {
        try 
        {   // This messes up mozilla if it is the cached/detached display.
            Highlight.removeHighlight( objDocument );
            // Do this afterwards in case of failure, the next time through try again.
            this.m_bHasSearchHighlights = false;    
        } // end try-catch
        catch( e ){}
    } // end if-else
    
    return { bRetVal: true, bModified: false };
};


NoteText.prototype.textHighlight = function( in_strSearchTerms )
{
    Util.Assert( TypeCheck.String( in_strSearchTerms ) );
    
    var astrWords = unescape( in_strSearchTerms.replace( /\+/g,' ' ) ).split( /\s+/ );
    var objDocument = this.getDocument();
    if( objDocument && objDocument.body )
    {   // This will fail on a 0 length word
        for (var nIndex = 0, strWord; strWord = astrWords[ nIndex ]; ++nIndex ) 
        {
            this.m_bHasSearchHighlights = true;
            Highlight.highlightWord( objDocument.body, strWord, objDocument );
        } // end for
    } // end if
};

NoteText.prototype.textHighlightInput = function( in_vInput )
{
    var bRetVal = false;
    
    if( true == this.m_bActive ) 
    {
        if( true == this.m_bReadyForProcessing )
        {
            bRetVal = true;
            // The first one means a string was passed in, the second means an event.
            var objRange;
            var strSearchTerm = TypeCheck.String( in_vInput ) ? 
                in_vInput : 
                ( objRange = this.getRange() ) ? objRange.toString() : '';

            if( strSearchTerm )
            {
                this.textHighlight( strSearchTerm );
            } // end if
            else
            {   // Bring up the popup.
                this._showPopup( this.textHighlight, this._popupCancel, NoteText._localStrings.SEARCH_HEADING );    
            } // end if-else
        } // end if
        else
        {
            var objFuncCont = new FunctionContainer( this.textHighlightInput, this, undefined, [ in_vInput ] );
            this.m_aReadyQueue[ this.m_aReadyQueue.length ] = objFuncCont;
        } // end if-else
    } // end if
    
    return { bRetVal: bRetVal, bModified: false };
};

NoteText.prototype.textSearch = function( in_objEvent )
{
    var bRetVal = false;
    var objRange;
    if( objRange = this.getRange() )
    {
        var strSearchTerm = objRange.toString();
        
        if( strSearchTerm && ( strSearchTerm.length > 0 ) )
        {
            this.Raise( 'categoryselectsearch', [ strSearchTerm ] );
        } // end if
        bRetVal = true;
    } // end if
    return { bRetVal: bRetVal, bModified: false };
};

/**
* textPrint - Print the note.
*/
NoteText.prototype.textPrint = function( in_objEvent )
{
    this.getContentWindow().focus();
    this.getContentWindow().print();

    return { bRetVal: true, bModified: false };
};

NoteText.prototype.textTitle = function( in_objEvent )
{
    this._updateTextSelectionVariables();
    this.Raise( 'noteEditorEditTitle' );
    this.logFeature( 'textTitle - keyboard shortcut', '' );
    return { bRetVal: true, bModified: false };
};

/**
 * _shortcutMatch - Check to see if the event matches the shortcut
 * @param {Object} in_objEvent - Event to match.
 * @param {Object} in_objShortcut - Shortcut to check against
 * @returns {bool} true if match, false otw. 
 */
NoteText.prototype._shortcutMatch = function( in_objEvent, in_objShortcut )
{
	var bRetVal = ( ( TypeCheck.Undefined( in_objShortcut.keyCode ) || ( in_objShortcut.keyCode == in_objEvent.keyCode ) )
                 && ( TypeCheck.Undefined( in_objShortcut.shiftKey ) || ( in_objShortcut.shiftKey == in_objEvent.shiftKey ) )
                 && ( TypeCheck.Undefined( in_objShortcut.ctrlKey ) || ( in_objShortcut.ctrlKey == in_objEvent.ctrlKey ) )
                 && ( !in_objShortcut.stateCheck || in_objShortcut.stateCheck.call( this ) ) );
                 
	return bRetVal;
};

/**
 * _handleShortcutReturn - Handle the return values of the shortcut.  
 * 	Will set the RaiseEdit flag and cancel the event if needed.
 * @param {variant} in_vReturn - either a boolean or an object.
 * @param {Object} in_objEvent - either a boolean or an object.
 * @returns {Object} with bCancelEvent which indicates whether to cancel the event,
 * 	and bRaiseEdit which indicates whether to raise the edit flag.
 */
NoteText.prototype._handleShortcutReturn = function( in_vReturn, in_objEvent )
{
	var strRetValType = typeof( in_vReturn );
	var bCanceEvent = false;
	
	if( 'boolean' == strRetValType )
	{   // Got a boolean back.  
	    //      Cancel the event if we got true.
	    bCancelEvent = in_vReturn;
	    this.m_bRaiseEdit = true;
	} // end if
	else if( ( 'object' == strRetValType )
	      && ( 'undefined' != typeof( in_vReturn.bRetVal ) ) )
	{   // Got a return object back, check the bCancelEvent and the bCancelEdit
	    // for hints on what we should do.
	    bCancelEvent = in_vReturn.bRetVal;
	    this.m_bRaiseEdit = in_vReturn.bModified;
	} // end if

	if( bCancelEvent )
    {
		in_objEvent.cancelEvent();                
    } // end if

	/* decrement the count by one on every key typed.  this way we "forget" that
	*  we entered a CTRL-H.  So, if we type CTRL-H, then A, and then 1, we get 1 and no
	*/
	if( this.m_bHeadingCtrlKeyTyped > 0 )
	{
        this.m_bHeadingCtrlKeyTyped--;
	} // end if
	    
	return { bCancelEvent: bCancelEvent, bRaiseEdit: this.m_bRaiseEdit };
};

/**
* Responds to keypresses in the note editing iframe
* @param {Object} in_objEvent - Key event
*/
NoteText.prototype.OnKeyDownHandler = function( in_objEvent )
{
	if ( false == this.m_bEditable )
	{
        in_objEvent.cancelEvent();
		return;
	} // end if

    if( true == this.m_bHasSearchHighlights )
    {
        this.textCleanXML();
    } // end if
    
    for( var nIndex = 0, aShortcut, bHandled = false; ( false == bHandled ) 
      			&& ( aShortcut = NoteText.caShortcutConfig[ nIndex ] ); ++nIndex )
    {
        if( ( bHandled = this._shortcutMatch( in_objEvent, aShortcut ) ) 
         && aShortcut.handler ) // check for a handler because we may have throwaway entries.
        {   
            // If we just do a sShortcut.handler(), the scope becomes the 
        	//		shortcut config.
            var vRetVal = aShortcut.handler.apply( this, [ in_objEvent ] );
            this._handleShortcutReturn( vRetVal, in_objEvent );
        } // end if
    } // end for
    	
    this._resizeTextArea();
};


/**
* OnKeyUpHandler - we have to notify the parent on OnKeyUp because after OnKeyDown,
*   the iframe document does not have the new key added to it yet.
*/
NoteText.prototype.OnKeyUpHandler = function( in_objEvent )
{
	if ( false == this.m_bEditable )
	{
        in_objEvent.cancelEvent();
		return;
	} // end if
    
    if( true == this.m_bRaiseEdit )
	{
	    this.Raise( 'noteEditorEdited' );
	} // end if-else
};

NoteText.prototype.OnPaste = function( in_objEvent )
{
    this.Raise( 'noteEditorEdited' );
};

/**
* queryCommandEnabled - query the browser if an editor command is supported and enabled.
*   returns true if supported and enabled, false otw.
* @param {String} in_strCommand  - Editor command to check.
*/
NoteText.prototype.queryCommandEnabled = function( in_strCommand )
{
    var bRetVal = false;
    
    try 
    {
        bRetVal = this.getDocument().queryCommandEnabled( in_strCommand );
    } catch ( error ) {
        switch( error.value )
        {   // Could be the window not ready, the document not ready, etc.
            case NoteText.NoteTextEC.WINDOW_NOT_READY:
            case NoteText.NoteTextEC.DOCUMENT_NOT_READY:
                SysError.raiseError( 'NoteText.prototype.queryCommandEnabled', 
                    ErrorLevels.eErrorType.ERROR, ErrorLevels.eErrorLevel.HIGH, 
                    error.message, error.value );
                break;
            default:    // Not enabled, no big deal.
/*                SysError.raiseError( 'NoteText.prototype.queryCommandEnabled', 
                    ErrorLevels.eErrorType.INFO, ErrorLevels.eErrorLevel.LOW, 
                    in_strCommand + ' command not supported.', 
                    NoteText.NoteTextEC.COMMAND_NOT_SUPPORTED );
                    */
                break;
        } // end switch
    } // end try-catch
    
    return bRetVal;    
};


/**
* execCommand - execute a command on the editor and cancels event if successful.  
*   Returns true if the command is supported and enabled, false otw.
* @param {String} in_strCommand  - editor command to execute
* @param {String} in_strValue  (optional) - value to pass to execCommand.
*/
NoteText.prototype.execCommand = function( in_strCommand, in_strValue )
{
    Util.Assert( TypeCheck.String( in_strCommand ) );
    Util.Assert( in_strCommand.length > 0 );
    
    var bRetVal = false;
    if( true == this.queryCommandEnabled( in_strCommand ) )
    {   // if we pass in a value, we are all good, if not we must pass null
        var strValue = TypeCheck.String( in_strValue ) ? in_strValue : null;
        
        try 
        {
            this.getDocument().execCommand( in_strCommand, false, strValue ); 
            bRetVal = true;
        } catch ( error ) { 
            switch( error.value )
            {
                // Could be the window not ready, the document not ready, etc.
                case NoteText.NoteTextEC.WINDOW_NOT_READY:
                case NoteText.NoteTextEC.DOCUMENT_NOT_READY:
                    SysError.raiseError( 'NoteText.prototype.execCommand', 
                        ErrorLevels.eErrorType.ERROR, ErrorLevels.eErrorLevel.HIGH, 
                        error.message, error.value );
                    break;
                default:
                    SysError.raiseError( 'NoteText.prototype.execCommand', 
                        ErrorLevels.eErrorType.INFO, ErrorLevels.eErrorLevel.LOW, 
                        in_strCommand + ': browser claims command supported but failed.', 
                        NoteText.NoteTextEC.COMMAND_FAILURE );
                    break;        
            } // end switch
        } // end try-catch
        	    
        this.m_bUpdateSize = true;        
    } // end if
    
    return bRetVal;
};



/**
* _showPopup - Display a popup for the note text.
* @param {Function} in_fncSubmit - Function to call on submit.
* @param {Function} in_fncCancel - Function to call on cancel.
* @param {String} in_strHeader - Header to place in popup.
* @param {String} in_strValue (optional) - Value to place in the box.  
*   If none given, use '' (empty string)
*/
NoteText.prototype._showPopup = function( in_fncSubmit, in_fncCancel, in_strHeader, in_strValue )
{
    Util.Assert( TypeCheck.Function( in_fncSubmit ) );
    Util.Assert( TypeCheck.Function( in_fncCancel ) );
    Util.Assert( TypeCheck.String( in_strHeader ) );
    Util.Assert( 0 < in_strHeader.length );
    
    var strValue = in_strValue || '';
    
    /* The PopupLocation has to be in relation to the application window, that is the
    *   event location in relation to the current document, added to the current documents
    *   location in relation to the upper level window
    */
    var me=this;
    var objPopupLocation = Position.cumulativeOffset( this.m_objDomContainer );
    objPopupLocation[ 0 ] += 30;
    objPopupLocation[ 1 ] += 30;
    
    // Use the setTimeout in these two so we have time to put the focus back in the note, 
    //  otherwise in IE a lot of the execCommand commands will fail and our range is in 
    //  the main document    
    var fncSubmit = function( in_strValue )
    {   
        this._popupClose();
        setTimeout( function() { in_fncSubmit.apply( me, [ in_strValue ] ); }, 100 );
    };
        
    var fncCancel = function() 
    {
        this._popupClose();
        setTimeout( function() { in_fncCancel.apply( me ); }, 100 );
    };
    
    this.RegisterListener( 'textinputsubmit', this.m_objPopup.m_strMessagingID, fncSubmit );
    this.RegisterListener( 'textinputcancelled', this.m_objPopup.m_strMessagingID, fncCancel );

    this.m_objPopup.setHeader( in_strHeader );
    this.m_objPopup.setValue( strValue );
    this.m_objPopup.show( objPopupLocation );    
};

NoteText.prototype._popupClose = function( in_strValue )
{
    this.focus();
    this.UnRegisterListener( 'textinputcancelled', this.m_objPopup.m_strMessagingID );
    this.UnRegisterListener( 'textinputsubmit', this.m_objPopup.m_strMessagingID );
};


/**
* getSelection - gets the current selection from the document.
* returns the selection
*/
NoteText.prototype.getSelection = function()
{
	var objDocument = this.getDocument();
	var objSelection = DOMRange.getSelection( objDocument );
    return objSelection;
};

NoteText.prototype.createRange = function()
{
    var objDocument = this.getDocument();
	var objRange = undefined; 
    try 
    {   // sometimes mozilla does and blows us up.
        if( objDocument.createRange )
        {   // W3C
            objRange = objDocument.createRange();
        } // end if
        else if( objDocument.body.createTextRange )
        {   // IE
            objRange = objDocument.body.createTextRange();
        } // end if
        
        if( objRange )
        {   // Make sure we have a range before doing anything with it.
            DOMRange( objRange, this.getDocument() );
        } // end if
    } // end try
    catch( e )
    {
        SysError.raiseError( 'NoteText.createRange', ErrorLevels.eErrorType.EXCEPTION, 
            ErrorLevels.eErrorLevel.LOW, e.description || e.message || '' );
    } // end try-catch
    
    return objRange;
};

/**
* getRange - Gets the range for a selection
*   returns the range
* @param {Object} in_objSelection  (optional) - selection to get range for.  If no selection
*       given, get the current document selection, if not found (window hidden), return undefined;
*/
NoteText.prototype.getRange = function()
{
    var objSelection = this.getSelection();
	var objRange = undefined; 
    try 
    {   // sometimes mozilla does and blows us up.
        if( objSelection.getRangeAt )
        {   // W3C
            objRange = objSelection.getRangeAt( 0 );
        } // end if
        else
        {   // IE
	        objRange = objSelection.createRange();
	        if( objRange.length )
	        {   // Keep control ranges out of this!
	            objRange = undefined;
	        } // end if
        } // end if
        
        if( objRange )
        {   // Make sure we have a range before doing anything with it.
            DOMRange( objRange, this.getDocument() );
        } // end if
    } // end try
    catch( e )
    {
        SysError.raiseError( 'NoteText.getRange', ErrorLevels.eErrorType.EXCEPTION, 
            ErrorLevels.eErrorLevel.LOW, e.description || e.message || '' );
    } // end try-catch
    
    return objRange;
};



/**
* _currentRangeIsLinkable - returns whether we can make a link out of the current
*   range.  Returns true if yes, returns false if range is inside of a link 
*   currently or no text is selected.
*/
NoteText.prototype._currentRangeIsLinkable = function()
{
    var objRange = this.getRange();
    // We go through this big thing because IE blows up on things like images.
    var bRetVal = ( objRange && objRange.toString && objRange.toString() && 
        ( objRange.toString().length > 0 ) && 
        ( null == this._getURLAtRange( objRange ) ) );
    return bRetVal;
};

/**
* _getURLAtRange - retrieves the URL at the current range if one exists.
*   Returns string with URL if exists, returns null otw.
* @param {Object} in_objRange  - Range to check.
*/
NoteText.prototype._getURLAtRange = function( in_objRange )
{
    Util.Assert( in_objRange );
    
	var objElement = in_objRange.getElement();
    var bTagElement = DOMElement.isTagType( objElement, "A" );
    var vRetVal = null;
        
	if( false == bTagElement )
	{   // for mozilla in case we didn't select the entire text.
	    objElement = in_objRange.parentElement();
	    bTagElement = DOMElement.isTagType( objElement, "A" );
    } // end if
    
    if( true == bTagElement )
    {
        vRetVal = objElement.href;
    } // end if
    
    return vRetVal;
};

/**
* _getURLAtCurrentRange - Gets the URL at thet currently selected range.
*   Returns a string of the URL if successful, null otw.
*/
NoteText.prototype._getURLAtCurrentRange = function()
{
	var objRange;
	var vRetVal = null;

	if( objRange = this.getRange() )
	{
       vRetVal = this._getURLAtRange( objRange );
    } // end if
    
    return vRetVal;
};

/**
* _openLinkAtCurrentRange - Opens a link, if possible, from the current range.
* returns true if successful, false otw.
*/
NoteText.prototype._openLinkAtCurrentRange = function()
{
	/* check if link was clicked */
	var strHref = this._getURLAtCurrentRange();
    var bRetVal = false;
    
    if( strHref )
    {
        window.open( strHref );
		bRetVal = true;
    } // end if
    
    return bRetVal;
};



/**
*format:
*   [ keyCode: value, ctrlKey: value, shiftKey: value, altKey: value, stateCheck: value, handler: value ]
* NOTE: Work down the list from specific to general to make sure that the shortcut is
*   not overridden by another entry.
* NOTE2: This has to come after all the NoteText functions or else it will not work in IE.
*/
NoteText.caShortcutConfig = [
        { keyCode: KeyCode.ESC,      handler: NoteText.prototype.textEscape },
        { keyCode: KeyCode.TAB,      ctrlKey: false, shiftKey: false, altKey: false, handler: NoteText.prototype.textIndent },
        { keyCode: KeyCode.TAB,      ctrlKey: false, shiftKey: true,  altKey: false, handler: NoteText.prototype.textOutdent },
        { keyCode: KeyCode.TAB,      ctrlKey: false, shiftKey: false, altKey: true,  handler: NoteText.prototype.textInsertOutline },
        { keyCode: KeyCode.TAB,      ctrlKey: false, shiftKey: true,  altKey: true,  handler: NoteText.prototype.textInsertBullets },
        { keyCode: KeyCode.Q,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textInsertOutline },
        { keyCode: KeyCode.Q,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textInsertBullets },
        { keyCode: KeyCode.ENTER,    ctrlKey: false, shiftKey: true,  altKey: false, handler: NoteText.prototype.textParagraph },
        { keyCode: KeyCode.ENTER,    ctrlKey: false, shiftKey: false, altKey: false, handler: NoteText.prototype.textEnter },
        { keyCode: KeyCode.EQUAL,    ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textIncreaseFontSize },
        { keyCode: KeyCode.MINUS,    ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textDecreaseFontSize },
        { keyCode: KeyCode.B,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textBold },
        { keyCode: KeyCode.C,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textCleanXML },
/*        { keyCode: KeyCode.C,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textCopy },
        { keyCode: KeyCode.D,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textDelete },*/
        { keyCode: KeyCode.E,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: function() { this.textTranslate( "es", "en" ); return true; } },
        { keyCode: KeyCode.E,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.keyMenu },
/*        { keyCode: KeyCode.F,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textSearch },*/
        { keyCode: KeyCode.F,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textHighlightInput },
        { keyCode: KeyCode.H,        ctrlKey: true,  shiftKey: false, altKey: false, handler: function() { this.m_bHeadingCtrlKeyTyped = 2; return true; } },
        { keyCode: KeyCode.I,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textItalics },
        { keyCode: KeyCode.L,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textLink },
        { keyCode: KeyCode.P,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textPrint },
        { keyCode: KeyCode.R,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textReload },
        { keyCode: KeyCode.R,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textRemoveFormat },
        { keyCode: KeyCode.S,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: function() { this.textTranslate( "en", "es" ); return true; } },
        { keyCode: KeyCode.S,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textStrikeThrough },
        { keyCode: KeyCode.T,        ctrlKey: true,  shiftKey: true,  altKey: false, handler: NoteText.prototype.textTag }, 
/*        { keyCode: KeyCode.T,        ctrlKey: true,  shiftKey: false, altKey: true,  handler: NoteText.prototype.textTitle },  */
        { keyCode: KeyCode.U,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textUnderline },
        /*{ keyCode: KeyCode.V,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textPaste },
        { keyCode: KeyCode.X,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textCut },*/
        { keyCode: KeyCode.Y,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textRedoRequest },
        { keyCode: KeyCode.Z,        ctrlKey: true,  shiftKey: false, altKey: false, handler: NoteText.prototype.textUndoRequest },
        { keyCode: KeyCode.KC0,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: NoteText.prototype.textRemoveHeading },
        { keyCode: KeyCode.KC1,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 1 ); } },
        { keyCode: KeyCode.KC2,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 2 ); } },
        { keyCode: KeyCode.KC3,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 3 ); } },
        { keyCode: KeyCode.KC4,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 4 ); } },
        { keyCode: KeyCode.KC5,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 5 ); } },
        { keyCode: KeyCode.KC6,      ctrlKey: false,  shiftKey: false, altKey: false, stateCheck: function() { return this.m_bHeadingCtrlKeyTyped; }, handler: function() { return this.textHeading( 6 ); } },
        { keyCode: KeyCode.CTL,             handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.SHIFT,           handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.ALT,             handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.LEFT_ARROW,      handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.UP_ARROW,        handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.RIGHT_ARROW,     handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.DOWN_ARROW,      handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.PAGE_UP,         handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.PAGE_DOWN,       handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.END,             handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.HOME,            handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.INS,             handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.HOME,            handler: NoteText.prototype.textApplyNoModify },
        { keyCode: KeyCode.ESC,             handler: NoteText.prototype.textApplyNoModify },
        /* the catch all! MUST BE LAST! */
        { handler: NoteText.prototype.textApplyModify }

];



/**
* _clickedOnCheckbox - This checks to see if we clicked on the left-padding
*   area of the list item, which is where we are assuming we put the checkbox.
* @param {Object} in_objEvent - event to check for mouse coordinates
* @returns {bool} - true if click inside left margin area, false otw.
*/
NoteText.prototype._clickedOnCheckbox = function( in_objEvent )
{
    // The basic idea is this, get the item we clicked on, get the left-padding size.
    //  Find where we clicked on the document.
    //  Find where the element is on the document.
    //  See if the click is inside the lefthand border of the element + it's padding.
    var bRetVal = false;
    var objListItem = in_objEvent.target;
    var nCheckboxPaddingWidth = parseInt( Element.getStyle( objListItem, 'padding-left' ), 10 );
    var objElementPosition = Position.cumulativeOffset( objListItem );  
    var objEventPosition = DOMEvent.documentCoordinates( in_objEvent );
    
    bRetVal = ( ( objEventPosition.x >= objElementPosition[0] )
             && ( objEventPosition.x <= ( objElementPosition[0] + nCheckboxPaddingWidth ) ) );
    
    return bRetVal;
};

NoteText.prototype.textToggleCheckbox = function( in_objEvent )
{
    var objElement = in_objEvent.target;
    
    if( ( true == DOMElement.isTagType( objElement, 'li' ) )
    &&  ( true == DOMElement.ancestorHasClassName( objElement, 'uberCheckboxList' ) ) 
    &&  ( true == this._clickedOnCheckbox( in_objEvent ) ) )
    {
        if( true == DOMElement.hasClassName( objElement, 'checkboxSelected' ) )
        {
            DOMElement.addClassName( objElement, 'checkboxUnselected' );
            DOMElement.removeClassName( objElement, 'checkboxSelected' );
        } // end if
        else
        {
            DOMElement.addClassName( objElement, 'checkboxSelected' );
            DOMElement.removeClassName( objElement, 'checkboxUnselected' );
        } // end if-else
        
        this.Raise( 'noteEditorEdited' );
    } // end if
};

NoteText.prototype.textInsertCheckbox = function( in_objEvent )
{
    this.textInsertBullets( 'uberCheckboxList' );
};

/**
* setActive - sets the active flag to let the note know whether it is
*   currently active and should do text highlights or not.
* @param {bool} in_bActive - active flag.
*/
NoteText.prototype.setActive = function( in_bActive )
{
    Util.Assert( TypeCheck.Boolean( in_bActive ) );
    
    this.m_bActive = in_bActive;
};

NoteText.prototype._saveCursorPos = function()
{
    var objRetVal = undefined;
    
    if( true === BrowserInfo.ie )
    {
        var nStartPoint = 0, nEndPoint = 0;
        var objDocument = this.getDocument();

        if( objDocument )
        {
            var objStart = objDocument.selection.createRange();
            if( objStart.duplicate )
            {   // Only want text range objects, otherwise we have a 
                // control range and this doesn't work.  AAAAAAAAGH
                var objEnd = objStart.duplicate();
                
                objStart.collapse( true );
                objEnd.collapse( false );
                
                var objBookmark = objStart.getBookmark();
                nStartPoint = objBookmark.charCodeAt(2) - 2;

                objBookmark = objEnd.getBookmark();
                nEndPoint = objBookmark.charCodeAt(2) - 2; 
            } // end if
        } // end if
        
		objRetVal = { startoffset: nStartPoint, length: nEndPoint - nStartPoint };
    } // end if
    else
    {
        this._textWrapRangeWithTag( 'span', 'uberCursorBookmark' );
    } // end if-else
    
    return objRetVal;    
};

NoteText.prototype._removeSavedCursorPos = function( in_objElement )
{
    var objElement = in_objElement || this.getDocument().getElementById( 'uberCursorBookmark' );
    
    if( objElement )
    {
        DOMElement.unwrap( objElement, true );
    } // end if
};

NoteText.prototype._restoreSavedCursorPos = function( in_objBookmark )
{
    if( true === BrowserInfo.ie )
    {
        Util.Assert( in_objBookmark );
        var objDocument = this.getDocument();
        if( objDocument && objDocument.body )
        {
		    var objRange = objDocument.body.createTextRange();
		    objRange.collapse( true );
		    objRange.moveStart( 'character', in_objBookmark.startoffset );
		    objRange.moveEnd( 'character', in_objBookmark.length);
            objRange.select();
        } // end if
    } // end if
    else
    {   // W3C
        var objElement = this.getDocument().getElementById( 'uberCursorBookmark' );

        if( objElement )
        {
            var objSelection = this.getSelection();
            objSelection.removeAllRanges();
            objSelection.selectAllChildren( objElement );

            this._removeSavedCursorPos( objElement );
        } // end if
    } // end if-else
    
    this.Raise( 'noteEditorEdited', [ true ] );
};

NoteText.prototype.getUndo = function()
{
    var objBookmark = this._saveCursorPos();
    var strXML = this.getXML();
    var objRetVal = { strXML: strXML, bookmark: objBookmark };
    
    this._removeSavedCursorPos();
    
    return objRetVal;
};

NoteText.prototype.setUndo = function( in_vUndoInfo )
{
    var me=this;
    var objFuncCont = new FunctionContainer( this._restoreSavedCursorPos, this, undefined, arguments );
    // forces this to happen just after the setXML so that we actually make it on to the the ready queue.
    setTimeout( function() { me.m_aReadyQueue[ me.m_aReadyQueue.length ] = objFuncCont; }, 1 );    
    this.setXML( in_vUndoInfo.strXML );
};
