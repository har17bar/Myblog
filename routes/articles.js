const express = require('express');
const router = express.Router();

//Article Model
const Articles = require('../models/article.js');

//User Model
const User = require('../models/user.js');

//Add route GET
router.get('/add', checkifAuthenticated, (req, res) => {
  res.render('add_artucle', { desc: 'Add article', errors: null });
});

//ADD route POST Submit
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  //  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();
  //Get errors
  let errors = req.validationErrors();
  if (errors) {
    res.render('add_artucle', {
      errors: errors,
      desc: 'Add article'
    });
  } else {
    let article = new Articles();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.save(function(err) {
      if (err) return console.log(err);
      req.flash('success', 'Articule added');
      res.redirect('/');
    });
  }
});

//Edit route GET
router.get('/edit/:id', checkifAuthenticated, (req, res) => {
  Articles.findById(req.params.id, (err, article) => {
    if (err) return console.log(err);
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Autorized');
      return res.redirect('/');
    }
    res.render('edit_article', { article, desc: 'Edit article', errors: null });
  });
});

//Edit route POST Submit
router.post('/edit/:id', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();
  //Get errors
  let errors = req.validationErrors();
  if (errors) {
    Articles.findById(req.params.id, (err, article) => {
      if (err) return console.log(err);
      res.render('edit_article', {
        article,
        desc: 'Edit article',
        errors: errors
      });
    });
  } else {
    let article = {};
    let query = { _id: req.params.id };
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    Articles.updateOne(query, article, err => {
      if (err) return console.log(err);
      req.flash('success', 'Articule updated');
      res.redirect('/');
    });
  }
});

//Delete article
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };
  Articles.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Articles.deleteOne(query, err => {
        if (err) {
          return console.log(err);
        }
        res.send('succsess');
      });
    }
  });
});

//Get single article
router.get('/:id', (req, res) => {
  Articles.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', { article: article, author: user.name });
    });
  });
});

//Access control

function checkifAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('danger', 'Please login');
  res.redirect('/users/login');
}

module.exports = router;
