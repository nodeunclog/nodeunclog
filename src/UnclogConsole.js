module.exports = UnclogConsole;

var Console = console;
var defaults = require('./defaults');
var extend = require('smallilies/extend');
var color = require('cli-color');
var processMessageString = require('./process-message-string');

function UnclogConsole(options, UnclogConsole) {
    // UnclogConsole = UnclogConsole || {};
    var o = extend(true, options, defaults);
    Object.keys(o.levels).forEach(function(l) {
        // (this.prototype || this)[key] = (this || this.prototype)[key]
        (UnclogConsole.prototype || UnclogConsole)[l] = (UnclogConsole || UnclogConsole.prototype)[l] = function() {
            var log = Console[l] || Console.log;
            switch (l) {
                case 'err':
                case 'warn':
                case 'fail':
                    log = Console.error
            };

            // Main logging Area
            var msg = processMessageString.apply(null, arguments);
            // log(msg);
            log(color[o.levels[l].color](o.levels[l].bullet, msg));
            return msg;
        };
        ((UnclogConsole.prototype || UnclogConsole)[l]).valueOf = ((UnclogConsole || UnclogConsole.prototype)[l]).valueOf = function() {
            return UnclogConsole.prototype || UnclogConsole;
        };
    });
    Object.keys(o.levels).forEach(function(l) {
        UnclogConsole[l][l] = UnclogConsole[l];
    });

    return UnclogConsole;
};
