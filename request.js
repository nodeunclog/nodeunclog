var config = require('./config');
var onFinished = require('on-finished');
var toShortString = require('to-short-string');
var parseUA = require('ua-parser').parse;

module.exports = function Request(req, res, next) {
    var console = this;
    try {
        // var context = getBaseFilename();
        // It's currently impossible to get actualy filename. so many callbacks, even Error.Infinity doesn't help

        // try {
        //     throw new Error();
        // } catch (err) {
        //     console.error(err);
        //     console.error(err.stack);
        //     console.log('>', getContext(err).stackTrail, '<');
        // }


        var method = req.method.toUpperCase();
        var url = req.url;
        var ip = (req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress));
        var useragent = '(' + parseUA(req.headers['user-agent']).ua.toString() + ')';
        var logTimeout = setTimeout(log, config.requestTimeout);
        onFinished(res, log);
        return next();

        function log() {
            clearTimeout(logTimeout);
            if (res.statusCode == 304) return;
            var status = '[' + (res._header ? (res.statusCode || '???') : ('timeout:' + (parseInt(config.requestTimeout / 1000)) + 's')) + ']';
            // Unclog(ip || method || UnclogRequest.context || method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, toShortString(useragent, 10, 10));
            console[(
                (!res._header || !res.statusCode) ||
                (res.statusCode > 400) ||
                (isNaN(res.statusCode))
            ) ? 'error' : 'verbose'](
                method, status, url, '|',
                ip, toShortString(useragent, 10, 10), '|',
                new Date().toISOString()
            );
        }
    } catch (err) {
        console.err(err)
    }
}
