function Notes()
{
    Notes.Base.constructor.apply( this, arguments );
}
UberObject.Base( Notes, ModelCollection );

/**
* eShareLevels enum
* read - you have read access to the note.
* write - you have write access to the note.
* none - you are the owner.
*/
Notes.eShareLevels = new Enum(
    'read',
    'write',
    'none'
);
