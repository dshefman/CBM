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

		let placementPairNumbers = placementPair[1];
		if (typeof(placementPairNumbers) !== 'string') {//Array check
			if (placementPairNumbers.indexOf(dancersNumber) !== -1) {
				placement = placementPair[0]
			}
		} else if (placementPairNumbers == dancersNumber) {
			placement = placementPair[0]
		}
	})
	if (placement) {


		let suffix = 'th';
		if (placement <=3 ) {suffix = orindalSuffixes[placement-1]} 

		let finalReport = `\tOverall rank: ${placement}${suffix}\n`;
		finalReport += placementDetails(currentEvent, dancersNumber)
		return (finalReport);
		
	} else {
		//console.log (`Did not dance in ${getTitle(currentEvent)}`)
		return ''
	}

}

const placementDetails = (currentEvent, dancersNumber) => {
	const tabulations =  currentEvent.tabulation; 
	
	if (!tabulations) {
		let multidanceReport = detailedReport(currentEvent, dancersNumber);

		if (!multidanceReport){
			return '\n\tJudges rankings about this dance were not saved\n';
		}

		return multidanceReport
	}

	const tabulationByDancer  = tabulations[dancersNumber];

	if (!tabulationByDancer) {
		return '\n\tDancer had no results in this event\n';

	}
	console.log('tabulationByDancer', tabulationByDancer)
	
	let lastCount = 0; 
	let rtn = '';
	Object.entries(tabulationByDancer).forEach((entry) => {
		console.log(entry);
		const [ key, value ] = entry;
		const place = key.split('-')[1]; // places are listed as 1-3 (3rd)
		const suffix = (place <=3 ) ? orindalSuffixes[place-1]: 'th';
		const placeCount = value - lastCount;
		lastCount = value;
		const plural = (placeCount > 1) ? 's' : ''
		if (placeCount != 0) {
			rtn += `\t${placeCount}: ${place}${suffix}${plural}\n`;
		}
	});
	return rtn;
}

const detailedReport = (currentEvent, dancersNumber) => {
	/*
	If it is a multidance, print out the results of each dance
	Print them in a way that will allow the MC to say: 
	"1st place to 136, placing 1st in W and 2nd in F"
	"2nd place to 137, placing 2nd in W and 2nd in F"
	*/
	let rtn = '';
	let warn = '';	

	//return rtn;

	if (currentEvent.hasOwnProperty('danceResults')) { 
		const danceResults = currentEvent.danceResults;
		const dances = [];
		const dancers = {}
		Object.values(currentEvent.ranking).forEach((dancer) => dancers[dancer] = []);

		danceResults.forEach((danceResult) => {
			dances.push(danceResult.dance);
			Object.entries(danceResult.final).forEach(([dancer, placement]) => {
				try {
					dancers[dancer].push(placement)
				} catch (err) {
					warn += `NOTE: Dancer ${dancer} has intermediate results, but not final results\n`;
				}
			});
		})
		rtn += '\n\n   -------------- DETAILS ------------\n'
		rtn += `   dances\t${dances.join(',')}\n`;
		
		const ranking = currentEvent.ranking;
		Object.keys(ranking).sort().forEach((placement) => {
			let dancer = ranking[placement];
			if (dancer === dancersNumber) {
				if (dancer.hasOwnProperty('each')) {
					//TODO format tiesfrom array
					rtn += `${dancer} tied in multidance. This part of the reporting isn't complete`

				} else {
					rtn += `   ${dancer}\t\t${dancers[dancer].join(',')}\n`;
				}
			}
		})

		rtn += `\n${warn}`;

	}

	return rtn;
}



/* GET results listing. */
router.get('/:filePath/:dancersNumber', function(req, res, next) {
  var file = req.params.filePath;
  var dancersNumber = req.params.dancersNumber;

  var output;
  try { 
  	output = fs.readFileSync(`public/output/${file}.txt`, 'utf8')
  } catch(err) {
  	output = fs.readFileSync(`public/outputCopy/${file}.txt`, 'utf8')
  }
  var results = processOutput(output);
  var finalReport = `-------------------${dancersNumber} RESULTS -----------------\n`;
  var resultsOutput = results.forEach( function (currentEvent) { 
  	if (currentEvent) {
  		let ranking = currentEvent.ranking;
  		let currentEventReport = simpleReport(currentEvent, dancersNumber);
  		if (currentEventReport.length){ 
			finalReport += `${getTitle(currentEvent)}\n`;
			finalReport += simpleReport(currentEvent, dancersNumber);
			finalReport += '\n\n';
		}

	} else {
		finalReport += 'End of Results'
	}
  })
  
  res.render('results', { title: `${file}: dancer ${dancersNumber}`, finalReport: finalReport});
});

module.exports = router;
