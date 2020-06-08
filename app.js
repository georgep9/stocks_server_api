var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();

const knexOptions = require('./knexfile.js');
const knex = require('knex')(knexOptions);

const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger.yaml');

const helmet = require('helmet');
const cors = require('cors');

const stocksRouter = require('./routes/stocks');
const userRouter = require('./routes/user');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('common'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.db = knex;
  next();
});

logger.token("req", (req, res) => JSON.stringify(req.headers));
logger.token("res", (req, res) => {
	const headers = {}
	res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)))
	return JSON.stringify(headers)
});

app.use("/", swaggerUI.serve);
app.get("/", swaggerUI.setup(swaggerDocument));
app.use('/stocks', stocksRouter);
app.use('/user', userRouter);

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
  res.render('error');
});

module.exports = app;
