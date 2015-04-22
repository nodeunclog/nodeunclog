require('unclog/v3').global({
    levels: {
        // debug: {
        //     // bullet:'>'
        // },
        // verbose: {}
    }
});

console.debug('debugmessage hi');
console.verbose('vermessagebose hi');
console.log('lmessageog', {message: {message: 'hi'}}, require('fs').read);
