var path = require('path'),
    fs = require('fs'),
    Q = require('q');

var readFile = Q.denodeify(fs.readFile);

function Responder(method, url, dynamicFn) {
    this.method = method;
    this.url = url;

    this.dynamicFn = dynamicFn || function() {};
    this.response = null;
}
Responder.prototype = {
    proxy: function(_src) {
        var src = path.resolve(process.cwd(), _src);

        return this.respond(200, readFile(src));
    },
    respond: function(code, data) {
        return (this.response = {
            code: code,
            data: data
        });
    }
};

module.exports = Responder;
