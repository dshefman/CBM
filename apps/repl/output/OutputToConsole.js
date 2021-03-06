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

	return (output) => {
        if (output.event && output.ranking) {
    		let rtn = {
    			event: output.event,
    			ranking: output.ranking,
    		}
    		if(output.hasOwnProperty('danceResults')) {
    			rtn.danceResults = output.danceResults;
    		}

		  return rtn;
        }
        return output
	};
});