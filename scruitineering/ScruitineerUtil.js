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




    return {
        tabulatePlacementPerDancer: tabulatePlacementPerDancer,
        countPlacementsPerDancer: countPlacementsPerDancer
    }
} );
