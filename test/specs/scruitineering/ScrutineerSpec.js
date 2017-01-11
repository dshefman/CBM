'use strict';
define([
    'chai',
    'lodash/lodash',
    'sinon',
    'scruitineering/Scruitineer'
], function(chai, _, sinon, Scruitineer) {

    describe('Scruitineer', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var SC

        beforeEach(function(){
           sandbox = sinon.sandbox.create();
            SC =  new Scruitineer();

        });

        afterEach(function(){
            sandbox.restore();
        });


        it('should run canary tests', function () {
            expect(1).to.equal(1);
        });

        function createJudgingResults(judge, dancers, placement) {
            var rtn =  {judge: judge, final:{}}
            var len = dancers.length;
            for (var i = 0; i < len ; i++){
                _.set(rtn.final, dancers[i], placement[i])
            }
            return rtn;

        }

        describe('Rule 5', function(){
            it('The winner of a particular dance is the couple who is placed 1st by an absolute majority of the judgesThe winner of a particular dance is the couple who is placed 1st by an absolute majority of the judges', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [1,4,3,2,5,6]);
                var B = createJudgingResults('B', dancers, [1,2,3,4,6,5]);
                var C = createJudgingResults('C', dancers, [1,2,3,5,4,6]);
                var D = createJudgingResults('D', dancers, [2,1,5,4,3,6]);
                var E = createJudgingResults('E', dancers, [1,2,4,3,5,6]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'tabulation.51'), {'1-1':4, '1-2': 5, '1-3': 5, '1-4':5, '1-5': 5, '1-6': 5 } ,'1st place couple');
                assert.deepEqual(_.get(results, 'tabulation.52'), {'1-1':1, '1-2': 4, '1-3': 4, '1-4':5, '1-5': 5, '1-6': 5 } ,'2nd place couple');
                assert.deepEqual(_.get(results, 'tabulation.53'), {'1-1':0, '1-2': 0, '1-3': 3, '1-4':4, '1-5': 5, '1-6': 5 } ,'3rd place couple');
                assert.deepEqual(_.get(results, 'tabulation.54'), {'1-1':0, '1-2': 1, '1-3': 2, '1-4':4, '1-5': 5, '1-6': 5 } ,'4th place couple');
                assert.deepEqual(_.get(results, 'tabulation.55'), {'1-1':0, '1-2': 0, '1-3': 1, '1-4':2, '1-5': 4, '1-6': 5 } ,'5th place couple');
                assert.deepEqual(_.get(results, 'tabulation.56'), {'1-1':0, '1-2': 0, '1-3': 0, '1-4':0, '1-5': 1, '1-6': 5 } ,'6th place couple');

                assert.deepEqual(_.get(results, 'rankByDancer.51'), '1' ,'1st place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '2' ,'2nd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '3' ,'3rd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '4' ,'4th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '5' ,'5th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '6' ,'6th place couple placements');

                var rankingExpectation ={1:'51', 2:'52', 3:'53', 4:'54', 5:'55', 6:'56'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('example 2', function(){
                var dancers = [11,21,31,41,51,61];
                var A = createJudgingResults('A', dancers, [1,2,3,4,5,6]);
                var B = createJudgingResults('B', dancers, [5,2,3,4,1,6]);
                var C = createJudgingResults('C', dancers, [1,5,3,2,4,6]);
                var D = createJudgingResults('D', dancers, [1,4,3,2,5,6]);
                var E = createJudgingResults('E', dancers, [2,1,3,4,5,6]);

                var results = SC.doFinal([A,B,C,D,E]);
                var rankingExpectation ={1:'11', 2:'21', 3:'31', 4:'41', 5:'51', 6:'61'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })

        describe('Rule 6', function(){
            it('If more than 1 couple has a majority, then the couple who has the greater majority wins', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [1,6,2,3,4,5]);
                var B = createJudgingResults('B', dancers, [1,2,4,3,5,6]);
                var C = createJudgingResults('C', dancers, [2,1,3,5,6,4]);
                var D = createJudgingResults('D', dancers, [1,5,3,2,4,6]);
                var E = createJudgingResults('E', dancers, [4,2,6,1,3,5]);
                var F = createJudgingResults('F', dancers, [2,1,3,5,6,4]);
                var G = createJudgingResults('G', dancers, [1,2,3,4,5,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'tabulation.61'), {'1-1':4, '1-2': 6, '1-3': 6, '1-4':7, '1-5': 7, '1-6': 7 } ,'1st place couple');
                assert.deepEqual(_.get(results, 'tabulation.62'), {'1-1':2, '1-2': 5, '1-3': 5, '1-4':5, '1-5': 6, '1-6': 7 } ,'2nd place couple');
                assert.deepEqual(_.get(results, 'tabulation.63'), {'1-1':0, '1-2': 1, '1-3': 5, '1-4':6, '1-5': 6, '1-6': 7 } ,'3rd place couple');
                assert.deepEqual(_.get(results, 'tabulation.64'), {'1-1':1, '1-2': 2, '1-3': 4, '1-4':5, '1-5': 7, '1-6': 7 } ,'4th place couple');
                assert.deepEqual(_.get(results, 'tabulation.65'), {'1-1':0, '1-2': 0, '1-3': 1, '1-4':3, '1-5': 5, '1-6': 7 } ,'5th place couple');
                assert.deepEqual(_.get(results, 'tabulation.66'), {'1-1':0, '1-2': 0, '1-3': 0, '1-4':2, '1-5': 4, '1-6': 7 } ,'6th place couple');

                assert.deepEqual(_.get(results, 'rankByDancer.61'), '1' ,'1st place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.62'), '2' ,'2nd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.63'), '3' ,'3rd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.64'), '4' ,'4th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.65'), '5' ,'5th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.66'), '6' ,'6th place couple placements');

                var rankingExpectation ={1:'61', 2:'62', 3:'63', 4:'64', 5:'65', 6:'66'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('example 2', function(){
                var dancers = [12,22,32,42,52,62];
                var A = createJudgingResults('A', dancers, [1,3,2,4,5,6]);
                var B = createJudgingResults('B', dancers, [1,2,5,3,4,6]);
                var C = createJudgingResults('C', dancers, [1,2,5,4,3,6]);
                var D = createJudgingResults('D', dancers, [4,1,2,5,3,6]);
                var E = createJudgingResults('E', dancers, [4,1,2,3,5,6]);

                var results = SC.doFinal([A,B,C,D,E]);
                var rankingExpectation ={1:'12', 2:'22', 3:'32', 4:'42', 5:'52', 6:'62'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })


        describe('Rule 7', function(){
            it('If more than 1 couple has a majority and there is no greater majority, use the lowest sum', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [3,2,1,5,4,6]);
                var B = createJudgingResults('B', dancers, [1,2,5,4,6,3]);
                var C = createJudgingResults('C', dancers, [6,1,4,2,3,5]);
                var D = createJudgingResults('D', dancers, [1,5,2,4,3,6]);
                var E = createJudgingResults('E', dancers, [1,3,2,6,5,4]);
                var F = createJudgingResults('F', dancers, [2,1,6,5,4,3]);
                var G = createJudgingResults('G', dancers, [1,3,2,4,6,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'tabulation.71'), {'1-1':4, '1-2': 5, '1-3': 6, '1-4':6, '1-5': 6, '1-6': 7 } ,'1st place couple');
                assert.deepEqual(_.get(results, 'tabulation.72'), {'1-1':2, '1-2': 4, '1-3': 6, '1-4':6, '1-5': 7, '1-6': 7 } ,'2nd place couple');
                assert.deepEqual(_.get(results, 'tabulation.73'), {'1-1':1, '1-2': 4, '1-3': 4, '1-4':5, '1-5': 6, '1-6': 7 } ,'3rd place couple');
                assert.deepEqual(_.get(results, 'tabulation.74'), {'1-1':0, '1-2': 1, '1-3': 1, '1-4':4, '1-5': 6, '1-6': 7 } ,'4th place couple');
                assert.deepEqual(_.get(results, 'tabulation.75'), {'1-1':0, '1-2': 0, '1-3': 2, '1-4':4, '1-5': 5, '1-6': 7 } ,'5th place couple');
                assert.deepEqual(_.get(results, 'tabulation.76'), {'1-1':0, '1-2': 0, '1-3': 2, '1-4':3, '1-5': 5, '1-6': 7 } ,'6th place couple');

                assert.deepEqual(_.get(results, 'rankByDancer.71'), '1' ,'1st place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.72'), '2' ,'2nd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.73'), '3' ,'3rd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.74'), '4' ,'4th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.75'), '5' ,'5th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.76'), '6' ,'6th place couple placements');

                assert.deepEqual(_.get(results, 'summation.72.1-2'), 6 ,'2nd place couple summation');
                assert.deepEqual(_.get(results, 'summation.73.1-2'), 7 ,'3rd place couple summation');
                assert.deepEqual(_.get(results, 'summation.74.1-4'), 14 ,'4th place couple summation');
                assert.deepEqual(_.get(results, 'summation.75.1-4'), 14 ,'5th place couple summation');


                var rankingExpectation ={1:'71', 2:'72', 3:'73', 4:'74', 5:'75', 6:'76'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('example 2', function(){
                var dancers = [13,23,33,43,53,63];
                var A = createJudgingResults('A', dancers, [1,5,2,4,3,6]);
                var B = createJudgingResults('B', dancers, [1,5,2,4,3,6]);
                var C = createJudgingResults('C', dancers, [1,2,5,3,4,6]);
                var D = createJudgingResults('D', dancers, [5,2,1,3,6,4]);
                var E = createJudgingResults('E', dancers, [5,2,4,3,1,6]);

                var results = SC.doFinal([A,B,C,D,E]);
                var rankingExpectation ={1:'13', 3:'23', 2:'33', 5:'43', 4:'53', 6:'63'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })

            it ('example 2b', function(){
                var dancers = [14,24,34,44,54,64];
                var A = createJudgingResults('A', dancers, [2,1,5,3,4,6]);
                var B = createJudgingResults('B', dancers, [1,2,6,3,4,5]);
                var C = createJudgingResults('C', dancers, [5,2,1,3,4,6]);
                var D = createJudgingResults('D', dancers, [1,5,2,3,6,4]);
                var E = createJudgingResults('E', dancers, [1,5,2,6,4,3]);

                var results = SC.doFinal([A,B,C,D,E]);

                assert.deepEqual(_.get(results, 'rankByDancer.14'), '1' ,'1st place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.24'), '2' ,'2nd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.34'), '3' ,'3rd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.44'), '4' ,'4th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '5' ,'5th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.64'), '6' ,'6th place couple placements');


                var rankingExpectation ={1:'14', 2:'24', 3:'34', 4:'44', 5:'54', 6:'64'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })

        describe('Rule 8', function(){
            it('There is no majority in intial rankings', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [3,4,2,1,5,6]);
                var B = createJudgingResults('B', dancers, [3,4,2,6,5,1]);
                var C = createJudgingResults('C', dancers, [3,4,6,1,5,2]);
                var D = createJudgingResults('D', dancers, [2,3,6,5,1,4]);
                var E = createJudgingResults('E', dancers, [5,2,4,1,3,6]);
                var F = createJudgingResults('F', dancers, [2,3,1,4,6,5]);
                var G = createJudgingResults('G', dancers, [3,2,4,6,1,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'tabulation.81'), {'1-1':0, '1-2':2, '1-3':6, '1-4':6, '1-5':7, '1-6':7} ,'1st place couple');
                assert.deepEqual(_.get(results, 'tabulation.82'), {'1-1':0, '1-2':2, '1-3':4, '1-4':7, '1-5':7, '1-6':7} ,'2nd place couple');
                assert.deepEqual(_.get(results, 'tabulation.83'), {'1-1':1, '1-2':3, '1-3':3, '1-4':5, '1-5':5, '1-6':7} ,'3rd place couple');
                assert.deepEqual(_.get(results, 'tabulation.84'), {'1-1':3, '1-2':3, '1-3':3, '1-4':4, '1-5':5, '1-6':7} ,'4th place couple');
                assert.deepEqual(_.get(results, 'tabulation.85'), {'1-1':2, '1-2':2, '1-3':3, '1-4':3, '1-5':6, '1-6':7} ,'5th place couple');
                assert.deepEqual(_.get(results, 'tabulation.86'), {'1-1':1, '1-2':2, '1-3':2, '1-4':3, '1-5':5, '1-6':7} ,'6th place couple');

                assert.deepEqual(_.get(results, 'rankByDancer.81'), '1' ,'1st place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.82'), '2' ,'2nd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.83'), '3' ,'3rd place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.84'), '4' ,'4th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.85'), '5' ,'5th place couple placements');
                assert.deepEqual(_.get(results, 'rankByDancer.86'), '6' ,'6th place couple placements');


                var rankingExpectation ={1:'81', 2:'82', 3:'83', 4:'84', 5:'85', 6:'86'};
                assert.deepEqual(_.get(results, 'ranking'), rankingExpectation, 'final placements')

            })
        })

    })

});
