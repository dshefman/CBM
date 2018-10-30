'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var express = require('express');
var router = express.Router();
var fs = require('fs');

var processOutput = function processOutput(output) {

	var allResults = output.split('\n');

	var finalResults = allResults.map(function (eventStr) {
		try {
			return JSON.parse(eventStr);
		} catch (err) {
			return null;
		}
	}).filter(function (event) {
		return event != null && event.hasOwnProperty('ranking');
	});

	return finalResults;
};

var getTitle = function getTitle(currentEvent) {
	return 'Event: "' + currentEvent.event + '" ';
};

var simpleReportFormat = function simpleReportFormat(ranking) {
	return function (key) {
		return key + ': ' + ranking[key];
	};
};
var simpleReport = function simpleReport(ranking) {
	return Object.keys(ranking).sort().map(simpleReportFormat(ranking)).join('\n');
};

var detailedReport = function detailedReport(currentEvent) {
	/*
 If it is a multidance, print out the results of each dance
 Print them in a way that will allow the MC to say: 
 "1st place to 136, placing 1st in W and 2nd in F"
 "2nd place to 137, placing 2nd in W and 2nd in F"
 */
	var rtn = '';
	var warn = '';

	if (currentEvent.hasOwnProperty('danceResults')) {
		var danceResults = currentEvent.danceResults;
		var dances = [];
		var dancers = {};
		Object.values(currentEvent.ranking).forEach(function (dancer) {
			return dancers[dancer] = [];
		});

		danceResults.forEach(function (danceResult) {
			dances.push(danceResult.dance);
			Object.entries(danceResult.final).forEach(function (_ref) {
				var _ref2 = _slicedToArray(_ref, 2),
				    dancer = _ref2[0],
				    placement = _ref2[1];

				try {
					dancers[dancer].push(placement);
				} catch (err) {
					warn += 'NOTE: Dancer ' + dancer + ' has intermediate results, but not final results\n';
				}
			});
		});
		rtn += '\n\n   -------------- DETAILS ------------\n';
		rtn += '   dances\t' + dances.join(',') + '\n';

		var ranking = currentEvent.ranking;
		Object.keys(ranking).sort().forEach(function (placement) {
			var dancer = ranking[placement];
			if (dancer.hasOwnProperty('each')) {
				//TODO format tiesfrom array
				rtn += dancer + ' tied in multidance. This part of the reporting isn\'t complete';
			} else {
				rtn += '   ' + dancer + '\t\t' + dancers[dancer].join(',') + '\n';
			}
		});

		rtn += '\n' + warn;
	}

	return rtn;
};

/* GET results listing. */
router.get('/:filePath', function (req, res, next) {
	var file = req.params.filePath;
	var output = fs.readFileSync('public/output/' + file + '.txt', 'utf8');
	var results = processOutput(output);
	var finalReport = '';
	var resultsOutput = results.forEach(function (currentEvent) {
		if (currentEvent) {
			var ranking = currentEvent.ranking;
			finalReport += getTitle(currentEvent) + '\n';
			finalReport += simpleReport(ranking);
			finalReport += detailedReport(currentEvent);
			finalReport += '\n\n';
		} else {
			finalReport += 'End of Results';
		}
	});

	res.render('results', { finalReport: finalReport });
});

module.exports = router;