const eliminationAggregateState = require('./EliminationAggregate');
const singleDanceAggregateState = require('./SingleDanceAggregate');
const getFromCallbackState = require('./GetFromCallback');
const API = require('scruitineering/ScruitineerAPI');



(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' )
        );
    } else {
        // Browser globals (root is window)
        root.Chooser = factory(
            root.lodash
        );
    }
})( this, function( _ ) {

    var Chooser = function (repl, callbackResults) {
        this.repl = repl;
        repl.setPrompt('callbacks or single> ');
        repl.prompt();
        this.evaluate = this.evaluate.bind(this);
        this.reset();
        this.callbackResults = callbackResults;
    };

    Chooser.prototype.toString = function () {
        return 'Chooser'
    };

    Chooser.prototype.reset = function() {

    };

    Chooser.prototype.evaluate = function(cmd, context, filename, callback) {
        cmd = _.trim(cmd);
        var currentState;
        switch (cmd) {
            case 'callbacks':
                currentState = new eliminationAggregateState(this.repl, getFromCallbackState);
                break;
            case 'single':
                currentState = new singleDanceAggregateState(this.repl, new API(), Chooser );
                break;
        }
        return currentState
    };

    return Chooser;
});