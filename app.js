const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const config = require('./config/database');
mongoose.connect(
  config.database,
  { useNewUrlParser: true }
);

const db = mongoose.connection;
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const expressMessages = require('express-messages');

//Init app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//check connection
db.once('open', err => {
  console.log('conected to mongodb');
});

//check db errors
db.on('error', err => {
  console.log(err);
});

//Bring in models
const Articles = require('./models/article.js');

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Express-session middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  })
);

//Expres Messages Middlware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
});

//Express validator Middlware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

//Passport config
require('./config/passport')(passport);

//Passport Midleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || 0;
  next();
});

//Home route
app.get('/', (req, res) => {
  Articles.find({}, (err, articles) => {
    if (err) {
      return console.log(`request to articles go erreor :${err}`);
    }
    res.render('index', {
      articles: articles,
      desc: 'Articles'
    });
  });
});

//Route Files
let articles = require('./routes/articles');
let user = require('./routes/users');

app.use('/articles', articles);
app.use('/users', user);

//App port
const port = 8888;

//Start server
app.listen(port, () => {
  console.log(`server is runing in port ${port}`);
});
