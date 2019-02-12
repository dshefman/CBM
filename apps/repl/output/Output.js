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
        var fname = this.eventName + '_'+ (now.getHours()+1 ) + (now.getMinutes());
        var dir = 'output';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        this.wstream = fs.createWriteStream(dir +'/' + fname + '.txt');
    }

    Output.prototype.append = function (data){
        if (_isObject(data)) {
                this.wstream.write(JSON.stringify(data) + '\n');
            }
    }

    Output.prototype.end = function (){
        this.wstream.end();
    }

    Output.prototype.toString = function () {
        return 'Output'
    };

   

    return Output;
});