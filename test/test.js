var assert = require('assert');
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
    var info = log.modules['base/index.js'];
    assert.equal(info.dependencies.join(','), ['base/bob.js', 'base/boc.js', 'base/package.json'].join(','));
    assert.equal(log.modules['base/index.js'].destHash, 'a5468dc2f3d9dfefeea287114779c369');
  });

  it('排除', function() {
    var info = log.modules['foo/index.js'];
    assert.equal(info.dependencies.join(','), ['base/index.js', 'core/index.js', 'foo/fob.js', 'foo/package.json'].join(','));
    assert.equal(info.destHash, 'd03c57b55ad6a2daf9d2cf9327606ad3');
  });
});
