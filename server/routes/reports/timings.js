var express = require('express');
var router = express.Router();
var fs = require('fs');

const processOutput = (output) => {


	const allResults = output.split('\n');


	const finalResults = allResults.map((eventStr) => { 
		try {
			return JSON.parse(eventStr)
		} catch (err) {
			return null
		}
	}).filter( (event) => event != null && event.hasOwnProperty('timestamp'));

	return finalResults;
}

const getTitle = (currentEvent) => `Event: "${currentEvent.event}" `

const simpleReportFormat = (ranking) => (key) => key + ': ' + ranking[key];
const simpleReport = (ranking) => Object.keys(ranking).sort().map(simpleReportFormat(ranking)).join('\n');

const detailedReport = (currentEvent) => {
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
			if (dancer.hasOwnProperty('each')) {
				//TODO format tiesfrom array
				rtn += `${dancer} tied in multidance. This part of the reporting isn't complete`

			} else {
				rtn += `   ${dancer}\t\t${dancers[dancer].join(',')}\n`;
			}
		})

		rtn += `\n${warn}`;

	}

	return rtn;
}



/* GET results listing. */
router.get('/:filePath', function(req, res, next) {
  var file = req.params.filePath;
  var output;
  try { 
  	output = fs.readFileSync(`public/output/${file}.txt`, 'utf8')
  } catch(err) {
  	output = fs.readFileSync(`public/outputCopy/${file}.txt`, 'utf8')
  }
  var results = processOutput(output);
  var finalReport = 'Title\ttime stamp\t Minutes from Start\t Minutes From last event\n';
  var lastTime = null;
  let startTime = null;
  const timingData = [];
  var resultsOutput = results.forEach( function (currentEvent) { 
  	if (currentEvent) {
  		let ranking = currentEvent.ranking;
  		let timeStamp = currentEvent.timestamp;
  		let time = new Date(timeStamp);
  		//console.log('CurrentEvent', JSON.stringify(currentEvent,null,4))
  		//console.log('timestamp', timeStamp, 'date', time)
  		startTime = (startTime) ? startTime: time;
  		lastTime = (lastTime) ? lastTime: startTime;
  		let deltaFromStart = ((time - startTime)/1000/60).toFixed(2);
  		let deltaFromLast = ((time - lastTime)/1000/60).toFixed(2);
  		lastTime = time; 
		finalReport += `${getTitle(currentEvent)}\t`;
		finalReport += `${timeStamp}\t`;
		finalReport += `${deltaFromStart}\t`;
		finalReport += `${deltaFromLast}\t`
		finalReport += '\n';
		timingData.push({title: currentEvent.event, timeStamp, deltaFromStart, deltaFromLast});

	} else {
		finalReport += 'End of Results'
	}
  })
  
  res.render('results', { title: `Timings for ${file}`, finalReport: finalReport });
});

module.exports = router;
