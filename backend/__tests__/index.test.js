const request = require('supertest');

describe('Test Express Server', () => {
    let server;

    beforeAll(() => {
        server = require('../index');
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should start server on the correct port', (done) => {
        request(server)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(404);
                done();
            });
    });
});
