require('array.prototype.find');

module.exports = function(config) {
    'use strict';

    var path = require('path'),
        escapeRegExp = require('escape-regexp');

    var HTTPMock = require('./http_mock');

    var handlers = Object.keys(config)
        .map(function(route) {
            var defs = require(path.resolve(process.cwd(), config[route])),
                httpMock = new HTTPMock(route);

            defs(httpMock);

            return httpMock;
        });

    return function(req, res, next) {
        var httpMock = handlers.find(function(httpMock) {
            return (new RegExp('^' + escapeRegExp(httpMock.namespace))).test(req.url);
        });

        if (!httpMock) {
            return next();
        }

        return httpMock.handle(req, res);
    };
};
