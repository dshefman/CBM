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
        root.ScruitineerUtil = factory(
            root.lodash
        );
    }
})( this, function( _ ) {

    /**
     * @function tabulatePlacementPerDancer
     * @description agreggates all of the judges score per dancer
     * @param {Object} judgesScores [{judge: ID, final: [dancer: placement]}] ==> [{"A": final:{54:1, 55:2, 56:3}}]
     * @returns {Object} {dancer: [placements] }
     * @example {54: [1,1,1,1,2,2]}
     */
    function tabulatePlacementPerDancer (dancePlacements){
        var results = {};
        _.each(dancePlacements, function(placementByJudge) {

            var placements = placementByJudge.final;
            _.each(placements, function (placement, dancer){

                //Create the dancer array if it doesn't exist yet
                if (!results[dancer]) {
                    results[dancer] = []
                }

                results[dancer].push(placement);
            })
        });
        return results;
    }


    /**
     * @function countPlacementsPerDancer
     * @description Counts the number of places each dancer got. For example 4 firsts, and 1 second
     * @param {Object} placementsByDancer {dancer: [placements]} ==> {54: [1,1,1,1,2,2]} )
     * @returns {Object} {dancer: {rank:count}} ==> {54: {1:4, 2:1}}
     */
    function countPlacementsPerDancer(placementByDancer){
        var results = {};
        _.each(placementByDancer, function (placements, dancer){
            var countsByPlacements = _.countBy(placements); //{1:4 ,2:1}
            results[dancer] = countsByPlacements;
        });
        return results;
    }


    /**
     * @function countNandHigherPerDancer
     * @description Count the number of 1sts, then the number of 1sts + 2nds, then 1sts + 2nds + 3rds, etc
     * @param {Object} countedPlacementsPerDancer {dancer: {rank:count}} ==> {54: {1:4, 2:1}}
     * @param {Integer} numOfPlaces How many places are we expecting. Translates to the last condition of the loop (eg 5 for this example)
     * @param {Integer} startingPosition. optional. Defaults to 1. Translates to the starting condition of the loop
     * @returns {Object} {dancer: {1-1: 4, 1-2: 5, 1-3: 5, 1-4: 5, 1-5: 5}
     */
    function countNandHigherPerDancer(countedPlacementsPerDancer, numOfPlaces, startingPosition){
        var results = {};
        startingPosition = _.toInteger(startingPosition) || 1;
        var totalPlaces = numOfPlaces + startingPosition -1;

        _.each(countedPlacementsPerDancer, function(countByPlacement, dancer){
            results[dancer] = {};
            for (var i = startingPosition ; i<= totalPlaces; i++){
                var key = '1-'+i;
                _.set(results[dancer], key, count1ToXPlacements(i, countByPlacement))
            }
        });

        return results;
    }

    function count1ToXPlacements(targetPlacement, countByPlacement){
        var total = 0;
        for (var i = 1; i <= targetPlacement; i++){
            if (_.get(countByPlacement, i)) {
                //We found a sum by an integer... for example placement (i) of 3rd place has 2 marks, add 2 to the total
                total += _.get(countByPlacement, i, 0);
            } else {
                //placement might exist as a fraction like 2.5. This happens when there is an unbreakable tie.
                //Math.ceil all of of the keys (so a tie for 2.5 computes to 3 in this case),
                //then see if they match our target(i) before adding them to the total
                _.each(countByPlacement, function (value, key) {
                    if (!_.isInteger(_.toNumber(key))) {
                        var ceilingPlacement = _.ceil(_.toNumber(key));
                        if (ceilingPlacement == i ){
                            total += value
                        }
                    }
                })
            }
        }
        return total;

    }

    /**
     * @function sumPlacementsByDancer
     * @description Sum the number of 1sts, then the number of 1sts + 2nds, then 1sts + 2nds + 3rds, etc
     * @param {Object} countedPlacementsPerDancer {dancer: {rank:count}} ==> {54: {1:4, 2:1}}
     * @param {Integer} numOfPlaces How many places are we expecting. Translates to the last condition of the loop (eg 5 for this example)
     * @param {Integer} startingPosition. optional. Defaults to 1. Translates to the starting condition of the loop
     * @returns {Object} {dancer: {1-1: 4, 1-2: 6, 1-3: 6, 1-4: 6, 1-5: 6}
     */
    function sumPlacementsByDancer(countedPlacementsPerDancer, numOfPlaces, startingPosition){
        var results = {};
        startingPosition = _.toInteger(startingPosition) || 1;
        var totalPlaces = numOfPlaces + startingPosition -1 ;

        _.each(countedPlacementsPerDancer, function(countedPlacement, dancer){
            var total = 0;
            results[dancer] = {};
            for (var key= startingPosition; key<= totalPlaces; key++){
                var count = _.get(countedPlacement, key, 0);
                total = total+ count*(key);
                _.set(results[dancer], '1-'+key, total);
            }
        });
        return results
    }


    return {
        tabulatePlacementPerDancer: tabulatePlacementPerDancer,
        countPlacementsPerDancer: countPlacementsPerDancer,
        countNandHigherPerDancer: countNandHigherPerDancer,
        sumPlacementsByDancer: sumPlacementsByDancer
    }
} );
