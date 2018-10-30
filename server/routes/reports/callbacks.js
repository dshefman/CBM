var express = require('express');
var router = express.Router();
var fs = require('fs');


const processOutput = (output) => {


	const allResults = output.split('\n');


	const callbackResults = allResults.map((eventStr) => { 
		try {
			return JSON.parse(eventStr)
		} catch (err) {
			return null
		}
	}).filter( (event) => event != null && event.hasOwnProperty('callback_results'));

	return callbackResults;
}

const getTitle = (currentEvent) => `Event: "${currentEvent.event}" `

const simpleReport = (results) => results.join(', ');





/* GET results listing. */
router.get('/:filePath', function(req, res, next) {
  var file = req.params.filePath;
  if (file) {
	  var output = fs.readFileSync(`public/output/${file}.txt`, 'utf8')
	  var results = processOutput(output);
	  var callbackReport = '';
	  var resultsOutput = results.forEach( function (currentEvent) { 
	  	if (currentEvent) {
			let callback_results = currentEvent.callback_results;
			callbackReport += `${getTitle(currentEvent)}         (calling back ${callback_results.length}) \n`;
			callbackReport += `\t${simpleReport(callback_results)}\n\n`;
			
		} else {
			callbackReport('End of Results')
		}
	  })
	  
	  res.render('results', {finalReport: callbackReport});
	} else {
		res.render('results', 'File not found. please append filename to end of path')
	}

});

module.exports = router;
