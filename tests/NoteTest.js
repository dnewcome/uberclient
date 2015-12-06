/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NoteTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new Note();
    },
    
    initTestObject: function()
    {
        var objTestObject = this.getTestObject();
        objTestObject.init( { Note_ID: 'testnoteid' } );
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnUntrashComplete();
        this.testIsOwner();
    },
    
    testOnUntrashComplete: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.m_objExtraInfo = {
            Trash: true
        };
        
        // Test1 - OnUntrashComplete with no system meta tags.
        objTestObject.resetRaisedMessages();
        objTestObject.OnUntrashComplete();
        objTestObject.testRaisedMessages( {
            notesave: null,
            requestsystemcategoriesaddnote: { to: SystemCategories.Categories.all },
            requestsystemcategoriesdeletenote: { to: SystemCategories.Categories.trashed }
        }, 'test1 - raised messages, no system meta tags' );
        
        // test2 - trash flag got cleared.
        fireunit.ok( false === objTestObject.m_objExtraInfo.Trash, 'test2: trash flag cleared' );
        
    },
    
    testIsOwner: function()
    {
        var objTestObject = this.getTestObject();
        
        objTestObject.m_objExtraInfo.Share_Owner = undefined;
        
        // test1 - if Share_Owner is undefined, then isOwner should return true.
        fireunit.ok( true === objTestObject.isOwner(), 'test1: current user is owner' );
        
        // test2 - if Share_Owner is defined, tehn isOwner should return false.
        objTestObject.m_objExtraInfo.Share_Owner = 'testuser';
        fireunit.ok( false === objTestObject.isOwner(), 'test2: current user is not the owner' );
    }
} );



