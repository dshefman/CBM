(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerSingleDance',
            'scruitineering/ScruitineerMultiDance'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerSingleDance' ),
            require( 'scruitineering/ScruitineerMultiDance' )
        );
    } else {
        // Browser globals (root is window)
        root.ScruitineerAPI = factory(
            root.lodash,
            root.ScruitineerSingleDance,
            root.ScruitineerMultiDance
        );
    }
})( this, function( _, ScruitineerSingleDance, ScruitineerMultiDance) {


    var ScruitineerAPI = function (verbose) {
        this.verbose = verbose;
        this.SC = new ScruitineerSingleDance(verbose);
        this.SC_Multi = new ScruitineerMultiDance(verbose);
    };

    ScruitineerAPI.prototype.toString = function () {
        return 'Scruitineer'
    };
    ScruitineerAPI.prototype.doFinal = function (judgesScoresPerDance) {
      if (this.verbose) {
        console.log('[API].doFinal() => input:\n' + JSON.stringify(judgesScoresPerDance, null, 4) + '\n----------\n');
      }
      var numOfDances = _.size(judgesScoresPerDance);
      var result;
      if (numOfDances == 1) {
          var judgesScores = _.get(judgesScoresPerDance, '[0].judgesScores');
          result = computeForSingleDance.call(this,judgesScores);
      } else {
          result = computeForMultiDance.call(this,judgesScoresPerDance);
      }

      return result;
    };

    function computeForSingleDance(judgesScores) {
        return this.SC.doFinal(judgesScores);
    }

    function computeForMultiDance(judgesScoresPerDance){
        var resultsForEachDance = [];
        var rawResultsForEachDance = {};
        var finalResults = null;
        var allScoresRaw = []
        _.each(judgesScoresPerDance, function(danceScoresObj, i){
            var dance = _.get(danceScoresObj, 'dance', 'unknown_' +i);
            var judgesScores = _.get(danceScoresObj, 'judgesScores');
            allScoresRaw = _.concat(allScoresRaw, judgesScores);
            var result = computeForSingleDance.call(this,judgesScores);
            resultsForEachDance.push({dance:dance, final:result.rankByDancer});
            rawResultsForEachDance[dance] = result;
        }.bind(this));


        finalResults = this.SC_Multi.doFinal(resultsForEachDance, allScoresRaw);
        _.set(finalResults, '_rawComputationalData', rawResultsForEachDance);
        return finalResults;
    }

    return ScruitineerAPI;
})