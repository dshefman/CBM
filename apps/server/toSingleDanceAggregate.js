var API = require('scruitineering/ScruitineerAPI');


export const toSingleDanceAggregate = (eventName) => {
	
	let placedDancers = [];
	let currentJudge = 0; 
	let singleDanceAPI = new API();
            

	return (placementByJudge, judge = currentJudge) => {
		var input = {judge, final: {}};
		console.log('[toSingleDanceAggregate].placementByJudge', placementByJudge)
		placementByJudge.forEach((val, index) => {
			input.final[val] = index+1;
		})
		placedDancers.push(input);
		currentJudge++;
		return () => {
			var judgesScores = {judgesScores: placedDancers}
            console.log('computing placements...', judgesScores);
            var computedResults = singleDanceAPI.doFinal([judgesScores]);
            return { 
            	event: eventName, 
            	ranking: computedResults.ranking
            }

		}
	}
}