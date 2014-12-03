if(0 || process.env.nonunclog){
console.logtxt  =
console.win     =
console.info    =
console.warn    =
console.error   =
console.err     =
console.errtxt  =
console.fail    =
console.silly   =
console.debug   =
console.verbose =
console.start   =
console.end     =
console.file    =
console.log;
console.request = function(){return function(req, res, next) {next();}};
console.socket = function(){return function(socket, next) {next();}};
module.exports = console;
return;
}

var toShortString = require('to-short-string');


var util = require('util');
var util_inspect = util.inspect;
util.inspect = function(object, options){
    // console.log('converting', object);
    // try{
    if(!options) options = {};
    options.depth = 3;
    return util_inspect(object, options);
    // }catch(err){console.error(err)}
}

var stackTrace = require('stack-trace');
// require('long-stack-traces');
// Error.stackTraceLimit = Infinity;
Error.stackTraceLimit = 20;
var path = require('path');
var onFinished = require('on-finished');

var fs = require('fs');

Array.prototype.doAnyOfTheseElementsExistIn = function(string){
    for (var i = 0; i < this.length; i++)
        if(string.indexOf(this[i]) !== -1)
            return true;
    return false;
}

//
var DEFAULT_WIDTH = (112+35-35);

// var IGNORE = [];
// var IGNORE = ['log', 'verbose'];
var IGNORE = (process.env.CLOG && process.env.CLOG.split(' ')) || [];

var COLOR = false;
if (
           ( process.env.color    && process.env.color.toLowerCase()    != false && process.env.color.toLowerCase()    != 'false' )
        || ( process.env.colors   && process.env.colors.toLowerCase()   != false && process.env.colors.toLowerCase()   != 'false' )
        || ( process.env.colorful && process.env.colorful.toLowerCase() != false && process.env.colorful.toLowerCase() != 'false' )
    )
    COLOR = true;
if (
           ( process.env.nocolor   && process.env.nocolor.toLowerCase()   != false && process.env.nocolor.toLowerCase()   != 'false' )
        || ( process.env.nocolors  && process.env.nocolors.toLowerCase()  != false && process.env.nocolors.toLowerCase()  != 'false' )
        || ( process.env.no_color  && process.env.no_color.toLowerCase()  != false && process.env.no_color.toLowerCase()  != 'false' )
        || ( process.env.no_colors && process.env.no_colors.toLowerCase() != false && process.env.no_colors.toLowerCase() != 'false' )
    )
    COLOR = false;
var NOBULLET = process.env.UNCLOG_NOBULLET;
var NOTIME = process.env.UNCLOG_NOTIME;
var NOPADDING = process.env.UNCLOG_NOPADDING;
var TWOLINE = process.env.UNCLOG_TWOLINE;
var NOLONGSTACKTRACE = process.env.UNCLOG_NOLONGSTACKTRACE;
var SYMBOL = process.env.UNCLOG_PADDING_SYMBOL;


var backtrace = false;

var ignore = [
    'fs.js',
    'authenticator',
    'express',
    'domain.js',
    '_stream_readable.js',
    '<anonymous>',
    'timers.js',
    '_stream_writable.js',
    'http.js',
    'module.js',
    'node.js',
    'net.js',
    'events.js',
    'node_modules',
    'unclog',
    'nodeunclog',
    ];


// console.log('=============================================================================================================');

if(process.env.env==='prod'){
    // NOBULLET = true;
    // NOTIME = true;
    // NOPADDING = true;
    // NOLONGSTACKTRACE = true;
    // TWOLINE = true;
    // SYMBOL = '_';
    // DEFAULT_WIDTH -= 44;
    // DEFAULT_WIDTH -= (44+35);
    }

if(process.env.remote){
    // NOTIME = true;
    // NOPADDING = true;
    // NOLONGSTACKTRACE = true;
    // TWOLINE = true;
    // SYMBOL = '_';
    // DEFAULT_WIDTH -= 44;
    // DEFAULT_WIDTH -= (44+35);
    DEFAULT_WIDTH -= (44+35+10-30-20);
    }


BASE = {
    context: {
        length: 0
        },
    symbol: '…',
    // symbol: '.',
    // symbol: ' ',
    };
BASE.symbol = SYMBOL?SYMBOL:BASE.symbol;


var utils = {
    merge: require('utils-merge')
    };


