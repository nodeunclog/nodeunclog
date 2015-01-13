if (0 || process.env.skipunclog || process.env.nounclog) {
    module.exports = require('./skip');
    return;
}
if (0 || process.env.blankunclog) {
    console.log('Silence is golden.');
    module.exports = require('./blank');
    return;
}

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

function Unclog(customContext) {};
for (var j = 0; j < consoleLevels.length; j++)
    Unclog.prototype[consoleLevels[j]] = Prelog(consoleLevels[j]);
Unclog.prototype.error = Unclog.prototype.err;
// Unclog.prototype.error = Unclog.prototype.err = console.error;
// Unclog.prototype.error = console.error;
// Unclog.prototype.error = console.error = Unclog.prototype.err;
console.err = console.error;
console.debug = console.log;

function Prelog(consoleLevel) {
    var level = consoleLevel;
    var number = consoleLevelNumber(level);
    var basicLevel = consoleLevelMapToBasicLevel(number);
    var levelText = consoleLevelPaddedText(number);
    var color = consoleLevelColor(number)[0];
    var baseColor = consoleLevelColor(1)[0];
    var resetColor = consoleLevelColor('reset');
    var bullet = consoleLevelBullet(number);
    return function(msg) {
        // if (!msg) return;
        try {
            var context = getContext.apply(null, arguments);
            var string = expandConsoleArguments(arguments, consoleLevelNumber(consoleLevel));
            var availableWidthForExtras = getAvailableWidthForExtras(string, config.width);
            var stringPadding = getStringPadding(string, config.contentWidth);
            var baseFilename = context.baseFilename;
            var stackTrail = context.stackTrail;
            // var extras = levelText + ' ' + baseFilename + ' ' + stackTrail;
            var extras = stackTrail;
            extras = truncateExtras(extras, availableWidthForExtras, 1);
            var extrasPadding = getExtrasPadding(extras, availableWidthForExtras);
            extras = baseColor + extrasPadding + color + bullet[2] + ' ' + baseColor + extras;
            try {
                // console[basicLevel].call(console, color + bullet[0], string, stringPadding + color, extras);
                console[basicLevel].call(console, color + bullet[0], string, extras, resetColor);
            } catch (err) {
                console.error.apply(console, arguments);
            }
        } catch (err) {
            Unclog.prototype.err(err);
        }
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
    var availableWidthForExtras = totalWidth - content.length;
    if (content.indexOf('\n') > -1)
        availableWidthForExtras = totalWidth - content.split('\n').pop().length
    if (content.indexOf('\r') > -1)
        availableWidthForExtras = totalWidth - content.split('\r').pop().length
    return availableWidthForExtras;
}

function Request(req, res, next) {
    try {
        // var context = getBaseFilename();
        // It's currently impossible to get actualy filename. so many callbacks, even Error.Infinity doesn't help

        // try {
        //     throw new Error();
        // } catch (err) {
        //     console.error(err);
        //     console.error(err.stack);
        //     console.log('>', getContext(err).stackTrail, '<');
        // }

        var method = req.method.toUpperCase();
        var url = req.url;
        var ip = (req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress));
        var useragent = '(' + require('ua-parser').parse(req.headers['user-agent']).ua.toString() + ')';
        var logTimeout = setTimeout(log, config.requestTimeout);
        onFinished(res, log);
        return next();

        function log() {
            clearTimeout(logTimeout);
            var status = '[' + (res._header ? (res.statusCode || '???') : ('timeout:' + (parseInt(config.requestTimeout / 1000)) + 's')) + ']';
            // Unclog(ip || method || UnclogRequest.context || method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, toShortString(useragent, 10, 10));
            Unclog.prototype[(
                (!res._header || !res.statusCode) ||
                (res.statusCode > 400) ||
                (isNaN(res.statusCode))
            ) ? 'error' : 'verbose'](
                method, status, url, '|',
                ip, toShortString(useragent, 10, 10), '|',
                new Date().toISOString()
            );
            // Unclog(method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, useragent);
        }
    } catch (err) {
        Unclog.prototype.err(err)
    }
}
Unclog.prototype.request = function(req, res, next) {
    if (next && (typeof(next) == 'function'))
        return Request(req, res, next);
    else return Request;
};



var socketRouter = require('socket.io-events')();
socketRouter.on(function(socket, arguments, next) {
    try {
        Unclog.prototype.verbose('SOCKET.on("' + toShortString(arguments[0], 10, 10) + '"' + (arguments[1] ? (', ' + toShortString(JSON.stringify(arguments[1]), 15, 15)) : '') + ')');
        next();
    } catch (err) {
        Unclog.prototype.err(err || new Error('socket error'));
    }
});
Unclog.prototype.socket = function() {
    var io = this;
    if (io && !io.length && io.on)
        io.on('connection', function(socket) {
            var req = socket.request;
            // var method = req.method.toUpperCase();
            var url = req.url;
            var ip = (req.headers['x-forwarded-for'] || req.ip || req.address || req._remoteAddress || (req.connection && req.connection.remoteAddress));
            var useragent = '(' + require('ua-parser').parse(req.headers['user-agent']).ua.toString() + ')';
            var referer = URL.parse(req.headers.referer);
            Unclog.prototype['verbose'](
                'SOCKET', 'connection',
                toShortString(socket.id), toShortString(socket.request.sessionID), '|',
                referer.host + toShortString(referer.path) + toShortString(referer.query), '|',
                // url, '|',
                ip, toShortString(useragent, 10, 10), '|',
                new Date().toISOString()
            );
            // Unclog.prototype.verbose('Socket connected');
            socket.on('disconnect', function() {
                Unclog.prototype['verbose'](
                    'SOCKET', 'disconnect',
                    toShortString(socket.id), toShortString(socket.request.sessionID), '|',
                    referer.host + toShortString(referer.path) + toShortString(referer.query), '|',
                    // url, '|',
                    ip, toShortString(useragent, 10, 10), '|',
                    new Date().toISOString()
                );
            });
        });
    if (arguments.length)
        return socketRouter(arguments[0], arguments[1]);
    else
        return socketRouter;
};


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

module.exports = new Unclog;

process.on('uncaughtException', function(err) {
    Unclog.prototype.err(err);
    Unclog.prototype.err('Uncaught Exception. Exiting...\u0007\u0007');
    process.exit(1);
});
