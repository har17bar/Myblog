const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Bring in article model
const User = require('../models/user.js');

router.get('/register', (req, res) => {
  res.render('register', { errors: null });
});

router.post('/register', (req, res) => {
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('name', 'Name must be at least 3 letters').isLength({ min: 3 });
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req
    .checkBody('username', 'Username must be at least 3 letters')
    .isLength({ min: 3 });
  req.checkBody('password', 'Pasword is required').notEmpty();
  // req.checkBody('pasword2', 'Paswords do not match').equals(req.body.password);
  //Get errors
  let errors = req.validationErrors();
  if (errors) {
    console.log('a');
    res.render('register', {
      errors: errors
    });
  } else {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(err => {
          if (err) {
            return console.log(err);
          } else {
            req.flash('success', 'You are now rigistreted and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

//Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

//Login procces
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Log Out
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logout');
  res.redirect('/users/login');
});
module.exports = router;
