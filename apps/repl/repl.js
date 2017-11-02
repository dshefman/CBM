const repl = require('repl');
const Output = require('./output/Output');

const Chooser = require('./states/Chooser');
const _ = require('lodash/lodash');

const util = require('util');

let outputMgr 

var currentState;

function evaluate (cmd, context, filename, callback) {
    cmd = _.trim(cmd);
    if (!currentState) {
    	outputMgr = new Output(cmd);
    	outputMgr.start();
        currentState = new Chooser(this);
    } else {
        currentState = currentState.evaluate(cmd, context, filename, callback);
    }
}

function writer(output) {
	outputMgr.append(output)
    return util.inspect(output, {depth:null});
}

var server = repl.start({prompt: 'What is the name of the event> ', eval:evaluate, writer:writer});
server.on('exit', function() {
	outputMgr.end();
	console.log('Received "exit" event from repl!');
	process.exit();
})

