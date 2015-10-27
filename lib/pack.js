var _ = require('lodash');
var async = require('async');

module.exports = function(compilation, packList, callback) {
  var modules = compilation.modules;

  // 获取依赖的所有AMD模块
  function getDependencies(src) {
    var module = _.find(modules, {src: src});
    var dependencies = module.extra.AMDDependencies || [];

    return _.flatten([dependencies, dependencies.map(getDependencies), src], true);
  }

  async.each(packList, function(config, callback) {
    var module = _.find(modules, {src: config.name});

    var include = _.flatten(config.include.concat(config.name).map(function(src) {
      return getDependencies(src);
    }), true);

    var exclude = _.flatten(config.exclude.map(function(src) {
      return getDependencies(src);
    }), true);

    // 排除不需要打包的
    include = _.uniq(_.difference(include, exclude));

    var contents = Buffer.concat(include.map(function(src) {
      return _.find(modules, {src: src}).contents;
    }));

    // 生成文件
    compilation.emitFile(module.dest, contents, module.charset || 'utf-8', callback);
  }, callback);
};
