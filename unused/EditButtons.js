/**
* Class EditButtons - this is the control containing the edit buttons for 
* editing note text Inherits from ViewBase
*/
function EditButtonsDisplay( model ) //: ViewBase
{
	var me = this;
	this.NoteModel = model.model; // temporarily the model is a child of Note...
	
	this.DomBuilder(); // call the base method
    
	for( var controlWidget in this.ControlWidgets )
	{
		var widget = this.ControlWidgets[controlWidget];
		BasicButtonBehavior.ApplyBehavior( widget );
	}
	
}
EditButtonsDisplay.prototype = new ViewBase( "EditButtons" );