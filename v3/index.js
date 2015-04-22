var merge = require('./merge');
var defaults = require('./defaults');
var defaultConsole = console;
var UnclogConsole = require('./console');


function Unclog(options) {

    // if (arguments.length >= 3)
    //     if (arguments[arguments.length - 2].req)
    //         if (arguments[arguments.length - 3].res)
    //             return require('./request').apply(this, arguments);
    // if (arguments.length == 2)
    //     if (arguments[0].nsp)
    //         return require('./socket').apply(this, arguments);

    if(!(this instanceof Unclog))
        return new Unclog(options);
    merge(this, defaults, options);
    this.createLevels();
    // merge(Unclog, this);
    // return Unclog;
};

merge(Unclog.prototype, defaultConsole, UnclogConsole);
merge(Unclog, defaultConsole, UnclogConsole);
Unclog.prototype.defaultConsole = Unclog.defaultConsole = defaultConsole;

merge(Unclog, defaults);
Unclog.createLevels();



var UnclogGlobal =
    Unclog.prototype.global = Unclog.global =
    Unclog.prototype.globalize = Unclog.globalize =
    Unclog.prototype.replace = Unclog.replace =
    function UnclogGlobal(options) {
        options = options || {};
        var unclog = new Unclog(options);
        Object.defineProperty(global, 'console', {
            get: function(){
                return unclog;
            },
            enumerable: true,
            configurable: true
        });
    };


module.exports = Unclog;
