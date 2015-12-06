/**
* Ubernote is a Singleton that holds the runtime state of the editor.
* standaloneeditor means we are a one note application.
* full is the full app.
*/
var Ubernote = {
    m_bFullApp: false,
    m_bStandaloneEditor: false,

    m_strNoteID: undefined,
    m_strSID: undefined,
    m_strUpdateString: undefined,
    m_strUserName: undefined,
    m_strVersion: undefined
};

if( !Array.prototype.forEach ) {
	Array.prototype.forEach = function( callback, context ) {
		for( var index = 0, item; item = this[ index ]; ++index ) {
			callback.call( context || null, item, index );
		}
	};
}
