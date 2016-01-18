var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var pkg = require('../package.json');

function getSrc(module) {return module.src;}

function resolveConfig(resolveModule, config, callback) {
  async.series([
    _.bind(async.mapSeries, async, config.include, resolveModule),
    _.bind(async.mapSeries, async, config.exclude, resolveModule)
  ], function(err, results) {
    if (err) {
      callback(err);
    }

    callback(null, {
      src: config.src,
      include: results[0],
      exclude: results[1],
      pkg: config.pkg
    });
  });
}

module.exports = function(options, callback) {
  var context = this;

  resolveConfig(context.resolveModule.bind(context), options.config, function(err, config) {
    if (err) {
      return callback(err);
    }

    // 添加文件依赖
    config.include.forEach(function(module) {
      context.addDependency(module.src);
    });

    // 添加打包描述的依赖
    context.addDependency(config.pkg);

    // 追加额外信息
    context.extra.pack = {
      include: config.include.map(getSrc),
      exclude: config.exclude.map(getSrc)
    };

    // 追加内容
    if (config.include.length > 0) {
      context.contents = Buffer.concat(config.include.concat(context).map(function(module) {
        return Buffer.concat([module.contents, new Buffer('\n')]);
      }));
    }

    callback();
  });
};

module.exports.toString = function() {
  return [pkg.name + '/include', pkg.version].join('@');
};
