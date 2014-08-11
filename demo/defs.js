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
};
