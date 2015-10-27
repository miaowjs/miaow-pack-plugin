var _ = require('lodash');
var async = require('async');
var mutil = require('miaow-util');

var getInfoList = require('./lib/getInfoList');
var processInfoList = require('./lib/processInfoList');
var pack = require('./lib/pack');

function Pack() {
}

Pack.prototype.apply = function(compiler) {
  compiler.plugin('compile-success', this.pack.bind(this));
};

Pack.prototype.pack = function(compilation, callback) {
  mutil.console.log('打包模块');
  async.waterfall([
    _.partial(getInfoList, compilation),
    _.partial(processInfoList, compilation),
    _.partial(pack, compilation)
  ], callback);
};

module.exports = Pack;
