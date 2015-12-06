/// <source>
/// <name>FunMon2.js</name>
/// <project>
/// <name>Function Monitor</name>
/// <url-title>Function Monitor Project</url-title>
/// <url>/projects/funmon/</url>
/// </project>
/// <package>
///	<static-class>
///		<name>FunctionMonitor</name>
///		<description>A library for monitoring function calls.</description>
///		<version>2.0</version>
///
/*
	Stephen W. Cote
	
	Function Monitor v2.0
*/


/// <example>
/// <name>Monitor a Function With Window Reference</name>
/// <description>Register a function to be monitored using a window reference.  This is used for referencing functions in other frames, or when monitoring functions where the <i>this</i> reference is needed. Note that the <i>Object.prototype</i> syntax must be present to monitor a prototyped function.  While the windowRef parameter can be used to register a function on a specific script object defined within a hash, that function registration cannot later be removed.</description>
/// <syntax>FunctionMonitor.register(sName, vWindow, sClass);</syntax>
/// <code>function ObjectClass(){</code>
/// <code>   this.name = "test object";</code>
/// <code>}</code>
/// <code>ObjectClass.prototype.doAction = function(){</code>
/// <code>   alert(this.name);</code>
/// <code>   // do something</code>
/// <code>}</code>
/// <code>var oObj = new ObjectClass();</code>
/// <code>FunctionMonitor.register("doAction",window,"ObjectClass");</code>
/// <code>oObj.doAction();</code>
/// </example>

/// <example>
/// <name>Stop monitoring a Function With Window Reference</name>
/// <description>Unregister a function from being monitored using a window reference.</description>
/// <syntax>FunctionMonitor.register(sName, vWindow, sClass);</syntax>
/// <code>function ObjectClass(){</code>
/// <code>   this.name = "test object";</code>
/// <code>}</code>
/// <code>ObjectClass.prototype.doAction = function(){</code>
/// <code>   alert(this.name);</code>
/// <code>   // do something</code>
/// <code>}</code>
/// <code>// where FunctionMonitor.register was previously used</code>
/// <code>FunctionMonitor.unregister("doAction",window,"ObjectClass");</code>

/// </example>

/// <example implementation="1">
/// <name>Implement FunctionMonitor</name>
/// <description>Implement this package on a Web page.</description>
/// <code><![CDATA[<script type = "text/javascript" src = "FunMon2.js"></script>]]></code>
/// </example>

/// <example>
/// <name>Monitor a Function</name>
/// <description>Register a function to be monitored.</description>
/// <syntax>FunctionMonitor.register(sName);</syntax>
/// <code>function MonitorThis(){</code>
/// <code>   // Some code</code>
/// <code>}</code>
/// <code>FunctionMonitor.register("MonitorThis");</code>
/// </example>

/// <example>
/// <name>Stop Monitoring a Function</name>
/// <description>Unregister a function from being monitored.</description>
/// <syntax>FunctionMonitor.unregister(sName);</syntax>
/// <code>function MonitorThis(){</code>
/// <code>   // Some code</code>
/// <code>}</code>
/// <code>// where FunctionMonitor.register was previously used</code>
/// <code>FunctionMonitor.unregister("MonitorThis");</code>
/// </example>

	/// <object private="1" internal = "1">
	/// <name>Metric</name>
	/// <description>Object representing a function metric.</description>
	/// <property name = "start" type = "int">Start time of the metric in milliseconds.</property>
	/// <property name = "stop" type = "int">Stop time of the metric in milliseconds.</property>
	/// <property name = "valOffset" type = "int">Difference between function execution time and internal execution time in milliseconds.</property>
	/// <property name = "route" type = "String">String representing the function trace.</property>
	/// <property name = "monStatus" type = "int">Integer identifying the stat the variant object identifier.</property>
	/// <property name = "duration" type = "int">Not used.</property>
	/// <property name = "caller" type = "function">Pointer to the caller of the this monitored instance.</property>
	/// <property name = "parentName" type = "String">Not used.</property>
	/// </object>

	/// <object private="1" internal = "1">
	/// <name>FunctionStore</name>
	/// <description>Object representing a stored function reference.</description>
	/// <property name = "name" type = "String">Name of the function</property>
	/// <property name = "classRef" type = "String">Name of the parent or prototype class.</property>
	/// <property name = "refName" type = "String">Name of the window reference.</property>
	/// <property name = "ref" type = "object">Pointer to the window reference.</property>
	/// <property name = "fp" type = "function">Pointer to the original function.</property>
	/// <property name = "index" type = "int">Index into the reverse function map.</property>
	/// <property name = "metrics" type = "array">Array of collected Metric objects.</property>
	/// <property name = "stackCount" type = "int">Current marker into the metric stack.</property>
	/// </object>

