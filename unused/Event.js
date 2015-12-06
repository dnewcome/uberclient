/**
* class Event: holds hash object of callback function refs. Use this to handle cases
* where more than one listener must be registered to a custom event
*/
function Event()
{
	var me = this;
	me.callbacks = new Object(); // hold on to all registered callbacks
	PublicMethods();
	
	function PublicMethods()
	{
		me.Raise = Raise;
		me.RegisterListener = RegisterListener;
		me.UnRegisterListener = UnRegisterListener;
	}
	
	/**
	* Raises the event, calling all registered handlers. Pass all the parameters that the registered 
	* callback functions expect to see, they will be applied through the `arguments' object even though
	* we don't have any params listed in the function signature here.
	*/
	function Raise() 
	{
		for( functionName in me.callbacks )
		{
			/* arguments is a javascript built-in array containing all args passed to Raise()
			we use apply so that the callee never knows we didn't know what args it expected to see 
			can't do typesafe callbacks, but at least we get all the args if we are careful
			must call Raise() using apply in order to propagate `this' ref... shane's method of storing
			context in a container is much better. */
			me.callbacks[functionName].apply( this, arguments );
			
		}
	}
	
	/**
	* Adds a callback function to the list of registered listeners
	* @listener {function} 
	*/
	function RegisterListener( listener )
	{
		me.callbacks[listener] = listener;
	}
	
	/**
	* Removes a callback function from the list of registered listeners
	* @listener {function} 
	*/
	function UnRegisterListener( listener )
	{
		for( functionName in me.callbacks )
		{
			if( me.callbacks[functionName] == listener ) 
			{
				delete me.callbacks[functionName];
			}
		}
	}

}
