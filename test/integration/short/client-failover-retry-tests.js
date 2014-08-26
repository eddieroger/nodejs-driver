var assert = require('assert');
var async = require('async');

var helper = require('../../test-helper.js');
var Client = require('../../../lib/client.js');
var types = require('../../../lib/types.js');
var ip = '127.0.0.1';

describe('Client', function () {
  this.timeout(30000);
  describe('#connect()', function () {
    before(helper.ccmHelper.start(3));
    after(helper.ccmHelper.remove);
    it('should discover all hosts in the ring', function (done) {
      var options = {contactPoints: [ip]};
      var client = new Client(options);
      client.connect(function (err) {
        if (err) return done(err);
        assert.strictEqual(client.hosts.length, 3);
        done();
      });
    });
    it('should allow multiple parallel calls', function (done) {
      var options = {contactPoints: [ip]};
      var client = new Client(options);
      async.times(100, function (n, next) {
        client.connect(next);
      }, done);
    });
  });
  describe('#execute()', function () {
    before(helper.ccmHelper.start(2));
    after(helper.ccmHelper.remove);
    it('should execute a basic query', function (done) {
      var options = {contactPoints: [ip]};
      var client = new Client(options);
      client.execute('SELECT * FROM system.schema_keyspaces', function (err, result) {
        assert.equal(err, null);
        assert.notEqual(result, null);
        assert.notEqual(result.rows, null);
        done();
      });
    });
    it('should callback with syntax error', function (done) {
      var options = {contactPoints: [ip]};
      var client = new Client(options);
      client.execute('SELECT WILL FAIL', function (err, result) {
        assert.notEqual(err, null);
        assert.strictEqual(err.code, types.responseErrorCodes.syntaxError);
        assert.equal(result, null);
        done();
      });
    });
  });
});