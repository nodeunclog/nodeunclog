var Console = console;
var stackTrace = require('stack-trace');
Error.stackTraceLimit = 20;
// Error.stackTraceLimit = Infinity;
var config = require('./defaults');
var deepIndexOf = require('smallilies').deepIndexOf;

var Path = require('path');

function getContext(err) {
    var err_ = err;
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
        // if(!stacktrace) Console.log(err_);
        for (var j = 0; j < stacktrace.length; j++)
            if (stacktrace[j] && stacktrace[j].fileName && deepIndexOf(stacktrace[j].fileName, config.ignore) == -1)
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
    if (file && deepIndexOf(file, config.ignore) == -1)
        return Path.basename(file, Path.extname(Path.basename(file)));
    else
        return '\b';
}

function getBaseFolderAndFilename(file, additionalInfo) {
    var text = '';
    // additionalInfo = stacktrace[j].lineNumber
    var dirname = Path.dirname(file);
    if (dirname == '.') dirname = '';
    else dirname = dirname.split(Path.sep).reverse()[0];

    // process.stdout.write('dirname:' + Path.dirname(file));
    var filename = getBaseFilename(file);

    text += dirname;
    if (!(filename == 'index' || filename == dirname))
        text += (dirname.length ? Path.sep : '') + filename;

    return ' ← ' + text + (additionalInfo ? (':' + (config.backtrace ? '~' : '') + additionalInfo) : '') + '';
}

function getStackTrail(stacktrace, cutoff) {
    if (!stacktrace || !stacktrace.length) return '';
    var stackTrail = '';
    for (var j = 0; j < ((cutoff && cutoff < stacktrace.length) ? cutoff : stacktrace.length); j++)
        if (stacktrace[j] && stacktrace[j].fileName && stacktrace[j].lineNumber)
            if (deepIndexOf(stacktrace[j].fileName, config.ignore) == -1) {
                stackTrail += getBaseFolderAndFilename(stacktrace[j].fileName, stacktrace[j].lineNumber);
                // break;
            }
    return stackTrail;
}



module.exports = getContext;
