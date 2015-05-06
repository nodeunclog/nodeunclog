module.exports = UnclogConsole;

var defaultConsole = console;
var defaults = require('./defaults');

var extend = require('smallilies/extend');

function UnclogConsole(options) {
    var UnclogConsole = {};
    options = extend(true, options, defaults);
    Object.keys(options.levels).forEach(function(level) {
        UnclogConsole[level] = function(msg) {
            var log = defaultConsole[level] || defaultConsole.log;

            // Main logging Area
            log(level, msg);

        };
    });
    return UnclogConsole;
};
