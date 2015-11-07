var Console = console;
var defaults = require('./defaults'),
    config = defaults;
var clc = require('cli-color');
var getMessage = require('./get-message');
var getContext = require('./get-context');


function getConsole(options) {
    var c = this;
    c.log   = ::Console.log;
    c.trace = ::Console.trace;
    c.time  = ::Console.time;
    c.timeEnd = ::Console.timeEnd;
    var o             = merge({}, options, defaults);
    c.plain           = getLogger(extend({                    plain: true, }, o));
    c.stdout          = getLogger(extend({      stdout: true, color: true, }, o));
    c.stdout.plain    = getLogger(extend({      stdout: true, plain: true, }, o));
    c.plain.stdout    = c.stdout.plain;
    for (let l in o.levels)(function(l) {
    c[l]              = getLogger(extend({l: l,               color: true, }, o));
    c.plain[l]        = getLogger(extend({l: l,               plain: true, }, o));
    c.stdout[l]       = getLogger(extend({l: l, stdout: true, color: true, }, o));
    c.plain.stdout[l] = getLogger(extend({l: l, stdout: true, plain: true, }, o));
    c.stdout.plain[l] = c.plain.stdout[l];

    c[l].stdout       = c.stdout[l];
    c[l].plain        = c.plain[l];

    c.stdout[l].plain = c[l].stdout.plain = c.plain[l];
    c.plain[l].stdout = c[l].plain.stdout = c.stdout[l];

    })(l);
};

var lastTime;

function getLogger(o) {
    return function log_(msg_) {
        var log = o.stdout ? process.stdout : Console.log;
        switch (o.level) {
            case 'err':
            case 'warn':
            case 'fail':
                log = o.stdout ? process.stderr : Console.error;
        };
        var msg = getMessage.apply(null, arguments);
        var context = getContext(msg_);
        // var stackTrail = ' \t' + tostr(context.stackTrail || '', 300);
        var stackTrail = context.stackTrail;
        var date = ('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']');
        var bullet = o.levels[o.l||'log'].bullet;

        if(!o.plain && !o.stdout)
            msg = date + bullet + msg + stackTrail;

        (o.stdout ? log.write : log).bind(log)(msg);
        return msg_;
    };
};


module.exports = getConsole;
