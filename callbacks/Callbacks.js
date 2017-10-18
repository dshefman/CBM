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
        root.Callbacks = factory(
            root.lodash
        );
    }
})( this, function( _ ) {


    var Callbacks = function () {

    };

    Callbacks.prototype.toString = function () {
        return 'Callbacks'
    };

    Callbacks.prototype.compute = function(scores, target) {
        /*
         var expectedOutput = {
             success: true,
             target: 6,
             targetResults: [10,12,14,16,17,20],
             availableResults: [1,4,5,6,8,10],
             totalCountedDancers: 10,
             results: {
                1: [20],
                4: [12,14,17,20],
                5: [12,14,16,17,20],
                6: [10,12,14,16,17,20],
                8: [10,11,12,14,15,16,17,20],
                10: [10,11,12,14,15,16,17,18,19,20],
             },
             raw:{
                tallied: {7:[20], 6:[12,14,17], 5:[16], 4:[10], 3:[11,15], 1:[18,19]},
                sorted: [20, 12, 14, 17, 16,10,11,15,18,19],
                input:[
                    [10,14,15,16,17,20],
                    [10,11,12,17,19,20],
                    [12,14,15,17,18,20],
                    [12,14,15,16,17,20],
                    [10,11,12,14,16,20],
                    [11,12,14,16,17,20],
                    [10,12,14,16,17,20],
                ]
             }
         }

         */

        //Merge all of the callbacks together
        var combined = [];
        _.each(scores, function(score){
            combined = _.concat(combined, score);
        });

        //Count them by dancer, then group them by their counts
        var counted = _.countBy(combined);
        var tallied = _.invertBy(counted);

        var talliedKeys = _.keys(tallied).sort().reverse();
        var results = {};
        var countedDancer = 0;
        var allDancers = [];
        var weightedAllDancers = [];
        //Build the cumulative list of dancers to call back
        _.each(talliedKeys, function(tally){
            var dancers = tallied[tally]
            countedDancer += dancers.length;
            allDancers = _.concat(allDancers, dancers);
            weightedAllDancers = _.concat(weightedAllDancers, dancers);
            results[countedDancer] = allDancers.sort();

        });

        //Did we match to our target number?
        var success = _.indexOf(_.map(_.keys(results), _.toInteger), target) != -1;

        //Just in case, lets put all of the dancers into largest to smallest order based on number of callbacks
        var sorted = [];
        _.each(_.keys(results), function(resultCount){
            sorted = _.concat(sorted, results[resultCount])
        });

        return {
            success: success,
            target: target,
            targetResults: _.get(results, target, []),
            totalCountedDancers: _.get(allDancers, 'length', -1),
            results: results,
            availableResults: _.map(_.keys(results), _.toInteger),
            raw: {
                tallied: tallied,
                input: scores,
                sorted: weightedAllDancers
            }
        };
    };

    return Callbacks;
});