
function UnitTest()
{
    try
    {
        fireunit.log( 'Starting MessageTest' );
    } catch(e)
    {
        document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        return;
    }

    
    
    var objMessages = undefined;
    var strSender1 = undefined;
    var strSender2 = undefined;
    var strReceiver1 = undefined;
    var strReceiver2 = undefined;
    var nSubscriberOneAllPubsNoArgs = 0;
    var nSubscriberOneAllPubsArgs = 0;
    var nSubscriberTwoAllPubsNoArgs = 0;
    var nSubscriberTwoAllPubsArgs = 0;
    var nSubscriberTwoSender1NoArgs = 0;
    var nSubscriberTwoSender1Args = 0;
    var nRaiseCount = 0;
    var vRaisedArgument = undefined;
        
    createObjects();
    createMessageIDs();

    registerListeners();
    checkCounts();

    vRaisedArgument = 'argument';
    raiseMessages( vRaisedArgument );
    checkCounts();

    vRaisedArgument = undefined;
    raiseMessages();
    checkCounts();
    checkCounts();

    vRaisedArgument = 'argument1';
    raiseMessages( vRaisedArgument );
    checkCounts();
    
    vRaisedArgument = undefined;
    RaiseForAddressMessages();
    checkCounts();

    vRaisedArgument = 'argument2';
    RaiseForAddressMessages( vRaisedArgument );
    checkCounts();

    vRaisedArgument = 'argument2';
    RaiseForAddressMessages( vRaisedArgument );
    RaiseForAddressMessages( vRaisedArgument );
    checkCounts();

    vRaisedArgument = undefined;
    raiseMessages();
    checkCounts();
    
    teardownObjects();
    
    // Wait for asynchronous operation.
    setTimeout(function(){
        // Finish test
        fireunit.testDone();
    }, 1000);
    
    function createObjects()
    {
        objMessages = new MessagePump();
        objMessages.init( new UniqueIDGenerator( "test" ) );
    };

    function createMessageIDs()
    {
        strSender1 = objMessages.generateID();
        fireunit.ok( TypeCheck.String( strSender1 ), 'sender1: ' + strSender1 );
        
        strSender2 = objMessages.generateID();
        fireunit.ok( TypeCheck.String( strSender2 ), 'sender2: ' + strSender2 );
        fireunit.ok( strSender2 != strSender1, 'sender2 and sender1 different' );
        
        strReceiver1 = objMessages.generateID();
        fireunit.ok( TypeCheck.String( strReceiver1 ), 'receiver1: ' + strReceiver1 );
        fireunit.ok( strReceiver1 != strSender2, 'receiver1 and sender2 different' );
 
        strReceiver2 = objMessages.generateID();
        fireunit.ok( TypeCheck.String( strReceiver2 ), 'receiver2: ' + strReceiver2 );
        fireunit.ok( strReceiver2 != strReceiver1, 'receiver2 and receiver1 different' );
    };
    
    function teardownObjects()
    {
        objMessages.teardown();
    };

    function registerListeners()
    {
        fireunit.ok( objMessages.RegisterListener( 'subscriber1allpubsnoargs', objMessages.all_publishers_id, 
            strReceiver1, fncSubscriberOneAllPubsNoArgs, this ), 'subscriber1allpubsnoargs' );

        fireunit.ok( objMessages.RegisterListener( 'subscriber1allpubsargs', objMessages.all_publishers_id, 
            strReceiver1, fncSubscriberOneAllPubsArgs, this ), 'subscriber1allpubsargs' );

        fireunit.ok( objMessages.RegisterListener( 'subscriber2allpubsnoargs', objMessages.all_publishers_id, 
            strReceiver2, fncSubscriberTwoAllPubsNoArgs, this ), 'subscriber2allpubsnoargs' );

        fireunit.ok( objMessages.RegisterListener( 'subscriber2allpubsargs', objMessages.all_publishers_id, 
            strReceiver2, fncSubscriberTwoAllPubsArgs, this ), 'subscriber2allpubsargs' );
     
        fireunit.ok( objMessages.RegisterListener( 'subscriber2sender1noargs', strSender1, 
            strReceiver2, fncSubscriberTwoSender1NoArgs, this ), 'subscriber2sender1noargs' );

        fireunit.ok( objMessages.RegisterListener( 'subscriber2sender1args', strSender1, 
            strReceiver2, fncSubscriberTwoSender1Args, this ), 'subscriber2sender1args' );
    };

    function raiseMessages()
    {
        var strRandomID = objMessages.generateID();
        
        /** Should all raise the counts **/
        objMessages.Raise( 'subscriber1allpubsnoargs', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber1allpubsargs', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber2allpubsnoargs', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber2allpubsargs', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber2sender1noargs', strSender1, arguments, true );
        objMessages.Raise( 'subscriber2sender1args', strSender1, arguments, true );

        /** Should not be handled **/
        objMessages.Raise( 'subscriber2sender1noargs', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber2sender1args', strRandomID, arguments, true );
        objMessages.Raise( 'subscriber2sender1noargs', strSender2, arguments, true );
        objMessages.Raise( 'subscriber2sender1args', strSender2, arguments, true );
        
        nRaiseCount++;
    };
    
    function RaiseForAddressMessages()
    {
        var strRandomID = objMessages.generateID();
        
        /** Should all raise the counts **/
        objMessages.RaiseForAddress( 'subscriber1allpubsnoargs', strRandomID, strReceiver1, arguments, true );
        objMessages.RaiseForAddress( 'subscriber1allpubsargs', strRandomID, strReceiver1, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2allpubsnoargs', strRandomID, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2allpubsargs', strRandomID, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2sender1noargs', strSender1, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2sender1args', strSender1, strReceiver2, arguments, true );

        /** Should not be handled **/
        objMessages.RaiseForAddress( 'subscriber2sender1noargs', strRandomID, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2sender1args', strRandomID, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2sender1noargs', strSender2, strReceiver2, arguments, true );
        objMessages.RaiseForAddress( 'subscriber2sender1args', strSender2, strReceiver2, arguments, true );
        
        nRaiseCount++;
    };
    
    
    function checkCounts()
    {
        fireunit.ok( nRaiseCount == nSubscriberOneAllPubsNoArgs, 'nSubscriberOneAllPubsNoArgs count' );
        fireunit.ok( nRaiseCount == nSubscriberOneAllPubsArgs, 'nSubscriberOneAllPubsArgs count' );
        fireunit.ok( nRaiseCount == nSubscriberTwoAllPubsNoArgs, 'nSubscriberTwoAllPubsNoArgs count' );
        fireunit.ok( nRaiseCount == nSubscriberTwoAllPubsArgs, 'nSubscriberTwoAllPubsArgs count' );
        fireunit.ok( nRaiseCount == nSubscriberTwoSender1NoArgs, 'nSubscriberTwoSender1NoArgs count', nRaiseCount, nSubscriberTwoSender1NoArgs );
        fireunit.ok( nRaiseCount == nSubscriberTwoSender1Args, 'nSubscriberTwoSender1Args count', nRaiseCount, nSubscriberTwoSender1Args );
    };
    
    function fncSubscriberOneAllPubsNoArgs( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberOneAllPubsNoArgs argument' );
        nSubscriberOneAllPubsNoArgs++;
    };
    
    function fncSubscriberOneAllPubsArgs( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberOneAllPubsArgs argument' );
        nSubscriberOneAllPubsArgs++;
    };
 
    function fncSubscriberTwoAllPubsNoArgs( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberTwoAllPubsNoArgs argument' );
        nSubscriberTwoAllPubsNoArgs++;
    };
    
    function fncSubscriberTwoAllPubsArgs( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberTwoAllPubsArgs argument' );
        nSubscriberTwoAllPubsArgs++;
    };
    
    function fncSubscriberTwoSender1NoArgs( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberTwoSender1NoArgs argument' );
        nSubscriberTwoSender1NoArgs++;
    };
    
    function fncSubscriberTwoSender1Args( in_vArgument )
    {
        fireunit.ok( in_vArgument == vRaisedArgument, 'fncSubscriberTwoSender1Args argument' );
        nSubscriberTwoSender1Args++;
    };
    
};
