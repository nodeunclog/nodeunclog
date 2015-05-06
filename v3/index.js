module.exports = Unclog;

function Unclog(options) {
    if (!(this instanceof Unclog))
        return new Unclog(options);
    init(options);
};

init.bind(Unclog)(require('./defaults'));

function init(options) {
    var UnclogConsole = require('./UnclogConsole')(options);
    for (key in UnclogConsole)
        this[key] = (this.prototype || this)[key] = UnclogConsole[key];
}

var UnclogGlobal =
    Unclog.prototype.global = Unclog.global =
    Unclog.prototype.globalize = Unclog.globalize =
    Unclog.prototype.replace = Unclog.replace =
    function UnclogGlobal(options) {
        var Console = new Unclog(options);
        Object.defineProperty(global, 'console', {
            get: function() {
                return Console;
            },
            configurable: true,
        });
        return Console;
    };
