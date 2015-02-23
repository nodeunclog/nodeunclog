if (0 || process.env.skipunclog || process.env.nounclog) {
    module.exports = require('./skip');
    return;
}
if (0 || process.env.blankunclog) {
    console.log('Silence is golden.');
    module.exports = require('./blank');
    return;
}

console.err = console.error;
console.debug = console.log;

module.exports = Unclog;


var util = require('util');
var config = require('./config');

var toShortString = require('to-short-string');

var path = require('path');
var Path = require('path');
var URL = require('url');
var onFinished = require('on-finished');

var stackTrace = require('stack-trace');
// Error.stackTraceLimit = 20;
Error.stackTraceLimit = Infinity;

require('deep-index-of');

var consoleLevels = [
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
];

var Request = require('./request');
var Socket = require('./socket');


for (var j = 0; j < consoleLevels.length; j++) {
    Unclog[consoleLevels[j]] = PrePrelog(consoleLevels[j]);
    Unclog[consoleLevels[j]].stdout = PrePrelog(consoleLevels[j], true);
}
// console.debug(Unclog.log.stdout.toString());
Unclog.error = Unclog.err;
// Unclog.error = Unclog.err = console.error;
// Unclog.error = console.error;
// Unclog.error = console.error = Unclog.err;

Unclog.request = Unclog;
Unclog.socket = Unclog;

function Unclog(customContext) {
    if (arguments.length >= 3)
        if (arguments[arguments.length - 2].req)
            if (arguments[arguments.length - 3].res)
                return Request.apply(this, arguments);
    if (arguments.length == 2)
        if (arguments[0].nsp)
            return Socket.apply(this, arguments);
    return Unclog.bind(this);
};

function PrePrelog(consoleLevel, stdout) {
    var options = {};
    options.consoleLevel = consoleLevel;
    options.stdout = stdout;
    var level = options.level = consoleLevel;
    var number = options.number = consoleLevelNumber(level);
    var basicLevel = options.basicLevel = consoleLevelMapToBasicLevel(number);
    var levelText = options.levelText = consoleLevelPaddedText(number);
    var color = options.color = consoleLevelColor(number)[0];
    var baseColor = options.baseColor = consoleLevelColor(1)[0];
    var resetColor = options.resetColor = consoleLevelColor('reset');
    var bullet = options.bullet = consoleLevelBullet(number);
    return Prelog.bind(options);
}

Prelog.prototype.stdout = process.stdout.write;

function Prelog(msg) {
    // if (!msg) return;
    var options = this;
    var consoleLevel = options.consoleLevel;
    var stdout = options.stdout;
    var level = options.level;
    var number = options.number;
    var basicLevel = options.basicLevel;
    var levelText = options.levelText;
    var color = options.color;
    var baseColor = options.baseColor;
    var resetColor = options.resetColor;
    var bullet = options.bullet;
    try {
        var string = expandConsoleArguments(arguments, consoleLevelNumber(consoleLevel));
        if(!stdout){
            var context = getContext.apply(null, arguments);
            var availableWidthForExtras = getAvailableWidthForExtras(string, config.width);
            var stringPadding = getStringPadding(string, config.contentWidth);
            var baseFilename = context.baseFilename;
            var stackTrail = context.stackTrail;
            // var extras = levelText + ' ' + baseFilename + ' ' + stackTrail;
            var extras = stackTrail;
            extras = truncateExtras(extras, availableWidthForExtras, 1);
            extras += ' [' + new Date().toISOString() + ']';
            var extrasPadding = getExtrasPadding(extras, availableWidthForExtras);
            extras = baseColor + extrasPadding + color + bullet[2] + ' ' + baseColor + extras;
        }
        try {
            // console[basicLevel].call(console, color + bullet[0], string, stringPadding + color, extras);
            if (stdout)
                process.stdout.write.call(process.stdout, color + string + resetColor);
            else
                console[basicLevel].call(console, color + bullet[0], string, extras, resetColor);
        } catch (err) {
            console.error.apply(console, arguments);
        }
    } catch (err) {
        Unclog.err(err);
    }
}

function getExtrasPadding(extras, availableWidthForExtras) {
    if (!extras || !extras.length) return '';
    availableWidthForExtras = parseInt(availableWidthForExtras);
    var extrasPadding = '';
    var extraSpace = parseInt(availableWidthForExtras - extras.length);
    if (extraSpace <= 0)
        return extrasPadding;
    if (extraSpace >= availableWidthForExtras)
        return extrasPadding;
    extrasPadding = (new Array(extraSpace)).join(' ');
    // extrasPadding = (new Array(extraSpace)).join(config.paddingDelimiter);
    return extrasPadding;
}

