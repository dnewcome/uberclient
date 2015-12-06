/**
* class Comments: This is Comments collection model
*/
function Comments()
{
    Comments.Base.constructor.apply( this );
}
UberObject.Base( Comments, MetaTags );

Object.extend( Comments.prototype, {
    /**
    * dbAdd - Add a Category to the database.  
    * @param {String} in_strName {string} - Comment to add
    * @param {Array} in_astrNoteIDs (optional) - noteids to add 
    *   this tag to on DB create completion.
    * @Returns {Boolean} a Category object if successful, undefined otw.
    */
    dbAdd: function( in_strComment, in_strNoteID )
    {
        var objInput = { 
            noteID: in_strNoteID,
            comment: in_strComment,
            displayName: Ubernote.m_strUserName,
            inlineFlag: 'false'
	    };

	    var objOutput = {
	        Comment_ID: Util.convertSQLServerUniqueID,
	        Create_Dt: Util.convertSQLServerTimestamp
	    };

        var me=this;
        var OnComplete = function( in_objOutputArguments )
        {
	        if( in_objOutputArguments && in_objOutputArguments.Comment_ID ) 
	        {   
	            var objModel = me._createModelFromItem( { 
    	            ID: in_objOutputArguments.Comment_ID,
    	            Name: Ubernote.m_strUserName,
    	            Comment: in_strComment,
    	            Create_Dt: in_objOutputArguments.Create_Dt,
    	            Type: me.m_strModelType
    	        } );
    	        me.OnDBAddComplete( objModel );
    	        me.RaiseForAddress( 'requestnotecommentadd', in_strNoteID, [ objModel ] );
	        } // end if    
        };
        
	    var objRetVal = Util.callDBActionAsync( 'NoteCommentAdd', objInput, 
	        objOutput, OnComplete );
	    return objRetVal;
    }
} );
