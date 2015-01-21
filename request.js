var console = require('./');
var config = require('./config');
var onFinished = require('on-finished');
var toShortString = require('to-short-string');
var parseUA = require('ua-parser').parse;

module.exports = function Request(req, res, next) {
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


        onFinished(res, function() {
            // So that if an onFinished is also used in application,
            // this onFinished will execute after that.
            onFinished(res, log);
        });
        return next();

        function log() {
            var url = req.url;
            try {
                var method = req.method.toUpperCase();
            } catch (err) {}
            try {
                var info = '(' + toShortString(req.info, 20) + ')';
            } catch (err) {}
            try {
                var ip = (req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress));
            } catch (err) {}
            try {
                var useragent = '(' + toShortString(parseUA(req.headers['user-agent']).ua.toString(), 20) + ')';
            } catch (err) {}
            var logTimeout = setTimeout(log, config.requestTimeout);

            clearTimeout(logTimeout);
            if (res.statusCode == 304) return;
            var status = '[' + (res._header ? (res.statusCode || '???') : ('timeout:' + (parseInt(config.requestTimeout / 1000)) + 's')) + ']';
            // Unclog(ip || method || UnclogRequest.context || method)[res.statusCode > 400 ? 'error' : 'verbose'](method, url, status, '|', ip, toShortString(useragent, 10, 10));

            var level = 'verbose';
            switch (true) {
                case (!res._header):
                case (!res.statusCode):
                case (res.statusCode > 400):
                case (isNaN(res.statusCode)):
                    level = 'error';
            }

            var message = '';
            if (method) message += method + ' ';
            if (status) message += status + ' ';
            if (url) message += url;
            if (info) message += ' ' + info;
            message += ' | ';
            if (ip) message += ip + ' ';
            if (useragent) message += useragent;

            console[level](message);
        }
    } catch (err) {
        console.err(err)
    }
}
