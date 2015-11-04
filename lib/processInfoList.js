var _ = require('lodash');
var async = require('async');
var path = require('path');
var mutil = require('miaow-util');
var console = mutil.console;

module.exports = function(options, compilation, infoList, callback) {
  var packList = [];

  function resolveModule(context, config, key, callback) {
    async.map(config[key], _.partial(compilation.resolveModule, context), function(err, modules) {
      if (err) {
        return callback(err);
      }

      config[key] = modules.map(function(module) {
        return module.src;
      });

      callback();
    });
  }

  function resolveConfig(context, config, callback) {
    config.name = path.join(context, config.name);

    if (!_.find(compilation.modules, {src: config.name})) {
      return callback(new Error('查找不到 ' + config.name + ' 模块'));
    }

    config.include = config.include || [];
    config.exclude = config.exclude || [];

    async.parallel([
      _.partial(resolveModule, path.resolve(compilation.context, context), config, 'include'),
      _.partial(resolveModule, path.resolve(compilation.context, context), config, 'exclude')
    ], callback);
  }

  async.each(
    infoList,
    function(info, callback) {
      var pack = info.data.pack || [];

      if (!_.isArray(pack)) {
        pack = [pack];
      }

      async.each(pack, function(config, callback) {
        resolveConfig(path.dirname(info.file), config, function(err) {
          if (err) {
            console.error('处理 ' + info.file + ' 文件报错');
            return callback(err);
          }

          packList.push(config);
          callback();
        });
      }, callback);
    },

    function(err) {
      if (err) {
        return callback(err);
      }

      packList.forEach(function(config) {
        var exclude = [];
        config.exclude.forEach(function(src) {
          exclude.push(src);

          var excludeConfig = _.find(packList, {name: src});

          if (excludeConfig) {
            exclude = exclude.concat(excludeConfig.include);
          }
        });

        config.exclude = exclude;
      });

      callback(null, packList);
    });
};
