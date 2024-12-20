import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cagnotteRouter from './routes/cagnotte.js';  // Nouvelle import


// Import routers
import creditRouter from './routes/credit.js';
import pocheRouter from './routes/poche.js';
import cors from 'cors';
import indexRouter from "./routes/index.js"; // Make sure to include `.js`
import usersRouter from "./routes/users.js"; // Incl
import transactionRouter from "./routes/transactions.js";

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "jade");
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin); 
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cagnottes',cagnotteRouter);
app.use('/credit', creditRouter);
app.use('/poches', pocheRouter);


app.use(indexRouter);
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(3005, () => console.log("running on port 3005"));

export default app;
