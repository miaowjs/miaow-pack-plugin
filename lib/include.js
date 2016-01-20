var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var pkg = require('../package.json');

function getSrc(module) {return module.src;}

module.exports = function(options, callback) {
  var context = this;
  var config = options.config;

  async.mapSeries(config.include, context.resolveModule.bind(context), function(err, includes) {
    if (err) {
      return callback(err);
    }

    // 添加文件依赖
    includes.forEach(function(module) {
      context.addDependency(module.src);
    });

    // 添加打包描述的依赖
    context.addDependency(config.pkg);

    // 追加额外信息
    context.extra.pack = {
      include: includes.map(getSrc),
      exclude: config.exclude
    };

    // 追加内容
    if (includes.length > 0) {
      context.contents = Buffer.concat(includes.concat(context).map(function(module) {
        return Buffer.concat([module.contents, new Buffer('\n')]);
      }));
    }

    callback();
  });
};

module.exports.toString = function() {
  return [pkg.name + '/include', pkg.version].join('@');
};
