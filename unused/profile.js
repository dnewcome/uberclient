/* MethodProfiler class. */
/* Taken nearly directly from the Pro JavaScript Design Patterns book */
/*  www.jsdesignpatterns.com */

var MethodProfiler = function(component) {
  this.component = component;
  this.timers = {};
  this.totals = {};
  this.entercounts = {};
  
  var that=this;
  var displayTotal = function(methodName) {
    if( console && console.log )
    {
        var count = that.entercounts[methodName] || 0;
        var total = that.totals[methodName] || 0;
        var avg = count/total || 0;
        console.log(methodName + ' entry count : ' + count + 
            ' total : ' + total + ' ms' +
            ' average : ' + avg + ' ms' );
    } // end if
  };
  component.displayTotal = displayTotal;
  
  for(var key in this.component) {
    // Ensure that the property is a function.
    if(typeof this.component[key] !== 'function') {
      continue;
    }

    // Add the method.
    var that = this;
    (function(methodName) {
      that[methodName] = function() {
        that.startTimer(methodName);
        var returnValue = that.component[methodName].apply(that.component, 
          arguments);
        var elapsed = that.getElapsedTime(methodName);
        var total = that.addToTotal(methodName, elapsed);
        //that.displayTime(methodName, elapsed, total);
        return returnValue;
      };
    })(key); }
};
MethodProfiler.prototype = {
  startTimer: function(methodName) {
    this.entercounts[methodName] = ( this.entercounts[methodName] || 0 )+1;
    this.timers[methodName] = (new Date()).getTime();
  },
  getElapsedTime: function(methodName) {
    return (new Date()).getTime() - this.timers[methodName];
  },
  addToTotal: function(methodName, milliseconds) {
    var newtotal = this.totals[methodName] = (this.totals[methodName] || 0) + milliseconds;
    return newtotal;
  },
  displayTime: function(methodName, time, total) {
    if( console && console.log )
    {
        console.log(methodName + ': ' + time + ' ms - total: ' + total + ' ms');
    } // end if
  }
};

/*UberEvents = new MethodProfiler(UberEvents);*/

/* ClassProfiler class. */
/* Taken nearly directly from the Pro JavaScript Design Patterns book */
/*  www.jsdesignpatterns.com */

var ClassProfiler = function(component) {
  this.component = component;
  this.component.orig_funcs = {};
  this.timers = {};
  this.totals = {};
  this.entercounts = {};
  
  var that=this;
  var displayTotal = function(methodName) {
    if( console && console.log )
    {
        console.log(methodName + ' entry count : ' + ( that.entercounts[methodName] || 0 ) +   ' total : ' + ( that.totals[methodName] || 0 ) + ' ms');
    } // end if
  };
  
  component.displayTotal = displayTotal;    
  for(var key in this.component.prototype) {
    // Ensure that the property is a function.
    if(typeof this.component.prototype[key] !== 'function') {
      continue;
    }

    // Add the method.
    (function(methodName) {
        that.component.orig_funcs[methodName] = component.prototype[methodName];
        that.component.prototype[methodName] = function() {
        that.startTimer(methodName);
        var returnValue = that.component.orig_funcs[methodName].apply(this, 
          arguments);
        var elapsed = that.getElapsedTime(methodName);
        var total = that.addToTotal(methodName, elapsed);
       // that.displayTime(methodName, elapsed, total);
        return returnValue;
      };
    })(key); }
    return component;
};
ClassProfiler.prototype = {
  startTimer: function(methodName) {
    this.entercounts[methodName] = ( this.entercounts[methodName] || 0 )+1;
    this.timers[methodName] = (new Date()).getTime();
  },
  getElapsedTime: function(methodName) {
    return (new Date()).getTime() - this.timers[methodName];
  },
  addToTotal: function(methodName, milliseconds) {
    var newtotal = this.totals[methodName] = (this.totals[methodName] || 0) + milliseconds;
    return newtotal;
  },
  displayTime: function(methodName, time, total) {
    if( console && console.log )
    {
        console.log(methodName + ': ' + time + ' ms - total: ' + total + ' ms');
    } // end if
  }

};


/*Context = new ClassProfiler(Context);*/