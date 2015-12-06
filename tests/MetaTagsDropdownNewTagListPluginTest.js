
var TemplateManager = {
    GetTemplate: function( in_strName )
    { 
        var objElement = document.createElement( 'div' );
        objElement.innerHTML = '<div id="listitem1"><div class="name">listitem1</div></div>';
        return objElement.firstChild;
    }
};

function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'MetaTagsDropdownNewTagListPluginTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create the test object here
        return new MetaTagsDropdownNewTagsListPlugin();
    },
    
    initTestObject: function()
    {
        UnitTestHarness.Base.initTestObject.apply( this, arguments );
        var objTestObject = this.getTestObject();
        objTestObject.m_objTagList = new ListDisplay();
    },
    
    getExpectedListeners: function()
    {
        return {
            childinitialization: null,
            onbeforeshow: null,
            addnewtag: null,
            cancelnewtag: null
        };
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
        
        this.testOnBeforeShow();
        this.testOnAddNewTag();
        this.testOnCancelNewTag();
    },
    
    testOnBeforeShow: function()
    {
        var objTestObject = this.getTestObject();
        
        // test1 - add a couple of items and make sure they can be removed.
        objTestObject.OnAddNewTag( 'tag1' );
        objTestObject.OnAddNewTag( 'tag2' );
        objTestObject.OnBeforeShow();
        
        fireunit.ok( !objTestObject._isNewTag( 'tag1' ), 'test1: tag1 removed' );
        fireunit.ok( !objTestObject._isNewTag( 'tag2' ), 'test1: tag2 removed' );
    },
    
    testOnAddNewTag: function()
    {
        var objTestObject = this.getTestObject();

        // test1 - add a couple of items and make sure they are there.
        objTestObject.OnAddNewTag( 'tag1' );
        objTestObject.OnAddNewTag( 'tag2' );
        
        fireunit.ok( objTestObject._isNewTag( 'tag1' ), 'test1: tag1 is added' );
        fireunit.ok( objTestObject._isNewTag( 'tag2' ), 'test1: tag2 is added' );
        
        // test2 - does not blow up if we try to add again.
        objTestObject.OnAddNewTag( 'tag1' );
        fireunit.ok( objTestObject._isNewTag( 'tag1' ), 'test2: tag1 readded' );
    },
    
    testOnCancelNewTag: function()
    {
        var objTestObject = this.getTestObject();
        // test1 - add a couple of items and make sure they are there.
        objTestObject.OnCancelNewTag( 'tag1' );
        objTestObject.OnCancelNewTag( 'tag2' );
        
        fireunit.ok( ! objTestObject._isNewTag( 'tag1' ), 'test1: tag1 is removed' );
        fireunit.ok( ! objTestObject._isNewTag( 'tag2' ), 'test1: tag2 is removed' );

        // test2 - does not blow up if we try to remove again.
        objTestObject.OnCancelNewTag( 'tag1' );
        fireunit.ok( ! objTestObject._isNewTag( 'tag1' ), 'test2: tag1 is removed' );
    }
} );



