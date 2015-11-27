var Pack = require('../..');
var amdParse = require('miaow-amd-parse');
var path = require('path');

module.exports = {
  // 工作目录
  context: __dirname,

  // 输出目录
  output: path.resolve(__dirname, '../output'),

  // 缓存目录
  cache: '',

  // 调试模式
  debug: true,

  // 静态文件的域名
  domain: 'http://127.0.0.1',

  plugins: [new Pack()],

  hashLength: 0,

  // 模块编译设置
  modules: [
    {
      test: '*.js',
      tasks: [
        amdParse
      ]
    }
  ]
};
