'use strict';
define([
    'chai',
    'lodash/lodash',
    'sinon',
    'scruitineering/ScruitineerMultiDance'
], function(chai, _, sinon, ScruitineerMultiDance) {

    describe('ScruitineerMultiDance', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var SC

        beforeEach(function(){
           sandbox = sinon.sandbox.create();
            SC =  new ScruitineerMultiDance();

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

        describe('Rule 9: For a multidance, the dancer with the lowest summative score is placed highest', function() {
            it('Multidance', function () {
                var dancers = [91, 92, 93, 94, 95, 96, 97, 98];
                var A = createDanceResults('W', dancers, [1, 4, 2, 5, 3, 6, 7, 8]);
                var B = createDanceResults('T', dancers, [1, 2, 3, 5, 4, 7, 6, 8]);
                var C = createDanceResults('V', dancers, [1, 2, 3, 6, 5, 4, 7, 8]);
                var D = createDanceResults('F', dancers, [1, 2, 3, 4, 7, 5, 6, 8]);
                var E = createDanceResults('Q', dancers, [1, 2, 3, 5, 7, 6, 4, 8]);

                var results = SC.doFinal([A, B, C, D, E]);
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

                var results = SC.doFinal([A,B,C]);
                assert.deepEqual(_.get(results, 'summation.101'), 5 ,'1st place couple');
                assert.deepEqual(_.get(results, 'summation.102'), 5 ,'2nd place couple');
                assert.deepEqual(_.get(results, 'summation.103'), 12,'3rd place couple');
                assert.deepEqual(_.get(results, 'summation.104'), 12,'4th place couple');
                assert.deepEqual(_.get(results, 'summation.105'), 14,'5th place couple');
                assert.deepEqual(_.get(results, 'summation.106'), 15,'6th place couple');

                assert.deepEqual(_.get(results, 'notes.101'), '10' ,'101 rule 10');
                assert.deepEqual(_.get(results, 'notes.102'), '10' ,'102 rule 10');
                assert.deepEqual(_.get(results, 'notes.103'), '10' ,'103 rule 10');
                assert.deepEqual(_.get(results, 'notes.104'), '10' ,'104 rule 10');


                var rankingExpectation ={1:'101', 2:'102', 3:'103', 4:'104', 5:'105', 6:'106'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it('Multidance, 4 way summative tie + 2 way summative tie', function(){
                var dancers = [201,202,203,204,205,206];
                var A = createDanceResults('W', dancers, [1,6,2,3,5,4]);
                var B = createDanceResults('T', dancers, [6,2,1,4,3,5]);
                var C = createDanceResults('F', dancers, [4,2,6,1,5,3]);
                var D = createDanceResults('Q', dancers, [1,2,3,4,5,6]);

                var results = SC.doFinal([A,B,C,D]);
                assert.deepEqual(_.get(results, 'summation.201'), 12 ,'1st place couple');
                assert.deepEqual(_.get(results, 'summation.202'), 12 ,'2nd place couple');
                assert.deepEqual(_.get(results, 'summation.203'), 12,'3rd place couple');
                assert.deepEqual(_.get(results, 'summation.204'), 12,'4th place couple');
                assert.deepEqual(_.get(results, 'summation.205'), 18,'5th place couple');
                assert.deepEqual(_.get(results, 'summation.206'), 18,'6th place couple');

                assert.deepEqual(_.get(results, 'notes.201'), '10' ,'201 rule 10');
                assert.deepEqual(_.get(results, 'notes.202'), '10' ,'202 rule 10');
                assert.deepEqual(_.get(results, 'notes.203'), '10' ,'203 rule 10');
                assert.deepEqual(_.get(results, 'notes.204'), '10' ,'204 rule 10');
                assert.deepEqual(_.get(results, 'notes.205'), '10' ,'205 rule 10');
                assert.deepEqual(_.get(results, 'notes.206'), '10' ,'206 rule 10');

                var rankingExpectation ={1:'201', 2:'202', 3:'203', 4:'204', 5:'205', 6:'206'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })


        })

        describe("Rule 11: If Rule 10 is still tied, then treat the marks as if it were a single dance", function(){
            it('Multidance, 2 way summative tie, 2 way rule 11', function(){
                var dancers = [301,302,303,304,305,306,307];
                var A = createDanceResults('W', dancers, [7,1,5,6,4,3,2]);
                var B = createDanceResults('T', dancers, [6,3,5,7,4,2,1]);
                var C = createDanceResults('V', dancers, [5,2,6,7,3,4,1]);
                var D = createDanceResults('F', dancers, [6,1,7,5,3,4,2]);
                var E = createDanceResults('Q', dancers, [5,1,6,7,3,4,2]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'summation.301'), 29, '301 sum');
                assert.deepEqual(_.get(results, 'summation.302'), 8 , '302 sum');
                assert.deepEqual(_.get(results, 'summation.303'), 29, '303 sum');
                assert.deepEqual(_.get(results, 'summation.304'), 32, '304 sum');
                assert.deepEqual(_.get(results, 'summation.305'), 17, '305 sum');
                assert.deepEqual(_.get(results, 'summation.306'), 17, '306 sum');
                assert.deepEqual(_.get(results, 'summation.307'), 8 , '307 sum');

                assert.deepEqual(_.get(results, 'notes.301'), '11' ,'201 rule 10');
                assert.deepEqual(_.get(results, 'notes.302'), '10' ,'202 rule 10');
                assert.deepEqual(_.get(results, 'notes.303'), '11' ,'203 rule 10');
                //assert.deepEqual(_.get(results, 'notes.304'), '10' ,'204 rule 10');
                assert.deepEqual(_.get(results, 'notes.305'), '10' ,'205 rule 10');
                assert.deepEqual(_.get(results, 'notes.306'), '10' ,'206 rule 10');
                assert.deepEqual(_.get(results, 'notes.307'), '10' ,'206 rule 10');

                var rankingExpectation ={5:'301', 1:'302', 6:'303', 7:'304', 3:'305', 4:'306', 2:'307'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })



    })

});
