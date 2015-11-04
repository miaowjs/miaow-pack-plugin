var _ = require('lodash');
var async = require('async');

module.exports = function(options, compilation, packList, callback) {
  var modules = compilation.modules;

  // 获取依赖的所有AMD模块
  function getDependencies(src) {
    // 调试模式，不递归打包依赖
    if (options.debug) {
      return [src];
    }

    var module = _.find(modules, {src: src});
    var dependencies = module.extra.AMDDependencies || [];

    return [dependencies, dependencies.map(getDependencies), src];
  }

  async.each(packList, function(config, callback) {
    var module = _.find(modules, {src: config.name});

    var include = _.uniq(_.flatten(config.include.concat(config.name).map(function(src) {
      return getDependencies(src);
    }), true));

    var exclude = _.uniq(_.flatten(config.exclude.map(function(src) {
      return getDependencies(src);
    }), true));

    // 排除不需要打包的
    include = _.difference(include, exclude);

    var contents = Buffer.concat(include.map(function(src) {
      return Buffer.concat([_.find(modules, {src: src}).contents, new Buffer('\n')]);
    }));

    // 生成文件
    compilation.emitFile(module.dest, contents, module.charset || 'utf-8', callback);
  }, callback);
};
