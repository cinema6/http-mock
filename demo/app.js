(function() {
    'use strict';

    var connect = require('connect'),
        http = require('http'),
        mockHttp = require('../src/index');

    var app = connect()
        .use(mockHttp({
            '/api': 'defs.js'
        }));

    http.createServer(app).listen(9000);
}());
