
(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'callbacks/Callbacks',
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
})( this, function( _, callBackCalc, GetFromCallbackState ) {


    var EliminationAggregate = function (repl, menuState, danceName) {
        this.repl = repl;
        this.nextState = GetFromCallbackState;
        this.menuState = menuState;
        this.danceName = danceName;
        repl.setPrompt('callbacks (' + danceName +')> ');
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
        if (cmd == "menu" || cmd.includes('!')) {
            console.log("abort detected (!), returning to menu");
            return new this.menuState(this.repl);
        } else if (cmd != ''){
            var dancerCallbacks = cmd.split(',');
            this.judgesWantToSee.push(dancerCallbacks);
            callback(null)
            return this;
        } else {
            var cb = new callBackCalc();
            console.log('computing callbacks...');
            var computedResults = cb.compute(this.judgesWantToSee)
            callback(null, 'Choose number to return: ' + computedResults.availableResults );
            return new this.nextState(this.repl, EliminationAggregate, computedResults, this.menuState, this.danceName);
        }
    };

    return EliminationAggregate;
});