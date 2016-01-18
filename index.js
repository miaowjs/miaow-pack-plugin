var _ = require('lodash');
var mutil = require('miaow-util');
var console = mutil.console;

var prepare = require('./lib/prepare');
var include = require('./lib/include');
var pack = require('./lib/pack');

function Pack() {
}

Pack.prototype.apply = function(compiler) {
  // 准备操作
  compiler.plugin('compile', function(compilation, callback) {
    prepare(compilation, function(err, configList) {
      if (err) {
        return callback(err);
      }

      compilation.plugin('inject-cache', function(module, cachedModule, callback) {
        // 不对那些缓存失效的模块处理
        if (!cachedModule) {
          return callback();
        }

        var config = _.find(configList, { name: module.src });

        // 如果新增了打包配置, 那缓存就需要失效了
        callback(null, config && _.indexOf(cachedModule.dependencies, config.pkg) === -1);
      });

      compilation.plugin('build-module', function(module, taskContext, callback) {
        var config = _.find(configList, { name: module.src });

        if (!module.cached && config) {
          module.tasks.splice(-1, 0, {
            task: include,
            options: {
              config: config
            }
          });
        }

        callback();
      });

      // 非调试模式，打包依赖
      if (!compilation.debug) {
        // 打包操作
        compiler.plugin('compile-success', function(compilation, callback) {
          console.log('合并模块');
          pack(compilation, function(err) {
            if (err) {
              console.error('合并模块失败');
            }

            callback(err);
          });
        });
      }

      callback();
    });
  });
};

module.exports = Pack;
