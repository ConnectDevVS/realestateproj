var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
var dotenConfig = require("dotenv").config({ path: envPath });
const connectDB = require("./db/connection");
const tenantMiddleware = require("./middlewares/tenant.middleware");

var indexRouter = require("./routes/index");
/*************ROUTES FOR VERSION 1 ************/
var v1AuthRouter = require("./routes/api/v1/auth");
var v1UserRouter = require("./routes/api/v1/users");
var v1ProjectRouter = require("./routes/api/v1/projects");
var v1TeamRouter = require("./routes/api/v1/team");

/*************ROUTES FOR VERSION 1 ************/

var app = express();
connectDB().then(() => console.log("🚀DB connection establised"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Apply tenant middleware globally (before routes)
app.use(tenantMiddleware);
app.use("/", indexRouter);

/*************ROUTES FOR VERSION 1 ************/

app.use("/", indexRouter);
app.use("/api/v1/auth", v1AuthRouter);
app.use("/api/v1/users", v1UserRouter);
app.use("/api/v1/projects", v1ProjectRouter);
app.use("/api/v1/team", v1TeamRouter);

/*********************************************/

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
