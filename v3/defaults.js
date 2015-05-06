var config = {};

config.levels = {};

config.levels.silly = {};
config.levels.verbose = {};
config.levels.log = {};
config.levels.info = {};
config.levels.pass = {};
config.levels.start = {};
config.levels.end = {};
config.levels.warn = {};
config.levels.err = {};
config.levels.fail = {};
config.levels.debug = {};

config.levels.silly.  bullet = '☺';
config.levels.verbose.bullet = ' ';
config.levels.log.    bullet = ' ';
config.levels.info.   bullet = '►';
config.levels.pass.   bullet = '√';
config.levels.start.  bullet = '▼';
config.levels.end.    bullet = '■';
config.levels.warn.   bullet = '₩';
config.levels.err.    bullet = '█';
config.levels.fail.   bullet = '×';
config.levels.debug.  bullet = '●';

config.levels.silly.  color = 'rainbow';
config.levels.verbose.color = 'blackBright';
config.levels.log.    color = 'black';
config.levels.info.   color = 'magentaBright';
config.levels.pass.   color = 'greenBright';
config.levels.start.  color = 'magentaBright';
config.levels.end.    color = 'red';
config.levels.warn.   color = 'yellow';
config.levels.err.    color = 'redBright';
config.levels.fail.   color = 'redBright';
config.levels.debug.  color = 'yellowBright';




// color
function color() {
    if (process.env.color)
        return true;
    if (process.env.colors)
        return true;
    if (process.env.nocolor)
        return false;
    if (process.env.nocolors)
        return false;
    if (process.env['no-color'])
        return false;
    if (process.env['no-colors'])
        return false;
    return true;
}
config.color = color();

// width
var thresholdContentWidth = config.thresholdContentWidth = 161;
var maxContentWidth = config.maxContentWidth = 150;
if (!isNaN(parseInt(process.env.unclogMaxContentWidth)))
    maxContentWidth = parseInt(process.env.unclogMaxContentWidth);
var separationFractionOfContentAndExtras = 2 / 3;

function width() {
    var width = (maxContentWidth / separationFractionOfContentAndExtras);
    try {
        // console.debug('process.stdout.columns:', process.stdout.columns);
        if (process.stdout.columns <= width)
            width = process.stdout.columns;
    } catch (err) {}
    return width - 10;
}
config.width = width();
if (!isNaN(parseInt(process.env.unclogWidth)))
    config.width = thresholdContentWidth = config.thresholdContentWidth = parseInt(process.env.unclogWidth);
config.contentWidth = config.width * separationFractionOfContentAndExtras;
config.extraWidth = config.width * (1 - separationFractionOfContentAndExtras);

// ignore
config.ignore = [
    'mongodb',
    'connect-mongo',
    'fs.js',
    'url.js',
    'authenticator',
    'express',
    'domain.js',
    '_stream_readable.js',
    '_http_client.js',
    '<anonymous>',
    'timers.js',
    '_stream_writable.js',
    'http.js',
    'module.js',
    'node.js',
    'net.js',
    'events.js',
    'child_process.js',
    'cluster.js',
    'node_modules',
    'unclog',
];

config.paddingDelimiter = '…';

// backtrace
config.backtrace = false;


config.requestTimeout = 30 * 1000;

module.exports = config;
