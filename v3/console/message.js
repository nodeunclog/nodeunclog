var util = require('util');
var toShortString = require('to-short-string');

function inspect(message) {
    var self = this;
    if ((typeof message == 'boolean') ||
        (typeof message == 'number') ||
        (typeof message == 'string'))
        return message;
    if (typeof message == 'object')
        return '\n    ' +
            util.inspect(message, {
                showHidden: typeof self.showHidden != 'undefined' ? self.showHidden : false,
                depth: typeof self.depth != 'undefined' ? self.depth : 3,
            })
            .replace(/[\n\r]+/g, '\n    ');
    if (typeof message == 'function')
        return '\n    ' +
            message.toString()
            .replace(/[\n\r]+/g, '\n    ');
}

function ComposeMessage(level, message) {
    var console = this.defaultConsole;
    var self = this;

    var text = '';
    [].slice.call(message).forEach(function(message) {
        text += ' ' + inspect.bind(self)(message);
    });
    message = text;

    message = self.colorize(level, message);

    var extras = self.createExtras(level, message);

    message = extras.pre + message + extras.post;

    return message;
}
module.exports = ComposeMessage;
