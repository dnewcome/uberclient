
function HashArrayTest()
{
    var strTestID1 = 'string1'
    var strTestID2 = 'string2'
    var strTestString1 = 'test string 1';
    var strTestString2 = 'test string 2';
    var nIndex1, nIndex2, nIndexFail, strReturnString;
    
    var objHashArray = new HashArray();

    try
    {
        fireunit.log( 'begin HashArrayTest' );
    } catch(e)
    {
        document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        return;
    }
    
    checkInitialization();
    checkEmpty();
    checkFirst();
    checkReAdd();
    checkSecond();
    checkRemoveSecond();
    checkRemoveFirst();
    checkEmpty();
    checkFirst();
    checkRemoveFirst();
    checkEmpty();
        
    function checkInitialization()
    {
        /** Exists but uninitialized **/
        fireunit.ok( objHashArray, 'HashArray exists' );
        fireunit.ok( false === objHashArray.isInitialized(), 'isInitialized should be false');
        
        /** initialized **/
        objHashArray.init();
        fireunit.ok( true === objHashArray.isInitialized(), 'isInitialized should be true, initialized');

        /** torn down again **/
        objHashArray.teardown();
        fireunit.ok( false === objHashArray.isInitialized(), 'isInitialized should be false, torn down');

        /** re-initialized **/
        objHashArray.init();
        fireunit.ok( true === objHashArray.isInitialized(), 'isInitialized should be true, initialized');
    };
    
    function checkEmpty()
    {
        /** no length yet **/
        fireunit.ok( 0 === objHashArray.length, '0 length' );

        /** nothing should be valid yet **/
        fireunit.ok( false == objHashArray.isValidIndex( 0 ), 'invalid index 0' );
        fireunit.ok( false == objHashArray.isValidKey( strTestID1 ), 'invalid id 1' );

        fireunit.ok( false == objHashArray.isValidIndex( 1 ), 'invalid index 1' );
        fireunit.ok( false == objHashArray.isValidKey( strTestID2 ), 'invalid id 2' );

        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 1: string should be undefined' );

        strReturnString = objHashArray.getByKey( strTestID2 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 2: string should be undefined' );

        strReturnString = objHashArray.getByIndex( 0 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByIndex 0: string should be undefined' );

        strReturnString = objHashArray.getByIndex( 1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByIndex 1: string should be undefined' );
    };
    
    function checkFirst()
    {
        /** Initial add **/
        nIndex1 = objHashArray.add( strTestID1, strTestString1 );
        fireunit.ok( nIndex1 > -1, 'initial add should be successful' );
        fireunit.ok( 1 === objHashArray.length, '1 length' );

        /** valid index and key **/
        fireunit.ok( objHashArray.isValidIndex( nIndex1 ), 'valid index 1' );
        fireunit.ok( objHashArray.isValidKey( strTestID1 ), 'valid key 1' );

        /** still invalid **/
        fireunit.ok( false == objHashArray.isValidIndex( 25 ), 'invalid index 25' );
        fireunit.ok( false == objHashArray.isValidKey( 'random' ), 'invalid key random' );
        
        /** See if we can get valid indexes and keys out */
        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.compare( strTestString1, strReturnString, 'getByKey 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        strReturnString = objHashArray.getByIndex( nIndex1 );
        fireunit.compare( strTestString1, strReturnString, 'getByIndex 0: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        /** See if we can get the index from the key and vice versa **/
        fireunit.ok( nIndex1 == objHashArray.getIndexByKey( strTestID1 ), 'getIndexByKey valid' );
        fireunit.ok( strTestID1 == objHashArray.getKeyByIndex( nIndex1 ), 'getKeyByIndex valid' );

        /** try with invalid data **/    
        fireunit.ok( -1 == objHashArray.getIndexByKey( strTestID2 ), 'getIndexByKey invalid' );
        fireunit.ok( TypeCheck.Undefined( objHashArray.getKeyByIndex( 2 ) ), 'getKeyByIndex invalid' );
    };

    function checkReAdd()
    {
        /** add a second item with same ID, should fail **/
        nIndexFail = objHashArray.add( strTestID1, strTestString2 );
        fireunit.ok( nIndexFail === -1, 'second add under same ID should fail' );
        fireunit.ok( 1 === objHashArray.length, '1 length still' );

        /** See if we can still get the index from the key and vice versa **/
        fireunit.ok( nIndex1 == objHashArray.getIndexByKey( strTestID1 ), 'getIndexByKey valid' );
        fireunit.ok( strTestID1 == objHashArray.getKeyByIndex( nIndex1 ), 'getKeyByIndex valid' );

        /** Make sure the first is still the first and didn't get overwritten */
        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.compare( strTestString1, strReturnString, 'getByKey 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        /** Check invalid indexes and keys **/
        strReturnString = objHashArray.getByKey( strTestID2 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 2: string should be undefined' );

        strReturnString = objHashArray.getByIndex( 1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByIndex 1: string should be undefined' );
    };


    function checkSecond()
    {
        /** Truely add a second */
        nIndex2 = objHashArray.add( strTestID2, strTestString2 );
        fireunit.ok( nIndex2 > -1, 'add 2 should be successful' );
        fireunit.ok( 2 === objHashArray.length, '2 length' );

        /** Make sure our new index is not the same as the first index **/
        fireunit.ok( nIndex1 != nIndex2, 'Indexes not be the same' );

        /** See if we can get the index from the key and vice versa for both **/
        fireunit.ok( nIndex1 == objHashArray.getIndexByKey( strTestID1 ), 'getIndexByKey 1 valid' );
        fireunit.ok( strTestID1 == objHashArray.getKeyByIndex( nIndex1 ), 'getKeyByIndex 1 valid' );

        fireunit.ok( nIndex2 == objHashArray.getIndexByKey( strTestID2 ), 'getIndexByKey 2 valid' );
        fireunit.ok( strTestID2 == objHashArray.getKeyByIndex( nIndex2 ), 'getKeyByIndex 2 valid' );

        /** Make sure the first item we added can still be gotten out **/
        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.compare( strTestString1, strReturnString, 'getByKey 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        strReturnString = objHashArray.getByIndex( nIndex1 );
        fireunit.compare( strTestString1, strReturnString, 'getByIndex 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        /** Make sure the second item we added can be gotten out **/
        strReturnString = objHashArray.getByKey( strTestID2 );
        fireunit.compare( strTestString2, strReturnString, 'getByKey 2: strings should be the same: "' 
            + strTestString2 + '" "' + strReturnString + '"' );

        strReturnString = objHashArray.getByIndex( nIndex2 );
        fireunit.compare( strTestString2, strReturnString, 'getByIndex 2: strings should be the same: "' 
            + strTestString2 + '" "' + strReturnString + '"' );
    };


    function checkRemoveSecond()
    {
        /** Start removing some things **/    
        strReturnString = objHashArray.removeByIndex( nIndex2 );
        fireunit.compare( strTestString2, strReturnString, 'removeByIndex 2: strings should be the same: "' 
            + strTestString2 + '" "' + strReturnString + '"' );
        fireunit.ok( 1 === objHashArray.length, '1 length' );

        /** Make sure we can get neither its index nor key **/
        strReturnString = objHashArray.getByIndex( nIndex2 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 2: strings should be undefined' );

        strReturnString = objHashArray.getByKey( strTestID2 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 2: strings should be undefined' );

        /** Make sure item 1 is still available **/
        strReturnString = objHashArray.getByIndex( nIndex1 );
        fireunit.compare( strTestString1, strReturnString, 'getByIndex 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );

        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.compare( strTestString1, strReturnString, 'strTestID1 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );
    
    };
    
    function checkRemoveFirst()
    {
        /** Remove the last item **/
        strReturnString = objHashArray.removeByKey( strTestID1 );
        fireunit.compare( strTestString1, strReturnString, 'removeByIndex 1: strings should be the same: "' 
            + strTestString1 + '" "' + strReturnString + '"' );
        fireunit.ok( 0 === objHashArray.length, '0 length' );

        /** Make sure we can not get item 1 out by index or ID **/
        strReturnString = objHashArray.getByIndex( nIndex1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 1: strings should be undefined' );

        strReturnString = objHashArray.getByKey( strTestID1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'getByKey 1: strings should be undefined' );

        /** Make sure we can't re-remove an item */
        strReturnString = objHashArray.removeByKey( strTestID1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'removeByKey 1: strings should be undefined' );

        strReturnString = objHashArray.removeByIndex( nIndex1 );
        fireunit.ok( TypeCheck.Undefined( strReturnString ), 'removeByIndex 1: strings should be undefined' );
    };
    
    // Wait for asynchronous operation.
    setTimeout(function(){
        // Finish test
        fireunit.testDone();
    }, 1000);
};
