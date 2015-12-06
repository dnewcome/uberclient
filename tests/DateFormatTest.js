/**
* Copy and reuse this file as the beginning place for a unit tests javascript.
*/
function UnitTestHarness()
{
    UnitTestHarness.Base.constructor.apply( this, arguments );
    this.m_strTestName = 'DateFormatTest';
};
UberObject.Base( UnitTestHarness, UberUnitTest );

Object.extend( UnitTestHarness.prototype, {
    createTestObject: function()
    {   // Create a fake test object because we aren't testing an instantiable class.
        return new UberObject();
    },
    
    test: function()
    {
        UnitTestHarness.Base.test.apply( this, arguments );
     
        this.testExpandingDate();   
		this.testExpandingDateTime();
        this.testTodayFuzzyDate();
    },
    
    testExpandingDate: function()
    {
        var objNow = new Date();
        var objDate = new Date( 'December 25, 2008' );
        
        // test1 - first set the date to sometime in a past year.  See if we get the full year.
        var strString = objDate.format( 'EXPANDINGDATE' );
        fireunit.compare( 'Dec 25, 2008', strString, 'test1: format for past year correct' );
        
        // test2 - set the year to this year and see if it drops the year.
        objDate.setFullYear( objNow.getFullYear() );
        var strString = objDate.format( 'EXPANDINGDATE' );
        fireunit.compare( 'Dec 25', strString, 'test2: format for current year correct' );

        // test3 - test the current day to see if it displays time with am.
        objNow.setHours( 1 );
        objNow.setMinutes( 30 );
        var strString = objNow.format( 'EXPANDINGDATE' );
        fireunit.compare( '1:30 AM', strString, 'test3: current day, set to 1:30 AM' );

        // test4 - test the current day to see if it displays time with pm.
        objNow.setHours( 13 );
        objNow.setMinutes( 30 );
        var strString = objNow.format( 'EXPANDINGDATE' );
        fireunit.compare( '1:30 PM', strString, 'test4: current day, set to 1:30 PM' );
        
    },

    testExpandingDateTime: function()
    {
        var objNow = new Date();
        var objDate = new Date( 'December 25, 2008 14:23' );
        
        // test1 - first set the date to sometime in a past year.  See if we get the full year.
        var strString = objDate.format( 'EXPANDINGDATETIME' );
        fireunit.compare( 'Dec 25, 2008@2:23 PM', strString, 'test1: format for past year correct' );
        
        // test2 - set the year to this year and see if it drops the year.
        objDate.setFullYear( objNow.getFullYear() );
        var strString = objDate.format( 'EXPANDINGDATETIME' );
        fireunit.compare( 'Dec 25@2:23 PM', strString, 'test2: format for current year correct' );

        // test3 - test the current day to see if it displays time with am.
        objNow.setHours( 1 );
        objNow.setMinutes( 30 );
        var strString = objNow.format( 'EXPANDINGDATETIME' );
        fireunit.compare( 'today@1:30 AM', strString, 'test3: current day, set to 1:30 AM' );

        // test4 - test the current day to see if it displays time with pm.
        objNow.setHours( 13 );
        objNow.setMinutes( 30 );
        var strString = objNow.format( 'EXPANDINGDATETIME' );
        fireunit.compare( 'today@1:30 PM', strString, 'test4: current day, set to 1:30 PM' );
        
    },
    
    testTodayFuzzyDate: function()
    {
        var objDate = new Date( 'December 25, 2008' );
        
        // test1 - first set the date to sometime in a past year.  See if we get the full year.
        var strString = objDate.format( 'TODAYFUZZY' );
        fireunit.compare( 'Dec 25, 2008', strString, 'test1: format for past year correct' );
        
        // test2 - do right now.
        objNow = new Date();
        var strString = objNow.format( 'TODAYFUZZY' );
        fireunit.compare( 'just now', strString, 'test2: format for just now' );
        
        // test3 - do a minute ago
        objNow.setMinutes( objNow.getMinutes() - 1 );
        var strString = objNow.format( 'TODAYFUZZY' );
        fireunit.compare( '1 minute ago', strString, 'test3: format for one minute ago.' );

        // test4 - do this year, but not in the last month, make sure there is no year.
        objNow.setMonth( 1 );
        objNow.setDate( 2 );
        var strString = objNow.format( 'TODAYFUZZY' );
        fireunit.compare( 'Feb 2', strString, 'test4: earlier this year.' );
        
    }
	
} );



