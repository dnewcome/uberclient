/**
* SystemCategories - a subclassed Categories object specialized for decoding 
*   system category database results.
*/
function SystemCategories()
{
};

SystemCategories.Categories = new Enum( 
    'all', 
    'untagged', 
    'trashed', 
    'starred', 
    'bookmarked',
    'search',
    'unchecked',
    'hidden',
    'public'
);
