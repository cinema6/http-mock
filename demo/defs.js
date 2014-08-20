module.exports = function(httpMock) {
    httpMock.whenGET('/api/foo/bar')
        .proxy('mocks/foo.json');

    httpMock.whenGET('/api/test')
        .respond(200, {
            name: 'Josh'
        });

    httpMock.whenGET('/api/dynamic', function() {
        this.respond(200, 'Hello');
    });

    httpMock.when('GET', '/api/cool')
        .respond(200, {
            company: 'cinema6'
        });

    httpMock.whenPOST('/api/hello', function(request) {
        this.respond(200, 'OKAY');
    });

    httpMock.whenGET('/api/josh/**')
        .respond(200, 'That\'s neat.');

    httpMock.whenGET('/api/headers')
        .respond(200, 'I know you don\'t care about me...')
        .setHeaders({
            'Cache-Control': 'max-age=30'
        });
};
