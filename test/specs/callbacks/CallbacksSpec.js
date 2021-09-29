'use strict';
// define([
//     'chai',
//     'lodash/lodash',
//     'sinon',
//     'callbacks/Callbacks'
// ], function(chai, _, sinon, Callbacks) {
const chai = require('chai');
const sinon = require('sinon');
const _ = require('lodash');
const Callbacks = require('../../../callbacks/Callbacks');
    

    describe('Callbacks', function() {
        var expect = chai.expect;
        var assert = chai.assert;
        var sandbox;

        var callbacks;


        chai.config.showDiff = true;
        chai.config.truncateThreshold = 0

        beforeEach(function(){
            sandbox = sinon.createSandbox();
            callbacks =  new Callbacks();

        });

        afterEach(function(){
            sandbox.restore();
        });


        it('should run canary tests', function () {
            expect(callbacks).to.not.be.null;
        });


        describe('Certified Correct Fig 1-1', function () {

            var scores;
            var actual;
            var target;
            beforeEach(function (){
                var A = [10,14,15,16,17,20];
                var B = [10,11,12,17,19,20];
                var C = [12,14,15,17,18,20];
                var D = [12,14,15,16,17,20];
                var E = [10,11,12,14,16,20];
                var F = [11,12,14,16,17,20];
                var G = [10,12,14,16,17,20];

                scores = [A,B,C,D,E,F,G];
                target = 6;
                actual = callbacks.compute([A,B,C,D,E,F,G], target);
            });


            it ('should have the raw.input returned' ,function (){
               assert.deepEqual(_.get(actual, 'raw.input'), scores);
            });

            it ('should have the target returned' ,function (){
                assert.deepEqual(_.get(actual, 'target'), target);
            });

            it ('should have the raw.tallied returned' ,function (){
                var expected = {7:['20'], 6:['12','14','17'], 5:['16'], 4:['10'], 3:['11','15'], 1:['18','19']}
                assert.deepEqual(_.get(actual, 'raw.tallied'), expected);
            });

            it ('should have the results returned' ,function (){
                var expected = {
                    1: ['20'],
                    4: ['12','14','17','20'],
                    5: ['12','14','16','17','20'],
                    6: ['10','12','14','16','17','20'],
                    8: ['10','11','12','14','15','16','17','20'],
                    10: ['10','11','12','14','15','16','17','18','19','20'],

                };
                    
                    assert.deepEqual(_.get(actual, 'results'), expected);
            });

            it ('should have the availableResults return', function(){
                var expected = [1,4,5,6,8,10];
                assert.deepEqual(_.get(actual,'availableResults'), expected);
            })

            it ('should have the targetResults return', function(){
                var expected = ['10','12','14','16','17','20'];
                assert.deepEqual(_.get(actual,'targetResults'), expected);
            })

            it ('should have success return', function(){
                var expected = true;
                assert.deepEqual(_.get(actual,'success'), expected);
            })

            it ('should have raw.sorted return', function(){
                var expected = ['20','12','14','17','16','10','11','15','18','19'];
                assert.deepEqual(_.get(actual,'raw.sorted'), expected);
            })

            it ('should have totalCountedDancers return', function(){
                var expected = 10;
                assert.deepEqual(_.get(actual,'totalCountedDancers'), expected);
            })

        });
        describe('Certified Correct Fig 1-2', function () {

            var scores;
            var actual;
            var target;
            beforeEach(function (){
                var A = [11,12,14,17,18,19];
                var B = [10,12,14,15,17,18];
                var C = [10,11,13,15,17,18];
                var D = [10,11,12,15,17,18];
                var E = [11,14,15,17,18,19];
                var F = [10,11,13,14,15,18];
                var G = [11,12,13,15,17,18];

                scores = [A,B,C,D,E,F,G];
                target = 6;
                actual = callbacks.compute([A,B,C,D,E,F,G], target);
            });


            it ('should have the raw.input returned' ,function (){
                assert.deepEqual(_.get(actual, 'raw.input'), scores);
            });

            it ('should have the target returned' ,function (){
                assert.deepEqual(_.get(actual, 'target'), target);
            });

            it ('should have the raw.tallied returned' ,function (){
                var expected = {7:['18'], 6:['11','15','17'], 4:['10','12','14'], 3:['13'], 2:['19']}
                assert.deepEqual(_.get(actual, 'raw.tallied'), expected);
            });

            it ('should have the results returned' ,function (){
                var expected = {
                    1: ['18'],
                    4: ['11','15','17','18'],
                    7: ['10','11','12','14','15','17','18'],
                    8: ['10','11','12','13','14','15','17','18'],
                    9: ['10','11','12','13','14','15','17','18','19']

                };

                assert.deepEqual(_.get(actual, 'results'), expected);
            });

            it ('should have the availableResults return', function(){
                var expected = [1,4,7,8,9];
                assert.deepEqual(_.get(actual,'availableResults'), expected);
            })

            it ('should have the targetResults return', function(){
                var expected = [];
                assert.deepEqual(_.get(actual,'targetResults'), expected);
            })

            it ('should have success return', function(){
                var expected = false;
                assert.deepEqual(_.get(actual,'success'), expected);
            })

            it ('should have raw.sorted return', function(){
                var expected = ['18','11','15','17','10','12','14','13','19'];
                assert.deepEqual(_.get(actual,'raw.sorted'), expected);
            })

            it ('should have totalCountedDancers return', function(){
                var expected = 9;
                assert.deepEqual(_.get(actual,'totalCountedDancers'), expected);
            })

        });

    })

//});
