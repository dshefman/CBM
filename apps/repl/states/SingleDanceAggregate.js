(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            './Chooser'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require('./Chooser')
        );
    } else {
        // Browser globals (root is window)
        root.SingleDanceAggregate = factory(
            root.lodash,
            root.Chooser
        );
    }
})( this, function( _, Chooser ) {


    var SingleDanceAggregate = function (repl, API, nextState, danceName) {
        this.repl = repl;
        this.nextState = nextState;
        this.API = API;
        this.danceName = danceName;
        repl.setPrompt('single ('+ danceName +')> ');
        repl.prompt();
        this.evaluate = this.evaluate.bind(this);
        this.reset();
    };

    SingleDanceAggregate.prototype.toString = function () {
        return 'SingleDanceAggregate'
    };

    SingleDanceAggregate.prototype.reset = function() {
        this.placedDancers = [];
        this.currentJudge = 0;
    };

    SingleDanceAggregate.prototype.evaluate  = function(cmd, context, filename, callback) {
        cmd = _.trim(cmd);
        if (cmd != ''){
            var input = {judge: this.currentJudge, final:{}};
            var placedByJudge = _.each(cmd.split(','), function(val, index) {
                input.final[val] = index + 1;
            });

            this.placedDancers.push(input);
            this.currentJudge++;
            callback(null)
            return this;
        } else {
            var judgesScores = {judgesScores: this.placedDancers}
            console.log('computing placements...');

            var computedResults = this.API.doFinal([judgesScores]);
            callback(null, {event: this.danceName, ranking: computedResults.ranking} );
            this.repl.setPrompt('repl> ');
            this.repl.prompt();

            return new this.nextState(this.repl);
        }
    };

    return SingleDanceAggregate;
});