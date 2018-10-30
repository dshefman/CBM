'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');

var processOutput = function processOutput(output) {

	var allResults = output.split('\n');

	var callbackResults = allResults.map(function (eventStr) {
		try {
			return JSON.parse(eventStr);
		} catch (err) {
			return null;
		}
	}).filter(function (event) {
		return event != null && event.hasOwnProperty('callback_results');
	});

	return callbackResults;
};

var getTitle = function getTitle(currentEvent) {
	return 'Event: "' + currentEvent.event + '" ';
};

var simpleReport = function simpleReport(results) {
	return results.join(', ');
};

/* GET results listing. */
router.get('/:filePath', function (req, res, next) {
	var file = req.params.filePath;
	if (file) {
		var output = fs.readFileSync('public/output/' + file + '.txt', 'utf8');
		var results = processOutput(output);
		var callbackReport = '';
		var resultsOutput = results.forEach(function (currentEvent) {
			if (currentEvent) {
				var callback_results = currentEvent.callback_results;
				callbackReport += getTitle(currentEvent) + '         (calling back ' + callback_results.length + ') \n';
				callbackReport += '\t' + simpleReport(callback_results) + '\n\n';
			} else {
				callbackReport('End of Results');
			}
		});

		res.render('results', { finalReport: callbackReport });
	} else {
		res.render('results', 'File not found. please append filename to end of path');
	}
});

module.exports = router;