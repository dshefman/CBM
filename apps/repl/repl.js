const repl = require('repl');

const Chooser = require('./states/Chooser');
const _ = require('lodash/lodash');

const util = require('util');

var currentState;

function evaluate (cmd, context, filename, callback) {
    cmd = _.trim(cmd);
    if (!currentState) {
        currentState = new Chooser(this);
    } else {
        currentState = currentState.evaluate(cmd, context, filename, callback);
    }
}

function writer(output) {
    return util.inspect(output, {depth:null});
}

repl.start({prompt: 'Press_Return_To_Start> ', eval:evaluate, writer:writer});

