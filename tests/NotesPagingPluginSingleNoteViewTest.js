/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    this.m_objConfig = undefined;
    
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NotesPagingPluginSingleNoteViewTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NotesPagingSingleNoteViewPlugin();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, [ { m_strSingleNoteView: 'singlenoteview' } ] );
        
        var objTestObject = this.getTestObject();
        var objPlugged = objTestObject.getPlugged();
        
        // We need an OnDisplayNotes.    
        objPlugged.OnDisplayNotes = function( in_objConfig )
        {
            this._setPluggedConfig( in_objConfig );
        }.bind( this );
    },
    
    getExpectedListeners: function()
    {
        return { 
			requestsinglenoteview: null,
			configchange: null
		};
    },
    
    getExpectedConfig: function()
    {
        return { m_strSingleNoteView: null };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        this.testOnSingleNoteView();
    },
    
    testOnSingleNoteView: function()
    {
        var objTestObject = this.getTestObject();
        // OnSingleNoteView will display the Xth index after the current page's base index.
        //  so if we are in page 10 and maxrows is set to 50, and we want index 10, 
        //  it will ask for index 510 from the DB.

        // test1 - the first note of the 5th page, 10 notes per page.
        this._setPluggedConfig( { maxrows: 10, page: 5 } );
        objTestObject.OnSingleNoteView( 0 );
        fireunit.compare( 'singlenoteview', this.m_objConfig.view, 'test1: single note view set' );
        fireunit.ok( 1 === this.m_objConfig.maxrows, 'test1: maxrows is 1' );
        fireunit.ok( 50 === this.m_objConfig.page, 'test1: page is 50' );
        
        // test2 - the 5th note in the the 5th page, 10 notes per page.
        this._setPluggedConfig( { maxrows: 10, page: 5 } );
        objTestObject.OnSingleNoteView( 5 );
        fireunit.compare( 'singlenoteview', this.m_objConfig.view, 'test2: single note view set' );
        fireunit.ok( 1 === this.m_objConfig.maxrows, 'test2: maxrows is 1' );
        fireunit.ok( 55 === this.m_objConfig.page, 'test2: page is 55' );
        
        // test3 - test to see if it can get the first page
        this._setPluggedConfig( { maxrows: 10, page: 0 } );
        objTestObject.OnSingleNoteView( 1 );
        fireunit.compare( 'singlenoteview', this.m_objConfig.view, 'test3: single note view set' );
        fireunit.ok( 1 === this.m_objConfig.maxrows, 'test3: maxrows is 1' );
        fireunit.ok( 1 === this.m_objConfig.page, 'test3: page is 1' );
        
        
    },
    
    _setPluggedConfig: function( in_objConfig )
    {
        this.getTestObject().getPlugged().m_objConfig = in_objConfig;
        this.m_objConfig = in_objConfig;
    }
} );



