
(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            '../../../callbacks/Callbacks',
            './GetFromCallback'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require('../../../callbacks/Callbacks'),
            require('./GetFromCallback')
        );
    } else {
        // Browser globals (root is window)
        root.EliminationAggregate = factory(
            root.lodash,
            root.Callbacks,
            root.GetFromCallback
        );
    }
})( this, function( _, callBackCalc, getFromCallbackState ) {


    var EliminationAggregate = function (repl, nextState) {
        this.repl = repl;
        this.nextState = nextState;
        repl.setPrompt('callbacks> ');
        repl.prompt();
        this.evaluate = this.evaluate.bind(this);
        this.reset();
    };

    EliminationAggregate.prototype.toString = function () {
        return 'EliminationAggregate'
    };

    EliminationAggregate.prototype.reset = function() {
        this.judgesWantToSee = [];
    };

    EliminationAggregate.prototype.evaluate  = function(cmd, context, filename, callback) {
        cmd = _.trim(cmd);
        if (cmd != ''){
            var dancerCallbacks = cmd.split(',');
            this.judgesWantToSee.push(dancerCallbacks);
            callback(null)
            return this;
        } else {
            var cb = new callBackCalc();
            console.log('computing callbacks...');
            var computedResults = cb.compute(this.judgesWantToSee)
            callback(null, 'Choose number to return: ' + computedResults.availableResults );
            return new this.nextState(this.repl, EliminationAggregate, computedResults);
        }
    };

    return EliminationAggregate;
});