function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NotesPagingPluginPaging';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NotesPagingPagingPlugin();
    },

    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        objPlugged.m_objConfig = {};
        objPlugged.OnDisplayNotes = function( in_objConfig )
        {
            this.m_objNewConfig = in_objConfig;
        };
        
        objPlugged.resetNewConfig = function()
        {
            this.m_objNewConfig = {};
        };
        
    },
        
    getExpectedListeners: function()
    {
        return {
            configchange: null,
            displaynotes: null,
            setpage: null,
            setnextpage: null,
            setpreviouspage: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnSetPage();
        this.testOnConfigChange();
        this.testOnDisplayNotes();
        this.testOnSetNextPage();
        this.testOnPreviousPage();
    },
    
    testOnSetPage: function()
    {
        // test1 - page !=, force=false
        // test2 - page ==, force=false
        // test3 - page !=, force=true
        // test4 - page ==, force=true
        // test5 - page !=, force=undefined(false)
        // test6 - page ==, force=undefined(false)
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        objPlugged.resetNewConfig();
        objPlugged.m_objConfig.page = 1;
        
        // test1 - page !=, force=false 
        objTestObject.OnSetPage( 2, false );
        fireunit.ok( 2 == objPlugged.m_objNewConfig.page, 'test1, page updated' );

        // test2 - page ==, force=false
        objPlugged.resetNewConfig();
        objTestObject.OnSetPage( 1, false );
        fireunit.ok( 'undefined' == typeof( objPlugged.m_objNewConfig.page ), 'test2, page not updated' );

        // test3 - page !=, force=true
        objPlugged.resetNewConfig();
        objTestObject.OnSetPage( 2, true );
        fireunit.ok( 2 == objPlugged.m_objNewConfig.page, 'test3, page forced updated' );

        // test4 - page ==, force=true
        objPlugged.resetNewConfig();
        objTestObject.OnSetPage( 1, true );
        fireunit.ok( 1 == objPlugged.m_objNewConfig.page, 'test4, page forced updated' );
            
        // test5 - page !=, force=undefined(false)
        objPlugged.resetNewConfig();
        objTestObject.OnSetPage( 2 );
        fireunit.ok( 2 == objPlugged.m_objNewConfig.page, 'test5, page updated' );

        // test6 - page ==, force=undefined(false)
        objPlugged.resetNewConfig();
        objTestObject.OnSetPage( 1 );
        fireunit.ok( 'undefined' == typeof( objPlugged.m_objNewConfig.page ), 'test6, page not updated' );
    },
    
    testOnDisplayNotes: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        // save this off right now so we can test one thing at a time.
        var fncOrigOnSetPage = objTestObject.OnSetPage;
        var fncOrigSetCounts = objTestObject.updateUI;

        var nNewPage, bForce, nCurrCount, nTotalCount, nTotalPages;

        objTestObject.OnSetPage = function( in_nPage, in_bForce ) {
            nNewPage = in_nPage;
            bForce = in_bForce;
        };

        objTestObject.updateUI = function( in_nCurrCount, in_nTotalCount, in_nTotalPages ) {
            nCurrCount = in_nCurrCount;
            nTotalCount = in_nTotalCount;
            nTotalPages = in_nTotalPages;
        };
        
        function resetCounts()
        {
            nNewPage = bForce = nCurrCount = nTotalCount = nTotalPages = null;
        };
        
        var objBaseConfig = {
            maxrows: 50
        };
        objPlugged.m_objConfig = objBaseConfig;
        
        var objDBConfig = {
            totalcount: 65,
            noteids: [ 'note1', 'note2', 'note3' ]
        };
    
        
        // test1 - three notes returned, nCurrCount 3, nTotalPages = 2, nTotalCount = 65
        //  no reset of page, just update counts.
        resetCounts();
        objTestObject.OnDisplayNotes( objDBConfig );
        fireunit.ok( 3 == nCurrCount, 'test1 - nCurrCount is 3' );
        fireunit.ok( 65 == nTotalCount, 'test1 - nTotalCount is 65' );
        fireunit.ok( 2 == nTotalPages, 'test1 - nTotalPages is 2' );
        fireunit.ok( null == nNewPage, 'test1 - nNewPage is null' );
        fireunit.ok( null == bForce, 'test1 - bForce is null' );

        // test2 - no notes returned, nCurrCount 0, nTotalPages = 2, nTotalCount = 65.
        //  must reset page to last good page.
        resetCounts();
        objDBConfig.noteids = [];
        objTestObject.OnDisplayNotes( objDBConfig );
        fireunit.ok( null === nCurrCount, 'test2 - nCurrCount is null' );
        fireunit.ok( null === nTotalCount, 'test2 - nTotalCount is null' );
        fireunit.ok( null === nTotalPages, 'test2 - nTotalPages is null' );
        fireunit.ok( 1 == nNewPage, 'test2 - nNewPage is 1' );
        fireunit.ok( true == bForce, 'test2 - bForce is true' );

        // test3 - no notes returned, there are no notes in category.
        // call update still.
        resetCounts();
        objDBConfig.totalcount = 0;
        objTestObject.OnDisplayNotes( objDBConfig );
        fireunit.ok( 0 === nCurrCount, 'test3 - nCurrCount is 0' );
        fireunit.ok( 0 === nTotalCount, 'test3 - nTotalCount is 0' );
        fireunit.ok( 0 === nTotalPages, 'test3 - nTotalPages is 0' );
        fireunit.ok( null === nNewPage, 'test3 - nNewPage is null' );
        fireunit.ok( null === bForce, 'test3 - bForce is null' );
        
        // test4 - noteids/totalcount is missing from the config object - 
        //  can happen if we have no notes selected and hit "open selected"
        resetCounts();
        objDBConfig.noteids = objDBConfig.totalcount = undefined;
        objTestObject.OnDisplayNotes( objDBConfig );
        fireunit.ok( 0 === nCurrCount, 'test4 - nCurrCount is 0' );
        fireunit.ok( 0 === nTotalCount, 'test4 - nTotalCount is 0' );
        fireunit.ok( 0 === nTotalPages, 'test4 - nTotalPages is 0' );
        fireunit.ok( null === nNewPage, 'test4 - nNewPage is null' );
        fireunit.ok( null === bForce, 'test4 - bForce is null' );
        
        // test5 - maxrows is 0, should call updateUI, NOT OnSetPage.  
        //  can happen if we have no notes selected and hit "open selected"
        resetCounts();
        objDBConfig.noteids = objDBConfig.totalcount = undefined;
        objPlugged.m_objConfig.maxrows = 0;
        objTestObject.OnDisplayNotes( objDBConfig );
        fireunit.ok( 0 === nCurrCount, 'test5 - nCurrCount is 0' );
        fireunit.ok( 0 === nTotalCount, 'test5 - nTotalCount is 0' );
        fireunit.ok( 0 === nTotalPages, 'test5 - nTotalPages is 0' );
        fireunit.ok( null == nNewPage, 'test5 - nNewPage is null' );
        fireunit.ok( null == bForce, 'test5 - bForce is null' );
        
        objTestObject.OnSetPage = fncOrigOnSetPage;
        objTestObject.updateUI = fncOrigSetCounts;
    },
    
    testOnConfigChange: function()
    {
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        // save this off right now so we can test one thing at a time.
        var fncOrigSetCounts = objTestObject.updateUI;

        var nCurrCount, nTotalCount, nTotalPages;

        objTestObject.updateUI = function( in_nCurrCount, in_nTotalCount, in_nTotalPages ) {
            nCurrCount = in_nCurrCount;
            nTotalCount = in_nTotalCount;
            nTotalPages = in_nTotalPages;
        };
        
        function resetCounts()
        {
            nCurrCount = nTotalCount = nTotalPages = null;
        };
        
        var objConfig = objPlugged.m_objConfig = {};
        resetCounts();

        // test1 - pass in a noteid, make sure that the page, startrow, 
        //  and maxrows are all set to 0
        //objConfig.page = objConfig.startrow = objConfig.maxrows = 0;
        objConfig.noteids = [];
        objTestObject.OnConfigChange();
        fireunit.ok( 0 == objConfig.page, 'test1: page 0' );
        fireunit.ok( 0 == objConfig.startrow, 'test1: startrow 0' );
        fireunit.ok( 0 == objConfig.maxrows, 'test1: maxrows 0' );
        fireunit.ok( null == nCurrCount, 'test1: nCurrCount null' );
        fireunit.ok( null == nTotalCount, 'test1: nTotalCount null' );
        fireunit.ok( null == nTotalPages, 'test1: nTotalPages null' );

        objConfig = objPlugged.m_objConfig = {};
        resetCounts();
        // test2, set noteid to a string, make sure page, startrow, 
        //  and maxrows are all set to 0;
        objConfig.noteids = [ 'somestring' ];
        objTestObject.OnConfigChange();
        fireunit.ok( 0 == objConfig.page, 'test2: page 0' );
        fireunit.ok( 0 == objConfig.startrow, 'test2: startrow 0' );
        fireunit.ok( 0 == objConfig.maxrows, 'test2: maxrows 0' );
        fireunit.ok( null == nCurrCount, 'test2: nCurrCount 1' );
        fireunit.ok( null == nTotalCount, 'test2: nTotalCount 1' );
        fireunit.ok( null == nTotalPages, 'test2: nTotalPages 1' );

        // test3, nothing besides maxrows specified.  should set page to 0,
        //  startrows should get filled in to 0, maxrows to 0
        objConfig = objPlugged.m_objConfig = { maxrows: 10 };
        resetCounts();
        objTestObject.OnConfigChange();
        fireunit.ok( 0 == objConfig.page, 'test3: page 0' );
        fireunit.ok( 0 == objConfig.startrow, 'test3: startrow 0' );
        fireunit.ok( null == nCurrCount, 'test3: nCurrCount null' );
        fireunit.ok( null == nTotalCount, 'test3: nTotalCount null' );
        fireunit.ok( null == nTotalPages, 'test3: nTotalPages null' );

        // test4, max rows and page 0 specified, set page to 0 and startrow to 0
        objConfig = objPlugged.m_objConfig = { maxrows: 10, page: 0 };
        resetCounts();
        objTestObject.OnConfigChange();
        fireunit.ok( 0 == objConfig.page, 'test4: page 0' );
        fireunit.ok( 0 == objConfig.startrow, 'test4: startrow 0' );
        fireunit.ok( null == nCurrCount, 'test4: nCurrCount null' );
        fireunit.ok( null == nTotalCount, 'test4: nTotalCount null' );
        fireunit.ok( null == nTotalPages, 'test4: nTotalPages null' );

        // test5, max rows and page 0 specified, keep page 0, and startrow to 30
        objConfig = objPlugged.m_objConfig = { maxrows: 15, page: 2 };
        resetCounts();
        objTestObject.OnConfigChange();
        fireunit.ok( 2 == objConfig.page, 'test5: page 2' );
        fireunit.ok( 30 == objConfig.startrow, 'test5: startrow 30' );
        fireunit.ok( null == nCurrCount, 'test5: nCurrCount null' );
        fireunit.ok( null == nTotalCount, 'test5: nTotalCount null' );
        fireunit.ok( null == nTotalPages, 'test5: nTotalPages null' );
        
        
        objTestObject.updateUI = fncOrigSetCounts;
    },
    
    testOnSetNextPage: function()
    {
        // test1 - test normal case.
        // test2 - test if no page set.
        // test3 - test if last page
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objConfig = objPlugged.m_objConfig = {};
        
        // test1 - set to page 0, should go to page 1.
        objPlugged.resetNewConfig();
        objTestObject.m_nTotalPages = 5;
        objConfig.page = 0;
        objTestObject.OnSetNextPage();
        fireunit.ok( 1 === objPlugged.m_objNewConfig.page, 'test1: nominal case, page increments' );

        // test2 - no page set, set to page 0?
        objPlugged.resetNewConfig();
        objConfig.page = objTestObject.m_nTotalPages = undefined;
        objTestObject.OnSetNextPage();
        fireunit.ok( 0 === objPlugged.m_objNewConfig.page, 'test2: no page set, set to 0' );
        
        // test3 - set to last page, stay on last page, do nothing
        objPlugged.resetNewConfig();
        objTestObject.m_nTotalPages = 5;
        objConfig.page = 4;
        objTestObject.OnSetNextPage();
        fireunit.ok( undefined === objPlugged.m_objNewConfig.page, 'test3: already at highest page, cannot increment' );
                
    },
    
    testOnPreviousPage: function()
    {
        // test1 - test normal case.
        // test2 - test if no page set.
        // test3 - test if first page (0 index)
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        var objConfig = objPlugged.m_objConfig = {};
        
        // test1 - set to page 1, should go to page 0.
        objPlugged.resetNewConfig();
        objTestObject.m_nTotalPages = 5;
        objConfig.page = 1;
        objTestObject.OnSetPreviousPage();
        fireunit.ok( 0 === objPlugged.m_objNewConfig.page, 'test1: nominal case, page decrements' );

        // test2 - no page set, set to page 0
        objPlugged.resetNewConfig();
        objConfig.page = objTestObject.m_nTotalPages = undefined;
        objTestObject.OnSetPreviousPage();
        fireunit.ok( 0 === objPlugged.m_objNewConfig.page, 'test2: no page set, set to 0' );
        
        // test3 - set to first page, do nothing.
        objPlugged.resetNewConfig();
        objTestObject.m_nTotalPages = 5;
        objConfig.page = 0;
        objTestObject.OnSetPreviousPage();
        fireunit.ok( undefined === objPlugged.m_objNewConfig.page, 'test3: already at lowest page, cannot increment' );
    
    }
} );



