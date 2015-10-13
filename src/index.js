require('array.prototype.find');
require('array.from');
require('colors').setTheme({
    success: 'green',
    error: 'red',
    warn: 'orange',
    title: ['underline', 'blue', 'bold']
});

module.exports = function(config) {
    'use strict';

    var path = require('path'),
        escapeRegExp = require('escape-regexp'),
        bodyParser = require('body-parser');

    var HTTPMock = require('./http_mock');

    return function(req, res, next) {
        var handlers = Object.keys(config)
            .filter(function(key) { return !(/^@/).test(key); })
            .map(function(route) {
                var defsPath = path.resolve(process.cwd(), config[route]),
                    defs = require(defsPath),
                    httpMock = new HTTPMock(route, { verbosity: config['@verbosity'] });

                defs(httpMock);
                // Remove the defs file after every request so the server does not need to be
                // restarted after the mock definitions are modified.
                delete require.cache[defsPath];

                return httpMock;
            }),
            httpMock = handlers.find(function(httpMock) {
                return (new RegExp('^' + escapeRegExp(httpMock.namespace)))
                    .test(req.url);
            });

        if (!httpMock) {
            return next();
        }

        return bodyParser.json()(req, res, function() {
            return httpMock.handle(req, res);
        });
    };
};
