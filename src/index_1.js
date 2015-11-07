module.exports = Unclog;

function Unclog(options) {
    if (!(this instanceof Unclog))
        return new Unclog(options);
    init(options);
};

init.bind(Unclog)(require('./defaults'));

function init(options) {
    // var UnclogConsole =
    require('./UnclogConsole')(options, this);
    // for (key in UnclogConsole)
    //     (this.prototype || this)[key] = (this || this.prototype)[key] = UnclogConsole[key];
};


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
Unclog.prototype.globalize = Unclog.globalize = UnclogGlobal;
Unclog.prototype.replace = Unclog.replace = UnclogGlobal;
