
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'CommentsListTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new CommentsList();
    },

	getExpectedConfig: function()
	{
		return {
			m_nDisplaysShown: null
		};
	},
	
	getExpectedListeners: function()
	{
		return { 
			showall: null,
			hideextras: null
		};
	},
	
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
		this.testFindInsertionIndex();
		this.testAddDisplay();
		this.testRemoveItem();
		this.testOnShowAll();
		this.testOnHideExtras();
    },
	
	testFindInsertionIndex: function()
	{
		var objTestObject = this.getTestObject();
		
		// test1 - make sure it returns 0;  That's all it does now.
		fireunit.ok( 0 === objTestObject.findInsertionIndex( {} ), 'test1: returns 0' );
	},
	
	testAddDisplay: function()
	{
		var objTestObject = this.getTestObject();
		objTestObject.m_nDisplaysShown = 2;
		
		// test1 - this is simulating the first item added, want it to be shown.
		objTestObject.resetRaisedMessages();
		objTestObject.addDisplay( '1', new Display( fireunit.id( 'listitem1' ) ) );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test1: listitem1 shown' );
		fireunit.ok( fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test1: listitem2 hidden' );
		fireunit.ok( fireunit.id( 'listitem3' ).hasClassName( 'hide' ), 'test1: listitem3 hidden' );
		fireunit.ok( fireunit.id( 'listitem4' ).hasClassName( 'hide' ), 'test1: listitem4 hidden' );
		fireunit.ok( fireunit.id( 'listitem5' ).hasClassName( 'hide' ), 'test1: listitem5 hidden' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test1: morecomments not added' );
		fireunit.compare( '', fireunit.id( 'elementExtraCount' ).innerHTML, 'test1: extra count not set' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test1' );

		// test2 - this is simulating the second item added, want it to be shown.
		objTestObject.resetRaisedMessages();
		objTestObject.addDisplay( '2', new Display( fireunit.id( 'listitem2' ) ) );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test2: listitem1 shown' );
		fireunit.ok( !fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test2: listitem2 shown' );
		fireunit.ok( fireunit.id( 'listitem3' ).hasClassName( 'hide' ), 'test2: listitem3 hidden' );
		fireunit.ok( fireunit.id( 'listitem4' ).hasClassName( 'hide' ), 'test2: listitem4 hidden' );
		fireunit.ok( fireunit.id( 'listitem5' ).hasClassName( 'hide' ), 'test2: listitem5 hidden' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test2: morecomments not added' );
		fireunit.compare( '', fireunit.id( 'elementExtraCount' ).innerHTML, 'test2: extra count not set' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test2' );

		// test3 - this is simulating the third item added, do not want it to be shown.
		objTestObject.resetRaisedMessages();
		objTestObject.addDisplay( '3', new Display( fireunit.id( 'listitem3' ) ) );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test3: listitem1 shown' );
		fireunit.ok( !fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test3: listitem2 shown' );
		fireunit.ok( fireunit.id( 'listitem3' ).hasClassName( 'hide' ), 'test3: listitem3 hidden' );
		fireunit.ok( fireunit.id( 'listitem4' ).hasClassName( 'hide' ), 'test3: listitem4 hidden' );
		fireunit.ok( fireunit.id( 'listitem5' ).hasClassName( 'hide' ), 'test3: listitem5 hidden' );
		fireunit.ok( fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test3: morecomments added' );
		fireunit.compare( '1', fireunit.id( 'elementExtraCount' ).innerHTML, 'test3: extra count set to 1' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test3' );
	},
	
	testRemoveItem: function()
	{
		var objTestObject = this.getTestObject();
		
		// We are assuming that testAddDisplay was called directly before 
		//	this and we have three items on the list.
		
		// test1 - Add a forth display so we can remove one and still have the 'morecomments'
		objTestObject.resetRaisedMessages();
		objTestObject.addDisplay( '4', new Display( fireunit.id( 'listitem4' ) ) );
		objTestObject.removeItem( 'listitem4' );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test1: listitem1 shown' );
		fireunit.ok( !fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test1: listitem2 shown' );
		fireunit.ok( fireunit.id( 'listitem3' ).hasClassName( 'hide' ), 'test1: listitem3 hidden' );
		fireunit.ok( fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test1: morecomments added' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'lesscomments' ), 'test1: lesscomments not added' );
		fireunit.compare( '1', fireunit.id( 'elementExtraCount' ).innerHTML, 'test1: extra count set to 1' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test1' );
		
		// test2 - remove the boundary, we only have two items left, 
		//	morecomments should not be there.
		objTestObject.resetRaisedMessages();
		objTestObject.removeItem( 'listitem3' );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test2: listitem1 shown' );
		fireunit.ok( !fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test2: listitem2 shown' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test2: morecomments removed' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'lesscomments' ), 'test2: lesscomments not added' );
		fireunit.compare( '1', fireunit.id( 'elementExtraCount' ).innerHTML, 'test2: extra count set to 1 still' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test2' );

		// test3 - Remove listitem2, only one item left, 
		//	morecomments should not be there.
		objTestObject.resetRaisedMessages();
		objTestObject.removeItem( 'listitem2' );
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test3: listitem1 shown' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test3: morecomments removed' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'lesscomments' ), 'test3: lesscomments not added' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test3' );
	},
	
	testOnShowAll: function()
	{
		var objTestObject = this.getTestObject();
		objTestObject.resetShowAll();
		
		// test1 - make sure showAll was chained and that the 'morecomments' was removed.
		objTestObject.resetRaisedMessages();
		fireunit.id( 'container' ).addClassName( 'morecomments' );
		objTestObject.OnShowAll();
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test1: morecomments removed' );
		fireunit.ok( fireunit.id( 'container' ).hasClassName( 'lesscomments' ), 'test1: lesscomments added' );
		fireunit.ok( objTestObject.getShowAll(), 'test1: showAll called' );
		objTestObject.testRaisedMessages( { listheightchange: null }, 'test1' );
	},
	
	testOnHideExtras: function()
	{
		var objTestObject = this.getTestObject();
		objTestObject.resetList();
		
		// test1 - add 4 items, ensure the hide is not on any of them.  
		//	Call OnShowAll to show them all, then call OnHideExtras 
		//	to make sure only the first two are shown.
		objTestObject.addDisplay( '1', new Display( fireunit.id( 'listitem1' ) ) );
		objTestObject.addDisplay( '2', new Display( fireunit.id( 'listitem2' ) ) );
		objTestObject.addDisplay( '3', new Display( fireunit.id( 'listitem3' ) ) );
		objTestObject.addDisplay( '4', new Display( fireunit.id( 'listitem4' ) ) );

		// make sure they are all shown.
		fireunit.id( 'container' ).removeClassName( 'morecomments' );
		fireunit.id( 'container' ).addClassName( 'lesscomments' );
		fireunit.id( 'listitem1' ).removeClassName( 'hide' );
		fireunit.id( 'listitem2' ).removeClassName( 'hide' );
		fireunit.id( 'listitem3' ).removeClassName( 'hide' );
		fireunit.id( 'listitem4' ).removeClassName( 'hide' );
		
		objTestObject.OnHideExtras();
		
		fireunit.ok( !fireunit.id( 'listitem1' ).hasClassName( 'hide' ), 'test1: listitem1 is shown' );
		fireunit.ok( !fireunit.id( 'listitem2' ).hasClassName( 'hide' ), 'test1: listitem2 is shown' );
		fireunit.ok( fireunit.id( 'listitem3' ).hasClassName( 'hide' ), 'test1: listitem3 is hidden' );
		fireunit.ok( fireunit.id( 'listitem4' ).hasClassName( 'hide' ), 'test1: listitem4 is hidden' );
		fireunit.ok( fireunit.id( 'container' ).hasClassName( 'morecomments' ), 'test1: morecomments added' );
		fireunit.ok( !fireunit.id( 'container' ).hasClassName( 'lesscomments' ), 'test1: lesscomments removed' );
	}
} );



