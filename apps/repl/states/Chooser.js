const eliminationAggregateState = require('./EliminationAggregate');
const singleDanceAggregateState = require('./SingleDanceAggregate');
const multiDanceAggregateState = require('./MultiDanceAggregate');
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
        this.danceName = "unknownDance"
        repl.setPrompt('{danceName}||callbacks||single||multi> ');
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
                currentState = new eliminationAggregateState(this.repl, Chooser, this.danceName);
                break;
            case 'single':
                currentState = new singleDanceAggregateState(this.repl, new API(), Chooser, this.danceName);
                break;
            case 'multi':
                currentState = new multiDanceAggregateState(this.repl, new API(), Chooser, this.danceName);
                break;
            default: 
                this.danceName = cmd;
                this.repl.setPrompt('{danceName}||callbacks||single||multi('+ this.danceName + ')> ');
                this.repl.prompt();
                currentState = this;
        }
        return currentState
    };

    return Chooser;
});