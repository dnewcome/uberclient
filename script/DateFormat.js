
/*
 * Date Format 1.2.2
 * (c) 2007-2008 Steven Levithan <stevenlevithan.com>
 * MIT license
 * Includes enhancements by Scott Trenda <scott.trenda.net> and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) { val = "0" + val; }
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date();
		if (isNaN(date)) { throw new SyntaxError("invalid date"); }

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};


// Based on: EXTERNAL: http://ejohn.org/blog/javascript-pretty-date/
/* FuzzyDate - make a pretty date based off of a javascript date
* @param {Date} time - Javascript date
* @returns {String} a pretty date
*/
dateFormat.fuzzyDate = function( date )
{
    var strRetVal = '';
    if( TypeCheck.Date( date ) )
    {
	    var diff = (((new Date()).getTime() - date.getTime()) / 1000);
	    var day_diff = Math.floor(diff / 86400);
    			
        if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        {
	        return dateFormat.toLocaleDateTimeString( date );
	    } // end if
    			
        strRetVal = day_diff == 0 && (
		        diff < 60 && "just now" ||
		        diff < 120 && "1 minute ago" ||
		        diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
		        diff < 7200 && "1 hour ago" ||
		        diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
	        day_diff == 1 && "Yesterday" ||
	        day_diff < 7 && day_diff + " days ago" ||
	        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
	} // end if
	return strRetVal;
};

dateFormat.todayModify = function( in_dtDate, in_strTodayFormat, in_strOtherFormat )
{
    var strRetVal = '';
    if( TypeCheck.Date( in_dtDate ) )
    {
	    var dtNow = new Date();
        
        var strFormat = ( ( in_dtDate.getDate() == dtNow.getDate() )
                       && ( in_dtDate.getYear() == dtNow.getYear() )
                       && ( in_dtDate.getMonth() == dtNow.getMonth() ) )
            ? in_strTodayFormat : in_strOtherFormat;
        
        strRetVal = in_dtDate.format( strFormat );
	} // end if
	return strRetVal;
};

/**
* dateFormat.expandingDate - this tries to make the date as 'relevant' or 'short' as possible.
*   if the date is today, it puts in the hours/minutes, if the date is this year, it puts in
*   only the month and the day.  If the date is not from this year, it puts the month, the date, 
*   and the year.
* @param {Date} in_dtDate - the date to return an expanding date for.
* @returns {String} - string representation of the date.
*/
dateFormat.expandingDate = function( in_dtDate )
{
    var strRetVal = '';
    var dtNow = new Date();
    if( dtNow.getYear() === in_dtDate.getYear() )
    {
        strRetVal = dateFormat.todayModify( in_dtDate, dateFormat.masks.shortTime, 'mmm d' );
    } // end if
    else
    {
        strRetVal = in_dtDate.format( dateFormat.masks.mediumDate );
    } // end if-else
    return strRetVal;
};


/**
* dateFormat.expandingDateTime - this tries to make the date as 'relevant' or 'short' as possible.
*   if the date is today, it puts in the hours/minutes, if the date is this year, it puts in
*   only the month, the day, and the time.  If the date is not from this year, it puts the month, the date, 
*   the year, and the time.
* @param {Date} in_dtDate - the date to return an expanding date for.
* @returns {String} - string representation of the date.
*/
dateFormat.expandingDateTime = function( in_dtDate )
{
    var strRetVal = '';
    var dtNow = new Date();
    if( dtNow.getYear() === in_dtDate.getYear() )
    {
        if( ( in_dtDate.getDate() == dtNow.getDate() )
	     && ( in_dtDate.getMonth() == dtNow.getMonth() ) )
		{
			strRetVal = 'today@' + in_dtDate.format( dateFormat.masks.shortTime );
		} // end if
		else
		{
			strRetVal = in_dtDate.format( "mmm dd@h:MM TT" );
		} // end if-else
    } // end if
    else
    {
        strRetVal = in_dtDate.format( "mmm dd, yyyy@h:MM TT" );
    } // end if-else
    return strRetVal;
};

/**
* todayFuzzy - return the fuzzy date if today, otherwise return
*   an expanding date
* @param {Date} in_dtDate - date to display
* @returns {String} formatted string.
*/
dateFormat.todayFuzzy = function( in_dtDate )
{
    return dateFormat.todayModify( in_dtDate, 'FUZZY', 'EXPANDINGDATE' );
};

/**
* Convert js date to 12hr formatted string
* @datetime {Date} (optional) Javascript date object to convert to text
* @returns {String} Localized time/date string if a valid date, empty otherwise.
*/
dateFormat.toLocaleDateTimeString = function( datetime )
{
    var strRetVal = '';
    if( TypeCheck.Date( datetime ) )
    {
        strRetVal = datetime.toLocaleDateString() + ' ' +datetime.toLocaleTimeString();
    } // end if
    
    return strRetVal;
};

	
// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
if( !Date.prototype.format )
{
    Date.eDateFormat = new Enum( 
        'REGULAR', 
        'FUZZY', 
        'TODAYFUZZY',
        'EXPANDINGDATE',
		'EXPANDINGDATETIME',
        'DATE',
        'DATENOYEAR',
        'TIME'
    );
    
Date.prototype.format = function( in_eFormat ) {
      
      var strRetVal = '';
      
      switch( in_eFormat )
      {
        case 'REGULAR':
            strRetVal = dateFormat.toLocaleDateTimeString( this );
            break;
        case 'FUZZY':
            strRetVal = dateFormat.fuzzyDate( this );
            break;
        case 'TODAYFUZZY':
            strRetVal = dateFormat.todayFuzzy( this );
            break;
        case 'EXPANDINGDATE':
            strRetVal = dateFormat.expandingDate( this );
            break;
        case 'EXPANDINGDATETIME':
            strRetVal = dateFormat.expandingDateTime( this );
            break;
        case 'DATE':
            strRetVal = this.toLocaleDateString();
            break;
        case 'DATENOYEAR':
            strRetVal = dateFormat(this, 'mmm d', false);
            break;
        case 'TIME':
            strRetVal = this.toLocaleTimeString();
            break;
        default:
            strRetVal = dateFormat(this, in_eFormat );
            break;
      }
      return strRetVal;
    };
}
