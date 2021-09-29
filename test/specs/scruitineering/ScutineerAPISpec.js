'use strict';
// define([
//     'chai',
//     'lodash/lodash',
//     'sinon',
//     'scruitineering/ScruitineerAPI',
// ], function(chai, _, sinon, ScruitineerAPI) {

const chai = require('chai');
const sinon = require('sinon');
const _ = require('lodash');
const ScruitineerAPI  =  require('../../../scruitineering/ScruitineerAPI');


    describe('Scruitineer API', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var SC;
        var SC_Multi;
        var R11 = 'R11';

        beforeEach(function(){
           sandbox = sinon.createSandbox();
            SC =  new ScruitineerAPI();

        });

        afterEach(function(){
            sandbox.restore();
        });


        it('should run canary tests', function () {
            expect(1).to.equal(1);
        });

        function createDanceResults(dance, dancers, placement) {
            var rtn =  {dance: dance, final:{}}
            var len = dancers.length;
            for (var i = 0; i < len ; i++){
                _.set(rtn.final, dancers[i], _.toString(placement[i]))
            }
            return rtn;

        }

        function createJudgingResults(judge, dancers, placement) {
            var rtn =  {judge: judge, final:{}}
            var len = dancers.length;
            for (var i = 0; i < len ; i++){
                _.set(rtn.final, dancers[i], placement[i])
            }
            return rtn;

        }

        function assertResults(placements, dancers, results){
            for(var i = 0 ; i < dancers.length; i++){
                var dancer = dancers[i];
                var isR11 = placements[i] == R11;
                if (!isR11) {
                    assert.deepEqual(_.get(results, 'rankByDancer.' + dancer), '' + placements[i] + '', 'placement for couple ' + dancer);
                } else {
                    assert.deepEqual(_.get(results, 'notes.' + dancer +'.rule'), '11', 'Rule 11 for couple ' + dancer);
                }
            }
        }


        describe('Rule 11. For a multidance tied under Rule 10, recompute all of the scores as if it were a single dance', function(){
            it('works for a single dance', function(){
                var dancers = [51,52,53,54,55,56,57];
                var A = createJudgingResults('A', dancers, [7,5,3,4,6,2,1]);
                var B = createJudgingResults('B', dancers, [5,6,3,2,7,4,1]);
                var C = createJudgingResults('C', dancers, [7,4,3,2,6,5,1]);
                var D = createJudgingResults('D', dancers, [7,3,5,1,6,4,2]);
                var E = createJudgingResults('E', dancers, [6,5,4,2,7,3,1]);

                var W = {dance:"W", judgesScores:[A,B,C,D,E] }
                var results = SC.doFinal([W]);
                /*assert.deepEqual(_.get(results, 'rankByDancer.51'), '7' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '5' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '3' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '6' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '4' ,'placement for couple 56');
                assert.deepEqual(_.get(results, 'rankByDancer.57'), '1' ,'placement for couple 57');
*/
                assertResults([7,5,3,2,6,4,1], dancers, results);
            })

            it('Works for multiDance: Rule 11', function(){
                var dancers = [111,112,113,114,115,116,117];
                var F_A = createJudgingResults('A', dancers, [6,3,1,4,7,2,5]);
                var F_B = createJudgingResults('B', dancers, [4,2,1,6,7,5,3]);
                var F_C = createJudgingResults('C', dancers, [6,7,3,2,4,5,1]);
                var F_D = createJudgingResults('D', dancers, [7,5,2,3,6,4,1]);
                var F_E = createJudgingResults('E', dancers, [5,2,1,6,4,3,7]);

                var T_A = createJudgingResults('A', dancers, [5,6,1,2,7,3,4]);
                var T_B = createJudgingResults('B', dancers, [7,2,1,6,4,5,3]);
                var T_C = createJudgingResults('C', dancers, [4,7,5,2,6,3,1]);
                var T_D = createJudgingResults('D', dancers, [7,5,3,2,6,4,1]);
                var T_E = createJudgingResults('E', dancers, [7,4,2,6,5,3,1]);

                var F = {dance:'F', judgesScores:[F_A, F_B, F_C, F_D, F_E]};
                var T = {dance:'T', judgesScores:[T_A, T_B, T_C, T_D, T_E]};

                var results = SC.doFinal([F,T]);

                assertResults([7,4,1,3,6,5,2], dancers, results);

            })

            it('Excercise 11-2', function(){
                var dancers = [111,112,113,114,115,116,117,118];
                var R_A = createJudgingResults('A', dancers, [8,6,2,5,7,1,3,4]);
                var R_B = createJudgingResults('B', dancers, [8,6,4,2,1,3,7,5]);
                var R_C = createJudgingResults('C', dancers, [8,6,7,2,5,3,1,4]);
                var R_D = createJudgingResults('D', dancers, [8,5,4,6,2,1,3,7]);
                var R_E = createJudgingResults('E', dancers, [8,7,5,4,1,2,3,6]);

                var Q_A = createJudgingResults('A', dancers, [8,6,2,5,7,1,3,4]);
                var Q_B = createJudgingResults('B', dancers, [8,6,3,2,1,5,7,4]);
                var Q_C = createJudgingResults('C', dancers, [8,5,6,2,3,1,4,7]);
                var Q_D = createJudgingResults('D', dancers, [8,6,7,3,1,2,5,4]);
                var Q_E = createJudgingResults('E', dancers, [8,7,6,4,1,2,3,5]);


                var R = {dance:'F', judgesScores:[R_A,R_B,R_C,R_D,R_E]};
                var Q = {dance:'T', judgesScores: [Q_A,Q_B,Q_C,Q_D,Q_E]};
                var results = SC.doFinal([R,Q]);

                assertResults([8,7,6,4,2,1,3,5], dancers, results);

            })

            it('Excercise 11-3', function(){
                var dancers = [111,112,113,114,115,116,117,];
                var R_A = createJudgingResults('A', dancers, [6,5,2,4,7,3,1]);
                var R_B = createJudgingResults('B', dancers, [6,5,4,2,7,3,1]);
                var R_C = createJudgingResults('C', dancers, [6,5,3,1,7,4,2]);
                var R_D = createJudgingResults('D', dancers, [7,4,5,1,6,3,2]);
                var R_E = createJudgingResults('E', dancers, [7,6,4,2,5,3,1]);

                var S_A = createJudgingResults('A', dancers, [7,5,3,4,6,2,1]);
                var S_B = createJudgingResults('B', dancers, [5,6,3,2,7,4,1]);
                var S_C = createJudgingResults('C', dancers, [7,4,3,2,6,5,1]);
                var S_D = createJudgingResults('D', dancers, [7,3,5,1,6,4,2]);
                var S_E = createJudgingResults('E', dancers, [6,5,4,2,7,3,1]);

                var B_A = createJudgingResults('A', dancers, [6,5,4,3,7,2,1]);
                var B_B = createJudgingResults('B', dancers, [6,5,3,2,7,4,1]);
                var B_C = createJudgingResults('C', dancers, [6,3,4,2,7,5,1]);
                var B_D = createJudgingResults('D', dancers, [7,4,6,1,5,3,2]);
                var B_E = createJudgingResults('E', dancers, [7,6,4,2,5,3,1]);

                var M_A = createJudgingResults('A', dancers, [7,5,3,4,6,2,1]);
                var M_B = createJudgingResults('B', dancers, [6,5,3,2,7,4,1]);
                var M_C = createJudgingResults('C', dancers, [7,4,5,2,6,3,1]);
                var M_D = createJudgingResults('D', dancers, [6,2,4,1,7,5,3]);
                var M_E = createJudgingResults('E', dancers, [7,6,3,2,5,4,1]);

                var R = {dance:'R', judgesScores: [R_A,R_B,R_C,R_D,R_E]};
                var S = {dance:'S', judgesScores: [S_A,S_B,S_C,S_D,S_E]};
                var B = {dance:'B', judgesScores: [B_A,B_B,B_C,B_D,B_E]};
                var M = {dance:'M', judgesScores: [M_A,M_B,M_C,M_D,M_E]};
                var results = SC.doFinal([R,S,B,M]);

                assertResults([7,5,4,2,6,3,1], dancers, results);

            })
        })

    })

//});
