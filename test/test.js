var assert = require('assert');
var find = require('lodash.find');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var plugin = require('../index');
describe('miaow-pack-plugin', function() {
  this.timeout(10e3);

  var log;

  before(function(done) {
    miaow({
      context: path.resolve(__dirname, './fixtures')
    }, function(err) {
      if (err) {
        console.error(err.toString(), err.stack);
        process.exit(1);
      }

      log = JSON.parse(fs.readFileSync(path.resolve(__dirname, './output/miaow.log.json')));
      done();
    });
  });

  it('接口是否存在', function() {
    assert(!!plugin);
  });

  it('包含', function() {
    assert.equal(find(log.modules, {src: 'base/index.js'}).destHash, '23e98047388c8d688165597c7edfa86b');
  });

  it('排除', function() {
    assert.equal(find(log.modules, {src: 'foo/index.js'}).destHash, 'd03c57b55ad6a2daf9d2cf9327606ad3');
  });
});