var FunctionMonitor = {
		/// <property type = "String" get = "1">
		/// <name>version</name>
		/// <description>The version of the class.</description>
		/// </property>
		///	
		version:"2.0",

		/// <property type = "boolean" get = "1" set = "1" default = "true">
		/// <name>can_trace</name>
		/// <description>Bit indicating whether function stacks should be traced.</description>
		/// </property>
		///	
		can_trace:1,

		/// <property type = "array" get = "1" private = "1">
		/// <name>functions</name>
		/// <description>Array of monitored functions.</description>
		/// </property>
		///
		functions:[],

		/// <property type = "array" get = "1" private = "1">
		/// <name>function_index</name>
		/// <description>Reverse lookup array of monitored functions.</description>
		/// </property>
		///
		function_index:[],

		/// <property type = "int" get = "1" set = "1" default = "20">
		/// <name>stack_len</name>
		/// <description>Maximum number of records to store before overwriting previous values.</description>
		/// </property>
		///
		stack_len:20,

		/// <property type = "boolean" get = "1" set = "1" default = "true">
		/// <name>hold_max</name>
		/// <description>Bit indicating whether stored values should not be overwritten if new values are less than the stored values.</description>
		/// </property>
		///
		hold_max:1,

		/// <method>
		/// <name>clearMetrics</name>
		/// <description>Clears stored metrics.</description>
		/// </method>
		///
		clearMetrics:function(){
			var iFLen=FunctionMonitor.function_index.length,i=0, vFP;
			for(;i<iFLen;){
				vFP=FunctionMonitor.functions[FunctionMonitor.function_index[i++]];
				vFP.metrics.length=0;
				vFP.stackCount=0;
			}
		},
		/// <method>
		/// <name>getAllMetrics</name>
		/// <description>Returns all collected metrics in a formatted hierarchy.</description>
		/// <return-value name = "sTxt" type = "String">string representing the collected metrics.</return-value>
		/// </method>
		///
		getAllMetrics:function(){
			var iFLen=FunctionMonitor.function_index.length,i = 0, s = [];
			for(;i<iFLen;){
				s.push(FunctionMonitor.getMetrics(FunctionMonitor.function_index[i++]));
			}
			return s.join("\n");
		},
		/// <method>
		/// <name>getMetrics</name>
		/// <param name="sName" type="String">name of the monitored function</param>
		/// <description>Returns collected metrics for the specified function in a formatted hierarchy.</description>
		/// <return-value name = "sTxt" type = "String">string representing the collected metrics.</return-value>
		/// </method>
		///
		getMetrics:function(sFunctionName){
			var vFP=FunctionMonitor.functions[sFunctionName], r = [], i = 0, oM, iL, aM, iMLen, sTab;
			if(typeof(vFP)=="object"){
				r.push(sFunctionName + ":");
				aM=vFP.metrics;
				iMLen=aM.length;
				var sTab="   ";
				for(;i<iMLen;i++){
					oM=aM[i];
					iL=-1;
					if(oM && oM.stop && oM.start){
						iL=oM.stop - oM.start;
					}
					r.push(sTab + "#" + i + " time=" + iL);
					if(oM.valOffset > 0){
						r.push(sTab + sTab + "process: " + oM.valOffset);
					}
					if(oM.route!=null && oM.route!="null"){
						r.push(sTab + sTab + "trace = " + oM.route);
					}
				}
			}
			else{
				r.push(sFunctionName + " is not a registered function.");
			}
			return r.join("\n");
		},

		/// <method>
		/// <name>unregister</name>
		/// <param name="sName" type="String">name of the monitored function</param>
		/// <param name="oWindow" type="object" optional = "1">object reference to a browser window.</param>
		/// <param name = "sClass" type = "String" optional = "1">name of the class prototype to which the function belongs.</param>
		/// <description>Unregisters a monitored function.</description>
		/// </method>
		///
		unregister : function(sFunctionName,windowRef,sClassRef){
			var oFrame=window, sFrameName="window", sRefer = "", sFuncStore, vFP, iIndex,vPFP;
			if(windowRef && windowRef!=window) oFrame=windowRef;
				
			if(sFrameName!="window") sRefer=sFrameName + "-";
			if(sClassRef) sRefer+=sClassRef + "--";
			sFuncStore="dispatch-" + sRefer + sFunctionName;


			vFP=this.functions[sFuncStore];
	
			if(!vFP){
				alert(sFuncStore + " is not a monitored function");
				return;
			}
	
	
			iIndex=vFP.index;
			FunctionMonitor.function_index[iIndex]=null;	

			if(!sClassRef){
				if(oFrame[sFunctionName]){
					oFrame[sFunctionName]=vFP.fp;
				}
				else{
					alert(sFunctionName + " does not exist");
				}
			}
			else{
				if(oFrame[sClassRef].prototype[sFunctionName]){
					oFrame[sClassRef].prototype[sFunctionName]=vFP.fp;
				}
				else{
					alert(sClassRef + "." + sFunctionName + " does not exist.");
				}
			}

			if(!FunctionMonitor[sFuncStore]){
				alert(sFuncStore + " does not have a monitor definition.");
				return;
			}

			vPFP=this[sFuncStore];
			if(oFrame.onload==vPFP) oFrame.onload=vFP.fp;
			FunctionMonitor[sFuncStore]=null;
			FunctionMonitor._pack();
		},

		/// <method private = "1" internal = "1">
		/// <name>_pack</name>
		/// <description>Collapses the functions and function_index arrays.</description>
		/// </method>
		///
		_pack:function(){
			var aTemp1=FunctionMonitor.functions, aTemp2=FunctionMonitor.function_index, iL, i=0, iIndex, vD;
			FunctionMonitor.functions=[];
			FunctionMonitor.function_index=[];
			iL=aTemp2.length;
			for(;i<iL;i++){
				if(aTemp2[i]!=null){
					iIndex=FunctionMonitor.function_index.length;
					FunctionMonitor.function_index[iIndex]=aTemp2[i];
					vD=aTemp1[aTemp2[i]];
					vD.index=iIndex;
					FunctionMonitor.functions[aTemp2[i]]=vD;
				}
			}
		},

		/// <method>
		/// <name>register</name>
		/// <param name="sName" type="String">name of the monitored function</param>
		/// <param name="oWindow" type="object" optional = "1">object reference to a browser window.</param>
		/// <param name = "sClass" type = "String" optional = "1">name of the class prototype to which the function belongs.</param>
		/// <description>Registers a function to be monitored.</description>
		/// </method>
		///
		register:function(sFunctionName,windowRef,sClassRef){
			var oFrame=window,sFrameName="window", vFP, sRefer="", sFuncStore, iIndex=-1;
			if(windowRef){
				if(windowRef!=window){
					oFrame=windowRef;
					if(oFrame.name){
						sFrameName=oFrame.name;
					}
					else{
						sFrameName="frame";
					}
				}
			}
	
			if(!sClassRef){
				vFP=oFrame[sFunctionName];
			}
			else{
				vFP=oFrame[sClassRef];
				if(vFP){
					if(vFP.prototype) vFP=vFP.prototype[sFunctionName];
					else vFP = vFP[sFunctionName];
				}
			}
	
			if(typeof(vFP)=="function"){
				if(sFrameName!="window") sRefer=sFrameName + "-";
				if(sClassRef) sRefer+=sClassRef + "--";
				sFuncStore="dispatch-" + sRefer + sFunctionName;
				if(!FunctionMonitor.functions[sFuncStore]){
					iIndex=FunctionMonitor.function_index.length;
					FunctionMonitor.function_index[iIndex]=sFuncStore;
				}
				else{
					iIndex=FunctionMonitor.functions[sFuncStore].index;
				}
				FunctionMonitor.functions[sFuncStore] = 
					{name:sFunctionName,classRef:sClassRef,refName:sFrameName,ref:oFrame,fp:vFP,index:iIndex,metrics:[],stackCount:0};
				eval('FunctionMonitor["' + sFuncStore + '"]=function(){return FunctionMonitor.dispatch("' + sFuncStore + '",this,arguments);}');

				if(!sClassRef){
					oFrame[sFunctionName]=FunctionMonitor[sFuncStore];
				}
				else{
					if(oFrame[sClassRef].prototype) oFrame[sClassRef].prototype[sFunctionName]=FunctionMonitor[sFuncStore];
					else oFrame[sClassRef][sFunctionName]=FunctionMonitor[sFuncStore];
				}
		
				if(oFrame.onload==vFP) oFrame.onload=FunctionMonitor[sFuncStore];
			}
			else{
				alert(sFunctionName + " is not a function");
			}
		},
	
		/// <method private = "1" internal = "1">
		/// <name>makeMetric</name>
		/// <description>Returns a new Metric object.</description>
		/// </method>
		///
		makeMetric : function(){
			return {start:null,stop:null,valOffset:-1,route:null,monStatus:-1,duration:-1,caller:null,parentName:null};
		},
		
		/// <method private = "1" internal = "1">
		/// <name>dispatch</name>
		/// <param name = "sStoreName" type = "String">Internal lookup name for a monitored function.</param>
		/// <param name = "vThis" type = "variant">Pointer to the <i>this</i> object.</param>
		/// <param name = "aArgs" type = "array">Arguments passed to the function.</param>
		/// <return-value name = "v" type = "variant">Returns the value returned by the monitored function.</return-value>
		/// <description>Receives function calls, invokes the original function, and monitors the execution time.</description>
		/// </method>
		///

	dispatch : function(sFuncStore,vThis,aArgs){
		var retVal, vFun = FunctionMonitor.functions[sFuncStore], z, vMet, vCaller, sCaller, oFr, d, iZ, iMLen, vM, iM1, iM2;
		if(!vFun){
			if(!FunctionMonitor.alert_error){
				FunctionMonitor.alert_error = 1;
				alert("Error: invalid function reference: " + sFuncStore);
			}
			return;
		}
		z=new Date();
		vMet=this.makeMetric();
		vCaller=null;
		sCaller=null;
		if(FunctionMonitor.dispatch.caller && FunctionMonitor.dispatch.caller.caller){
			vCaller=FunctionMonitor.dispatch.caller.caller;
		}
		if(FunctionMonitor.can_trace) vMet.route=FunctionMonitor.traceRoute(vCaller);
		oFr=vFun.ref;
		d=new Date();
		vMet.start=d.getTime();	
/*
		try{
*/

			if(!vFun.classRef){
				retVal=vFun.fp.apply(vCaller,aArgs);
			}
			else{
				retVal=vFun.fp.apply(vThis,aArgs);
			}
			vMet.monStatus=1;
/*
		}
		catch(e){
			vMet.monStatus=2;
			retVal=e;
		}
*/
		d=new Date();
		vMet.stop=d.getTime();

		iZ=z.getTime();
		z=new Date();
		vMet.valOffset=z.getTime() - iZ - (vMet.stop - vMet.start);		
		iMLen;
		if(FunctionMonitor.stack_len > 0){
			if(vFun.stackCount >= FunctionMonitor.stack_len) vFun.stackCount=0;
			iMLen=vFun.stackCount;
			vM=vFun.metrics[iMLen];			
			if(vM){
				iM1=vM.stop - vM.start;
				iM2=vMet.stop - vMet.start;
				if(iM1 > iM2) vMet=vM;
			}
			vFun.stackCount++;
		}
		else{
			iMLen=vFun.metrics.length;
		}
		vFun.metrics[iMLen]=vMet;
		return retVal;
	},
		/// <method private = "1" internal = "1">
		/// <name>traceRoute</name>
		/// <param name = "fFunction" type = "function">Reference to the function being invoked.</param>
		/// <return-value name = "sTrace" type = "String">String value representing the stack trace.</return-value>
		/// <description>Returns the call stack for the specified function.</description>
		/// </method>
		///
	traceRoute:function(vFP){
		var retVal="",aRoute=[],iCounter=0, sName;
		if(vFP != null){
			while(vFP && vFP != null ){
				sName=FunctionMonitor.getFunctionName(vFP.toString());
				if(sName==null){
					vFP=null;
					break;
				}
				aRoute.push(sName);
				vFP=vFP.caller;
			}
			retVal = aRoute.reverse().join("->");
		}
		else{
			retVal="null";
		}
		return retVal;
	},
		/// <method private = "1" internal = "1">
		/// <name>getFunctionName</name>
		/// <param name = "sFunction" type = "String">String representation of a function.</param>
		/// <return-value name = "sName" type = "String">The name of the function.</return-value>
		/// <description>Returns the name of a function based on the string representation of the whole function.</description>
		/// </method>
		///
	getFunctionName:function(sFP){
		var aM=sFP.match(/function\s([A-Za-z0-9_]*)\(/gi);	
		if(sFP==null) return sFP;
	
		if(aM!=null && aM.length){
			sFP=aM[0];
			sFP=sFP.replace(/^function\s+/,"");
			sFP=sFP.replace(/^\s*/,"");
			sFP=sFP.replace(/\s*$/,"");
			sFP=sFP.replace(/\($/,"");
			return sFP;
		}
		else{
			return null;
		}
	}
}

/// </static-class>
/// </package>
/// </source>
///