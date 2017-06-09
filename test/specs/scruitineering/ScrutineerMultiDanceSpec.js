'use strict';
define([
    'chai',
    'lodash/lodash',
    'sinon',
    'scruitineering/ScruitineerMultiDance',
    'scruitineering/ScruitineerSingleDance'
], function(chai, _, sinon, ScruitineerMultiDance, ScruitineerSingleDance) {

    describe('ScruitineerMultiDance', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var SC_Multi;
        var SC;

        chai.config.truncateThreshold = 0;

        beforeEach(function(){
           sandbox = sinon.sandbox.create();
            SC_Multi =  new ScruitineerMultiDance()
            SC = new ScruitineerSingleDance();

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

        describe('Rule 9: For a multidance, the dancer with the lowest summative score is placed highest', function() {
            it('Multidance', function () {
                var dancers = [91, 92, 93, 94, 95, 96, 97, 98];
                var A = createDanceResults('W', dancers, [1, 4, 2, 5, 3, 6, 7, 8]);
                var B = createDanceResults('T', dancers, [1, 2, 3, 5, 4, 7, 6, 8]);
                var C = createDanceResults('V', dancers, [1, 2, 3, 6, 5, 4, 7, 8]);
                var D = createDanceResults('F', dancers, [1, 2, 3, 4, 7, 5, 6, 8]);
                var E = createDanceResults('Q', dancers, [1, 2, 3, 5, 7, 6, 4, 8]);

                var results = SC_Multi.doFinal([A, B, C, D, E]);
                assert.deepEqual(_.get(results, 'summation.91'),  5 , '1st place couple');
                assert.deepEqual(_.get(results, 'summation.92'),  12, '2nd place couple');
                assert.deepEqual(_.get(results, 'summation.93'),  14, '3rd place couple');
                assert.deepEqual(_.get(results, 'summation.94'),  25, '4th place couple');
                assert.deepEqual(_.get(results, 'summation.95'),  26, '5th place couple');
                assert.deepEqual(_.get(results, 'summation.96'),  28, '6th place couple');
                assert.deepEqual(_.get(results, 'summation.97'),  30, '7th place couple');
                assert.deepEqual(_.get(results, 'summation.98'),  40, '8th place couple');


                var rankingExpectation = {1: '91', 2: '92', 3: '93', 4: '94', 5: '95', 6: '96', 7: '97', 8: '98'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })

        describe('Rule 10: When there is a tie in the sums, then count the number of N through place to break the tie', function(){
            it('Multidance 2x2 way summative tie', function(){
                var dancers = [101,102,103,104,105,106];
                var A = createDanceResults('W', dancers, [1,2,6,5,4,3]);
                var B = createDanceResults('T', dancers, [1,2,4,3,5,6]);
                var C = createDanceResults('F', dancers, [3,1,2,4,5,6]);

                var results = SC_Multi.doFinal([A,B,C]);
                assert.deepEqual(_.get(results, 'summation.101'), 5 ,'1st place couple');
                assert.deepEqual(_.get(results, 'summation.102'), 5 ,'2nd place couple');
                assert.deepEqual(_.get(results, 'summation.103'), 12,'3rd place couple');
                assert.deepEqual(_.get(results, 'summation.104'), 12,'4th place couple');
                assert.deepEqual(_.get(results, 'summation.105'), 14,'5th place couple');
                assert.deepEqual(_.get(results, 'summation.106'), 15,'6th place couple');

                assert.deepEqual(_.get(results, 'notes.101'), {rule:'10', rank: 1} ,'101 rule 10');
                assert.deepEqual(_.get(results, 'notes.102'), {rule:'10', rank: 2} ,'102 rule 10');
                assert.deepEqual(_.get(results, 'notes.103'), {rule:'10', rank: 3} ,'103 rule 10');
                assert.deepEqual(_.get(results, 'notes.104'), {rule:'10', rank: 4} ,'104 rule 10');


                var rankingExpectation ={1:'101', 2:'102', 3:'103', 4:'104', 5:'105', 6:'106'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it('Multidance, 4 way summative tie + 2 way summative tie', function(){
                var dancers = [201,202,203,204,205,206];
                var A = createDanceResults('W', dancers, [1,6,2,3,5,4]);
                var B = createDanceResults('T', dancers, [6,2,1,4,3,5]);
                var C = createDanceResults('F', dancers, [4,2,6,1,5,3]);
                var D = createDanceResults('Q', dancers, [1,2,3,4,5,6]);

                var results = SC_Multi.doFinal([A,B,C,D]);
                assert.deepEqual(_.get(results, 'summation.201'), 12 ,'1st place couple');
                assert.deepEqual(_.get(results, 'summation.202'), 12 ,'2nd place couple');
                assert.deepEqual(_.get(results, 'summation.203'), 12,'3rd place couple');
                assert.deepEqual(_.get(results, 'summation.204'), 12,'4th place couple');
                assert.deepEqual(_.get(results, 'summation.205'), 18,'5th place couple');
                assert.deepEqual(_.get(results, 'summation.206'), 18,'6th place couple');

                assert.deepEqual(_.get(results, 'notes.201'), {rule:'10', rank: 1} ,'201 rule 10');
                assert.deepEqual(_.get(results, 'notes.202'), {rule:'10', rank: 2} ,'202 rule 10');
                assert.deepEqual(_.get(results, 'notes.203'), {rule:'10', rank: 3} ,'203 rule 10');
                assert.deepEqual(_.get(results, 'notes.204'), {rule:'10', rank: 4} ,'204 rule 10');
                assert.deepEqual(_.get(results, 'notes.205'), {rule:'10', rank: 5} ,'205 rule 10');
                assert.deepEqual(_.get(results, 'notes.206'), {rule:'10', rank: 6} ,'206 rule 10');

                var rankingExpectation ={1:'201', 2:'202', 3:'203', 4:'204', 5:'205', 6:'206'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })


        })

        describe("Rule 11: If Rule 10 is still tied, then treat the marks as if it were a single dance", function(){
            it('Multidance, 2 way summative tie, 2 way rule 11 setup', function(){
                var dancers = [301,302,303,304,305,306,307];
                var A = createDanceResults('W', dancers, [7,1,5,6,4,3,2]);
                var B = createDanceResults('T', dancers, [6,3,5,7,4,2,1]);
                var C = createDanceResults('V', dancers, [5,2,6,7,3,4,1]);
                var D = createDanceResults('F', dancers, [6,1,7,5,3,4,2]);
                var E = createDanceResults('Q', dancers, [5,1,6,7,3,4,2]);

                var results = SC_Multi.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'summation.301'), 29, '301 sum');
                assert.deepEqual(_.get(results, 'summation.302'), 8 , '302 sum');
                assert.deepEqual(_.get(results, 'summation.303'), 29, '303 sum');
                assert.deepEqual(_.get(results, 'summation.304'), 32, '304 sum');
                assert.deepEqual(_.get(results, 'summation.305'), 17, '305 sum');
                assert.deepEqual(_.get(results, 'summation.306'), 17, '306 sum');
                assert.deepEqual(_.get(results, 'summation.307'), 8 , '307 sum');

                assert.deepEqual(_.get(results, 'notes.301'), {rule:'11' , rank:5} ,'201 rule 11');
                assert.deepEqual(_.get(results, 'notes.303'), {rule:'11' , rank:5} ,'203 rule 11');
                assert.deepEqual(_.get(results, 'notes.302'), {rule:'10' , rank:1} ,'202 rule 10');
                assert.deepEqual(_.get(results, 'notes.305'), {rule:'10' , rank:3} ,'205 rule 10');
                assert.deepEqual(_.get(results, 'notes.306'), {rule:'10' , rank:4} ,'206 rule 10');
                assert.deepEqual(_.get(results, 'notes.307'), {rule:'10' , rank:2} ,'206 rule 10');

                //var rankingExpectation ={5:'301', 1:'302', 6:'303', 7:'304', 3:'305', 4:'306', 2:'307'};
                //assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('W & Q, 7 judges, rule 11', function(){
                var dancers = [111,112,113,114,115];
                var W_A = createJudgingResults('A', dancers, [1,5,4,3,2]);
                var W_B = createJudgingResults('B', dancers, [1,3,5,4,2]);
                var W_C = createJudgingResults('C', dancers, [1,5,4,3,2]);
                var W_D = createJudgingResults('D', dancers, [1,4,5,3,2]);
                var W_E = createJudgingResults('E', dancers, [1,3,5,4,2]);
                var W_F = createJudgingResults('F', dancers, [1,3,5,4,2]);
                var W_G = createJudgingResults('G', dancers, [1,3,4,5,2]);

                var W_results = SC.doFinal([W_A,W_B,W_C,W_D,W_E,W_F,W_G])

                var Q_A = createJudgingResults('A', dancers, [1,5,4,3,2]);
                var Q_B = createJudgingResults('B', dancers, [1,3,5,4,2]);
                var Q_C = createJudgingResults('C', dancers, [1,3,5,4,2]);
                var Q_D = createJudgingResults('D', dancers, [1,4,5,3,2]);
                var Q_E = createJudgingResults('E', dancers, [2,3,5,4,1]);
                var Q_F = createJudgingResults('F', dancers, [1,4,5,3,2]);
                var Q_G = createJudgingResults('G', dancers, [1,4,5,3,2]);

                var Q_results = SC.doFinal([Q_A, Q_B, Q_C, Q_D, Q_E, Q_F, Q_G]);

                var w_expectation ={1:'111', 2:'115', 3:'112', 4:'114', 5:'113'};
                assert.deepEqual(_.get(W_results, 'ranking'), w_expectation, ' W final placements')

                var q_expectation ={1:'111', 2:'115', 3:'114', 4:'112', 5:'113'};
                assert.deepEqual(_.get(Q_results, 'ranking'), q_expectation, ' Q final placements')

                console.log('calc multidance')
                var w_input = {dance:'W', final: W_results.rankByDancer};
                var q_input = {dance:'Q', final: Q_results.rankByDancer};
                var multi_results = SC_Multi.doFinal([w_input, q_input], _.concat([], W_results.judgesScores, Q_results.judgesScores))

                assert.deepEqual(_.get(multi_results, 'notes.112'), {rule:'11', rank:3} ,'112 rule 11');
                assert.deepEqual(_.get(multi_results, 'notes.114'), {rule:'11', rank:3} ,'114 rule 11');

                var rankingExpectation ={1:'111', 4:'112', 5:'113', 3:'114', 2:'115'};
                assert.deepEqual(_.get(multi_results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('F & T, 5 judges, rule 11', function(){
                var dancers = [111,112,113,114,115,116,117,118];
                var F_A = createJudgingResults('A', dancers, [2,6,8,7,1,4,5,3]);
                var F_B = createJudgingResults('B', dancers, [5,8,3,4,1,2,7,6]);
                var F_C = createJudgingResults('C', dancers, [6,1,2,3,5,4,8,7]);
                var F_D = createJudgingResults('D', dancers, [6,5,8,3,2,1,7,4]);
                var F_E = createJudgingResults('E', dancers, [4,7,8,2,6,1,3,5]);
                var F_results = SC.doFinal([F_A,F_B,F_C,F_D,F_E])

                var T_A = createJudgingResults('A', dancers, [3,7,8,6,1,5,2,4]);
                var T_B = createJudgingResults('B', dancers, [6,8,5,3,1,2,7,4]);
                var T_C = createJudgingResults('C', dancers, [5,3,4,1,2,6,7,8]);
                var T_D = createJudgingResults('D', dancers, [5,8,6,3,4,2,7,1]);
                var T_E = createJudgingResults('E', dancers, [4,7,8,3,5,2,1,6]);

                var T_results = SC.doFinal([T_A, T_B, T_C, T_D, T_E]);

                var F_expectation ={4:'111', 6:'112', 8:'113', 3:'114',2:'115',1:'116',7:'117',5:'118'};
                assert.deepEqual(_.get(F_results, 'ranking'), F_expectation, ' F final placements')

                var T_expectation ={5:'111',8:'112',6:'113',3:'114',1:'115',2:'116',7:'117',4:'118'};
                assert.deepEqual(_.get(T_results, 'ranking'), T_expectation, ' T final placements')

                console.log('calc multidance')
                var f_input = {dance:'F', final: F_results.rankByDancer};
                var t_input = {dance:'T', final: T_results.rankByDancer};
                var multi_results = SC_Multi.doFinal([f_input, t_input], _.concat([], F_results.judgesScores, T_results.judgesScores))


                var rankingExpectation ={4:'111',6:'112',7:'113',3:'114',1:'115',2:'116',8:'117',5:'118'};
                assert.deepEqual(_.get(multi_results, 'ranking'), rankingExpectation, 'final placements')

            })
        })



    })

});
