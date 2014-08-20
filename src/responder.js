var path = require('path'),
    fs = require('fs'),
    Q = require('q');

var readFile = Q.denodeify(fs.readFile);

function copy(object) {
    return Object.keys(object)
        .reduce(function(result, prop) {
            result[prop] = object[prop];

            return result;
        }, {});
}

function Responder(method, url, dynamicFn) {
    this.method = method;
    this.url = url;

    this.dynamicFn = dynamicFn || function() {};
    this.response = null;
    this.headers = {};
}
Responder.prototype = {
    proxy: function(_src) {
        var src = path.resolve(process.cwd(), _src);

        return this.respond(200, readFile(src));
    },
    respond: function(code, data) {
        this.response = {
            code: code,
            data: data
        };

        return this;
    },
    setHeaders: function(headers) {
        this.headers = copy(headers);

        return this;
    }
};

module.exports = Responder;