function truncateExtras(string, availableWidthForExtras, fraction) {
    if (!string || !string.length) return '';
    var length = availableWidthForExtras - string.length;
    if (length < 0)
        string = toShortString(string, availableWidthForExtras, fraction);
    return string;
}

function getAvailableWidthForExtras(content, totalWidth) {

    if (content.length <= config.thresholdContentWidth)
        totalWidth = config.thresholdContentWidth;

    var availableWidthForExtras = totalWidth - content.length;

    // console.debug('content.length:', content.length);
    // console.debug('availableWidthForExtras:', availableWidthForExtras);

    if (content.indexOf('\n') > -1)
        availableWidthForExtras = totalWidth - content.split('\n').pop().length
    if (content.indexOf('\r') > -1)
        availableWidthForExtras = totalWidth - content.split('\r').pop().length
    return availableWidthForExtras;
}

// var Request = require('./request').bind(Unclog.prototype);
// Unclog.request = function(req, res, next) {
//     if (next && (typeof(next) == 'function'))
//         return Request(req, res, next);
//     else return Request;
// };







function expandConsoleArguments(arguments, depth) {
    return util.format.apply(null, arguments);
    // return modifiedUtil(depth).format.apply(null, arguments);
}

function getStringPadding(string, contentWidth) {
    var stringPadding = consoleLevelColor(1)[0] + '';
    var length = contentWidth - string.length;
    if (length > 0)
        for (var j = 0; j < length; j++)
            stringPadding = stringPadding + config.paddingDelimiter;
    return stringPadding;
}


function getContext(err) {
    try {
        if (err && (err instanceof Error)) {
            if (!err.stack || !err.stack.length)
                throw new Error(err.message);
            else throw err;
        } else if (err)
            throw new Error(err.toString());
        else
            throw new Error('');
    } catch (err) {
        var stacktrace = stackTrace.parse(err);
        for (var j = 0; j < stacktrace.length; j++)
            if (stacktrace[j] && stacktrace[j].fileName && stacktrace[j].fileName.deepIndexOf(config.ignore) == -1)
                return attachBaseFilenameToStacktrace(stacktrace, j);
        return attachBaseFilenameToStacktrace(stacktrace, 2);
    }
}

function attachBaseFilenameToStacktrace(stacktrace, j) {
    if (!stacktrace || !stacktrace[j]) return '';
    stacktrace[j].baseFilename = (!j ? '*' : '') + getBaseFilename(stacktrace[j].fileName);
    stacktrace[j].baseFolderAndFilename = getBaseFolderAndFilename(stacktrace[j].fileName, stacktrace[j].lineNumber);
    stacktrace[j].stackTrail = getStackTrail(stacktrace);
    return stacktrace[j];
}

function getBaseFilename(file) {
    if (file && file.deepIndexOf(config.ignore) == -1)
        return path.basename(file, path.extname(path.basename(file)));
    else
        return '\b';
}

function getBaseFolderAndFilename(file, additionalInfo) {
    // additionalInfo = stacktrace[j].lineNumber
    return '[' + path.dirname(file).split(path.sep).reverse()[0] + path.sep + getBaseFilename(file) + (additionalInfo ? (':' + (config.backtrace ? '~' : '') + additionalInfo) : '') + ']';
}

function getStackTrail(stacktrace, cutoff) {
    if (!stacktrace || !stacktrace.length) return '';
    var stackTrail = '';
    for (var j = 0; j < ((cutoff && cutoff < stacktrace.length) ? cutoff : stacktrace.length); j++)
        if (stacktrace[j] && stacktrace[j].fileName && stacktrace[j].lineNumber)
            if (stacktrace[j].fileName.deepIndexOf(config.ignore) == -1)
                stackTrail += getBaseFolderAndFilename(stacktrace[j].fileName, stacktrace[j].lineNumber);
    return stackTrail;
}


function consoleLevelNumber(consoleLevel) {
    return (consoleLevels.indexOf(consoleLevel));
}

function consoleLevelMapToBasicLevel(consoleLevelNumber) {
    return ([
        'log',
        'log',
        'log',
        'log',
        'log',
        'log',
        'log',
        'warn',
        'error',
        'log',
        'log',
    ][consoleLevelNumber]);
}

function consoleLevelPaddedText(consoleLevelNumber) {
    return ([
            'silly  ',
            'verbose',
            'log    ',
            'info   ',
            'pass   ',
            'start  ',
            'end    ',
            'warn   ',
            'err    ',
            'fail   ',
            'debug  ',
        ].replaceAll(/ /g, config.paddingDelimiter)
        // .replaceAll(config.paddingDelimiter, ' ' + consoleLevelColor(1)[0])
        .replaceAll(config.paddingDelimiter, ' ')[consoleLevelNumber]);
}

function consoleLevelBullet(consoleLevelNumber) {
    return ([
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
    ][consoleLevelNumber]);
}

