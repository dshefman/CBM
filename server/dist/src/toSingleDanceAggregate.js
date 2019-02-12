'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var API = require('scruitineering/ScruitineerAPI');

var toSingleDanceAggregate = exports.toSingleDanceAggregate = function toSingleDanceAggregate(eventName) {

	var placedDancers = [];
	var currentJudge = 0;
	var singleDanceAPI = new API();

	return function (placementByJudge) {
		var judge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : currentJudge;

		var input = { judge: judge, final: {} };
		console.log('[toSingleDanceAggregate].placementByJudge', placementByJudge);
		placementByJudge.forEach(function (val, index) {
			input.final[val] = index + 1;
		});
		placedDancers.push(input);
		currentJudge++;
		return function () {
			var judgesScores = { judgesScores: placedDancers };
			console.log('computing placements...', judgesScores);
			var computedResults = singleDanceAPI.doFinal([judgesScores]);
			return {
				event: eventName,
				ranking: computedResults.ranking
			};
		};
	};
};