var i = 0;
function Unclog(context) {

    // try {
    //     if (context.length > 0)
    //         Object.defineProperty(BASE.context, 'length', {
    //             value: context.length + 1,
    //             writable: false,
    //             enumerable: true,
    //             configurable: false
    //             });
    //     } catch(e){}

    if(!context) return new Error('just do require(\'unclog\') or require(\'unclog\')(\'provide a context here\') ');
    if (!(this instanceof Unclog))
        return new Unclog(context);
    var unclog = Object.create(this);
    unclog.context = context;


    return unclog
}

Unclog.log     = function() { return log(this.context, 'log',     arguments);};
Unclog.logtxt  = function() { return log(this.context, 'logtxt',  arguments);};
Unclog.win     = function() { return log(this.context, 'win',     arguments);};
Unclog.info    = function() { return log(this.context, 'info',    arguments);};
Unclog.warn    = function() { return log(this.context, 'warn',    arguments);};
Unclog.error   = function() { return log(this.context, 'error',   arguments);};
Unclog.err     = function() { return log(this.context, 'err',     arguments);};
Unclog.errtxt  = function() { return log(this.context, 'errtxt',  arguments);};
Unclog.fail    = function() { return log(this.context, 'fail',    arguments);};
Unclog.silly   = function() { return log(this.context, 'silly',   arguments);};
Unclog.debug   = function() { return log(this.context, 'debug',   arguments);};
Unclog.verbose = function() { return log(this.context, 'verbose', arguments);};
Unclog.start   = function() { return log(this.context, 'start',   arguments);};
Unclog.end     = function() { return log(this.context, 'end',     arguments);};
Unclog.file    = function() { return logtofile(this.context, arguments);};
Unclog.request = function returnUnclogRequest() {
    if (arguments.length)
        return UnclogRequest.apply(null, arguments);
        // return UnclogRequest(arguments[0], arguments[1], arguments[2]);
    else
        return UnclogRequest;
    UnclogRequest.context = getBaseFilename();
    return UnclogRequest;
};
// Unclog.request = UnclogRequest;
function UnclogRequest(req, res, next) {
    // var context = getBaseFilename();
    // It's currently impossible to get actualy filename. so many callbacks, even Error.Infinity doesn't help
    var method = req.method.toUpperCase();
    var url = req.url;
    var ip = (req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress));
    var useragent = '(' + require('ua-parser').parse(req.headers['user-agent']).ua.toString() + ')';
    function log() {
        clearTimeout(logTimeout);
        var status = '[' + (res._header ? (res.statusCode || '...') : 'timeout') + ']';
        Unclog(ip || method || UnclogRequest.context || method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, toShortString(useragent,10,10));
        // Unclog(method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, useragent);
    }
    var logTimeout = setTimeout(log, 30000);
    onFinished(res, log);
    next();
}
var socketRouter = require('socket.io-events')();
socketRouter.on(function(socket, arguments, next) {
    Unclog('SOCKET.IO').verbose('SOCKET.on("' + toShortString(arguments[0],10,10) + '"' + (arguments[1] ? (', ' + toShortString(JSON.stringify(arguments[1]),15,15)) : '') + ')');
    next();
});
Unclog.socket = function() {
    if (arguments.length)
        return socketRouter(arguments[0], arguments[1]);
        // return socketRouter.apply(null, arguments)
    else
        return socketRouter;
};

function getBaseFilename() {
    for (var stacktrace = stackTrace.parse(new Error()), i = 0; i < stacktrace.length; i++)
        if (!ignore.doAnyOfTheseElementsExistIn(stacktrace[i].fileName))
            return path.basename(stacktrace[i].fileName, path.extname(path.basename(stacktrace[i].fileName)));
}
// function getBaseFilename1() {
//     var stacktrace = stackTrace.parse(new Error());
//     // console.log('stacktrace : ===================', '\n', stacktrace);
//     if ('<anonymous>' == stacktrace[1].fileName) {
//         var filename = stacktrace[7];
//         backtrace = true;
//     } else if (['nodeunclog', 'unclog'].indexOf(path.dirname(stacktrace[3].fileName).split(path.sep).reverse()[0]) === -1)
//         var filename = stacktrace[3];
//     else
//         var filename = stacktrace[4];
//     if ('index' == path.basename(filename.fileName, path.extname(path.basename(filename.fileName))))
//         filename = path.dirname(filename.fileName).split(path.sep).reverse()[0];
//     else
//         filename = filename.fileName;
//     return path.basename(filename, path.extname(path.basename(filename)));
// }




