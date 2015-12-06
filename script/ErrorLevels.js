/*
* We have to put these in a separate file that can be included in the external includes before
*   the config file.  Config depends on these values.
*/
var ErrorLevels = {};
ErrorLevels.eErrorLevel = new Enum(
    'INFO',
    'LOW',
    'MEDIUM',
    'HIGH',
    'EXTREME',      /* EXTREME and CRITICAL cause logouts in non-debug mode */
    'CRITICAL'
);

ErrorLevels.eErrorType = new Enum( 
    'INFO',
    'ASSERT', 
    'WARNING',
    'ERROR',
    'EXCEPTION'
);
