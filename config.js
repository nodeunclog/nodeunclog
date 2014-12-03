var config = {};

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
var maxContentWidth = 133;
var separationFractionOfContentAndExtras = 2 / 3;

function width() {
    var width = (maxContentWidth / separationFractionOfContentAndExtras);
    if (process.stdout.columns && process.stdout.columns <= (maxContentWidth / separationFractionOfContentAndExtras))
        width = process.stdout.columns;
    return width - 4;
}
config.width = width();
config.contentWidth = config.width * separationFractionOfContentAndExtras;
config.extraWidth = config.width * (1 - separationFractionOfContentAndExtras);

// ignore
config.ignore = [
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

config.paddingDelimiter = '_';

// backtrace
config.backtrace = false;

module.exports = config;
