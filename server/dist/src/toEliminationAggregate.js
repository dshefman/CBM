'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var callbackCalc = require('callbacks/Callbacks');

/**
* usage: 
* var eliminationAggregate = toEliminationAggregate('Bronze Waltz')
* eliminationAggregate([100,101,105])
* eliminationAggregate([101,102,104])
* eliminationAggregate([100,103,105])
* var computedResults = eliminationAggregate(); 
* var availableCallbackOptions = computedResults.availableResults
* var callbackResults = computedResults.getResult(availableCallbackOptions[0])
*/

var toEliminationAggregate = exports.toEliminationAggregate = function toEliminationAggregate(eventName) {

	var judgesWantToSee = [];

	//dancerCallbacks == array of numbers
	console.log('[toEliminationAggregate]', eventName);

	return function (dancerCallbacks) {

		if (dancerCallbacks) {
			judgesWantToSee.push(dancerCallbacks);
		}

		return function () {

			var cb = new callbackCalc();
			var computedResults = cb.compute(judgesWantToSee);

			return {

				availableResults: computedResults.availableResults,
				getResult: function getResult(requestedNumber) {
					var callback_results = computedResults.results[requestedNumber];
					console.log('callback_results', callback_results);

					return {
						event: eventName,
						callback_results: callback_results
					};
				}
			};
		};
	};
};