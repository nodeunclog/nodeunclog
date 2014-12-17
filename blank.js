console.logtxt  =
    console.win     =
    console.info    =
    console.warn    =
    console.error   =
    console.err     =
    console.errtxt  =
    console.fail    =
    console.silly   =
    console.debug   =
    console.verbose =
    console.start   =
    console.end     =
    console.file    =
    console.log =
    function() {};
console.request = function(req, res, next) {
    if (next && (typeof(next) == 'function'))
        return next();
    return function(req, res, next) {
        next();
    }
};
console.socket = function(socket, next) {
    if (next && (typeof(next) == 'function'))
        return next();
    return function(socket, next) {
        next();
    }
};

module.exports = console;
