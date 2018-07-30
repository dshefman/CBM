
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

const getTitle = (currentEvent) => `event "${currentEvent.event}" `

const simpleReportFormat = (ranking) => (key) => key + ': ' + ranking[key];
const simpleReport = (ranking) => Object.keys(ranking).sort().map(simpleReportFormat(ranking)).join('\n');

const detailedReport = (currentEvent, dancersNumber) => {
	/*
	If it is a multidance, print out the results of each dance
	Print them in a way that will allow the MC to say: 
	"1st place to 136, placing 1st in W and 2nd in F"
	"2nd place to 137, placing 2nd in W and 2nd in F"
	*/
	let rtn = '';
	let warn = '';	

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
				if (dancer === dancersNumber) {
					rtn += `   ${dancer}\t\t${dancers[dancer].join(',')}\n`;
				}
			}
		})

		rtn += `\n${warn}`;

	}

	return rtn;
}


const repl = require('repl');
const fs = require('fs');
const outputDir = '../output'
let files = [];
let hasStarted = false;
let dancersNumber = null;


let eventCount = 0;
let finalResults = [];
let fileSelected = false;


const setReplPrompt = (replContext) => (msg) => {
	replContext.setPrompt(msg);
	replContext.prompt();
}

/*
* List all of the files in the output folder: 
*
* 0: UH_FullCompOutput.txt
*
*/
const initPrompt = (replPrompt) =>{
	console.log('\n------------------- OUTPUT FILES -----------------\n')
	fs.readdirSync(outputDir).forEach(file => { files.push(file); })
	files.forEach((file, idx) => { console.log(`${idx} : ${file}` )});
	console.log('');
	replPrompt('*** select the number of the file to show the report *** > ')
	
}

const fileSelectionPrompt = (numInput, dancersNumber, replPrompt) => {
	output = fs.readFileSync(`${outputDir}/${files[numInput]}`, 'utf8')
	finalResults = processOutput(output);
}

const reportEventPrompt = (dancersNumber) => {
	console.log(`\n-------------------${dancersNumber} RESULTS -----------------\n`)	
	
	finalResults.forEach((currentEvent) => {
		eventCount++;
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

			let finalReport = `${placement}${suffix} in ${getTitle(currentEvent)}`;
			finalReport += detailedReport(currentEvent, dancersNumber)
			console.log(finalReport);
			
		} else {
			//console.log (`Did not dance in ${getTitle(currentEvent)}`)
		}
	})
	console.log(`\n------------------- END ${dancersNumber} RESULTS -----------------\n`)
	
}

function reportDancer (dancersNumber, replPrompt) {
	reportEventPrompt(dancersNumber);
	replPrompt('enter next dancers number to find: ')
} 

/*
* After selecting the dancer and the file
* List all dancer's placements
*
* 1st in event "New ECS" 
* 2nd in event "New Tx2s" 
* 1st in event "4 New WCS" 
*
*/

function evaluate (cmd, context, filename, callback) {
	const replPrompt = setReplPrompt(this);
	let numInput = null;
	if (!dancersNumber) {
		dancersNumber = cmd.trim();
	} 
	if (!fileSelected) {
		numInput = parseInt(cmd);
	}
	
	if (!hasStarted) {
		hasStarted = true;
		initPrompt(replPrompt)
	} else {
		if (!isNaN(numInput) && !fileSelected) {
			fileSelectionPrompt(numInput,dancersNumber,replPrompt);
			fileSelected = true;
			reportDancer(dancersNumber, replPrompt)
			dancersNumber = null;
		} else {
			reportDancer(dancersNumber, replPrompt)
			dancersNumber = null;
		}
	} 
}

var server = repl.start({prompt: 'Enter dancer number to find: ', eval:evaluate});

