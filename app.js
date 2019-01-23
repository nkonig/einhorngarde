var createError = require('http-errors');
var express = require('express');
var fileUpload = require('express-fileupload');
var expressWinston = require('express-winston');
var winston = require('winston');
var session = require('express-session');

var path = require('path');
var cookieParser = require('cookie-parser');

const config = require('./config/config.js');

var indexRouter   = require('./routes/index');
var usersRouter   = require('./routes/users');
var selectRouter  = require('./routes/selection');
var trasuryRouter = require('./routes/treasury');
var warroomRouter = require('./routes/warrom');

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');

var mongoDB = global.gConfig.database;
/*
var mongoDB = 'mongodb://root:einhorngarde123@ds245022.mlab.com:45022/einhorngarde';
if(process.env.DEV) {
  mongoDB = 'mongodb://root:einhorngarde123@ds115543.mlab.com:15543/einhorngarde_dev';
}
*/

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var hbs = require('hbs');
//hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname +  '/views/partials');
hbs.registerHelper('each', function(context, options) {
  var ret = "";

  for(var i=0, j=context.length; i<j; i++) {
    ret = ret + options.fn(context[i]);
  }

  return ret;
});
hbs.registerHelper('ifEquals', function(a, b, options) {
  //console.log("HBS Helber Equals - a: " + a + " | b: " + b);
  if (String(a) === String(b)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('ifNotEquals', function(a, b, options) {
  //console.log("HBS Helber Equals - a: " + a + " | b: " + b);
  if (String(a) === String(b)) {
    return options.inverse(this);
  }
  return options.fn(this);
});

hbs.registerHelper( 'eachInMap', function ( map, block ) {
  var out = '';
  var mapKeys = Array.from(map.keys());
  mapKeys.map(function( prop ) {
     out += block.fn( {key: prop, value: map.get(prop)} );
  });
  return out;
} );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({secret: 'hoppe hoppe reiter',
                 name: 'einhornkecks',
                 resave: true,
                 saveUninitialized: true,
                 cookie: { secure: false, 
                           maxAge: 1800000
                         }
                })
);

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'logs/einhornagrde.log',
      maxsize: 262144000
    })
  ],
  statusLevels: false, // default value
  level: function (req, res) {
    var level = "";
    if (res.statusCode >= 100) { level = "silly"; }
    if (res.statusCode >= 400) { level = "warn"; }
    if (res.statusCode >= 500) { level = "error"; }
    // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
    if (res.statusCode == 401 || res.statusCode == 403) { level = "error"; }
    // No one should be using the old path, so always warn for those
    if (req.path === "/v1" && level === "info") { level = "warn"; }
    return level;
  }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/selection', selectRouter);
app.use('/treasury', trasuryRouter);
app.use('/warroom', warroomRouter);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'logs/einhornagrde.log',
      maxsize: 262144000
    })
  ],
  statusLevels: false, // default value
  level: function (req, res) {
    var level = "";
    if (res.statusCode >= 100) { level = "silly"; }
    if (res.statusCode >= 400) { level = "warn"; }
    if (res.statusCode >= 500) { level = "error"; }
    // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
    if (res.statusCode == 401 || res.statusCode == 403) { level = "error"; }
    // No one should be using the old path, so always warn for those
    if (req.path === "/v1" && level === "info") { level = "warn"; }
    return level;
  }
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  return res.render('error');
});

module.exports = app;
