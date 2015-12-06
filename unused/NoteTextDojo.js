

function NoteText()
{
    this.m_objEditor = undefined;
    
    NoteText.Base.constructor.apply( this );
};
UberObject.Base( NoteText, Display );
NoteText.nEditor = 0;
(function() {
    Util.Assert( dojo, 'Dojo Library not loaded' );

/*	dojo.require("dijit.form.Form");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit.form.ComboBox");
	dojo.require("dijit.form.FilteringSelect");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.form.DateTextBox");
	dojo.require("dijit.form.CurrencyTextBox");
	dojo.require("dijit.form.NumberSpinner");
	dojo.require("dijit.form.Slider");
	dojo.require("dijit.form.Textarea");*/
	dojo.require("dijit.Editor");
	dojo.require("dijit._editor.plugins.LinkDialog");
	dojo.require("dijit._editor.plugins.FontChoice");
	dojo.require("dijit._editor.plugins.TextColor");
	/*dojo.require('dijit.layout.AccordionContainer');
	dojo.require("dijit.form.Button");
	
	dojo.require("dojo.data.ItemFileReadStore");
	dojo.require("dojo.parser");	// scan page for widgets and instantiate them        
	*/
})();

Object.extend( NoteText.prototype, {
    loadConfigParams: function()
    {
        var ConfigParams = {
            m_strTemplate: { type: 'string', bRequired: false },        // We don't NEED a template for this
            m_objParentElement: { type: 'object', bRequired: true },
            m_bEditable: { type: 'boolean', bRequired: false, default_value: true },
            m_objPopupElement: { type: 'object', bRequired: false },
            m_abProvides: { type: 'object', bReqired: false, default_value: 
                { nativeundo: true } }
        };

        NoteText.Base.loadConfigParams.apply( this );
        Util.union( this.m_objConfigParams, ConfigParams, true );
    },
    
    init: function( in_objConfig )
    {
        Util.Assert( in_objConfig );
        
        var vRetVal = this.initWithConfigObject( in_objConfig );
        
        return vRetVal;
    },
    
    childInitialization: function()
    {   
        this.m_objDomContainer.innerHTML = '<p />  ';
        this.m_objDomContainer.id = this.m_strMessagingID;
        
      //  if( NoteText.nEditor < 2 )
        {
            /*dojo.addOnLoad( this, '_domCreate' );*/
        } // end if
        this._domCreate();
        NoteText.nEditor++;
        
        NoteText.Base.childInitialization.apply( this );
    },

    RegisterMessageHandlers: function()
    {
        this.RegisterListener( 'notedomready', this.m_strMessagingID, this._domReady ); 
        NoteText.Base.RegisterMessageHandlers.apply( this );
    },

    teardownDom: function()
    {
        var strID = this.$().id;

        NoteText.Base.teardownDom.apply( this );
    },
        
    _domCreate: function()
    {
        var me=this;
        var objEditor = new dijit.Editor( {}, this.m_objDomContainer );  
        if( objEditor.onLoadDeferred.fired < 0 )
        {
            objEditor.onLoadDeferred.addCallback( function( in_nResult ) {
                me._domReady( objEditor );
                return in_nResult;
            } );
        } // end if
        else
        {
            this._domReady( objEditor );
        }
    },
    
    _domReady: function( in_objEditor )
    {
        this.m_bDomReady = true;
        this.m_objEditor = in_objEditor;

        var me=this;
        dojo.connect( in_objEditor, 'onKeyUp', this, 'OnKeyUp' );
        dojo.connect( in_objEditor, 'onMouseMove', this, 'OnMouseMove' );
        
        if( this.m_strSavedXML )
        {
            this.setXML( this.m_strSavedXML );
        } // end if
        
        var me=this;
        
    },
    
    OnKeyUp: function( in_objEditor, in_objEvent )
    {
        this.Raise( 'noteEditorEdited' );
    },
    
    OnMouseMove: function( in_objEditor, in_objEvent )
    {
        //this.Raise( 'onmousemove'
        var b=true;
        
    },
    
    OnEmail: function( in_objEditor )
    {
        this.Raise( 'noteEditorEmail' );
    },
    
    setXML: function( in_strXML )
    {
        Util.Assert( TypeCheck.String( in_strXML ) );
        
        if( true == this.m_bDomReady )
        {
            var strRetVal = this.m_objEditor.setValue( in_strXML || this.m_strSavedXML );
            this.m_strSavedXML = null;
        } // end if
        else
        {
            this.m_strSavedXML = in_strXML;
        } // end if-else
    },
    
    getXML: function()
    {
        var strRetVal = this.m_objEditor.getValue( true );
        return strRetVal;    
    },
    
    setActive: function( in_bActive )
    {
        Util.Assert( TypeCheck.Boolean( in_bActive ) );
        
        this.m_bActive = in_bActive;
    },
    
    focus: function()
    {
        var strID = this.$().id;

    },
    
    cancelFocus: function()
    {
    },
    
    show: function()
    {
        NoteText.Base.show.apply( this );
    },
    
    hide: function()
    {
        NoteText.Base.hide.apply( this );
    },
    
    _resizeTextArea: function( in_nInitialTimeout, in_bOverrideStep )
    {
        var nTimeout = 500;
        var me=this;
        
/*        if( this.m_objTextResizeTimer )
        {   // clear the old one, wait for the new.
            clearTimeout( this.m_objTextResizeTimer );
        } // end if
        
        this.m_objTextResizeTimer = setTimeout( function() { me.m_objEditor.resizeToContent(); }, nTimeout );
        */
    }
    

});