function consoleLevelColor(consoleLevelNumber) {
    var colors = [
        ['\x1b[36;1m', '\x1b[47;1;36;1m'], // silly
        ['\x1b[30;1m', '\x1b[47;1;30;1m'], // verbose
        ['\x1b[30;22m', '\x1b[47;1;30;1m'], // log
        ['\x1b[34;22m', '\x1b[47;1;34;1m'], // info
        ['\x1b[33;22m', '\x1b[47;1;33;1m'], // pass
        ['\x1b[32;22m', '\x1b[47;1;32;1m'], // start
        ['\x1b[32;1m', '\x1b[47;1;32;1m'], // end
        ['\x1b[31;1m', '\x1b[47;1;31;1m'], // warn
        ['\x1b[31;1m', '\x1b[47;1;31;1m'], // err
        ['\x1b[35;22m', '\x1b[47;1;35;1m'], // fail
        ['\x1b[34;1m', '\x1b[47;1;34;1m'], // debug
    ];
    colors.reset = '\x1b[30;22m';
    // colors.reset = '\x1b[30;2m';
    // colors.reset = '\x1b[0m';
    // colors.reset = '\x1b[39;1m';
    // colors.reset = '\x1b[0m\x1b[30;1m';
    // colors.reset = '\x1b[49;1;39;1m';
    return colors[consoleLevelNumber];
}


// console.log(' > ;\x1b[30;2m 30;2m < ');
// console.log(' > ;\x1b[31;2m 31;2m < ');
// console.log(' > ;\x1b[32;2m 32;2m < ');
// console.log(' > ;\x1b[33;2m 33;2m < ');
// console.log(' > ;\x1b[34;2m 34;2m < ');
// console.log(' > ;\x1b[35;2m 35;2m < ');
// console.log(' > ;\x1b[36;2m 36;2m < ');
// console.log(' > ;\x1b[37;2m 37;2m < ');

