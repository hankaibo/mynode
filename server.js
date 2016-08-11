'use strict';

/**
 * 当执行 npm start 时的主文件，负责启动模块，配置和路由。
 */

/**
 * 模块依赖
 */
require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
const connection = connect();

/**
 * 导出
 */
module.exports = {
  app,
  connection
}

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen() {
  if (app.get('env') === 'test') {
    return;
  }
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  var options = {
    server: { socketOptions: { keepAlive: 1 } }
  };
  var connection = mongoose.connect(config.db, options).connection;
  return connection;
}

