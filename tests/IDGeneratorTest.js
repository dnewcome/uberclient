
function UnitTest()
{
    try
    {
        fireunit.log( 'begin IDGeneratorTest' );
    } catch(e)
    {
        document.write( 'This test requires fireunit to run. Please go to <a href="http://fireunit.org">Fireunit</a>' );
        return;
    }
    
    
    var objIDGenerator1 = new UniqueIDGenerator( 'idgenerator1' );
    var objIDGenerator2 = new UniqueIDGenerator( 'idgenerator2' );

    for( var nIndex = 0, strLastID1 = '', strLastID2 = ''; nIndex < 10; ++nIndex )
    {
        var strNewID1 = objIDGenerator1.getUniqueID();
        var strNewID2 = objIDGenerator2.getUniqueID();
        
        fireunit.ok( strNewID1 != strLastID1, '1: IDs should not be the same as last run: ' + strNewID1 );
        fireunit.ok( strNewID2 != strLastID2, '2: IDs should not be the same as last run: ' + strNewID2 );
        fireunit.ok( strNewID1 != strNewID2, 'IDs should not be the same between generators' );
        
        strLastID1 = strNewID1;
        strLastID2 = strNewID2;
    } // end for
    
        // Wait for asynchronous operation.
    setTimeout(function(){
        // Finish test
        fireunit.testDone();
    }, 1000);
};
