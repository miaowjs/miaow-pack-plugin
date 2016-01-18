var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var glob = require('glob');
var mutil = require('miaow-util');
var path = require('path');

function readConfig(context, file, callback) {
  file = mutil.relative('', file);

  fs.readFile(
    path.resolve(context, file),
    {
      encoding: 'utf-8'
    },
    function(err, data) {
      if (err) {
        return callback(err);
      }

      var configList;

      try {
        var pack = JSON.parse(data).pack || [];
        pack = _.isArray(pack) ? pack : [pack];

        configList = _.map(pack, function(item) {
          return {
            name: mutil.relative('', path.join(path.dirname(file), item.name)),
            include: item.include || [],
            exclude: item.exclude || [],
            pkg: file
          };
        });

      } catch (err) {
        return callback(new Error('解析包信息出错：' + file));
      }

      callback(null, configList);
    });
}

module.exports = function(compilation, callback) {
  glob('**/package.json', {
    cwd: compilation.context,
    exclude: compilation.exclude,
    nodir: true
  }, function(err, files) {
    if (err) {
      return callback(err);
    }

    async.map(files, _.partial(readConfig, compilation.context), function(err, configList) {
      callback(err, _.flatten(configList || []));
    });
  });
};
