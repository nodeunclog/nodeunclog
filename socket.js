var console = require('./');

var URL = require('url');
var UAparser = require('ua-parser').parse;
var toShortString = require('to-short-string');

var socketIoEventsRouter = require('socket.io-events');

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


    var router = socketIoEventsRouter();


    log('Connection');

    socket.on('disconnect', function() {
        log('Disconnect');
    });
    socket.on('reconnect', function() {
        log('Reconnect');
    });

    router.on(function(socket, args, next) {
        var name = args[0],
            msg = args[1];
        log('on(\'' + name + '\') ' + toShortString(msg, 40, 10));
        next();
    });

    var emit = socket.emit;
    socket.emit = function emitIntercept(name, msg) {
        log('emit(\'' + name + '\') ' + toShortString(msg, 40, 10));
        emit.apply(socket, arguments);
    }

    function log(msg) {
        console['verbose']('SOCKET', msg, '|', user, '|', referer, '|', ip, useragent);
    }

    router(socket, next);
    // next();
}
