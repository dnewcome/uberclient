/**
* class to construct all dialogs and to keep all dialog functionality in one place.
*/
function Dialogs()
{
	dlg = document.getElementById("dlgLoadingScreen");
	this.loadingscreen = new ModalDialog(dlg);

	dlg = document.getElementById("dlgConnectionScreen");
	this.connectionscreen = new ModalDialog(dlg);
	
}
