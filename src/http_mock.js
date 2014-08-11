var Q = require('q');

var Responder = require('./responder');

function HTTPMock(route) {
    this.namespace = route;

    this.responders = [];
}
HTTPMock.prototype = {
    whenGET: function(url, handler) {
        return this.responders[this.responders.push(new Responder('GET', url, handler)) - 1];
    },
    handle: function(req, res) {
        var responder = this.responders.find(function(responder) {
            return ['method', 'url'].every(function(prop) {
                return req[prop] === responder[prop];
            });
        });

        if (!responder) {
            res.statusCode = 500;
            return res.end(
                'There is no response defined for a ' + req.method + ' on ' + req.url + '.'
            );
        }

        responder.dynamicFn(req);

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

module.exports = HTTPMock;
