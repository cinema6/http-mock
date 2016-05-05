var Q = require('q'),
    url = require('url'),
    minimatch = require('minimatch'),
    random = require('lodash/random');

var Responder = require('./responder');

function HTTPMock(route, options) {
    this.namespace = route;

    this.responders = [];
    this.verbosity = typeof options.verbosity === 'number' ? options.verbosity : Infinity;
    this.delay = (function(delay) {
        if (delay instanceof Array) {
            return delay;
        }

        if (typeof delay === 'number') {
            return [delay, delay];
        }

        return [250, 500];
    }(options.delay));
}
HTTPMock.prototype = {
    when: function(method, url, handler) {
        return this.responders[
            this.responders.push(new Responder(method, url, handler)) - 1
        ];
    },
    handle: function(req, res) {
        var verbosity = this.verbosity,
            delay = random(this.delay[0], this.delay[1]),
            requestUrl = url.parse(req.url, true),
            path = requestUrl.pathname,
            responder = this.responders.find(function(responder) {
                return req.method === responder.method &&
                    minimatch(path, responder.url);
            });

        function fail(message) {
            res.statusCode = 500;
            if (verbosity > 0) { console.log(message.error); }
            return res.end(message);
        }

        if (verbosity > 0) { console.log(('Handling [' + req.method + '] to "' + path + '".').title); }

        req.query = requestUrl.query;
        req.pathname = path;

        if (!responder || !(responder.dynamicFn(req) || responder.response)) {
            return fail(
                'There is no response defined for a [' + req.method + '] on "' + path + '".'
            );
        }

        if (verbosity > 1) {
            console.log([
                'Matched route [' + req.method + '] "' + path + ' to response handler ',
                'with URL "' + responder.url + '".'
            ].join('').success);
        }
        Object.keys(responder.headers)
            .forEach(function(name) {
                res.setHeader(name, this[name]);
            }, responder.headers);

        if (verbosity > 1) {
            console.log('Delaying ' + delay + 'ms.');
        }

        return Q.when(responder.response.data)
            .delay(delay)
            .then(function end(_data) {
                var data = typeof _data === 'string' || _data instanceof Buffer ?
                    _data : JSON.stringify(_data, null, '    ');

                if (typeof _data === 'object') {
                    res.setHeader('Content-Type', 'application/json');
                }

                res.statusCode = responder.response.code;
                if (verbosity > 2) {
                    console.log([
                        'Sending response to client: [' + res.statusCode + '] ',
                        JSON.stringify(responder.headers, null, '  '),
                        data
                    ].join('\n').success);
                }
                return res.end(data);
            })
            .catch(function fatal(error) {
                return fail('Fatal Error: ' + error);
            });
    }
};
['GET', 'POST', 'PUT', 'DELETE'].forEach(function(verb) {
    HTTPMock.prototype['when' + verb] = function() {
        var args = Array.from(arguments);

        return this.when.apply(this, [verb].concat(args));
    };
});

module.exports = HTTPMock;
