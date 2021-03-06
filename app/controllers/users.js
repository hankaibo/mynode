'use strict';

/**
 * 模块依赖
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond } = require('../utils');
const User = mongoose.model('User');

/**
 * 获取用户
 */
exports.load = async(function* (req, res, next, _id) {
  const criteria = { _id };
  try {
    req.profile = yield User.load({ criteria });
    if (!req.profile) { return next(new Error('User not found')); }
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * 新建用户
 */
exports.create = async(function* (req, res) {
  const user = new User(req.body);
  user.provider = 'local';
  try {
    yield user.save();
    req.logIn(user, err => {
      if (err) { req.flash('info', 'Sorry! We are not able to log you in!'); }
      return res.redirect('/');
    });
  } catch (err) {
    const errors = Object.keys(err.errors)
      .map(field => err.errors[field].message);

    res.render('users/signup', {
      title: 'Sign up',
      errors,
      user
    });
  }
});

/**
 *  显示属性
 */
exports.show = function (req, res) {
  const user = req.profile;
  respond(res, 'users/show', {
    title: user.name,
    user: user
  });
};

exports.signin = function () { };

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * 登录
 */
exports.login = function (req, res) {
  res.render('users/login', {
    title: '登录'
  });
};

/**
 * 注册
 */
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: '注册',
    user: new User()
  });
};

/**
 * 登出
 */
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */
exports.session = login;

/**
 * 登录方法
 */
function login(req, res) {
  const redirectTo = req.session.returnTo
    ? req.session.returnTo
    : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}
