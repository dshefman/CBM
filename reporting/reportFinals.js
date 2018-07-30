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


const repl = require('repl');
const fs = require('fs');
const outputDir = '../output'
let files = [];
let hasStarted = false;


let eventCount = 0;
let finalResults = [];


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

const fileSelectionPrompt = (numInput, replPrompt) => {
	output = fs.readFileSync(`${outputDir}/${files[numInput]}`, 'utf8')
	finalResults = processOutput(output);
	replPrompt('*** press enter to see the next result *** ')
	console.log('\n------------------- RESULTS -----------------\n')
}

/*
 * Output each event in the following way: 
 *
 * Event: 'A'     (1 of X)
 * 1: 142
 * 2: 132
 * 3: 145
 *
 */
const reportEventPrompt = () => {
	let currentEvent = finalResults.shift();
	if (currentEvent) {
		eventCount++;
		let ranking = currentEvent.ranking;
		let finalReport = `${getTitle(currentEvent)}         (${eventCount} / ${finalResults.length}) \n`;
		finalReport += simpleReport(ranking);
		finalReport += detailedReport(currentEvent);
		console.log(finalReport);
		return true;
	} else {
		console.log('End of Results')
	}
}

/*
 * Start by reading all of the files in the output directory
 * Once a file is selected, output the final results for each event
 * one at a time. 
 * The intention is for the MC to be able to call out the results to present awards.
 * If it is a multidance event, give the details of that event
 */
function evaluate (cmd, context, filename, callback) {
	const replPrompt = setReplPrompt(this);
	
	const numInput = parseInt(cmd);
	
	if (!hasStarted) {
		hasStarted = true;
		initPrompt(replPrompt)
	} else {
		if (!isNaN(numInput)) {
			fileSelectionPrompt(numInput,replPrompt);
		} else {
			reportEventPrompt();
		}
	} 
}

var server = repl.start({prompt: '*** hit return to start ***', eval:evaluate});

