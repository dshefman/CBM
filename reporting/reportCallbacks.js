
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


const repl = require('repl');
const fs = require('fs');
const outputDir = '../output'
let files = [];
let hasStarted = false;


let eventCount = 0;
let callbackResults = [];


const setReplPrompt = (replContext) => (msg) => {
	replContext.setPrompt(msg);
	replContext.prompt();
}

const initPrompt = (replPrompt) =>{
	console.log('\n------------------- OUTPUT FILES -----------------\n')
	fs.readdirSync(outputDir).forEach(file => { files.push(file); })
	files.forEach((file, idx) => { console.log(`${idx} : ${file}` )});
	console.log('');
	replPrompt('*** select the number of the file to show the report *** > ')
	
}

const fileSelectionPrompt = (numInput, replPrompt) => {
	output = fs.readFileSync(`${outputDir}/${files[numInput]}`, 'utf8')
	callbackResults = processOutput(output).reverse();
	replPrompt('*** press enter to see the next result *** ')
	console.log('\n------------------- RESULTS -----------------\n')
}

const reportEventPrompt = () => {
	let currentEvent = callbackResults.shift();
	if (currentEvent) {
		eventCount++;
		let callback_results = currentEvent.callback_results;
		let callbackReport = `${getTitle(currentEvent)}         (calling back ${callback_results.length}) \n`;
		callbackReport += `\t${simpleReport(callback_results)}`;
		console.log(callbackReport);
		return true;
	} else {
		console.log('End of Results')
	}
}

/*
* Output callbacks in reverse order. This assumes that you want to callback the most recent first
*
*Event: "87"          (calling back 5) 
*        101, 112, 117, 119, 150
*
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