var color = {};
color.padding = COLOR? '\x1b[30;1m' :''; // \x1b[47;1;30;1m
color.verbose = COLOR? '\x1b[30;1m' :''; // \x1b[47;1;30;1m
color.default = COLOR? '\x1b[30;2m' :''; // \x1b[47;1;30;2m
color.warn    = COLOR? '\x1b[31;1m' :''; // \x1b[47;1;31;1m
color.err     = COLOR? '\x1b[31;2m' :''; // \x1b[47;1;31;2m
color.errtxt  = COLOR? '\x1b[31;2m' :''; // \x1b[47;1;31;2m
color.error   = COLOR? '\x1b[31;2m' :''; // \x1b[47;1;31;2m
color.end     = COLOR? '\x1b[32;1m' :''; // \x1b[47;1;32;1m
color.start   = COLOR? '\x1b[32;2m' :''; // \x1b[47;1;32;2m
color.win     = COLOR? '\x1b[33;2m' :''; // \x1b[47;1;33;2m
color.debug   = COLOR? '\x1b[34;1m' :''; // \x1b[47;1;34;1m
color.info    = COLOR? '\x1b[34;2m' :''; // \x1b[47;1;34;2m
color.fail    = COLOR? '\x1b[35;2m' :''; // \x1b[47;1;35;2m
color.silly   = COLOR? '\x1b[36;2m' :''; // \x1b[47;1;36;2m
color.log     = COLOR? '\x1b[30;2m' :''; // \x1b[47;1;30;2m
color.logtxt  = COLOR? '\x1b[30;2m' :''; // \x1b[47;1;30;2m
// or.log     = COLOR? '\x1b[37;1m' :''; // \x1b[47;1;37;1m

var bullet1 = {}, bullet2 = {}, bullet3 = {};
bullet1.log     = !NOBULLET? ' ' :'->'; bullet2.log     = !NOBULLET? ' ' :' '; bullet3.log     = !NOBULLET? ' ' :'<-';
bullet1.logtxt  = !NOBULLET? ' ' :'->'; bullet2.logtxt  = !NOBULLET? ' ' :' '; bullet3.logtxt  = !NOBULLET? ' ' :'<-';
bullet1.win     = !NOBULLET? '√' :'->'; bullet2.win     = !NOBULLET? '√' :' '; bullet3.win     = !NOBULLET? '√' :'<-';
bullet1.info    = !NOBULLET? '►' :'->'; bullet2.info    = !NOBULLET? '◄' :' '; bullet3.info    = !NOBULLET? '◄' :'<-';
bullet1.warn    = !NOBULLET? '₩' :'->'; bullet2.warn    = !NOBULLET? ' ' :' '; bullet3.warn    = !NOBULLET? ' ' :'<-';
bullet1.err     = !NOBULLET? '█' :'->'; bullet2.err     = !NOBULLET? ' ' :' '; bullet3.err     = !NOBULLET? ' ' :'<-';
bullet1.errtxt  = !NOBULLET? '█' :'->'; bullet2.errtxt  = !NOBULLET? ' ' :' '; bullet3.errtxt  = !NOBULLET? ' ' :'<-';
bullet1.error   = !NOBULLET? '█' :'->'; bullet2.error   = !NOBULLET? ' ' :' '; bullet3.error   = !NOBULLET? ' ' :'<-';
bullet1.fail    = !NOBULLET? '×' :'->'; bullet2.fail    = !NOBULLET? '×' :' '; bullet3.fail    = !NOBULLET? '×' :'<-';
bullet1.debug   = !NOBULLET? '●' :'->'; bullet2.debug   = !NOBULLET? ' ' :' '; bullet3.debug   = !NOBULLET? ' ' :'<-';
bullet1.silly   = !NOBULLET? '☺' :'->'; bullet2.silly   = !NOBULLET? '☺' :' '; bullet3.silly   = !NOBULLET? '☺' :'<-';
bullet1.start   = !NOBULLET? '▼' :'->'; bullet2.start   = !NOBULLET? '▼' :' '; bullet3.start   = !NOBULLET? '▼' :'<-';
bullet1.end     = !NOBULLET? '■' :'->'; bullet2.end     = !NOBULLET? '■' :' '; bullet3.end     = !NOBULLET? '■' :'<-';
bullet1.verbose = !NOBULLET? ' ' :'->'; bullet2.verbose = !NOBULLET? ' ' :' '; bullet3.verbose = !NOBULLET? ' ' :'<-';


