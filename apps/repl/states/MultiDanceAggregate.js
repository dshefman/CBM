(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' )
        );
    } else {
        // Browser globals (root is window)
        root.MultiDanceAggregate = factory(
            root.lodash
        );
    }
})( this, function( _ ) {

    var DANCE = 'dance';
    var PLACEMENTS = 'placements';


    var MultiDanceAggregate = function (repl, API, Chooser, eventName) {
        this.repl = repl;
        this.API = API;
        this.nextState = Chooser;
        this.eventName = eventName;
        this.promptBase = 'multidance ('+ eventName +')'; 
        this.setPromptToDance();
        this.evaluate = this.evaluate.bind(this);
        this.resetDance();
        this.aggregateResults = [];
    };

    MultiDanceAggregate.prototype.toString = function () {
        return 'MultiDanceAggregate'
    };

    MultiDanceAggregate.prototype.setPromptToDance = function () {
        this.inputType = DANCE;
        this.repl.setPrompt(this.promptBase +  ' select dance> ');
        this.repl.prompt();
    }

    MultiDanceAggregate.prototype.setPromptToPlacements = function () {
        this.inputType = PLACEMENTS;
        this.repl.setPrompt(this.promptBase +  ' {'+ this.indivDance +'}> ');
        this.repl.prompt();
    }

    MultiDanceAggregate.prototype.resetDance = function() {
        this.placedDancers = [];
        this.currentJudge = 0;
    };

    MultiDanceAggregate.prototype.evaluate  = function(cmd, context, filename, callback) {
        cmd = _.trim(cmd);

        if (this.inputType == DANCE) {
            if (cmd != '') {
                this.indivDance = cmd;
                this.resetDance()
                this.setPromptToPlacements();
                return this;
            } else {
                this.computeMultiDance(callback);
                return new this.nextState(this.repl);
            }
        } else if (this.inputType == PLACEMENTS) {

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
                this.aggregateResults.push({dance: this.indivDance, judgesScores: this.placedDancers});
                this.setPromptToDance();
                return this;
            }
        }
    };

    MultiDanceAggregate.prototype.computeMultiDance = function (callback){ 
        console.log('computing placements...', JSON.stringify(this.aggregateResults,null, 4));

        var computedResults = this.API.doFinal(this.aggregateResults);
        callback(null, {
            event: this.eventName, 
            danceResults: computedResults.dancePlacements, 
            ranking: computedResults.ranking
        } );
    }

    return MultiDanceAggregate;
});