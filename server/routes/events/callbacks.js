var express = require('express');
var router = express.Router();
import { toEliminationAggregate } from '../../src/toEliminationAggregate';

let eliminationAggregate = null;
router.get('', function(req, res, next) {
	var rtn = 'testing';
	var callbacks = Object.keys(req.query);
	console.log('set callbacks for', callbacks);

	
	if (eliminationAggregate){
		console.log('score added')
		
		eliminationAggregate(callbacks);
		rtn = 'Judges Score Added';
	} else {
		rtn = 'dance not started yet'
	}
  
  res.send(rtn);

});

router.get('/start', function(req, res, next) {
	console.log('event started')
	var rtn = 'Previous dance still active. Please stop it';
	if (!eliminationAggregate) {
		eliminationAggregate = toEliminationAggregate('testName' + new Date().toString())
		rtn = 'Event Started';
	}
	res.send(rtn);

});

router.get('/stop', function(req, res, next) {
	console.log('event ended')
	var rtn = 'Can not stop before starting';
	
	if (eliminationAggregate) {
		var toResult = eliminationAggregate();
		var computedResults = toResult();
		rtn = `Choose number to return: ${computedResults.availableResults}`;
	}
	res.render('results', {finalReport: rtn});
	

});

router.get('/select/:number', function(req, res, next) {
	//console.log('Calling back #', req.params);
	var requestedNumber = parseInt(req.params.number);
	console.log('Calling back #', requestedNumber);
	    
	var rtn = 'There is no active event. Please /start an event';
	
	if (eliminationAggregate) {
		var toResult = eliminationAggregate();
		var computedResults = toResult();

		var hasRequestedResults = computedResults.availableResults.indexOf(requestedNumber) != -1;
    
		if (hasRequestedResults) {
			var results = computedResults.getResult(requestedNumber) 
			console.log('SAVE THIS:', results);
			rtn = JSON.stringify(results, null, 4 )
			eliminationAggregate = null;
		} else {
			rtn = `invalid  ${requestedNumber}. Please choose a number from the list ${computedResults.availableResults}`
		}

	}
	res.render('results', {finalReport: rtn});
	
});



module.exports = router;
