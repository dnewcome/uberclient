function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'NotesPagingTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new NotesPaging();
    },
    
    getExpectedConfig: function()
    {
        return { m_objConfig: null };
    },
    
    getExpectedListeners: function()
    {
        return {
            requestdisplaynotes: null,
            requestdisplaysinglenote: null,
            setHeight: null,
	        notetrash: null,
	        notedelete: null,
	        noteuntrash: null,
	        notehidden: null,
	        noteunhidden: null,
	        notesemptytrash: null
        };
    
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
    }
    
} );



