(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            './EliminationAggregate'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require('./EliminationAggregate')
        );
    } else {
        // Browser globals (root is window)
        root.GetFromCallback = factory(
            root.lodash,
            root.EliminationAggregate
        );
    }
})( this, function( _, eliminationAggregate ) {

    var GetFromCallback = function (repl, nextState, callbackResults, menuState) {
        this.repl = repl;
        this.nextState = nextState;
        this.menuState = menuState;
        repl.setPrompt('how many to call back> ');
        repl.prompt();
        this.evaluate = this.evaluate.bind(this);
        this.reset();
        this.callbackResults = callbackResults;
    };

    GetFromCallback.prototype.toString = function () {
        return 'GetFromCallback'
    };

    GetFromCallback.prototype.reset = function() {

    };

    GetFromCallback.prototype.evaluate = function(cmd, context, filename, callback) {
        cmd = _.trim(cmd);
        var request = _.toInteger(cmd);
        var hasRequestedResults = _.indexOf(this.callbackResults.availableResults, request) != -1;
        if (hasRequestedResults) {
            callback(null, {callback_results: this.callbackResults.results[cmd] } );
            return new this.nextState(this.repl, GetFromCallback, this.menuState);
        } else if (cmd == "menu") {
            return new this.menuState(this.repl);
        } else {
            callback('that number is an invalid option. Try one of these: '+ this.callbackResults.availableResults)
            return this;
        }
    };

    return GetFromCallback;
});