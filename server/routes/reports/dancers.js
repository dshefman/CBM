var express = require('express');
var router = express.Router();
var fs = require('fs');


const orindalSuffixes = ['st', 'nd', 'rd']

const processOutput = (output) => {


	const allResults = output.split('\n');


	const finalResults = allResults.map((eventStr) => { 
		try {
			return JSON.parse(eventStr)
		} catch (err) {
			return null
		}
	}).filter( (event) => event != null && event.hasOwnProperty('ranking'));

	return finalResults;
}

const getTitle = (currentEvent) => `Event: "${currentEvent.event}" `


const simpleReportFormat = (ranking) => (key) => key + ': ' + ranking[key];
const simpleReport = (currentEvent, dancersNumber) => {
	let ranking = currentEvent.ranking;
	let placement = null;
	Object.entries(ranking).forEach((placementPair) => { 
		
		if (placementPair[1] == dancersNumber) {
			placement = placementPair[0]
		}
	})
	if (placement) {


		let suffix = 'th';
		if (placement <=3 ) {suffix = orindalSuffixes[placement-1]} 

		let finalReport = `Overall rank: ${placement}${suffix}\n`;
		finalReport += placementDetails(currentEvent, dancersNumber)
		return (finalReport);
		
	} else {
		//console.log (`Did not dance in ${getTitle(currentEvent)}`)
	}

}

const addDancer = (dancer, dancers) => {
	if (dancers.indexOf(dancer) == -1) {
			dancers.push(dancer);
			return true
	}
	return false
}

const addDancers = (ranking, dancers) => {
	console.log('ranking', ranking)
	Object.values(ranking).forEach((key) => {
		if (typeof(key) !== 'string') { //check for Array
			key.forEach((dancer) => addDancer(dancer, dancers));
		} else {
			addDancer(key, dancers);
		}
		
	})
	return dancers;
}



/* GET results listing. */
router.get('/:filePath/', function(req, res, next) {
  var file = req.params.filePath;
  
  var output = fs.readFileSync(`public/output/${file}.txt`, 'utf8')
  var results = processOutput(output);
  var dancers = [];
  var finalReport = `-------------------DANCERS -----------------\n`;
  var resultsOutput = results.forEach( function (currentEvent) { 
  	if (currentEvent) {
  		let ranking = currentEvent.ranking;
  		dancers = addDancers(ranking, dancers)
		//finalReport += dancers.sort().join('\n');
		//finalReport += detailedReport(currentEvent);
		//finalReport += '\n\n';

	} else {
		finalReport += 'End of Results'
	}
  })

  var url = req.originalUrl.replace('dancers', 'dancer') //This couples the URL of the routes. Should figure out how to remove the coupling
  
  res.render('allDancers', { url: url, file: file, dancers: dancers.sort()});
});

module.exports = router;
