var processEnv = {};

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
processEnv.color = color();

// width
function width() {
    if (process.stdout.columns)
        return process.stdout.columns;
    return 150;
}
processEnv.width = width();

// ignore
processEnv.ignore = [
    // 'fs.js',
    // 'authenticator',
    // 'express',
    // 'domain.js',
    // '_stream_readable.js',
    // '<anonymous>',
    // 'timers.js',
    // '_stream_writable.js',
    // 'http.js',
    // 'module.js',
    // 'node.js',
    // 'net.js',
    // 'events.js',
    // 'node_modules',
    // 'unclog',
    'nodeunclog',
];

// backtrace
processEnv.backtrace = false;

module.exports = processEnv;
