function colorize(level, text, dim) {
    var console = this.defaultConsole;
    var color = this.levels[level].color;
    var reset = this.colorReset;
    var dimColor = this.colorDim;

    if (this.nocolor)
        return text;

    text = dim ? dimColor : color + text + reset;

    return text;
}
module.exports = colorize;
