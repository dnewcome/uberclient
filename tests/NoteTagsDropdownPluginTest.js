/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTest()
{
    try
    {
        fireunit.log( 'begin NoteTagsDropdownPlugin Test' );
    } catch(e)
    {
        document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        return;
    }
    var objPlugin, objPlugged, objMenu, objMessages;
    var aBindings;
    var strPluginID, strPluggedID, strMenuID;
    
    setup();
    checkRequiredConfigParameters();
    checkRequiredMessages();
    
    simulateActionMessages();
    
    
    
    
    
    
    
    function setup()
    {
        objPlugin = new NoteTagsDropdownPlugin();
        fireunit.ok( objPlugin.m_bConstructorChained, 'constructors all chained together' );
        
        objPlugin.init();
        fireunit.ok( objPlugin.m_bInitChained, 'inits all chained together' );
        strPluginID = objPlugin.m_strMessagingID;

        objPlugged = objPlugin.getPlugged();
        strPluggedID = objPlugged.m_strMessagingID;
        
        objPlugged.m_objNote = new Function();
        objPlugged.m_objNote.getBindings = function() {
            return aBindings;
        };
        
        objMenu = new UberObject();
        objMenu.init();

        // Set it manually for now.
        objPlugin.m_objMenu = objMenu;

        // Add a couple of functions        
        objMenu.selectItem = function( in_strItemID ) {
            this.m_aobjSelectedItems[ in_strItemID ] = true;
            this.m_bSelectItemCalled = true;
        };
        objMenu.isSelected = function( in_strItemID ) {
            return !!this.m_aobjSelectedItems[ in_strItemID ]
        };
        objMenu.clearState = function()
        {
            this.m_aobjSelectedItems = {}; 
            this.m_bSelectItemCalled = false;
            this.m_bSupress = undefined;
        };
        
        // Test the functions
        objMenu.clearState();
        objMenu.selectItem( 'blue' );
        objMenu.selectItem( 'green' );
        fireunit.ok( objMenu.isSelected( 'blue' ), 'selectItem blue found' );
        fireunit.ok( objMenu.isSelected( 'green' ), 'selectItem green found' );

        objMenu.clearState();
        fireunit.ok( !objMenu.m_bSelectItemCalled, 'clearState m_bSelectItemCalled' );
        
        strMenuID = objMenu.m_strMessagingID;
        
        objMessages = {
            menushow: { from: strMenuID, test: testMenuShow }
        };
        
    };
    
    function checkRequiredConfigParameters()
    {
        /** we have to check hasOwnProperty of the prototype because our test UberObject has one **/
        fireunit.ok( objPlugin.__proto__.hasOwnProperty( 'loadConfigParams' ), 'loadConfigParams exists' );
        fireunit.ok( objPlugin.m_bLoadConfigParamsChained, 'loadConfigParams all chained together' );
        fireunit.ok( objPlugin.m_bExtendConfigParamsCalled, 'm_bExtendConfigParamsCalled called, default options exist' );        
        fireunit.ok( objPlugin.hasOwnProperty( 'm_objMenu' ), 'm_objMenu item expected' );
    };
    
    
    function checkRequiredMessages()
    {
        fireunit.ok( objPlugin.__proto__.hasOwnProperty( 'RegisterMessageHandlers' ), 'RegisterMessageHandlers exists' );
        fireunit.ok( objPlugin.m_bRegisterMessageHandlersChained, 'RegisterMessageHandlers chained together' );

        objPlugin.testExpectedListeners( objMessages );
        
    };    
    
    
    
    function testMenuShow( in_strMessageRaised )
    {
        // Try a fake menu first 
        raiseMessage( in_strMessageRaised, [ { fakemenu: null } ] );
        objPlugged.testRaisedMessages( {}, 'testMenuShow' );
        fireunit.ok( !objMenu.m_bSelectItemCalled, 'testMenuShow: selectItem not called' );
        objMenu.clearState();
        
        // Try the real menu
        raiseMessage( in_strMessageRaised, [ objMenu ] );
        objPlugged.testRaisedMessages( {}, 'testMenuShow' );
        fireunit.ok( !objMenu.m_bSelectItemCalled, 'testMenuShow: selectItem not called' );
        objMenu.clearState();
        
        // Add some bindings!
        aBindings = [ 'tag1', 'tag2', 'tag3' ];
        fireunit.ok( TypeCheck.Array( objPlugged.m_objNote.getBindings() ), 'getBindings returns array' );
        
        raiseMessage( in_strMessageRaised, [ objMenu ] );
        objPlugged.testRaisedMessages( {}, 'testMenuShow' );
        fireunit.ok( objMenu.m_bSelectItemCalled, 'testMenuShow: selectItem called' );

        fireunit.ok( objMenu.isSelected( 'tag1' ), 'testMenuShow: selectItem called for tag1' );
        fireunit.ok( objMenu.isSelected( 'tag2' ), 'testMenuShow: selectItem called for tag2' );
        fireunit.ok( objMenu.isSelected( 'tag3' ), 'testMenuShow: selectItem called for tag3' );
        fireunit.ok( !objMenu.isSelected( 'tag4' ), 'testMenuShow: selectItem not called for tag4' );
        objMenu.clearState();

        
        // Add some new bindings!
        aBindings = [ 'tag3', 'tag4', 'tag5' ];
        fireunit.ok( TypeCheck.Array( objPlugged.m_objNote.getBindings() ), 'getBindings returns array' );
        
        raiseMessage( in_strMessageRaised, [ objMenu ] );
        objPlugged.testRaisedMessages( {}, 'testMenuShow' );
        fireunit.ok( objMenu.m_bSelectItemCalled, 'testMenuShow: selectItem called' );

        fireunit.ok( !objMenu.isSelected( 'tag1' ), 'testMenuShow: selectItem called for tag1' );
        fireunit.ok( !objMenu.isSelected( 'tag2' ), 'testMenuShow: selectItem called for tag2' );
        fireunit.ok( objMenu.isSelected( 'tag3' ), 'testMenuShow: selectItem called for tag3' );
        fireunit.ok( objMenu.isSelected( 'tag4' ), 'testMenuShow: selectItem called for tag4' );
        fireunit.ok( objMenu.isSelected( 'tag5' ), 'testMenuShow: selectItem called for tag5' );
        fireunit.ok( !objMenu.isSelected( 'tag6' ), 'testMenuShow: selectItem not called for tag6' );
        objMenu.clearState();

    };    
    
    
    
    function simulateActionMessages()
    {
        for( var strKey in objMessages )
        {
            var objConfig = objMessages[ strKey ];
            if( objConfig )
            {
                var fncTest = objConfig.test;
                if( fncTest )
                {
                    fncTest( strKey );
                } // end if
            } // end if
        } // end for
    };

   
    function raiseMessage( in_strCausingMessage, in_aArguments )
    {
        var objConfig = objPlugin.getMessages()[ in_strCausingMessage ];
        var fncCallback = objConfig.listener, objContext = objConfig.context;
        
        objMenu.resetRaisedMessages();
        objPlugin.resetRaisedMessages();
        fncCallback.apply( objContext, in_aArguments || [] );
    };
    
    
        // Wait for asynchronous operation.
    setTimeout(function(){
        // Finish test
        fireunit.testDone();
    }, 1000);
};
