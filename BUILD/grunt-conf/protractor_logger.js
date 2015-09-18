'use strict';

var Cucumber = require('cucumber')
  , listener = Cucumber.Listener();
listener.hasHandlerForEvent = function() { return true };
listener.getHandlerForEvent = function() { return handler };

function handler(event, callback) {
	var error_message, resultStatus, failureMessage;
    var eventName = event.getName();
    //console.log('Event: ************************** [' + eventName + ']');
    if (eventName === "StepResult" ) {
		var stepResult = event.getPayloadItem('stepResult');
		if (stepResult.isSuccessful()) {
	      resultStatus = 'passed';
	    }
	    else if (stepResult.isPending()) {
	      resultStatus = 'pending';
	      error_message = 'pending';
	    }
	    else if (stepResult.isSkipped()) {
	      resultStatus = 'skipped';
	      error_message = 'skipped';
	    }
	    else if (stepResult.isUndefined()) {
	      resultStatus = 'undefined';
	      error_message = 'undefined';
	    }
	    else {
	      resultStatus = 'failed';
	      failureMessage = stepResult.getFailureException();
	      if (failureMessage) {
	        error_message = (failureMessage.stack || failureMessage);
	        error_message = (failureMessage.error || failureMessage);
	      }
	    }

		console.log("//[E2E] [" + resultStatus + '] - ' + stepResult.getStep().getName() );
		if (stepResult.isFailed()) {
		    console.log("//[E2E] !!! " + error_message);
		    //watch_var(error_message);
		}
    };
    
    if (eventName === "BeforeScenario" ) {
		var scenarioResult = event.getPayloadItem('scenario');
		console.log('//[E2E] Scenario: ' + scenarioResult.getName());
	};

    if (eventName === "BeforeFeature" ) {
		var featureResult = event.getPayloadItem('feature');
		console.log('//[E2E] Feature: ' + featureResult.getName());
		console.log('//[E2E] ' + featureResult.getUri());
    };
    
    callback();
}

function watch_var(v) {
	for (var k in v){
	    if (v.hasOwnProperty(k)) {
    		 console.log("//[E2E] [debug] Key is " + k + ", value is " + v[k]);
    		 if ( v[k] && typeof(v[k]) == 'function') {
    		 	try {
	    		 	console.log(v[k]());
    		 	} catch (e) {

    		 	}
    		 }
	    }
	}
}

module.exports = function () {

    this.registerListener(listener);

};