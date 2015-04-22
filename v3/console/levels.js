function CreateLevels() {
    var console = this.defaultConsole;
    var self = this;
    var levels = Object.keys(self.levels);
    levels.forEach(function(level) {
        self[level] = function Level() {
            self.output({
                level: level,
                arguments: arguments
            });
        };
    });
    var longest = levels.reduce(function(a, b) {
        return a.length > b.length ? a : b;
    }).length;
    for (level in self.levels)(function(level, length) {
        level.padding = '';
        for (var i = length; i <= longest; i++)
            level.padding += ' ';
    })(self.levels[level], level.length);
    console.log('create padding');
}
module.exports = CreateLevels;
