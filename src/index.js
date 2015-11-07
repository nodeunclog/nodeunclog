require('smallilies');

global.Console = console;

var getConsole = require('./get-console');

function Unclog(options) {
    if(typeof options == 'string'){
        var str = options;
        options = {};
        if(str.match('p'))
            options.plain = true;
    }

    if (!(this instanceof Unclog)) return new Unclog(options);

    getConsole.bind(this)(options);
    globalize('console', this);
};

module.exports = Unclog;

globalize('console', new Unclog());
