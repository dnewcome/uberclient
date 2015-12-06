function Comment()
{
    Comment.Base.constructor.apply( this, arguments );
};
UberObject.Base( Comment, MetaTag );

Object.extend( Comment.prototype, {
    deleteMe: function( in_strModelID, in_dtUpdate, in_bSkipDBSave )
    {
        var objConfig = {
            commentID: this.m_strID
        };

        var bRetVal = Comment.Base.deleteMe.apply( this, [ 'NoteCommentRemove', objConfig, in_bSkipDBSave ] );
        return bRetVal;
    }
} );
