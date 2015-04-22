var merge = require('merge');

var Merge = module.exports = function Merge() {
    var dests = arguments[0];
    if (!(dests instanceof Array))
        dests = [dests];
    var srcs = [].slice.call(arguments, 1);

    for (var i = 0; i < dests.length; i++)
        for (var j = 0; j < srcs.length; j++)
            for (key in srcs[j])
                if (typeof srcs[j][key] == 'object') {
                    if (!dests[i][key])
                        dests[i][key] = {};
                    if (typeof dests[i][key] == 'object')
                        merge(dests[i][key], srcs[j][key]);
                } else
                    dests[i][key] = srcs[j][key];

}
