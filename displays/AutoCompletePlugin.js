
function AutoCompletePlugin()
{
    this.m_aobjMatches = undefined;
    this.m_bTextEventCapable = undefined;
    
    AutoCompletePlugin.Base.constructor.apply( this );
}
UberObject.Base( AutoCompletePlugin, Plugin );

Object.extend( AutoCompletePlugin.prototype, {
    init: function()
    {
        AutoCompletePlugin.Base.init.apply( this, arguments );
        this.m_aobjMatches = [];
        
        try 
        {
            var objEvent = document.createEvent && document.createEvent( 'TextEvent' );
            this.m_bTextEventCapable = !!( objEvent && objEvent.initTextEvent );
        } // end try
        catch (e)
        {   // Opera blows up here.
            this.m_bTextEventCapable = false;
        } // end try-catch
    },
    
    loadConfigParams: function()
    {
        AutoCompletePlugin.Base.loadConfigParams.apply( this );
        this.extendConfigParams( {
            m_strInputSelector: { type: 'string', bRequired: true },
            m_fncMatchFinder: { type: 'function', bRequired: true },
            type: { type: 'string', bReqired: false, default_value: 'AutoCompletePlugin' }
        } );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListenerObject( { message: 'registerdomeventhandlers', 
	            listener: this.OnRegisterDomEventHandlers, context: this } );
        this.RegisterListenerObject( { message: 'insertlastautocomplete', 
	            listener: this.OnInsertLast, context: this } );
        this.RegisterListenerObject( { message: 'selectlastautocomplete', 
	            listener: this.OnSelectEntry, context: this } );
        	            
	    AutoCompletePlugin.Base.RegisterMessageHandlers.apply( this, arguments );
    },

    OnRegisterDomEventHandlers: function()
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );

        this.RegisterListenerObject( { message: 'onkeydown', from: objInputElement, 
                listener: this.OnKeyDown, context: this } );
        this.RegisterListenerObject( { message: 'onkeyup', from: objInputElement, 
                listener: this.OnKeyUp, context: this } );
    },
    
    /**
    * OnKeyDown - KeyDown handler - takes care of if there has been a tab or comma pressed while
    *   we are in the middle of auto-completion, it'll finish the auto-completion, and insert a comma.
    * @param {Object} in_objEvent - Event with the key
    */
    OnKeyDown: function( in_objEvent )
    {
        Util.Assert( in_objEvent );

        switch( in_objEvent.keyCode )
        {
            case KeyCode.TAB:
                // a tab only completes if there is a match
                if( this.m_aobjMatches.length )
                {   
                    this.OnSelectEntry();
                    this._startEntry();
                    in_objEvent.cancelEvent();
                } // end if
                break;
            case KeyCode.COMMA:
                // a comma always completes.
                this.OnSelectEntry();
                this._startEntry();
                in_objEvent.cancelEvent();
                break;
            default:
                break;
        }        
    },
    
    /**
    * OnKeyUp - keyup handler - Handles key presses.
    * @param {Object} in_objEvent - Event with the key
    */
    OnKeyUp: function( in_objEvent )
    {
        Util.Assert( in_objEvent );

        switch( in_objEvent.keyCode )
        {
            case KeyCode.BACKSPACE:
                // backspace shouild reset the last matches, but not display any matches.
                // Keep track of if we are directly after a backspace, because if not, we hit the
                //  down arrow we automatically go to the second match instead of the first.
                var astrItems  = this.getPlugged().$( this.m_strInputSelector ).value.split( ', ' );
                if( astrItems.length && astrItems[ astrItems.length - 1 ].length )
                {
                    this.m_aobjMatches = this._findMatches();
                    this.m_nCurrSelection = 0;
                    this.m_bAfterBackspace = true;
                } // end if
                else
                {   // say that we are restarting, do not put on a comma
                    this._startEntry( true );
                } // end if-else
                break;
            case KeyCode.SHIFT:
            case KeyCode.ALT:
            case KeyCode.CTL:
            case KeyCode.HOME:
            case KeyCode.END:
            case KeyCode.LEFT_ARROW:
            case KeyCode.RIGHT_ARROW:
                break;
            case KeyCode.UP_ARROW:
                if( this.m_aobjMatches && this.m_aobjMatches.length )
                {
                    this.m_nCurrSelection = this.m_nCurrSelection - 1;
                    if( -1 === this.m_nCurrSelection )
                    {
                        this.m_nCurrSelection = this.m_aobjMatches.length - 1;
                    } // end if
                    this._insertMatch();
                } // end if
                break;
            case KeyCode.DOWN_ARROW:
                if( this.m_aobjMatches && this.m_aobjMatches.length )
                {   
                    if( true == this.m_bAfterBackspace )
                    {   // this prevents us from going to the second match instead of the first.
                        this.m_nCurrSelection = -1;
                        this.m_bAfterBackspace = false;
                    } // end if-else
                    this.m_nCurrSelection = ( this.m_nCurrSelection + 1 ) % this.m_aobjMatches.length;
                    this._insertMatch();
                } // end if
                break;
            default:
                this.m_bAfterBackspace = false;
                this.m_aobjMatches = this._findMatches();
                if( this.m_aobjMatches && this.m_aobjMatches.length )
                {
                    this.m_nCurrSelection = 0;
                    this._insertMatch();
                } // end if
                break;
        } // end switch
    },

    /**
    * OnInsertLast - insert an item at the end of the list.  If the last "entry"
    *       is a partial completion, it will be replaced with item.
    * @param {String} in_strItem - item to insert.
    */
    OnInsertLast: function( in_strItem )
    {
        Util.Assert( TypeCheck.String( in_strItem ) );
        
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );
        var astrEntries = objInputElement.value.split( ', ' );
        if( astrEntries.length )
        {   // replace the last entry, rejoin elements.
            astrEntries[ astrEntries.length - 1 ] = in_strItem;
            objInputElement.value = astrEntries.join( ', ' );
        } // end if
        else
        {   // nothing in the box currently, insert the item directly.
            objInputElement.value = in_strItem;
        } // end if
        
        // reset this so that we do not raise the 'autocompletestart' with an entry.
        this.m_aobjMatches = this.m_nCurrSelection = this.m_strCurrEntry = undefined;
        this._startEntry();
    },

    /**
    * OnSelectEntry - Called when autocomplete finishes an entry.  Raises
    *   a 'autocompleteselect' message with the current selection if available,
    *   or an object with the name of the currently typed text.
    */
    OnSelectEntry: function()
    {
        var objCurrEntry = this.m_aobjMatches && this.m_aobjMatches.length
            ? this.m_aobjMatches[ this.m_nCurrSelection ] 
            : this.m_strCurrEntry ? { name: this.m_strCurrEntry } : {};
        
        this.getPlugged().Raise( 'autocompleteselect', [ objCurrEntry ], true );
        
        // reset this for now. 
        this.m_aobjMatches = this.m_nCurrSelection = this.m_strCurrEntry = undefined;
    },
        
    /**
    * _insertMatch - update the input with the current match.
    */    
    _insertMatch: function()
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );
        objInputElement.value = this.m_strInitialValue;
        
        // We have to append on the end of the string that we aren't already showing.
        var strCurrMatch = this.m_aobjMatches[ this.m_nCurrSelection ].name;
        var strCompletion = strCurrMatch.substr( this.m_strCurrEntry.length );
        
        // prepare for the coming DOM Level3 events
        if( this.m_bTextEventCapable )
        {   // we do this to cause Webkit based browsers to 'shift' their contents
            // so that we can see the end of the string and the cursor.
            this._dispatchTextEvent( objInputElement, strCompletion );
        } // end if
        else
        {
            objInputElement.value = objInputElement.value + strCompletion;
        } // end if
        
        this._setRange( this.m_strInitialValue.length, strCompletion.length );
    },
    
    /**
    * _setRange - selects the auto-completed text so we can overwrite it or continue on.
    * @param {Number} in_nOrigLength - the original text's length.
    * @param {Number} in_nCompletionLength - number of characters in auto completed text.
    */
    _setRange: function( in_nOrigLength, in_nCompletionLength )
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );

        if( objInputElement.createTextRange )
		{
			objRange = objInputElement.createTextRange();
            objRange.collapse( true );
            objRange.moveEnd( 'character', in_nOrigLength + in_nCompletionLength );
            objRange.moveStart( 'character', in_nOrigLength );
            objRange.select();		
		} // end if
		else
		{
            if( ! this.m_bTextEventCapable )                    
            {   // takes care of firefox, etc that doesn't do the TextEvent properly
                this._dispatchKeyboardEvent( objInputElement, 'keypress', KeyCode.SPACE );
                this._dispatchKeyboardEvent( objInputElement, 'keypress', KeyCode.BACKSPACE );
            } // end if
            
			objInputElement.setSelectionRange( in_nOrigLength, in_nOrigLength + in_nCompletionLength );
		} // end if-else
    },
    
    /**
    * @private
    * _findMatches - finds the matches for the current 'last' item inputted.
    *   This function comma separates the input elements value, then takes 
    *   the last item in the list and tries to find a match for it.
    *   It saves the initial value of the input element into this.m_strInitialValue,
    *   and saves the term we are matching on in this.m_strCurrEntry.
    * @returns {Array} - Array of matches.
    */
    _findMatches: function()
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );
        var aobjRetVal = [];

        this.m_strInitialValue = objInputElement.value;
        aTerms = this.m_strInitialValue.split( ',' );
        this.m_strCurrEntry = aTerms[ aTerms.length - 1 ].strip();
        
        if( this.m_strCurrEntry )
        {
            aobjRetVal = this.m_fncMatchFinder( this.m_strCurrEntry );
            if( aobjRetVal.length )
            {   // only raise this if there are matches.
                this.getPlugged().Raise( 'autocompletematch', [ aobjRetVal ] );
            } // end if
        } // end if

        return aobjRetVal;
    },
    
    _dispatchTextEvent: function( in_objElement, in_strText )
    {
        var objEvent = document.createEvent( 'TextEvent' );
        objEvent.initTextEvent('textInput', true, true, null, in_strText );
        in_objElement.dispatchEvent(objEvent);
    },
    
    _dispatchKeyboardEvent: function( in_objElement, in_strEventName, in_nKeyCode )
    {
        var objEvent = document.createEvent( 'KeyboardEvent' );
        var strFunction = TypeCheck.Function( objEvent.initKeyboardEvent ) ? 
            'initKeyboardEvent' : 'initKeyEvent';
            
        objEvent[ strFunction ]( in_strEventName, true, true, window, false, false, false, false, 
                in_nKeyCode, in_nKeyCode);
                
        in_objElement.dispatchEvent(objEvent);
    },

    /**
    * @private
    * _startEntry - Starts a new entry by inserting a ", " at the end of the input
    *   box and then moving the cursor to the end.
    * @param {bool} in_bSkipCommaAdd (optional) - if set to true, skip the comma add.
    */
    _startEntry: function( in_bSkipCommaAdd )
    {
        Util.Assert( TypeCheck.UBoolean( in_bSkipCommaAdd ) );
        if( !in_bSkipCommaAdd )
        {
            this._insertComma();
        } // end if
        
        // reset this or else if we backspace and delete everything after we had a matching entry,
        //  it will get selected if we call 'selectlastautocomplete'
        this.m_aobjMatches = this.m_nCurrSelection = undefined;
        this.getPlugged().Raise( 'autocompletestart' );
    },
    
    /**
    * @private
    * _insertComma - insert the ", " on the end of the string
    */
    _insertComma: function()
    {
        var objInputElement = this.getPlugged().$( this.m_strInputSelector );
        if( this.m_bTextEventCapable )                    
        {
            objInputElement.value = objInputElement.value;
            this._dispatchTextEvent( objInputElement, ', ' );
        } // end if
        else
        {
            objInputElement.value = objInputElement.value + ', ';
            // This puts the cursor at the end of the text so the box scrolls
            //  with the user input.
            this._setRange( objInputElement.value.length, 0 );
        } // end if-else
    }
} );
