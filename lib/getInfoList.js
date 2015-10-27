var async = require('async');
var fs = require('fs');
var glob = require('glob');
var mutil = require('miaow-util');
var path = require('path');

module.exports = function(compilation, callback) {
  glob('**/package.json', {
    cwd: compilation.context,
    exclude: compilation.exclude,
    nodir: true
  }, function(err, files) {
    if (err) {
      return callback(err);
    }

    async.map(files, function(file, callback) {
      file = mutil.relative('', file);

      fs.readFile(
        path.resolve(compilation.context, file),
        {encoding: 'utf-8'},
        function(err, data) {
          if (err) {
            callback(err);
          }

          try {
            data = JSON.parse(data);
          } catch (err) {
            return callback(new Error('解析包信息出错：' + file));
          }

          callback(null, {
            file: file,
            data: data
          });
        });
    }, callback);
  });
};
