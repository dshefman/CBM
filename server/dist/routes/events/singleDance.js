'use strict';

var _toSingleDanceAggregate = require('../../src/toSingleDanceAggregate');

var express = require('express');
var router = express.Router();


var singleDanceAggregate = null;
var toResult = null;
router.get('', function (req, res, next) {
	var rtn = 'testing';

	if (singleDanceAggregate) {
		console.log('score added');

		toResult = singleDanceAggregate([100, 101, 200]);
		rtn = 'Judges Score Added';
	} else {
		rtn = 'dance not started yet';
	}

	res.send(rtn);
});

router.get('/start', function (req, res, next) {
	console.log('event started');
	var rtn = 'Previous dance still active. Please stop it';
	if (!singleDanceAggregate) {
		singleDanceAggregate = (0, _toSingleDanceAggregate.toSingleDanceAggregate)('testName' + new Date().toString());
		rtn = 'Event Started';
	}
	res.send(rtn);
});

router.get('/stop', function (req, res, next) {
	console.log('event ended');
	var rtn = 'Can not stop before starting';
	var isStarted = singleDanceAggregate != null;
	var hasPlacements = toResult != null;

	if (isStarted && hasPlacements) {
		var computedResults = toResult();
		rtn = 'finalResults: ' + JSON.stringify(computedResults, null, 4);
	} else if (!hasPlacements) {
		rtn = 'Place dancers before calling stop';
	}
	res.render('results', { finalReport: rtn });
	toResult = null;
	singleDanceAggregate = null;
});

module.exports = router;