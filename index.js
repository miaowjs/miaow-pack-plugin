var _ = require('lodash');
var async = require('async');
var mutil = require('miaow-util');
var console = mutil.console;

var getInfoList = require('./lib/getInfoList');
var processInfoList = require('./lib/processInfoList');
var pack = require('./lib/pack');

function Pack() {
}

Pack.prototype.apply = function(compiler) {
  compiler.plugin('compile-success', this.pack.bind(this));
};

Pack.prototype.pack = function(compilation, callback) {
  console.log('合并模块');
  async.waterfall([
    _.partial(getInfoList, compilation),
    _.partial(processInfoList, compilation),
    _.partial(pack, compilation)
  ], function(err) {
    if (err) {
      console.error('合并模块失败');
    }

    callback(err);
  });
};

module.exports = Pack;
