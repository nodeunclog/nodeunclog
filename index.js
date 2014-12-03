if (0 || process.env.skipunclog) {
    module.exports = require('./skip');
    return;
}

var util = require('util');
var config = require('./config');

var path = require('path');
var onFinished = require('on-finished');

var stackTrace = require('stack-trace');
Error.stackTraceLimit = 20;

require('deep-index-of');


var Unclog = {};
Unclog.log = Prelog('log');

function Prelog(consoleLevel) {
    // console.log(consoleLevel);
    return function() {
        // var string = expandConsoleArguments(arguments, consoleLevelToNumber(consoleLevel));
        // console.log(string);
        // console.log(getContext().baseFilename);
        // console.log.apply(console, arguments);
        console.log(getContext().stackTrail);
    }
}

function expandConsoleArguments(arguments, depth) {
    return util.format.apply(null, arguments);
    // return modifiedUtil(depth).format.apply(null, arguments);
}

function consoleLevelToNumber(consoleLevel) {
    return [
        'silly',
        'verbose',
        'log',
        'info',
        'pass',
        'start',
        'end',
        'warn',
        'err',
        'fail',
        'debug',
    ].indexOf(consoleLevel);
}

function consoleLevelBullet(consoleLevelNumber) {
    return [
        ['☺', '☺', '☺'], // silly
        [' ', ' ', ' '], // verbose
        [' ', ' ', ' '], // log
        ['►', '◄', '◄'], // info
        ['√', '√', '√'], // pass
        ['▼', '▼', '▼'], // start
        ['■', '■', '■'], // end
        ['₩', ' ', ' '], // warn
        ['█', ' ', ' '], // err
        ['×', '×', '×'], // fail
        ['●', ' ', ' '], // debug
    ](consoleLevelNumber);
}

function consoleLevelColor(consoleLevelNumber) {
    return [
        ['\x1b[36;2m', '\x1b[47;1;36;2m'], // silly
        ['\x1b[30;1m', '\x1b[47;1;30;1m'], // verbose
        ['\x1b[30;2m', '\x1b[47;1;30;2m'], // log
        ['\x1b[34;2m', '\x1b[47;1;34;2m'], // info
        ['\x1b[33;2m', '\x1b[47;1;33;2m'], // pass
        ['\x1b[32;2m', '\x1b[47;1;32;2m'], // start
        ['\x1b[32;1m', '\x1b[47;1;32;1m'], // end
        ['\x1b[31;1m', '\x1b[47;1;31;1m'], // warn
        ['\x1b[31;2m', '\x1b[47;1;31;2m'], // err
        ['\x1b[35;2m', '\x1b[47;1;35;2m'], // fail
        ['\x1b[34;1m', '\x1b[47;1;34;1m'], // debug
    ](consoleLevelNumber);
}

function getContext() {
    for (var stacktrace = stackTrace.parse(new Error()), j = 0; j < stacktrace.length; j++)
        if (stacktrace[j].fileName.deepIndexOf(config.ignore) == -1) {
            return attachBaseFilenameToStacktrace(stacktrace, j);
        }
    return attachBaseFilenameToStacktrace(stacktrace, 0);
}

function attachBaseFilenameToStacktrace(stacktrace, j) {
    stacktrace[j].baseFilename = (!j ? '*' : '') + getBaseFilename(stacktrace[j].fileName);
    stacktrace[j].baseFolderAndFilename = getBaseFolderAndFilename(stacktrace[j].fileName, stacktrace[j].lineNumber);
    stacktrace[j].stackTrail = getStackTrail(stacktrace);
    return stacktrace[j];
}

function getBaseFilename(file) {
    return path.basename(file, path.extname(path.basename(file)));
}

function getBaseFolderAndFilename(file, additionalInfo) {
    // additionalInfo = stacktrace[j].lineNumber
    return '[' + path.dirname(file).split(path.sep).reverse()[0] + path.sep + getBaseFilename(file) + (additionalInfo ? (':' + (config.backtrace ? '~' : '') + additionalInfo) : '') + ']';
}

function getStackTrail(stacktrace, cutoff) {
    var stackTrail = '';
    for (var j = 0; j < ((cutoff && cutoff < stacktrace.length) ? cutoff : stacktrace.length); j++)
        if (stacktrace[j] && stacktrace[j].fileName && stacktrace[j].lineNumber)
            if (stacktrace[j].fileName.deepIndexOf(config.ignore) == -1)
                stackTrail += getBaseFolderAndFilename(stacktrace[j].fileName);
    return stackTrail;
}







function modifiedUtil(options) {
    if (typeof(options) == 'number')
        options = {
            depth: options
        };
    options.showHidden = true;
    return (function(util1) {
        // var util_inspect = util.inspect;
        // util.inspect = function(object) {
        //     console.log('even?', object);
        //     return util_inspect(object, options);
        // }
        var util_format = util.format;
        util.format = function() {
            console.log('even?', arguments);
            var util_inspect = util.inspect;
            util.inspect = function(object) {
                console.log('even?', object);
                return util_inspect(object, options);
            }
            return util_format.apply(null, arguments);
        }
        return util;
    })(util);
}


module.exports = Unclog;