// // console.debug('>>>\x1b[0m<<<');
// console.log(' > ;\x1b[47;1;37;1m 47;1;37;1m < ');
// console.log(' > ;\x1b[46;1;37;1m 46;1;37;1m < ');
// console.log(' > ;\x1b[45;1;37;1m 45;1;37;1m < ');
// console.log(' > ;\x1b[44;1;37;1m 44;1;37;1m < ');
// console.log(' > ;\x1b[43;1;37;1m 43;1;37;1m < ');
// console.log(' > ;\x1b[42;1;37;1m 42;1;37;1m < ');
// console.log(' > ;\x1b[41;1;37;1m 41;1;37;1m < ');
// console.log(' > ;\x1b[40;1;37;1m 40;1;37;1m < ');
// console.log(' > ;\x1b[47;1;36;1m 47;1;36;1m < ');
// console.log(' > ;\x1b[46;1;36;1m 46;1;36;1m < ');
// console.log(' > ;\x1b[45;1;36;1m 45;1;36;1m < ');
// console.log(' > ;\x1b[44;1;36;1m 44;1;36;1m < ');
// console.log(' > ;\x1b[43;1;36;1m 43;1;36;1m < ');
// console.log(' > ;\x1b[42;1;36;1m 42;1;36;1m < ');
// console.log(' > ;\x1b[41;1;36;1m 41;1;36;1m < ');
// console.log(' > ;\x1b[40;1;36;1m 40;1;36;1m < ');
// console.log(' > ;\x1b[47;1;35;1m 47;1;35;1m < ');
// console.log(' > ;\x1b[46;1;35;1m 46;1;35;1m < ');
// console.log(' > ;\x1b[45;1;35;1m 45;1;35;1m < ');
// console.log(' > ;\x1b[44;1;35;1m 44;1;35;1m < ');
// console.log(' > ;\x1b[43;1;35;1m 43;1;35;1m < ');
// console.log(' > ;\x1b[42;1;35;1m 42;1;35;1m < ');
// console.log(' > ;\x1b[41;1;35;1m 41;1;35;1m < ');
// console.log(' > ;\x1b[40;1;35;1m 40;1;35;1m < ');
// console.log(' > ;\x1b[47;1;34;1m 47;1;34;1m < ');
// console.log(' > ;\x1b[46;1;34;1m 46;1;34;1m < ');
// console.log(' > ;\x1b[45;1;34;1m 45;1;34;1m < ');
// console.log(' > ;\x1b[44;1;34;1m 44;1;34;1m < ');
// console.log(' > ;\x1b[43;1;34;1m 43;1;34;1m < ');
// console.log(' > ;\x1b[42;1;34;1m 42;1;34;1m < ');
// console.log(' > ;\x1b[41;1;34;1m 41;1;34;1m < ');
// console.log(' > ;\x1b[40;1;34;1m 40;1;34;1m < ');
// console.log(' > ;\x1b[47;1;33;1m 47;1;33;1m < ');
// console.log(' > ;\x1b[46;1;33;1m 46;1;33;1m < ');
// console.log(' > ;\x1b[45;1;33;1m 45;1;33;1m < ');
// console.log(' > ;\x1b[44;1;33;1m 44;1;33;1m < ');
// console.log(' > ;\x1b[43;1;33;1m 43;1;33;1m < ');
// console.log(' > ;\x1b[42;1;33;1m 42;1;33;1m < ');
// console.log(' > ;\x1b[41;1;33;1m 41;1;33;1m < ');
// console.log(' > ;\x1b[40;1;33;1m 40;1;33;1m < ');
// console.log(' > ;\x1b[47;1;32;1m 47;1;32;1m < ');
// console.log(' > ;\x1b[46;1;32;1m 46;1;32;1m < ');
// console.log(' > ;\x1b[45;1;32;1m 45;1;32;1m < ');
// console.log(' > ;\x1b[44;1;32;1m 44;1;32;1m < ');
// console.log(' > ;\x1b[43;1;32;1m 43;1;32;1m < ');
// console.log(' > ;\x1b[42;1;32;1m 42;1;32;1m < ');
// console.log(' > ;\x1b[41;1;32;1m 41;1;32;1m < ');
// console.log(' > ;\x1b[40;1;32;1m 40;1;32;1m < ');
// console.log(' > ;\x1b[47;1;31;1m 47;1;31;1m < ');
// console.log(' > ;\x1b[46;1;31;1m 46;1;31;1m < ');
// console.log(' > ;\x1b[45;1;31;1m 45;1;31;1m < ');
// console.log(' > ;\x1b[44;1;31;1m 44;1;31;1m < ');
// console.log(' > ;\x1b[43;1;31;1m 43;1;31;1m < ');
// console.log(' > ;\x1b[42;1;31;1m 42;1;31;1m < ');
// console.log(' > ;\x1b[41;1;31;1m 41;1;31;1m < ');
// console.log(' > ;\x1b[40;1;31;1m 40;1;31;1m < ');
// console.log(' > ;\x1b[47;1;30;1m 47;1;30;1m < ');
// console.log(' > ;\x1b[46;1;30;1m 46;1;30;1m < ');
// console.log(' > ;\x1b[45;1;30;1m 45;1;30;1m < ');
// console.log(' > ;\x1b[44;1;30;1m 44;1;30;1m < ');
// console.log(' > ;\x1b[43;1;30;1m 43;1;30;1m < ');
// console.log(' > ;\x1b[42;1;30;1m 42;1;30;1m < ');
// console.log(' > ;\x1b[41;1;30;1m 41;1;30;1m < ');
// console.log(' > ;\x1b[40;1;30;1m 40;1;30;1m < ');

// console.debug('>>>\x1b[0m<<<');
// console.log(' > ;\x1b[30;2m 30;2m < ');
// console.log(' > ;\x1b[31;2m 31;2m < ');
// console.log(' > ;\x1b[32;2m 32;2m < ');
// console.log(' > ;\x1b[33;2m 33;2m < ');
// console.log(' > ;\x1b[34;2m 34;2m < ');
// console.log(' > ;\x1b[35;2m 35;2m < ');
// console.log(' > ;\x1b[36;2m 36;2m < ');
// console.log(' > ;\x1b[37;2m 37;2m < ');

// console.log(' > ;\x1b[30;1m 30;1m < ');
// console.log(' > ;\x1b[31;1m 31;1m < ');
// console.log(' > ;\x1b[32;1m 32;1m < ');
// console.log(' > ;\x1b[33;1m 33;1m < ');
// console.log(' > ;\x1b[34;1m 34;1m < ');
// console.log(' > ;\x1b[35;1m 35;1m < ');
// console.log(' > ;\x1b[36;1m 36;1m < ');
// console.log(' > ;\x1b[37;1m 37;1m < ');
// console.log(' > ;\x1b[30;22m 30;4m < ');
// console.log(' > ;\x1b[31;22m 31;4m < ');
// console.log(' > ;\x1b[32;22m 32;4m < ');
// console.log(' > ;\x1b[33;22m 33;4m < ');
// console.log(' > ;\x1b[34;22m 34;4m < ');
// console.log(' > ;\x1b[35;22m 35;4m < ');
// console.log(' > ;\x1b[36;22m 36;4m < ');
// console.log(' > ;\x1b[37;22m 37;4m < ');





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


process.on('uncaughtException', function(err) {
    Unclog.err(err);
    Unclog.err(err.stack);
    Unclog.err('Uncaught Exception. Exiting...\u0007\u0007');
    process.exit(1);
});
