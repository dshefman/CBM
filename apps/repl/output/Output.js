const fs = require('fs');
const _isObject = require('lodash/isObject');




(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' )
        );
    } else {
        // Browser globals (root is window)
        root.Output = factory(
            root.lodash
        );
    }
})( this, function( _ ) {

    var Output = function (eventName) {
        this.wstream = null;
        this.eventName = eventName
    };

    Output.prototype.start = function(){
        var now = new Date();
        var fname = (now.getFullYear()) + '_' + this.eventName;
        var dir = 'output';
        this.filePath = dir + '/' + fname + '.txt';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        
        //this.wstream = fs.createWriteStream(filePath, {flags: 'as+'});
        
    }

    Output.prototype.append = function (data){
        if (_isObject(data)) {

                var now = new Date()
                var dataCopy = Object.assign({timestamp: now.toISOString()}, data);
                var dataOut = JSON.stringify(dataCopy);


                if (!dataOut.includes('!')) {
                    this.wstream = fs.createWriteStream(this.filePath, {flags: 'a+'});
                    this.wstream.write(JSON.stringify(dataCopy) + '\n');
                    this.wstream.end();
                } else {
                    console.log('Did not record event because of (!) making event void')
                }
            }
    }

    Output.prototype.end = function (){
        //this.wstream.end();
    }

    Output.prototype.toString = function () {
        return 'Output'
    };

   

    return Output;
});