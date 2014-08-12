var Q = require('q'),
    url = require('url'),
    minimatch = require('minimatch');

var Responder = require('./responder');

function HTTPMock(route) {
    this.namespace = route;

    this.responders = [];
}
HTTPMock.prototype = {
    when: function(method, url, handler) {
        return this.responders[
            this.responders.push(new Responder(method, url, handler)) - 1
        ];
    },
    handle: function(req, res) {
        var requestUrl = url.parse(req.url, true),
            path = requestUrl.pathname,
            responder = this.responders.find(function(responder) {
                return req.method === responder.method &&
                    minimatch(path, responder.url);
            });

        req.query = requestUrl.query;
        req.pathname = path;

        if (!responder || !(responder.dynamicFn(req) || responder.response)) {
            res.statusCode = 500;
            return res.end(
                'There is no response defined for a ' + req.method + ' on ' + path + '.'
            );
        }

        return Q.when(responder.response.data)
            .then(function end(_data) {
                var data = typeof _data === 'string' || _data instanceof Buffer ?
                    _data : JSON.stringify(_data, null, '    ');

                res.statusCode = responder.response.code;
                return res.end(data);
            })
            .catch(function fail(error) {
                req.statusCode = 500;
                return res.end('Fatal Error: ' + error);
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
