(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerUtil'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerUtil' )
        );
    } else {
        // Browser globals (root is window)
        root.Scruitineer = factory(
            root.lodash,
            root.ScruitineerUtil
        );
    }
})( this, function( _, Util) {

    const RULE_10 = '10';

    var ScruitineerMultiDance = function(){};
    ScruitineerMultiDance.prototype.toString = function(){return 'ScruitineerMultiDance'};
    ScruitineerMultiDance.prototype.doFinal = function(dancePlacements) {
        var placementsByDancer = Util.tabulatePlacementPerDancer(dancePlacements); //{101: [1,1,1]
        console.log('doFinal.placementsByDancer', placementsByDancer);

        var placementSummationByDancer = sumPlacements(placementsByDancer); //{101: 3}
        console.log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var sortedSummation = _.invertBy(placementSummationByDancer); // {3:[101]}
        console.log('sorted Summation', sortedSummation)

        var countedPlacementsPerDancer = Util.countPlacementsPerDancer(placementsByDancer);
        console.log('countedPlacementsPerDancer', countedPlacementsPerDancer)

        var notes = {};
        var ranking = placeDancers(sortedSummation, countedPlacementsPerDancer, notes);

        var rtn = {
            dancePlacements: dancePlacements,
            summation: placementSummationByDancer,
            notes: notes,
            ranking: ranking
        };
        console.log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    }

    function sumPlacements(placementsByDancer){
        var results = {}
        _.each(placementsByDancer, function(placements, dancer){
            results[dancer] = _.sum(_.map(placements, _.toInteger));
        });
        return results
    }

    function placeDancers (sortedSummation, countedPlacementsPerDancer, notes){
        var ranking = {}
        var rank = 1;
        //Sort ascending the summation of each of the competitors dance placements
        _.each(_.orderBy(_.keys(sortedSummation), _.toNumber, ['asc']), function(key, index){
            var sameSumDancers = _.get(sortedSummation, key);
            console.log('sameSumDancer',rank,  sameSumDancers);
            if (_.size(sameSumDancers) == 1) {
                //There is one clear winner, place them
                rankDancer(ranking, rank, _.first(sameSumDancers))
                rank++;
            } else {
                console.log('summation tie for ', key, sameSumDancers);
                var tieBreakingPlacements = [];
                _.each(sameSumDancers, function(dancer){
                    tieBreakingPlacements.push(_.merge(_.clone(_.get(countedPlacementsPerDancer, dancer)), {'dancer':dancer})); //Convert {dancerX:{1:1, 2:1} to [{1:1, 2:1, dancer:X}]
                })
                rank = breakTie(tieBreakingPlacements, countedPlacementsPerDancer, ranking, rank,notes, 0);

            }

        })
        //ranking = _.flatten(ranking)

        console.log('placeDancers', ranking)
        return ranking
    }

    function breakTie(tiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration){
        console.log('break tie('+iteration +') for place:' + lookingForRankPosition, tiedPlacements);

       addNotesAboutWhatRuleIsUsed(notes, tiedPlacements, RULE_10);

        var findHighestPlacements = computeFindHighestPlacements(tiedPlacements, countedPlacements, lookingForRankPosition);
        console.log('findHighestPlacements',lookingForRankPosition, findHighestPlacements);
        //Compare only the first two, even if there are more then two that are tied. Since they are sorted, if [0] > [1] then we know there isn't a tie
        var dancerPlacements1 = findHighestPlacements[0];
        var dancerPlacements2 = findHighestPlacements[1];
        if (!dancerPlacements2){
            lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);

        } else {
            var hasGTERanks = dancerPlacements1.highestRank <= dancerPlacements2.highestRank;
            var hasSameRanksGreaterCounts = dancerPlacements1.highestRank == dancerPlacements2.highestRank && dancerPlacements1.count > dancerPlacements2.count
            console.log('hasGTERanks', hasGTERanks, 'hasSameRanksGreaterCounts', hasSameRanksGreaterCounts)
            if (hasGTERanks || hasSameRanksGreaterCounts){
                lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);
                lookingForRankPosition = removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancerPlacements1.dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration)
            }
        }
        return lookingForRankPosition;

    }

    function removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration){
        tiedPlacements = _.reject(tiedPlacements, {dancer: dancer});
        if (_.size(tiedPlacements)!=0) {
            lookingForRankPosition = breakTie(tiedPlacements, countedPlacements, ranking, lookingForRankPosition, iteration+1)
        }
        return lookingForRankPosition
    }

    function addNotesAboutWhatRuleIsUsed(notes, collection, rule){
        _.each(collection, function(dancerObj){
            notes[_.get(dancerObj, 'dancer')] = rule;
        });
    }

    function computeFindHighestPlacements(tiedPlacements, countedPlacements, rank){
        var findHighestPlacements = _.orderBy(_.map(tiedPlacements, function (countedPlacement) {
            var highestPlacements = _.pickBy(countedPlacement, function (value, key) {
                return key <= rank || key == 'dancer'
            })
            console.log('highestPlacements', highestPlacements)
            var sumCount = {count: 0, dancer: '', highestRank: 100}
            _.each(highestPlacements, function (value, key) {
                if (key == 'dancer') {
                    _.set(sumCount, 'dancer', value)
                }
                else {
                    sumCount.count = sumCount.count + value;
                    sumCount.highestRank = _.max([rank, _.toNumber(key)])
                }
            })
            return sumCount;
        }), ['highestRank', 'count'], ['asc', 'desc'])
        return findHighestPlacements
    }

    function rankDancer( ranking, rank, dancer) {
        console.log('rankDancer', rank, dancer)
        ranking[rank] = dancer;
        return rank +1;
    }

    return ScruitineerMultiDance;
} );
