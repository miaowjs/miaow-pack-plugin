var _ = require('lodash');
var async = require('async');
var path = require('path');

module.exports = function(compilation, callback) {
  var modules = compilation.modules;

  // 获取依赖的所有AMD模块
  function getDependencies(src) {
    var module = modules[src];
    var dependencies = module.extra.AMDDependencies || [];

    return [dependencies, dependencies.map(getDependencies), src];
  }

  async.each(
    _.filter(
      modules,
      function(module) {return module.extra.pack;}
    ),
    function(module, callback) {
      var config = module.extra.pack;
      var resolveModule = compilation.resolveModule.bind(compilation, path.resolve(module.context, module.srcDir));

      async.mapSeries(config.exclude, resolveModule, function(err, excludes) {
        if (err) {
          return callback(err);
        }

        var include = _.uniq(_.flatten(config.include.concat(module.src).map(function(src) {
          return getDependencies(src);
        }), true));

        var exclude = _.uniq(_.flatten(excludes.map(function(excludeModule) {
          var config = excludeModule.extra.pack || { include: [] };
          return config.include.concat(excludeModule.src).map(getDependencies);
        }), true).concat(config.include));

        // 排除不需要打包的
        include = _.difference(include, exclude);

        var contents = Buffer.concat(include.map(function(src) {
          return Buffer.concat([modules[src].contents, new Buffer('\n')]);
        }));

        // 生成文件
        compilation.emitFile(module.dest, contents, module.charset || 'utf-8', callback);
      });
    },

    callback
  );
};
