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

    function tabulatePlacementPerDancer (dancePlacements){
        // returns {dancer: [placements]
        var results = {};
        _.each(dancePlacements, function(scoreByDance) {
            var danceScore = scoreByDance.final;

            _.each(danceScore, function (placement, dancer){
                //console.log("each judge", scoreByJudge.judge, dancer, placement)
                if (!results[dancer]) {
                    results[dancer] = []
                }
                results[dancer].push(placement);
            })
        });
        return results;
    }

    function countPlacementsPerDancer(placementByDancer){
        var results = {};
        _.each(placementByDancer, function (placements, dancer){
            var countsByPlacements = _.countBy(placements); //{1:4 ,2:1}
            results[dancer] = countsByPlacements;
        });
        return results;
    }

    function countNandHigherPerDancer(countedPlacementsPerDancer, numOfPlaces, startingPosition){
        var results = {};
        startingPosition = _.toInteger(startingPosition) || 1;
        var totalPlaces = numOfPlaces + startingPosition -1;
        //console.log('countNandHigherPerDancer', countedPlacementsPerDancer, numOfPlaces, startingPosition)
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
        //console.log('count1ToXPlacements', targetPlacement, countByPlacement);
        for (var i = 1; i <= targetPlacement; i++){
            if (_.get(countByPlacement, i)) {
                //Normal sums
                total += _.get(countByPlacement, i, 0);
                //console.log('count1ToXPlacements', i, total);
            } else {
                //placement might exist as a fraction like 2.5. Math.ceil all of of the keys to match to the targetPlacement
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
        //console.log('count1ToXPlacements', targetPlacement, countByPlacement ,total);
        return total;

    }

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
                //console.log('sumPlacementsByDance',dancer, '1-'+key, total);

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
