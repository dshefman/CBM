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

        describe('Rule 9', function() {
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

            describe('Rule 10', function(){
            it('Multidance', function(){
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


                var rankingExpectation ={1:'101', 2:'102', 3:'103', 4:'104', 5:'105', 6:'106'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it('Multidance, tough tie breaker', function(){
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


                var rankingExpectation ={1:'201', 2:'202', 3:'203', 4:'204', 5:'205', 6:'206'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })


        })



    })

});