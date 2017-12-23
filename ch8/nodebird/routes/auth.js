const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { User } = require('../models');

const router = express.Router();

router.post('/join', async (req, res, next) => {
  const { email, nick, password } = req.body;
  console.log(email, nick, password);
  try {
    const exUser = await User.find({ where: { email } });
    console.log(exUser);
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
      return res.redirect('/join');
    } else {
      const hash = await bcrypt.hash(password, 10);
      const result = await User.create({
        email,
        nick,
        password: hash,
      });
      return res.redirect('/');
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/');
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

module.exports = router;