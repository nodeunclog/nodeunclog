module.exports = getMessage;

var tostr = require('smallilies').tostr;

var util = require('util');

function getMessage() {
    return util.format.apply(util, arguments);
};
