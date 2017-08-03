const repl = require('repl');

const eliminationAggregateState = require('./states/EliminationAggregate');
const singleDanceAggregateState = require('./states/SingleDanceAggregate');
const getFromCallbackState = require('./states/GetFromCallback');
const API = require('./scruitineering/ScruitineerAPI');

const _ = require('lodash/lodash');

const util = require('util');

var currentState;

function evaluate (cmd, context, filename, callback) {
    cmd = _.trim(cmd);
    if (!currentState) {
        switch (cmd) {
            case 'callbacks':
                currentState = new eliminationAggregateState(this, getFromCallbackState);
                return;
            case 'single':
                currentState = new singleDanceAggregateState(this, new API(), null );
                return;
        }

    } else {
        currentState = currentState.evaluate(cmd, context, filename, callback);
    }
}

function writer(output) {
    return util.inspect(output, {depth:null});
}

repl.start({prompt: 'repl> ', eval:evaluate, writer:writer});
