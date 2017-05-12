(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerUtil',
            'scruitineering/Scruitineer'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerUtil' ),
            require( 'scruitineering/Scruitineer' )
        );
    } else {
        // Browser globals (root is window)
        root.Scruitineer = factory(
            root.lodash,
            root.ScruitineerUtil,
            root.Scruitineer
        );
    }
})( this, function( _, Util, Scruitineer) {

    const RULE_10 = '10';
    const RULE_11 = '11';

    var ScruitineerMultiDance = function(){};
    ScruitineerMultiDance.prototype.toString = function(){return 'ScruitineerMultiDance'};
    ScruitineerMultiDance.prototype.doFinal = function(dancePlacements, judgesScores) {
        console.log('doFinal inputs', JSON.stringify(dancePlacements))
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

        var rule11Dancers = findRule11Dancers(notes);
        if (_.size(rule11Dancers) > 0){
            var brokenTie = breakTieAsASingleDance(judgesScores, rule11Dancers, notes);
            ranking = _.merge(ranking, brokenTie);
        }

        var rtn = {
            dancePlacements: dancePlacements,
            summation: placementSummationByDancer,
            notes: notes,
            rankByDancer: _.invert(ranking),
            ranking: ranking
        };
        console.log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    }

    function sumPlacements(placementsByDancer){
        var results = {}
        _.each(placementsByDancer, function(placements, dancer){
            results[dancer] = _.sum(_.map(placements, _.toNumber));
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

        addNotesAboutWhatRuleIsUsed(notes, tiedPlacements, RULE_10, lookingForRankPosition);


        var findHighestPlacements = computeFindHighestPlacements(tiedPlacements, countedPlacements, lookingForRankPosition);
        console.log('findHighestPlacements',lookingForRankPosition, findHighestPlacements);
        //Compare only the first two, even if there are more then two that are tied. Since they are sorted, if [0] > [1] then we know there isn't a tie
        var dancerPlacements1 = findHighestPlacements[0];
        var dancerPlacements2 = findHighestPlacements[1];
        if (!dancerPlacements2){
            lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);

        } else {
            var hasGTCounts = dancerPlacements1.count > dancerPlacements2.count;
            var hasSameCountsLTSum = dancerPlacements1.sum < dancerPlacements2.sum;
            if (hasGTCounts || hasSameCountsLTSum) {
                lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);
                lookingForRankPosition = removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancerPlacements1.dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration)
            } else {
                var filteredTiedPlacements = _.filter(tiedPlacements, function (o) {
                    return o.dancer == dancerPlacements1.dancer || o.dancer == dancerPlacements2.dancer
                });
                console.log('tie needs to be broken with rule 11', filteredTiedPlacements);
                addNotesAboutWhatRuleIsUsed(notes, filteredTiedPlacements, RULE_11, lookingForRankPosition);
                lookingForRankPosition += _.size(filteredTiedPlacements);

                var remainingTiedPlacements = _.reject(tiedPlacements, function (o) {
                    return o.dancer == dancerPlacements1.dancer || o.dancer == dancerPlacements2.dancer
                });
                if (_.size(remainingTiedPlacements)) {
                    console.log('continue to break tie with', remainingTiedPlacements);
                    lookingForRankPosition = breakTie(remainingTiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration + 1)
                }
            }
        }
        return lookingForRankPosition;

    }

    function removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration){
        tiedPlacements = _.reject(tiedPlacements, {dancer: dancer});
        if (_.size(tiedPlacements)!=0) {
            lookingForRankPosition = breakTie(tiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration+1)
        }
        return lookingForRankPosition
    }

    function addNotesAboutWhatRuleIsUsed(notes, collection, rule, lookingForRankPosition){
        _.each(collection, function(dancerObj){
            notes[_.get(dancerObj, 'dancer')] = {rule: rule, rank:lookingForRankPosition};
        });

    }

    function computeFindHighestPlacements(tiedPlacements, countedPlacements, rank){
        var numberOfDancers = _.size(countedPlacements);
        var countedNandHigherPerDancer = Util.countNandHigherPerDancer(countedPlacements,numberOfDancers);
        console.log('countedNandHigherPerDancer', countedNandHigherPerDancer);

        var isKeyLTERank = function (key){
            return _.ceil(_.toNumber(key)) <= rank;
        }

        var findHighestPlacements = _.orderBy(_.map(tiedPlacements, function (countedPlacement) {
            var dancer = _.get(countedPlacement, 'dancer')
            //console.log('countedPlacement', countedPlacement)
            var highestPlacements = _.pickBy(countedPlacement, function (value, key) {
                //console.log('highestPlacements pickBy',  _.toNumber(key), "<=", rank);
                return key == 'dancer' || isKeyLTERank(key);
            })
            console.log('highestPlacements',rank,  highestPlacements)

            var sumCount = {count: 0, sum:0, dancer: dancer}
            //Get the 1-N count for this next rank
            sumCount.count = _.get(_.get(countedNandHigherPerDancer, dancer), '1-' + rank);

            //Sum
            sumCount.sum  =  _.reduce(_.get(countedPlacements, dancer), function(result, value, key) {
                if (isKeyLTERank(key)) {
                    //console.log('reduce', result, value, key, result+value)
                    return result + (value * _.toNumber(key));
                }
                return result;
            }, 0);

            return sumCount;
        }), ['count', 'sum'], ['desc', 'asc'])
        return findHighestPlacements
    }

    function rankDancer( ranking, rank, dancer) {
        console.log('rankDancer', rank, dancer)
        ranking[rank] = dancer;
        return rank +1;
    }

    function notes_has_RULE_11(notes){
        var rtn = _.reduce(notes, function(result, val){ result = result || val == RULE_11}, false)
        console.log('notes_has_Rule11', notes, rtn)
        return rtn != undefined;
    }

    function findRule11Dancers(notes){
        console.log('findRule11Dancers.notes', notes)
        var rtn = _.reduce(notes, function(result, val, key) {
            console.log('findRule11Dancers.result', result,'>>', val, key)
            if (val.rule == RULE_11) {
                var currentTiedRank = _.get(result, val.rank, []);
                currentTiedRank.push(key);
                _.set(result, val.rank, currentTiedRank);
            }
            return result
        }, {})
        console.log('rule11Dancers', rtn);
        return rtn;
    }

    function breakTieAsASingleDance(judgesScores, tiedDancersByRank, notes){
        console.log('breakTieAsASingleDance', JSON.stringify(judgesScores), JSON.stringify(tiedDancersByRank))
        var scoresOnly = _.reduce(judgesScores, function(result, value, key){
            result.push({final:value.final})
            return result
        }, [])
        console.log('breakTieAsASingleDance.scoresOnly', scoresOnly)

        var singleDanceScruitineer = new Scruitineer();
        var tiedPositions = _.keys(tiedDancersByRank).sort();

        var brokenTie = {}
        _.each(tiedPositions, function(rank){
            var dancers = _.get(tiedDancersByRank, rank, [])
            console.log('breakTieAsSingleDance for rank and dancers', rank, dancers);
            var dancerOnlyScores = _.reduce(scoresOnly, function(result, value, key){
                result.push({final: _.pick(value.final, dancers)})
                return result
            }, [])
            console.log('breakTieAsSingleDance.dancerOnlyScores', dancerOnlyScores);

            var singleDanceResults = singleDanceScruitineer.doFinal(dancerOnlyScores, rank);
            //console.log('breakTieAsASingleDance.results', JSON.stringify(singleDanceResults,null,4))

            var rankingsForTiedDancers = _.pick(singleDanceResults.rankByDancer, dancers);
            console.log('breakTieAsASingleDance.rankingsForTiedDancers', rankingsForTiedDancers)

            var sortedRankingsForTiedDancers = _.invert(rankingsForTiedDancers);
            var sortedKeys = _.keys(sortedRankingsForTiedDancers).sort();

            console.log('breakTieAsASingleDance.sortedRankingsForTiedDancers', sortedRankingsForTiedDancers)

            var lookingForPosition = _.toInteger(rank);
            console.log('breakTieAsASingleDance.lookingForPosition', lookingForPosition , '-', (lookingForPosition + _.size(dancers)-1))

            _.each(sortedKeys, function(key){
                _.set(brokenTie,  _.toString(lookingForPosition), _.get(sortedRankingsForTiedDancers, key));
                lookingForPosition++;
            })
            console.log('breakTieAsASingleDance.brokenTie', brokenTie)
        })

        return brokenTie;
    }

    return ScruitineerMultiDance;
} );
