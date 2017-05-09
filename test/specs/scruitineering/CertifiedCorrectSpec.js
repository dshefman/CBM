'use strict';
define([
    'chai',
    'lodash/lodash',
    'sinon',
    'scruitineering/Scruitineer',
    'scruitineering/ScruitineerMultiDance',
], function(chai, _, sinon, Scruitineer, ScruitineerMultiDance) {

    describe('Certified Correct - Scrutineering Exam Prep Book Examples', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var SC;
        var SC_Multi;

        beforeEach(function(){
           sandbox = sinon.sandbox.create();
            SC =  new Scruitineer();
            SC_Multi = new ScruitineerMultiDance();

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
                assert.deepEqual(_.get(results, 'rankByDancer.' +dancer ), ''+placements[i]+'' ,'placement for couple ' + dancer);
            }
        }


        describe('Rule 5. The winner of a particular position is the couple who is placed by an absolute majority of the judges.', function(){
            it('Example 5-1', function(){
                var dancers = [51,52,53,54,55,56,57];
                var A = createJudgingResults('A', dancers, [7,5,3,4,6,2,1]);
                var B = createJudgingResults('B', dancers, [5,6,3,2,7,4,1]);
                var C = createJudgingResults('C', dancers, [7,4,3,2,6,5,1]);
                var D = createJudgingResults('D', dancers, [7,3,5,1,6,4,2]);
                var E = createJudgingResults('E', dancers, [6,5,4,2,7,3,1]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '7' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '5' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '3' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '6' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '4' ,'placement for couple 56');
                assert.deepEqual(_.get(results, 'rankByDancer.57'), '1' ,'placement for couple 57');

            })

            it('Example 5-2', function(){
                var dancers = [51,52,53,54,55,56,57];
                var A = createJudgingResults('A', dancers, [6,5,2,4,7,3,1]);
                var B = createJudgingResults('B', dancers, [7,5,4,2,6,3,1]);
                var C = createJudgingResults('C', dancers, [7,4,3,2,6,5,1]);
                var D = createJudgingResults('D', dancers, [7,2,5,1,6,4,3]);
                var E = createJudgingResults('E', dancers, [5,6,4,2,7,3,1]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '7' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '5' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '4' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '6' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '3' ,'placement for couple 56');
                assert.deepEqual(_.get(results, 'rankByDancer.57'), '1' ,'placement for couple 57');

            })

            it('Example 5-3', function(){
                var dancers = [51,52,53,54,55];
                var A = createJudgingResults('A', dancers, [4,1,2,5,3]);
                var B = createJudgingResults('B', dancers, [4,1,2,5,3]);
                var C = createJudgingResults('C', dancers, [4,2,3,5,1]);
                var D = createJudgingResults('D', dancers, [5,3,1,4,2]);
                var E = createJudgingResults('E', dancers, [5,1,2,4,3]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '4' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '1' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '2' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '5' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '3' ,'placement for couple 55');

            })

            it('Example 5-4', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [2,5,1,3,4,6]);
                var B = createJudgingResults('B', dancers, [1,4,3,5,2,6]);
                var C = createJudgingResults('C', dancers, [2,5,1,3,4,6]);
                var D = createJudgingResults('D', dancers, [2,5,1,4,3,6]);
                var E = createJudgingResults('E', dancers, [1,5,2,4,3,6]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '2' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '5' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '1' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '4' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '3' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '6' ,'placement for couple 56');

            })

            it('Example 5-5', function(){
                var dancers = [51,52,53,54,55,56,57];
                var A = createJudgingResults('A', dancers, [6,5,4,3,7,2,1]);
                var B = createJudgingResults('B', dancers, [6,5,3,2,7,4,1]);
                var C = createJudgingResults('C', dancers, [6,3,4,2,7,5,1]);
                var D = createJudgingResults('D', dancers, [7,4,6,1,5,3,2]);
                var E = createJudgingResults('E', dancers, [5,6,4,2,7,3,1]);

                var results = SC.doFinal([A,B,C,D,E]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '6' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '5' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '4' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '7' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '3' ,'placement for couple 56');
                assert.deepEqual(_.get(results, 'rankByDancer.57'), '1' ,'placement for couple 57');

            })

            it('Example 5-6', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [4,2,6,3,1,5]);
                var B = createJudgingResults('B', dancers, [2,3,6,4,1,5]);
                var C = createJudgingResults('C', dancers, [3,2,6,3,1,4]);
                var D = createJudgingResults('D', dancers, [5,2,6,3,1,4]);
                var E = createJudgingResults('E', dancers, [6,4,2,3,1,5]);
                var F = createJudgingResults('F', dancers, [3,2,4,5,1,6]);
                var G = createJudgingResults('G', dancers, [2,4,3,5,1,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '3' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '2' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '6' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '4' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '1' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '5' ,'placement for couple 56');

            })

            it('Example 5-7', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [4,3,5,2,1,6]);
                var B = createJudgingResults('B', dancers, [5,4,3,1,2,6]);
                var C = createJudgingResults('C', dancers, [4,3,5,1,2,6]);
                var D = createJudgingResults('D', dancers, [6,4,3,2,1,5]);
                var E = createJudgingResults('E', dancers, [4,2,5,3,1,6]);
                var F = createJudgingResults('F', dancers, [4,3,5,2,1,6]);
                var G = createJudgingResults('G', dancers, [5,3,6,2,1,4]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '4' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '3' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '5' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '1' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '6' ,'placement for couple 56');

            })

            it('Example 5-8', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [5,3,4,2,1,6]);
                var B = createJudgingResults('B', dancers, [4,5,3,1,2,6]);
                var C = createJudgingResults('C', dancers, [4,3,6,1,2,5]);
                var D = createJudgingResults('D', dancers, [6,5,4,1,2,3]);
                var E = createJudgingResults('E', dancers, [5,3,4,1,2,6]);
                var F = createJudgingResults('F', dancers, [4,3,5,2,1,6]);
                var G = createJudgingResults('G', dancers, [5,2,6,2,1,4]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '5' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '3' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '4' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '1' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '2' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '6' ,'placement for couple 56');

            })

            it('Example 5-9', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [1,4,3,2,6,5]);
                var B = createJudgingResults('B', dancers, [1,4,5,2,6,3]);
                var C = createJudgingResults('C', dancers, [2,4,5,1,6,3]);
                var D = createJudgingResults('D', dancers, [2,6,4,1,3,5]);
                var E = createJudgingResults('E', dancers, [1,4,3,2,6,5]);
                var F = createJudgingResults('F', dancers, [3,4,2,1,6,5]);
                var G = createJudgingResults('G', dancers, [1,3,5,2,6,4]);
                var J = createJudgingResults('J', dancers, [2,4,3,1,6,5]);
                var K = createJudgingResults('K', dancers, [1,4,3,2,6,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,J,K]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '1' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '4' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '3' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '6' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '5' ,'placement for couple 56');

            })

            it('Example 5-10', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [4,5,1,2,6,3]);
                var B = createJudgingResults('B', dancers, [3,6,1,2,5,4]);
                var C = createJudgingResults('C', dancers, [5,4,1,3,6,2]);
                var D = createJudgingResults('D', dancers, [5,6,3,1,4,2]);
                var E = createJudgingResults('E', dancers, [6,5,4,3,2,1]);
                var F = createJudgingResults('F', dancers, [5,6,3,2,4,1]);
                var G = createJudgingResults('G', dancers, [5,6,1,3,4,2]);
                var H = createJudgingResults('H', dancers, [5,6,1,3,5,2]);
                var J = createJudgingResults('J', dancers, [5,6,1,3,2,4]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '5' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '6' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '1' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '3' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '4' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '2' ,'placement for couple 56');

            })

            it('Example 5-11', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [5,1,6,2,4,3]);
                var B = createJudgingResults('B', dancers, [5,1,4,2,6,3]);
                var C = createJudgingResults('C', dancers, [5,3,6,1,2,4]);
                var D = createJudgingResults('D', dancers, [1,4,6,2,3,5]);
                var E = createJudgingResults('E', dancers, [4,2,6,1,5,3]);
                var F = createJudgingResults('F', dancers, [4,3,5,1,2,5]);
                var G = createJudgingResults('G', dancers, [5,1,6,2,4,3]);
                var H = createJudgingResults('H', dancers, [6,1,4,2,5,3]);
                var J = createJudgingResults('J', dancers, [4,1,6,2,3,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '5' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '1' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '6' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '4' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '3' ,'placement for couple 56');

            })

            it('Example 5-12', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [4,3,2,5,6,1]);
                var B = createJudgingResults('B', dancers, [5,4,2,6,3,1]);
                var C = createJudgingResults('C', dancers, [4,6,5,2,3,1]);
                var D = createJudgingResults('D', dancers, [6,3,2,5,4,1]);
                var E = createJudgingResults('E', dancers, [6,1,2,5,4,3]);
                var F = createJudgingResults('F', dancers, [6,3,5,4,2,1]);
                var G = createJudgingResults('G', dancers, [6,2,4,5,3,1]);
                var H = createJudgingResults('H', dancers, [6,1,2,4,5,3]);
                var J = createJudgingResults('J', dancers, [2,4,1,3,5,6]);
                var K = createJudgingResults('K', dancers, [6,3,4,5,2,1]);
                var L = createJudgingResults('L', dancers, [5,1,2,4,6,3]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J,K,L]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '6' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '3' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '2' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '5' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '4' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '1' ,'placement for couple 56');

            })


            it('Example 5-13', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [6,4,3,5,2,1]);
                var B = createJudgingResults('B', dancers, [5,4,6,3,1,2]);
                var C = createJudgingResults('C', dancers, [6,5,4,3,2,1]);
                var D = createJudgingResults('D', dancers, [6,3,5,4,2,1]);
                var E = createJudgingResults('E', dancers, [6,4,5,3,2,1]);
                var F = createJudgingResults('F', dancers, [5,6,3,4,2,1]);
                var G = createJudgingResults('G', dancers, [5,3,6,4,2,1]);
                var H = createJudgingResults('H', dancers, [6,5,4,3,2,1]);
                var J = createJudgingResults('J', dancers, [6,5,3,4,2,1]);
                var K = createJudgingResults('K', dancers, [6,4,5,3,2,1]);
                var L = createJudgingResults('L', dancers, [5,4,6,3,2,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J,K,L]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '6' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '4' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '5' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '3' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '2' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '1' ,'placement for couple 56');

            })


            it('Example 5-14', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [1,2,5,6,4,3]);
                var B = createJudgingResults('B', dancers, [1,2,6,4,5,3]);
                var C = createJudgingResults('C', dancers, [1,2,4,5,6,3]);
                var D = createJudgingResults('D', dancers, [1,2,4,5,6,3]);
                var E = createJudgingResults('E', dancers, [1,3,6,2,5,4]);
                var F = createJudgingResults('F', dancers, [2,1,4,6,5,3]);
                var G = createJudgingResults('G', dancers, [1,2,6,4,5,3]);
                var H = createJudgingResults('H', dancers, [2,1,5,6,3,4]);
                var J = createJudgingResults('J', dancers, [2,1,3,4,5,6]);
                var K = createJudgingResults('K', dancers, [1,2,6,4,3,5]);
                var L = createJudgingResults('L', dancers, [1,2,6,5,4,3]);
                var M = createJudgingResults('M', dancers, [1,2,6,3,5,3]);
                var P = createJudgingResults('P', dancers, [1,2,5,4,6,3]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J,K,L,M,P]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '1' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '2' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '6' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '4' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '5' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '3' ,'placement for couple 56');

            })

            it('Example 5-15', function(){
                var dancers = [51,52,53,54,55,56];
                var A = createJudgingResults('A', dancers, [2,4,5,3,6,1]);
                var B = createJudgingResults('B', dancers, [6,5,4,2,3,1]);
                var C = createJudgingResults('C', dancers, [5,3,4,2,6,1]);
                var D = createJudgingResults('D', dancers, [5,4,3,2,6,1]);
                var E = createJudgingResults('E', dancers, [5,3,4,2,6,1]);
                var F = createJudgingResults('F', dancers, [2,3,4,6,5,1]);
                var G = createJudgingResults('G', dancers, [3,5,4,2,6,1]);
                var H = createJudgingResults('H', dancers, [5,3,4,1,6,2]);
                var J = createJudgingResults('J', dancers, [5,2,3,4,6,1]);
                var K = createJudgingResults('K', dancers, [5,1,3,4,6,2]);
                var L = createJudgingResults('L', dancers, [5,1,3,4,6,2]);
                var M = createJudgingResults('M', dancers, [5,4,2,3,6,1]);
                var P = createJudgingResults('P', dancers, [1,3,5,4,6,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,J,K,L,M,P]);
                assert.deepEqual(_.get(results, 'rankByDancer.51'), '5' ,'placement for couple 51');
                assert.deepEqual(_.get(results, 'rankByDancer.52'), '3' ,'placement for couple 52');
                assert.deepEqual(_.get(results, 'rankByDancer.53'), '4' ,'placement for couple 53');
                assert.deepEqual(_.get(results, 'rankByDancer.54'), '2' ,'placement for couple 54');
                assert.deepEqual(_.get(results, 'rankByDancer.55'), '6' ,'placement for couple 55');
                assert.deepEqual(_.get(results, 'rankByDancer.56'), '1' ,'placement for couple 56');

            })
        })
        describe('Rule 6. The winner of a particular position is the couple who has the highest majority rcount from the judges', function (){
            it('Example 6-1', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [3,2,4,5,1,6]);
                var B = createJudgingResults('B', dancers, [1,3,4,5,2,6]);
                var C = createJudgingResults('C', dancers, [1,2,3,4,6,5]);
                var D = createJudgingResults('D', dancers, [1,6,3,4,2,5]);
                var E = createJudgingResults('E', dancers, [2,6,4,3,1,5]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([1,3,4,5,2,6], dancers, results);

            })

            it('Example 6-2', function(){
                var dancers = [61,62,63,64,65,66,67,68];
                var A = createJudgingResults('A', dancers, [3,8,1,6,4,5,2,7]);
                var B = createJudgingResults('B', dancers, [3,7,1,8,5,2,4,6]);
                var C = createJudgingResults('C', dancers, [7,8,1,4,5,2,3,6]);
                var D = createJudgingResults('D', dancers, [8,7,1,5,3,4,2,6]);
                var E = createJudgingResults('E', dancers, [1,8,6,3,7,5,2,4]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([3,8,1,6,5,4,2,7], dancers, results);

            })

            it('Example 6-3', function(){
                var dancers = [61,62,63,64,65,66,67,68];
                var A = createJudgingResults('A', dancers, [4,6,1,2,7,5,3,8]);
                var B = createJudgingResults('B', dancers, [5,7,2,1,4,6,3,8]);
                var C = createJudgingResults('C', dancers, [7,6,2,1,5,4,3,8]);
                var D = createJudgingResults('D', dancers, [6,7,2,1,5,4,3,8]);
                var E = createJudgingResults('E', dancers, [5,7,3,1,6,2,4,8]);
                var F = createJudgingResults('F', dancers, [4,7,3,1,5,8,2,6]);
                var G = createJudgingResults('G', dancers, [7,6,2,1,5,3,4,8]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([6,7,2,1,5,4,3,8], dancers, results);

            })

            it('Example 6-4', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [2,5,6,4,1,3]);
                var B = createJudgingResults('B', dancers, [4,5,6,3,1,2]);
                var C = createJudgingResults('C', dancers, [2,5,6,3,1,4]);
                var D = createJudgingResults('D', dancers, [2,6,5,3,1,4]);
                var E = createJudgingResults('E', dancers, [5,4,6,3,1,2]);
                var F = createJudgingResults('F', dancers, [2,6,5,4,1,3]);
                var G = createJudgingResults('G', dancers, [3,4,6,5,1,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([2,5,6,4,1,3], dancers, results);

            })

            it('Example 6-5', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [4,6,3,5,1,2]);
                var B = createJudgingResults('B', dancers, [4,5,3,6,1,2]);
                var C = createJudgingResults('C', dancers, [3,6,5,4,1,2]);
                var D = createJudgingResults('D', dancers, [3,5,6,4,1,2]);
                var E = createJudgingResults('E', dancers, [4,5,3,6,1,2]);
                var F = createJudgingResults('F', dancers, [2,5,6,4,1,3]);
                var G = createJudgingResults('G', dancers, [5,6,3,4,1,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([4,6,3,5,1,2], dancers, results);

            })

            it('Example 6-6', function(){
                var dancers = [61,62,63,64,65,66,67,68];
                var A = createJudgingResults('A', dancers, [5,7,8,3,2,4,1,6]);
                var B = createJudgingResults('B', dancers, [5,8,7,3,1,4,2,6]);
                var C = createJudgingResults('C', dancers, [6,4,7,3,2,8,1,5]);
                var D = createJudgingResults('D', dancers, [7,4,5,3,2,6,1,8]);
                var E = createJudgingResults('E', dancers, [8,4,7,5,3,6,1,2]);
                var F = createJudgingResults('F', dancers, [3,8,7,5,4,2,1,6]);
                var G = createJudgingResults('G', dancers, [5,4,7,2,3,8,1,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([5,4,8,3,2,7,1,6], dancers, results);

            })

            it('Example 6-7', function(){
                var dancers = [61,62,63,64,65,66,67,68];
                var A = createJudgingResults('A', dancers, [4,5,8,3,1,7,2,6]);
                var B = createJudgingResults('B', dancers, [5,4,7,3,1,6,2,8]);
                var C = createJudgingResults('C', dancers, [7,2,8,4,3,6,1,5]);
                var D = createJudgingResults('D', dancers, [7,4,5,3,2,8,1,6]);
                var E = createJudgingResults('E', dancers, [6,4,8,5,1,3,2,7]);
                var F = createJudgingResults('F', dancers, [3,8,7,5,6,2,1,4]);
                var G = createJudgingResults('G', dancers, [4,5,7,2,1,8,3,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([5,4,8,3,1,7,2,6], dancers, results);

            })

            it('Example 6-8', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [4,1,3,5,6,2]);
                var B = createJudgingResults('B', dancers, [4,1,6,5,3,2]);
                var C = createJudgingResults('C', dancers, [3,1,6,5,4,2]);
                var D = createJudgingResults('D', dancers, [3,1,4,6,5,2]);
                var E = createJudgingResults('E', dancers, [3,1,5,6,4,2]);
                var F = createJudgingResults('F', dancers, [3,1,5,6,4,2]);
                var G = createJudgingResults('G', dancers, [4,2,5,3,6,1]);
                var H = createJudgingResults('H', dancers, [5,6,3,2,4,1]);
                var I = createJudgingResults('I', dancers, [3,2,4,6,5,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,1,5,6,4,2], dancers, results);

            })

            it('Example 6-9', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [5,6,3,2,4,1]);
                var B = createJudgingResults('B', dancers, [3,2,6,1,5,4]);
                var C = createJudgingResults('C', dancers, [3,5,2,6,4,1]);
                var D = createJudgingResults('D', dancers, [4,3,6,2,5,1]);
                var E = createJudgingResults('E', dancers, [3,4,6,2,5,1]);
                var F = createJudgingResults('F', dancers, [1,5,6,3,4,2]);
                var G = createJudgingResults('G', dancers, [4,2,5,3,6,1]);
                var H = createJudgingResults('H', dancers, [3,4,5,2,6,1]);
                var I = createJudgingResults('I', dancers, [2,6,5,3,4,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,4,6,2,5,1], dancers, results);

            })

            it('Example 6-10', function(){
                var dancers = [61,62,63,64,65,66,67];
                var A = createJudgingResults('A', dancers, [2,3,6,5,4,1,7]);
                var B = createJudgingResults('B', dancers, [1,4,7,3,5,2,6]);
                var C = createJudgingResults('C', dancers, [4,5,7,2,3,1,6]);
                var D = createJudgingResults('D', dancers, [1,4,6,5,3,2,7]);
                var E = createJudgingResults('E', dancers, [1,4,7,3,6,2,5]);
                var F = createJudgingResults('F', dancers, [1,5,2,4,7,3,6]);
                var G = createJudgingResults('G', dancers, [1,4,6,7,3,2,5]);
                var H = createJudgingResults('H', dancers, [1,3,6,2,5,4,7]);
                var I = createJudgingResults('I', dancers, [1,6,7,3,4,2,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([1,4,7,3,5,2,6], dancers, results);

            })

            it('Example 6-11', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [4,2,6,1,5,3]);
                var B = createJudgingResults('B', dancers, [5,2,4,1,6,3]);
                var C = createJudgingResults('C', dancers, [4,1,6,3,2,5]);
                var D = createJudgingResults('D', dancers, [2,3,6,1,4,5]);
                var E = createJudgingResults('E', dancers, [4,2,6,1,5,3]);
                var F = createJudgingResults('F', dancers, [6,2,3,1,4,5]);
                var G = createJudgingResults('G', dancers, [5,2,6,1,4,3]);
                var H = createJudgingResults('H', dancers, [4,2,5,1,6,3]);
                var I = createJudgingResults('I', dancers, [3,2,6,1,4,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([4,2,6,1,5,3], dancers, results);

            })

            it('Example 6-12', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [6,1,3,4,5,2]);
                var B = createJudgingResults('B', dancers, [5,3,1,4,6,2]);
                var C = createJudgingResults('C', dancers, [6,3,1,4,5,2]);
                var D = createJudgingResults('D', dancers, [6,3,1,4,5,2]);
                var E = createJudgingResults('E', dancers, [5,3,2,4,6,1]);
                var F = createJudgingResults('F', dancers, [5,1,2,4,6,3]);
                var G = createJudgingResults('G', dancers, [5,1,2,3,6,4]);
                var H = createJudgingResults('H', dancers, [6,1,3,4,5,2]);
                var I = createJudgingResults('I', dancers, [5,1,2,4,6,3]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([5,1,2,4,6,3], dancers, results);

            })

            it('Example 6-13', function(){
                var dancers = [61,62,63,64,65,66];
                var A = createJudgingResults('A', dancers, [3,2,6,1,5,4]);
                var B = createJudgingResults('B', dancers, [4,1,5,2,6,3]);
                var C = createJudgingResults('C', dancers, [5,2,6,3,1,4]);
                var D = createJudgingResults('D', dancers, [2,4,6,1,3,5]);
                var E = createJudgingResults('E', dancers, [5,2,6,1,3,4]);
                var F = createJudgingResults('F', dancers, [3,2,4,1,5,6]);
                var G = createJudgingResults('G', dancers, [5,2,6,1,3,4]);
                var H = createJudgingResults('H', dancers, [5,3,6,1,2,4]);
                var I = createJudgingResults('I', dancers, [4,1,6,2,3,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([5,2,6,1,3,4], dancers, results);

            })

            it('Example 6-14', function(){
                var dancers = [61,62,63,64,65,66,67];
                var A = createJudgingResults('A', dancers, [6,2,1,3,7,5,4]);
                var B = createJudgingResults('B', dancers, [6,1,4,2,5,7,3]);
                var C = createJudgingResults('C', dancers, [6,2,3,4,7,5,1]);
                var D = createJudgingResults('D', dancers, [5,3,1,2,4,7,6]);
                var E = createJudgingResults('E', dancers, [2,3,1,4,6,7,5]);
                var F = createJudgingResults('F', dancers, [2,3,5,4,7,6,1]);
                var G = createJudgingResults('G', dancers, [4,6,1,2,5,7,3]);
                var H = createJudgingResults('H', dancers, [7,3,1,2,6,5,4]);
                var I = createJudgingResults('I', dancers, [6,4,2,1,5,7,3]);
                var K = createJudgingResults('K', dancers, [6,4,1,2,5,7,3]);
                var L = createJudgingResults('L', dancers, [7,2,1,3,5,6,4]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L]);
                assertResults([6,3,1,2,5,7,4], dancers, results);

            })

            it('Example 6-15', function(){
                var dancers = [61,62,63,64,65,66,67];
                var A = createJudgingResults('A', dancers, [1,7,6,3,4,5,2]);
                var B = createJudgingResults('B', dancers, [3,7,1,5,6,2,4]);
                var C = createJudgingResults('C', dancers, [1,2,7,4,3,5,6]);
                var D = createJudgingResults('D', dancers, [1,2,6,7,3,4,5]);
                var E = createJudgingResults('E', dancers, [1,7,2,5,3,4,6]);
                var F = createJudgingResults('F', dancers, [3,1,4,5,2,6,7]);
                var G = createJudgingResults('G', dancers, [2,1,4,6,3,5,7]);
                var H = createJudgingResults('H', dancers, [1,2,6,7,4,5,3]);
                var I = createJudgingResults('I', dancers, [1,2,4,6,3,5,7]);
                var K = createJudgingResults('K', dancers, [1,7,3,4,2,6,5]);
                var L = createJudgingResults('L', dancers, [1,2,7,4,3,5,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L]);
                assertResults([1,2,4,6,3,5,7], dancers, results);

            })

            it('Example 6-16', function(){
                var dancers = [61,62,63,64,65,66,67];
                var A = createJudgingResults('A', dancers, [1,6,7,4,3,5,2]);
                var B = createJudgingResults('B', dancers, [4,5,2,6,7,1,3]);
                var C = createJudgingResults('C', dancers, [1,2,5,7,3,4,6]);
                var D = createJudgingResults('D', dancers, [2,1,6,7,3,4,5]);
                var E = createJudgingResults('E', dancers, [1,7,2,6,3,4,5]);
                var F = createJudgingResults('F', dancers, [3,1,5,6,4,2,7]);
                var G = createJudgingResults('G', dancers, [1,2,3,6,4,7,5]);
                var H = createJudgingResults('H', dancers, [1,2,6,7,4,5,3]);
                var I = createJudgingResults('I', dancers, [2,1,5,7,3,4,6]);
                var K = createJudgingResults('K', dancers, [1,4,7,6,2,3,5]);
                var L = createJudgingResults('L', dancers, [1,3,7,5,2,4,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L]);
                assertResults([1,2,6,7,3,4,5], dancers, results);

            })
        })
        describe('Rule 7. Two or more couples have an equal majority. Apply lowest summation', function(){
            it('Example 7-1', function(){
                var dancers = [71,72,73,74,75,76,77];
                var A = createJudgingResults('A', dancers, [5,1,2,3,6,7,4]);
                var B = createJudgingResults('B', dancers, [5,3,1,2,7,6,4]);
                var C = createJudgingResults('C', dancers, [7,1,4,3,5,6,2]);
                var D = createJudgingResults('D', dancers, [5,1,4,3,6,2,7]);
                var E = createJudgingResults('E', dancers, [7,1,2,3,4,6,5]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([5,1,2,3,7,6,4], dancers, results);

            })

            it('Example 7-2', function(){
                var dancers = [71,72,73,74,75,76,77];
                var A = createJudgingResults('A', dancers, [3,6,1,7,2,4,5]);
                var B = createJudgingResults('B', dancers, [4,6,1,3,2,5,7]);
                var C = createJudgingResults('C', dancers, [4,7,6,2,5,1,3]);
                var D = createJudgingResults('D', dancers, [3,7,2,1,4,5,6]);
                var E = createJudgingResults('E', dancers, [6,5,1,3,2,4,7]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([4,7,1,3,2,5,6], dancers, results);

            })

            it('Example 7-3', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [5,6,4,1,2,3]);
                var B = createJudgingResults('B', dancers, [4,6,5,2,3,1]);
                var C = createJudgingResults('C', dancers, [3,4,2,5,6,1]);
                var D = createJudgingResults('D', dancers, [6,3,4,2,5,1]);
                var E = createJudgingResults('E', dancers, [6,5,4,2,3,1]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([5.5,5.5,4,2,3,1], dancers, results);

            })

            it('Example 7-4', function(){
                var dancers = [71,72,73,74,75,76,77];
                var A = createJudgingResults('A', dancers, [4,3,7,6,2,1,5]);
                var B = createJudgingResults('B', dancers, [3,5,7,6,2,1,4]);
                var C = createJudgingResults('C', dancers, [2,4,7,6,3,1,5]);
                var D = createJudgingResults('D', dancers, [2,4,7,6,1,3,5]);
                var E = createJudgingResults('E', dancers, [1,5,7,6,3,2,4]);
                var F = createJudgingResults('F', dancers, [3,4,7,6,2,1,5]);
                var G = createJudgingResults('G', dancers, [2,4,6,7,3,1,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([3,4,7,6,2,1,5], dancers, results);

            })

            it('Example 7-5', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [2,1,5,6,3,4]);
                var B = createJudgingResults('B', dancers, [2,1,3,4,5,6]);
                var C = createJudgingResults('C', dancers, [3,1,4,5,2,6]);
                var D = createJudgingResults('D', dancers, [3,2,4,5,1,6]);
                var E = createJudgingResults('E', dancers, [4,1,2,5,3,6]);
                var F = createJudgingResults('F', dancers, [1,3,2,6,4,5]);
                var G = createJudgingResults('G', dancers, [2,1,3,5,4,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([2,1,4,5,3,6], dancers, results);

            })

            it('Example 7-6', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [2,1,5,6,3,4]);
                var B = createJudgingResults('B', dancers, [4,2,1,5,3,6]);
                var C = createJudgingResults('C', dancers, [6,1,2,5,4,3]);
                var D = createJudgingResults('D', dancers, [5,1,2,6,4,3]);
                var E = createJudgingResults('E', dancers, [4,1,2,5,3,6]);
                var F = createJudgingResults('F', dancers, [6,4,2,5,3,1]);
                var G = createJudgingResults('G', dancers, [5,1,2,6,4,3]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([5,1,2,6,4,3], dancers, results);

            })

            it('Example 7-7', function(){
                var dancers = [71,72,73,74,75,76,77,78];
                var A = createJudgingResults('A', dancers, [5,6,8,7,4,2,1,3]);
                var B = createJudgingResults('B', dancers, [3,8,6,5,2,7,1,4]);
                var C = createJudgingResults('C', dancers, [3,8,7,5,4,6,1,2]);
                var D = createJudgingResults('D', dancers, [2,6,7,4,3,5,8,1]);
                var E = createJudgingResults('E', dancers, [6,7,8,4,5,3,1,2]);
                var F = createJudgingResults('F', dancers, [6,7,8,2,3,5,1,4]);
                var G = createJudgingResults('G', dancers, [4,8,6,7,3,5,1,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([4,7.5,7.5,6,3,5,1,2], dancers, results);

            })

            it('Example 7-8', function(){
                var dancers = [71,72,73,74,75];
                var A = createJudgingResults('A', dancers, [5,1,3,4,2]);
                var B = createJudgingResults('B', dancers, [4,1,3,5,2]);
                var C = createJudgingResults('C', dancers, [5,1,3,4,2]);
                var D = createJudgingResults('D', dancers, [5,2,4,3,1]);
                var E = createJudgingResults('E', dancers, [4,2,5,3,1]);
                var F = createJudgingResults('F', dancers, [5,1,3,2,4]);
                var G = createJudgingResults('G', dancers, [5,1,2,4,3]);
                var H = createJudgingResults('H', dancers, [5,1,4,3,2]);
                var I = createJudgingResults('I', dancers, [5,1,4,3,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([5,1,3.5,3.5,2], dancers, results);

            })

            it('Example 7-9', function(){
                var dancers = [71,72,73,74,75,76,77];
                var A = createJudgingResults('A', dancers, [1,2,6,5,4,3,7]);
                var B = createJudgingResults('B', dancers, [2,3,4,1,6,5,7]);
                var C = createJudgingResults('C', dancers, [3,1,2,6,5,4,7]);
                var D = createJudgingResults('D', dancers, [3,4,2,1,7,5,6]);
                var E = createJudgingResults('E', dancers, [1,5,6,3,4,2,7]);
                var F = createJudgingResults('F', dancers, [5,4,3,2,6,1,7]);
                var G = createJudgingResults('G', dancers, [5,3,6,1,4,2,7]);
                var H = createJudgingResults('H', dancers, [4,3,5,1,7,2,6]);
                var I = createJudgingResults('I', dancers, [4,7,6,1,3,2,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,4,5,1,6,2,7], dancers, results);

            })

            it('Example 7-10', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [3,4,2,1,6,5]);
                var B = createJudgingResults('B', dancers, [2,3,4,1,5,6]);
                var C = createJudgingResults('C', dancers, [3,2,4,1,5,6]);
                var D = createJudgingResults('D', dancers, [2,6,1,4,5,3]);
                var E = createJudgingResults('E', dancers, [2,4,5,1,6,3]);
                var F = createJudgingResults('F', dancers, [2,5,4,1,6,3]);
                var G = createJudgingResults('G', dancers, [2,3,4,1,6,5]);
                var H = createJudgingResults('H', dancers, [1,5,3,2,4,6]);
                var I = createJudgingResults('I', dancers, [2,4,3,1,5,6]);
                var K = createJudgingResults('K', dancers, [2,5,3,1,4,6]);
                var L = createJudgingResults('L', dancers, [2,4,3,1,6,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L]);
                assertResults([2,4,3,1,6,5], dancers, results);

            })

            it('Example 7-11', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [6,3,1,4,2,5]);
                var B = createJudgingResults('B', dancers, [6,4,2,3,1,5]);
                var C = createJudgingResults('C', dancers, [4,3,2,6,1,5]);
                var D = createJudgingResults('D', dancers, [5,3,1,6,2,4]);
                var E = createJudgingResults('E', dancers, [6,2,1,5,4,3]);
                var F = createJudgingResults('F', dancers, [4,5,2,3,1,6]);
                var G = createJudgingResults('G', dancers, [5,4,1,3,2,6]);
                var H = createJudgingResults('H', dancers, [6,5,1,3,2,4]);
                var I = createJudgingResults('I', dancers, [5,4,2,3,1,6]);
                var K = createJudgingResults('K', dancers, [5,3,4,2,1,6]);
                var L = createJudgingResults('L', dancers, [6,5,1,3,2,4]);
                var M = createJudgingResults('M', dancers, [5,3,1,4,2,6]);
                var N = createJudgingResults('N', dancers, [6,3,1,4,2,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L,M,N]);
                assertResults([6,3,1,4,2,5], dancers, results);

            })

            it('Example 7-12', function(){
                var dancers = [71,72,73,74,75,76];
                var A = createJudgingResults('A', dancers, [6,4,2,3,1,5]);
                var B = createJudgingResults('B', dancers, [6,4,2,3,1,5]);
                var C = createJudgingResults('C', dancers, [4,3,1,5,2,6]);
                var D = createJudgingResults('D', dancers, [6,3,1,5,2,4]);
                var E = createJudgingResults('E', dancers, [6,3,1,5,2,4]);
                var F = createJudgingResults('F', dancers, [2,5,3,4,1,6]);
                var G = createJudgingResults('G', dancers, [5,4,1,3,2,6]);
                var H = createJudgingResults('H', dancers, [6,4,1,3,2,5]);
                var I = createJudgingResults('I', dancers, [6,3,1,5,2,4]);
                var K = createJudgingResults('K', dancers, [6,2,3,4,1,5]);
                var L = createJudgingResults('L', dancers, [6,4,1,3,2,5]);
                var M = createJudgingResults('M', dancers, [5,3,2,4,1,6]);
                var N = createJudgingResults('N', dancers, [5,4,2,3,1,6]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L,M,N]);
                assertResults([6,3,1,4,2,5], dancers, results);

            })
        })
        describe('Rule 8. No couple receives a majority for position under review. Proceed to position+1 to determine majority ', function(){
            it('Example 8-1', function(){
                var dancers = [81,82,83,84,85,86,87,88];
                var A = createJudgingResults('A', dancers, [1,2,3,6,8,4,5,7]);
                var B = createJudgingResults('B', dancers, [6,2,5,7,3,4,1,8]);
                var C = createJudgingResults('C', dancers, [3,4,1,7,2,6,5,8]);

                var results = SC.doFinal([A,B,C]);
                assertResults([3,1,2,7,4,5,6,8], dancers, results);

            })

            it('Example 8-2', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [1,4,2,6,5,3]);
                var B = createJudgingResults('B', dancers, [5,2,4,6,3,1]);
                var C = createJudgingResults('C', dancers, [3,4,2,6,1,5]);

                var results = SC.doFinal([A,B,C]);
                assertResults([3,5,1,6,3,3], dancers, results);

            })

            it('Example 8-3', function(){
                var dancers = [81,82,83];
                var A = createJudgingResults('A', dancers, [1,2,3]);
                var B = createJudgingResults('B', dancers, [3,1,2]);
                var C = createJudgingResults('C', dancers, [2,3,1]);

                var results = SC.doFinal([A,B,C]);
                assertResults([2,2,2], dancers, results);

            })

            it('Example 8-4', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [3,2,1,6,4,5]);
                var B = createJudgingResults('B', dancers, [3,4,1,5,2,6]);
                var C = createJudgingResults('C', dancers, [1,4,2,3,5,6]);
                var D = createJudgingResults('D', dancers, [2,1,3,5,6,4]);
                var E = createJudgingResults('E', dancers, [2,1,4,6,5,3]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([3,2,1,6,4,5], dancers, results);

            })

            it('Example 8-5', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [1,5,6,4,2,3]);
                var B = createJudgingResults('B', dancers, [1,3,2,5,4,6]);
                var C = createJudgingResults('C', dancers, [3,5,2,1,6,4]);
                var D = createJudgingResults('D', dancers, [6,2,3,1,5,4]);
                var E = createJudgingResults('E', dancers, [6,1,5,3,4,2]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([2,3,4,1,6,5], dancers, results);

            })

            it('Example 8-6', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [1,4,5,2,6,3]);
                var B = createJudgingResults('B', dancers, [3,2,6,5,4,1]);
                var C = createJudgingResults('C', dancers, [4,2,1,6,5,3]);
                var D = createJudgingResults('D', dancers, [5,6,3,4,1,2]);
                var E = createJudgingResults('E', dancers, [6,5,4,2,3,1]);

                var results = SC.doFinal([A,B,C,D,E]);
                assertResults([4,4,4,4,4,1], dancers, results);

            })

            it('Example 8-7', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [5,4,3,6,2,1]);
                var B = createJudgingResults('B', dancers, [2,5,6,1,4,3]);
                var C = createJudgingResults('C', dancers, [3,5,1,2,4,6]);
                var D = createJudgingResults('D', dancers, [5,2,1,6,3,4]);
                var E = createJudgingResults('E', dancers, [6,1,5,4,2,3]);
                var F = createJudgingResults('F', dancers, [5,2,1,6,3,4]);
                var G = createJudgingResults('G', dancers, [6,3,5,2,4,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([6,3,1,5,4,2], dancers, results);

            })

            it('Example 8-8', function(){
                var dancers = [81,82,83,84,85,86,87];
                var A = createJudgingResults('A', dancers, [2,1,7,6,5,3,4]);
                var B = createJudgingResults('B', dancers, [3,1,6,7,5,4,2]);
                var C = createJudgingResults('C', dancers, [4,2,3,6,5,7,1]);
                var D = createJudgingResults('D', dancers, [2,3,7,5,6,4,1]);
                var E = createJudgingResults('E', dancers, [3,2,6,4,7,5,1]);
                var F = createJudgingResults('F', dancers, [5,2,6,4,3,7,1]);
                var G = createJudgingResults('G', dancers, [4,2,3,5,7,6,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G]);
                assertResults([3,2,7,5,6,4,1], dancers, results);

            })

            it('Example 8-9', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [1,4,2,3,5,6]);
                var B = createJudgingResults('B', dancers, [1,4,3,2,5,6]);
                var C = createJudgingResults('C', dancers, [2,1,3,5,4,6]);
                var D = createJudgingResults('D', dancers, [2,1,4,3,5,6]);
                var E = createJudgingResults('E', dancers, [5,2,1,4,3,6]);
                var F = createJudgingResults('F', dancers, [5,3,1,4,2,6]);
                var G = createJudgingResults('G', dancers, [5,3,4,1,2,6]);
                var H = createJudgingResults('H', dancers, [4,6,5,1,2,3]);
                var I = createJudgingResults('I', dancers, [3,4,6,5,1,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([1,2,4,3,5,6], dancers, results);

            })

            it('Example 8-10', function(){
                var dancers = [81,82,83,84,85,86,87];
                var A = createJudgingResults('A', dancers, [6,3,1,2,7,5,4]);
                var B = createJudgingResults('B', dancers, [3,6,1,2,7,4,5]);
                var C = createJudgingResults('C', dancers, [3,4,1,2,6,5,7]);
                var D = createJudgingResults('D', dancers, [4,6,1,2,3,5,7]);
                var E = createJudgingResults('E', dancers, [5,6,1,2,4,7,3]);
                var F = createJudgingResults('F', dancers, [6,4,2,1,5,7,3]);
                var G = createJudgingResults('G', dancers, [6,2,1,4,5,3,7]);
                var H = createJudgingResults('H', dancers, [4,7,2,1,3,6,5]);
                var I = createJudgingResults('I', dancers, [6,5,1,2,7,3,4]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([6,5,1,2,7,4,3], dancers, results);

            })

            it('Example 8-11', function(){
                var dancers = [81,82,83,84,85,86,87];
                var A = createJudgingResults('A', dancers, [7,5,1,3,4,6,2]);
                var B = createJudgingResults('B', dancers, [6,3,1,2,5,7,4]);
                var C = createJudgingResults('C', dancers, [2,6,1,3,4,5,7]);
                var D = createJudgingResults('D', dancers, [5,7,1,2,3,4,6]);
                var E = createJudgingResults('E', dancers, [5,6,1,2,3,7,4]);
                var F = createJudgingResults('F', dancers, [4,3,1,2,6,5,7]);
                var G = createJudgingResults('G', dancers, [7,3,1,2,4,6,5]);
                var H = createJudgingResults('H', dancers, [4,7,1,2,3,5,6]);
                var I = createJudgingResults('I', dancers, [6,4,1,2,7,3,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([5.5, 4, 1, 2,3,7,5.5], dancers, results);

            })

            it('Example 8-12', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [4,1,3,5,6,2]);
                var B = createJudgingResults('B', dancers, [4,2,6,5,3,1]);
                var C = createJudgingResults('C', dancers, [3,2,6,5,4,1]);
                var D = createJudgingResults('D', dancers, [3,2,5,6,4,1]);
                var E = createJudgingResults('E', dancers, [3,1,6,4,5,2]);
                var F = createJudgingResults('F', dancers, [4,2,5,6,3,1]);
                var G = createJudgingResults('G', dancers, [4,2,5,3,6,1]);
                var H = createJudgingResults('H', dancers, [4,2,3,6,5,1]);
                var I = createJudgingResults('I', dancers, [4,2,3,5,6,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,2,4.5,6,4.5,1], dancers, results);

            })

            it('Example 8-13', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [5,1,3,4,6,2]);
                var B = createJudgingResults('B', dancers, [4,1,6,5,3,2]);
                var C = createJudgingResults('C', dancers, [3,2,5,4,6,1]);
                var D = createJudgingResults('D', dancers, [3,2,4,6,5,1]);
                var E = createJudgingResults('E', dancers, [5,1,4,6,3,2]);
                var F = createJudgingResults('F', dancers, [4,2,5,6,3,1]);
                var G = createJudgingResults('G', dancers, [5,3,4,2,6,1]);
                var H = createJudgingResults('H', dancers, [4,3,5,2,6,1]);
                var I = createJudgingResults('I', dancers, [6,2,3,4,5,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([4.5,2,4.5,3,6,1], dancers, results);

            })

            it('Example 8-14', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [5,1,3,4,6,2]);
                var B = createJudgingResults('B', dancers, [3,1,6,5,4,2]);
                var C = createJudgingResults('C', dancers, [3,2,6,4,5,1]);
                var D = createJudgingResults('D', dancers, [3,1,5,6,4,2]);
                var E = createJudgingResults('E', dancers, [3,1,6,5,4,2]);
                var F = createJudgingResults('F', dancers, [4,2,6,5,3,1]);
                var G = createJudgingResults('G', dancers, [4,2,5,3,6,1]);
                var H = createJudgingResults('H', dancers, [3,1,4,6,5,2]);
                var I = createJudgingResults('I', dancers, [5,2,3,4,6,1]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,1,6,4,5,2], dancers, results);

            })

            it('Example 8-15', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [4,1,5,2,6,3]);
                var B = createJudgingResults('B', dancers, [4,1,5,2,6,3]);
                var C = createJudgingResults('C', dancers, [2,1,6,4,3,5]);
                var D = createJudgingResults('D', dancers, [1,3,6,2,4,5]);
                var E = createJudgingResults('E', dancers, [5,2,6,3,4,1]);
                var F = createJudgingResults('F', dancers, [4,2,3,1,5,3]);
                var G = createJudgingResults('G', dancers, [4,2,6,1,5,3]);
                var H = createJudgingResults('H', dancers, [6,4,5,1,2,3]);
                var I = createJudgingResults('I', dancers, [4,2,6,1,3,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([4,2,6,1,5,3], dancers, results);

            })

            it('Example 8-16', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [3,2,6,1,5,4]);
                var B = createJudgingResults('B', dancers, [3,1,5,2,6,4]);
                var C = createJudgingResults('C', dancers, [4,1,6,2,3,5]);
                var D = createJudgingResults('D', dancers, [2,4,6,1,3,5]);
                var E = createJudgingResults('E', dancers, [4,2,6,1,5,3]);
                var F = createJudgingResults('F', dancers, [4,2,3,1,6,5]);
                var G = createJudgingResults('G', dancers, [5,2,6,1,4,3]);
                var H = createJudgingResults('H', dancers, [5,2,6,1,3,4]);
                var I = createJudgingResults('I', dancers, [4,1,6,2,3,5]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([3,2,6,1,4,5], dancers, results);

            })

            it('Example 8-17', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [2,1,5,6,4,3]);
                var B = createJudgingResults('B', dancers, [1,2,6,5,4,3]);
                var C = createJudgingResults('C', dancers, [1,2,4,6,5,3]);
                var D = createJudgingResults('D', dancers, [2,1,5,6,3,4]);
                var E = createJudgingResults('E', dancers, [1,2,5,3,6,4]);
                var F = createJudgingResults('F', dancers, [2,1,4,6,5,3]);
                var G = createJudgingResults('G', dancers, [1,2,5,4,6,3]);
                var H = createJudgingResults('H', dancers, [1,2,6,5,3,4]);
                var I = createJudgingResults('I', dancers, [2,1,4,3,5,6]);
                var K = createJudgingResults('K', dancers, [1,2,6,4,5,3]);
                var L = createJudgingResults('L', dancers, [2,1,6,5,4,3]);
                var M = createJudgingResults('M', dancers, [1,2,6,4,5,3]);
                var N = createJudgingResults('N', dancers, [1,3,5,4,6,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I,K,L,M,N]);
                assertResults([1,2,6,5,4,3], dancers, results);

            })

            it('Example 8-18', function(){
                var dancers = [81,82,83,84,85,86];
                var A = createJudgingResults('A', dancers, [1,5,6,3,4,2]);
                var B = createJudgingResults('B', dancers, [1,3,5,4,6,2]);
                var C = createJudgingResults('C', dancers, [3,5,4,2,6,1]);
                var D = createJudgingResults('D', dancers, [2,4,3,5,6,1]);
                var E = createJudgingResults('E', dancers, [1,2,4,6,5,3]);
                var F = createJudgingResults('F', dancers, [2,4,3,5,6,1]);
                var G = createJudgingResults('G', dancers, [1,4,3,5,6,2]);
                var H = createJudgingResults('H', dancers, [1,3,4,5,6,2]);
                var I = createJudgingResults('I', dancers, [1,3,4,6,5,2]);
                var K = createJudgingResults('K', dancers, [1,4,3,5,6,2]);
                var L = createJudgingResults('L', dancers, [2,4,3,6,5,1]);
                var M = createJudgingResults('M', dancers, [1,3,4,6,5,2]);
                var N = createJudgingResults('N', dancers, [2,4,3,5,6,1]);
                var P = createJudgingResults('P', dancers, [3,2,6,4,5,1]);
                var R = createJudgingResults('R', dancers, [1,3,5,4,6,2]);

                var results = SC.doFinal([A,B,C,D,E,F,G,H,I]);
                assertResults([1,3,4,5,6,2], dancers, results);

            })
        })

        describe('Rule 9. For a multidance, the dancer with the lowest summative score across dances is placed highest', function(){
            it('Example 9-1', function(){
                var dancers = [91,92,93,94,95,96];
                var W = createDanceResults('W', dancers, [2,1,6,4,5,3]);
                var F = createDanceResults('F', dancers, [2,1,6,5,4,3]);
                var T = createDanceResults('T', dancers, [2,1,6,4,5,3]);

                var results = SC_Multi.doFinal([W,F,T]);
                assertResults([2,1,6,4,5,3], dancers, results);

            })

            it('Example 9-2', function(){
                var dancers = [91,92,93,94,95,96,97,98];
                var C = createDanceResults('C', dancers, [8,3.5,5,2,3.5,7,6,1]);
                var R = createDanceResults('R', dancers, [8,5,3,2,4,7,6,1]);
                var S = createDanceResults('S', dancers, [8,3.5,3.5,2,5,7,6,1]);

                var results = SC_Multi.doFinal([C,R,S]);
                assertResults([8,4,3,2,5,7,6,1], dancers, results);

            })

            it('Example 9-3', function(){
                var dancers = [91,92,93,94,95,96];
                var C = createDanceResults('C', dancers, [6,3,4.5,4.5,1,2]);
                var S = createDanceResults('S', dancers, [6,4,2,5,1,3]);
                var R = createDanceResults('R', dancers, [6,5,2,3,1,4]);
                var P = createDanceResults('P', dancers, [6,3,2,4,1,5]);
                var J = createDanceResults('J', dancers, [5,3,2,4,1,6]);

                var results = SC_Multi.doFinal([C,R,S,P,J]);
                assertResults([6,3,2,5,1,4], dancers, results);

            })

            it('Example 9-4', function(){
                var dancers = [91,92,93,94,95,96];
                var W = createDanceResults('W', dancers, [4.5,4.5,1,2,6,3]);
                var T = createDanceResults('T', dancers, [5.5,3,1,2,5.5,4]);
                var F = createDanceResults('F', dancers, [6,3,1,2,5,4]);
                var Q = createDanceResults('Q', dancers, [5,3,1,2,6,4]);

                var results = SC_Multi.doFinal([W,F,T,Q]);
                assertResults([5,3,1,2,6,4], dancers, results);

            })

            it('Example 9-5', function(){
                var dancers = [91,92,93,94,95];
                var W = createDanceResults('W', dancers, [4,1,5,3,2]);
                var T = createDanceResults('T', dancers, [3,1,5,4,2]);
                var F = createDanceResults('F', dancers, [3,1,5,4,2]);
                var V = createDanceResults('V', dancers, [3,1,5,4,2]);

                var results = SC_Multi.doFinal([W,F,T,V]);
                assertResults([3,1,5,4,2], dancers, results);

            })

            it('Example 9-6', function(){
                var dancers = [91,92,93,94,95];
                var W = createDanceResults('W', dancers, [3.5,5,1,2,3.5]);
                var T = createDanceResults('T', dancers, [4,5,1,2,3]);
                var F = createDanceResults('F', dancers, [5,4,1,2,3]);
                var Q = createDanceResults('Q', dancers, [5,3,1,4,2]);

                var results = SC_Multi.doFinal([W,F,T,Q]);
                assertResults([5,4,1,2,3 ], dancers, results);

            })

            it('Example 9-7', function(){
                var dancers = [91,92,93,94,95,96,97];
                var W = createDanceResults('W', dancers, [2,4,5,3,6,1,7]);
                var T = createDanceResults('T', dancers, [2,3,4,6,5,1,7]);
                var V = createDanceResults('V', dancers, [2,4,3,5,6,1,7]);
                var F = createDanceResults('F', dancers, [2,3,4,5,6,1,7]);
                var Q = createDanceResults('Q', dancers, [2,4,3,5,6,1,7]);

                var results = SC_Multi.doFinal([W,F,V,T,Q]);
                assertResults([2,3,4,5,6,1,7], dancers, results);

            })

            it('Example 9-8', function(){
                var dancers = [91,92,93,94,95,96,97];
                var W = createDanceResults('W', dancers, [1,4,7,3,5,2,6]);
                var T = createDanceResults('T', dancers, [2,5,6,3,4,1,7]);
                var V = createDanceResults('V', dancers, [1,5,6,3,4,2,7]);
                var F = createDanceResults('F', dancers, [1,5,6,3,4,2,7]);
                var Q = createDanceResults('Q', dancers, [2,4,5,3,5,1,7]);

                var results = SC_Multi.doFinal([W,F,V,T,Q]);
                assertResults([1,5,6,3,4,2,7], dancers, results);

            })

            it('Example 9-9', function(){
                var dancers = [91,92,93,94,95,96,97,98];
                var C = createDanceResults('C', dancers, [5,4,8,3,2,7,1,6]);
                var R = createDanceResults('R', dancers, [5,4,8,3,1,7,2,6]);
                var S = createDanceResults('S', dancers, [5,4,8,3,2,6,1,7]);
                var B = createDanceResults('B', dancers, [5,4,8,3,2,7,1,6]);
                var M = createDanceResults('M', dancers, [7,4,6,3,2,8,1,5]);

                var results = SC_Multi.doFinal([C,B,S,R,M]);
                assertResults([5,4,8,3,2,7,1,6], dancers, results);

            })

            it('Example 9-10', function(){
                var dancers = [91,92,93,94,95,96];
                var W = createDanceResults('W', dancers, [2,3,4,1,6,5]);
                var T = createDanceResults('T', dancers, [3,2,5,1,4,6]);
                var V = createDanceResults('V', dancers, [6,2,4,1,3,5]);
                var F = createDanceResults('F', dancers, [4,5,3,1,2,6]);
                var Q = createDanceResults('Q', dancers, [3,2,6,1,4,5]);

                var results = SC_Multi.doFinal([W,F,V,T,Q]);
                assertResults([3,2,5,1,4,6], dancers, results);

            })

            it('Example 9-11', function(){
                var dancers = [91,92,93,94,95,96,97,98];
                var W = createDanceResults('W', dancers, [3,   8,1,6,  5,4,2,7]);
                var T = createDanceResults('T', dancers, [4,   8,1,7,  5,2,3,6]);
                var V = createDanceResults('V', dancers, [5,   8,1,4,  6,2,3,7]);
                var F = createDanceResults('F', dancers, [7,   8,1,5,  4,2,3,6]);
                var Q = createDanceResults('Q', dancers, [6.5, 8,1,6.5,5,2,3,4]);

                var results = SC_Multi.doFinal([W,F,V,T,Q]);
                assertResults([5,8,1,6,4,2,3,7], dancers, results);

            })

            it('Example 9-12', function(){
                var dancers = [91,92,93,94,95,96];
                var C = createDanceResults('C', dancers, [1,2,4,3,5,6]);
                var S = createDanceResults('S', dancers, [2,1,3,4,5,6]);
                var R = createDanceResults('R', dancers, [1,2,5,4,3,6]);
                var P = createDanceResults('P', dancers, [2,1,5,4,3,6]);
                var J = createDanceResults('J', dancers, [1,2,5,3,4,6]);

                var results = SC_Multi.doFinal([C,R,S,P,J]);
                assertResults([1,2,5,3,4,6], dancers, results);

            })
        })
    })

});
