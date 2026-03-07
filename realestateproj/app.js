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
var v1GlobalConfig = require("./routes/api/v1/globalconfig");
var v1UserRouter = require("./routes/api/v1/users");
var v1ProjectRouter = require("./routes/api/v1/projects");
var v1TeamRouter = require("./routes/api/v1/team");
var v1StageRouter = require("./routes/api/v1/stage");
var v1TransactionRouter = require("./routes/api/v1/transaction");
var v1RequestRouter = require("./routes/api/v1/requests");
var v1DocumentsRouter = require("./routes/api/v1/documents");
var v1InvoicesRouter = require("./routes/api/v1/invoices");
var v1SubContractRouter = require("./routes/api/v1/subcontract");
var v1ComplaintRouter = require("./routes/api/v1/complaints");

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
app.use("/api/v1/globalconfig", v1GlobalConfig);
app.use("/api/v1/auth", v1AuthRouter);
app.use("/api/v1/users", v1UserRouter);
app.use("/api/v1/projects", v1ProjectRouter);
app.use("/api/v1/team", v1TeamRouter);
app.use("/api/v1/stage", v1StageRouter);
app.use("/api/v1/transaction", v1TransactionRouter);
app.use("/api/v1/requests", v1RequestRouter);
app.use("/api/v1/documents", v1DocumentsRouter);
app.use("/api/v1/invoices", v1InvoicesRouter);
app.use("/api/v1/subcontract", v1SubContractRouter);
app.use("/api/v1/complaints", v1ComplaintRouter);

/*********************************************/

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : err;

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