function log(context, level, str, toConsole) {

    if(IGNORE.indexOf(level) > -1)
        return;

    for(var k in str)
        if (typeof str[k] != 'string')
            str[k] = util.inspect(str[k], {depth:null})
    var message = util.format.apply(null, str).split('\n');

    // var message = util.format.apply(null, str).split('/[\n\r]+/');
    // console.log(message);

    var message_post = '';

    if(!context) {
        var stacktrace = stackTrace.parse(new Error())
        if('nodeunclog' !== path.dirname(stacktrace[2].fileName).split(path.sep).reverse()[0])
            var filename = stacktrace[2].fileName;
        else
            var filename = stacktrace[3].fileName;
        // var context = path.basename(filename, path.extname(path.basename(filename)));
        var context = getBaseFilename();
    }

    var padding = {
        level: '',
        message: '',
        justmessage: '',
        length: 0
        };

    level = level;

    var time = new Date();
    if(!NOTIME)
        time = (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + (':' + (time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds())) + ('.' + (time.getMilliseconds() < 10 ? '00' + time.getMilliseconds() : (time.getMilliseconds() < 100 ? '0' + time.getMilliseconds() : (time.getMilliseconds()))));
    else
        time = '';


    // var conwidth = process.stdout.columns > DEFAULT_WIDTH ? process.stdout.columns : DEFAULT_WIDTH;
    var conwidth = DEFAULT_WIDTH;
    var leveldiff = 7 - level.length;
    var contextdiff = context.length - BASE.context.length;

    for (var i = 0; i < message.length; i++) {

        if (message[i] === '') return;

        message[i] = message[i].replace(/\r/g, '');
        message[i] = message[i].replace(/\t/g, '  ');

        padding.level = '';
        if(!NOPADDING)
            for (var j = 0; j < leveldiff; j++)
                padding.level += ' ';

        padding.message = '';
        padding.length = message[i].length;
        if(!NOPADDING)
            while (padding.length++ <= (conwidth - contextdiff))
                padding.message += BASE.symbol;

        // var stacktrace = stackTrace.parse(new Error(message[i]))[2];
        // stacktrace = ' [' + stacktrace.fileName.match(/([^\\]+$)/)[0] + ':' + stacktrace.lineNumber + '] ';
        var stacktrace = '';
        var stacktraces = stackTrace.parse(new Error(message[i]));
        // console.dir(stacktraces);

        // if (['nodeunclog', 'unclog'].indexOf(path.dirname(stacktraces[2].fileName).split(path.sep).reverse()[0]) == -1)
        //     for (var j = 2; j < (NOLONGSTACKTRACE ? 7 : stacktraces.length); j++)
        //         if (stacktraces[j] && stacktraces[j].fileName && stacktraces[j].lineNumber)
        //             if (['nodeunclog', 'unclog'].indexOf(path.dirname(stacktraces[j].fileName).split(path.sep).reverse()[0]) === -1)
        //                 stacktrace += ' [' + path.dirname(stacktraces[j].fileName).split(path.sep).reverse()[0] + path.sep + path.basename(stacktraces[j].fileName) + ':' + stacktraces[j].lineNumber + ']';

        // // if (['nodeunclog', 'unclog'].indexOf(path.dirname(stacktraces[2].fileName).split(path.sep).reverse()[0]) == -1)
        //     for (var j = 0; j < stacktraces.length; j++)
        //         if (stacktraces[j] && stacktraces[j].fileName && stacktraces[j].lineNumber){
        //             var stacktrace_tobe = ' [' + path.dirname(stacktraces[j].fileName).split(path.sep).reverse()[0] + path.sep + path.basename(stacktraces[j].fileName) + ':' + stacktraces[j].lineNumber + ']';
        //             if (['nodeunclog', 'unclog', 'lib\authenticator.js', ].indexOf(stacktrace_tobe)
        //                 continue;
        //             stacktrace += stacktrace_tobe;
        //         }

        // for (var j = 2; j < (NOLONGSTACKTRACE ? 7 : stacktraces.length); j++)
        //     if (stacktraces[j] && stacktraces[j].fileName && stacktraces[j].lineNumber){
        //         if (![ 'domain.js', '_stream_readable.js', '<anonymous>', 'timers.js', '_stream_writable.js','http.js','module.js','node.js','net.js','events.js','node_modules','unclog','nodeunclog'].doAnyOfTheseElementsExistIn(stacktraces[j].fileName))
        //             stacktrace += ' [' + path.dirname(stacktraces[j].fileName).split(path.sep).reverse()[0] + path.sep + path.basename(stacktraces[j].fileName) + ':' + (backtrace ? '~' : '') + stacktraces[j].lineNumber + ']';
        //             // stacktrace += ' [' + stacktraces[j].fileName + ':' + stacktraces[j].lineNumber + ']';
        //     }

        for (var j = 2; j < (NOLONGSTACKTRACE ? 7 : stacktraces.length); j++)
            if (stacktraces[j] && stacktraces[j].fileName && stacktraces[j].lineNumber){
                if (!ignore.doAnyOfTheseElementsExistIn(stacktraces[j].fileName))
                    stacktrace += ' [' + path.dirname(stacktraces[j].fileName).split(path.sep).reverse()[0] + path.sep + path.basename(stacktraces[j].fileName) + ':' + (backtrace ? '~' : '') + stacktraces[j].lineNumber + ']';
                    // stacktrace += ' [' + stacktraces[j].fileName + ':' + stacktraces[j].lineNumber + ']';
            }

        console.log(
              color[level]
            + bullet1[level] + ' '
            + message[i]
            // + '?'
            + ' ' + (bullet2[level]==' '?color.padding+BASE.symbol:bullet2[level])
            + color.padding
            + (bullet2[level]==' '?BASE.symbol:' ')
            + padding.message
            + (bullet3[level]==' '?BASE.symbol+BASE.symbol:color[level]+' '+bullet3[level]) + ' '
            + color[level]
            + context + ' '
            + level + ' '
            + padding.level
            + color.padding
            + time
            + color[level]
            +(TWOLINE ? (stacktrace !== '' ? ('\n  └') : '') : '')
            + stacktrace
            + color.default
            );

        if (process.env.logtofile) {
            logtofile( '\n'
                , bullet1[level]
                , message[i]
             // , (bullet2[level]==' '?BASE.symbol+BASE.symbol:bullet1[level] + ' ')
                , padding.message
             // , (bullet1[level]==' '?BASE.symbol+BASE.symbol:' ' + bullet1[level])
                , context
                , (level=='log'?'Log':level)
                , padding.level
                , time
                , stacktrace
                );
            }

        }

    switch (level) {
        case 'warn':
        case 'err':
        case 'error':
        case 'fail': return new Error(message, context, level)
            // return (function(message.join('\n'), context, level){
            //     message = message.join('\n')
            //     var err = new Error(message, context, level);
            //     err.message = err.msg = message;
            //     return err;
            //     })(message, context, level);
        case 'logtxt':
        case 'errtxt': return message.join('\n');
        default: return null;
        }
    }

Unclog.call(Unclog, '');
utils.merge(Unclog.prototype, Unclog);

function logtofile() {
    // fs.appendFile('.log', [].slice.call(arguments).join(' '), function(err) {});
    fs.appendFile('.log', '\n======================\n');
    // fs.appendFile('.log', util.inspect(arguments ,{showHidden:false,depth:null}));
    // fs.appendFile('.log', util.inspect(arguments['0'] ,{showHidden:false,depth:null}));
    // fs.appendFile('.log', '----------------------');
    fs.appendFile('.log', util.inspect(arguments['1']['0'] ,{showHidden:false,depth:null}));
    fs.appendFile('.log', '\n======================\n');
    // console.log('======================');
    // console.log(arguments);
    // console.log('----------------------');
    // console.log([].slice.call(arguments));
    // console.log('----------------------');
    // console.log([].slice.call(arguments).join(' '));
    // console.log('======================');

}

module.exports = Unclog;


// process.on('SIGINT', function() {
//     console.log('Received Signal');
//     setTimeout(function() {
//         console.log('Exit');
//         process.exit(1);
//     }, 10000);
// });
