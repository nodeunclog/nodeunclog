var output = module.exports = function output(options) {
    var console = this.defaultConsole;
    var message = this.composeMessage(options.level, options.arguments);
    console[console[level] ? level : 'log'].call(this, message);
}
