var _ = require('lodash');
var async = require('async');
var mutil = require('miaow-util');
var console = mutil.console;

var getInfoList = require('./lib/getInfoList');
var processInfoList = require('./lib/processInfoList');
var pack = require('./lib/pack');

function Pack(options) {
  this.options = options || {};
}

Pack.prototype.apply = function(compiler) {
  compiler.plugin('compile-success', this.pack.bind(this));
};

Pack.prototype.pack = function(compilation, callback) {
  console.log('合并模块');
  async.waterfall([
    _.partial(getInfoList, this.options, compilation),
    _.partial(processInfoList, this.options, compilation),
    _.partial(pack, this.options, compilation)
  ], function(err) {
    if (err) {
      console.error('合并模块失败');
    }

    callback(err);
  });
};

module.exports = Pack;
