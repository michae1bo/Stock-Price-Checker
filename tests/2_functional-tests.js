const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    let prevLikes;

    test('Test GET with one stock', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, 'likes');
                done();
            })
    })

    test('Test GET with one stock and liking it', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, 'likes');
                prevLikes = res.body.stockData.likes;
                done();
            })
    })

    test('Test GET with one stock and liking it again', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, 'likes');
                assert.equal(res.body.stockData.likes, prevLikes);
                done();
            })
    })

    test('Test GET with two stocks', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.property(res.body.stockData[1], 'price');
                assert.equal(res.body.stockData.length, 2);
                done();
            })
    })

    test('Test GET with two stocks and liking them', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.property(res.body.stockData[1], 'price');
                assert.equal(res.body.stockData.length, 2);
                done();
            })
    })

});
