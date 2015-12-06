/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTest()
{
    try
    {
        fireunit.log( 'begin AttachmentTagMenuTest' );
    } catch(e)
    {
        document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        return;
    }
    
    var objMenu, objExpectedMenuItems, objMetaTag;
    
    setup();
    testExpected();
    testMissing();
    testDownload();
    testRemove();
    
    function setup()
    {
        objMenu = new AttachmentTagMenu();
        objMenu.loadConfigParams();
        
        objMetaTag = new MetaTag();
        objMetaTag.setType( 'testmetatag' );
        objMetaTag.setMetaTagID( 'testmetatagid' );
        
        objExpectedMenuItems = {};
        objExpectedMenuItems[ _localStrings.DOWNLOAD ] = undefined;
        objExpectedMenuItems[ _localStrings.REMOVE_TAG ] = undefined;
    };
    
    function testExpected()
    {
        var bExtra = false;
        for( var nIndex = 0, objMenuItem; objMenuItem = objMenu.m_aobjMenuItems[ nIndex ]; ++nIndex )
        {
            var strKey = objMenuItem.string;//objMenuItem.callback;
            if( objExpectedMenuItems.hasOwnProperty( strKey ) )
            {
                if( objExpectedMenuItems[ strKey ] )
                {   // save this off for later
                    if( TypeCheck.Function( objMenuItem.displaycheck ) )
                    {
                        objDisplayChecks[ strKey ] = objMenuItem.displaycheck;
                    } // end if
                    else
                    {   /** FAIL, missing a display check **/
                        fireunit.ok( false, 'missing displaycheck for: ' + strKey );
                    } // end if
                } // end if
                
                fireunit.ok( TypeCheck.Defined( objMenuItem.callback ), 'callback exists for ' + strKey );
                objExpectedMenuItems[ strKey ] = objMenuItem;
            } // end if
            else
            {
                fireunit.ok( false, 'unrecognized menu item: ' + strKey );
                bExtra = true;
            } // end if-else
        } // end for
        fireunit.ok( !bExtra, 'looking for extra menu items' );
    };
    
    function testMissing()
    {
        var bMissing = false;
        for( var strKey in objExpectedMenuItems )
        {
            if( ! TypeCheck.Object( objExpectedMenuItems[ strKey ] ) )
            {
                fireunit.ok( false, 'missing menu item: ' + strKey );
                bMissing = true;
            } // end if
        } // end for
        
        fireunit.ok( !bMissing, 'looking for missing menu items' );
    };

    function testDownload()
    {
        var fncCallback = objExpectedMenuItems[ _localStrings.DOWNLOAD ].callback;
        
        fncCallback.apply( objMetaTag );
        
        var strRaisedMessage = objMetaTag.getRaisedMessage( 'requesttestmetatagdownload' );
        fireunit.ok( !!strRaisedMessage, 'download message raised' );
        fireunit.ok( strRaisedMessage == 'testmetatagid', 'message sent to correct address' );
    };
    
    function testRemove()
    {
        var fncCallback = objExpectedMenuItems[ _localStrings.REMOVE_TAG ].callback;

        /**
        * the menu uses window.confirm to ask the user whether they want to remove 
        *   the attachment.
        */
        var bConfirmRetVal = false;
        window.confirm = function() { return bConfirmRetVal; };

        fncCallback.apply( objMetaTag );
        fireunit.ok( !objMetaTag.getRemoveRequested(), 'user cancelled remove' );

        bConfirmRetVal = true;
        objMetaTag.resetRemoveRequested();
        fncCallback.apply( objMetaTag );
        fireunit.ok( objMetaTag.getRemoveRequested(), 'user wanted remove' );

    };
    
    
    // Wait for asynchronous operation.
    setTimeout(function(){
        // Finish test
        fireunit.testDone();
    }, 1000);
};
