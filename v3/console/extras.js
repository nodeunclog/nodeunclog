function CreateExtras(level, message) {
    var console = this.defaultConsole;
    var self = this;

    var extras = {
        pre: '',
        post: '',
    };

    if (this.simple || this.plain || this.noextras)
        return extras;

    // console.log(self.levels[level]);
    var bullet = self.levels[level].bullet || ' ';
    var padding = '';
    extras.pre += bullet;


    extras.pre = self.colorize(level, extras.pre);
    extras.post = self.colorize(level, extras.post, 'dim');

    return extras;
}
module.exports = CreateExtras;
