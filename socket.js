var console = require('./');

var URL = require('url');
var UAparser = require('ua-parser').parse;
var toShortString = require('to-short-string');

module.exports = function Socket(socket, next) {
    var req = socket.request;
    var user = req.user;
    if (user) user = toShortString(user);
    else user = 'Anon';
    if (socket.id)
        user += ' ' + toShortString(socket.id, 4, 2)
    if (socket.request.sessionID)
        user += ':' + toShortString(socket.request.sessionID, 4, 2);

    var url = URL.parse(req.url);
    url = url.host + toShortString(url.path) + toShortString(url.query);

    var referer = URL.parse(req.headers.referer);
    referer = referer.host + toShortString(referer.path) + toShortString(referer.query);

    var ip = (req.headers['x-forwarded-for'] || req.ip || req.address || req._remoteAddress || (req.connection && req.connection.remoteAddress));
    var useragent = '(' + toShortString((UAparser(req.headers['user-agent']).ua.toString()), 10, 10) + ')';

    log('connection');

    socket.on('disconnect', function() {
        log('disconnect');
    });
    socket.on('reconnect', function() {
        log('reconnect');
    });

    function log(msg) {
        console['verbose']('SOCKET', msg, '|', user, '|', referer, '|', ip, useragent);
    }
    next();
}
