var express = require("express");
var path = require("path");
// var favicon = require('serve-favicon');
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// var index = require("./routes/index");
// var user = require("./routes/user");
var auth = require("./routes/auth");
var jwt = require("jsonwebtoken");
var passportJWT = require("passport-jwt");
var passport = require("passport");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

require("./passport");

var app = express();
// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/knowledgeincommon", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "tasmanianDevil";

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  UserModel.findOne({ _id: jwt_payload.id })
    .then(result => {
      next(null, result);
    })
    .catch(err => {
      next(null, false);
    });
});
passport.use(strategy);

app.post("/login", function(req, res) {
  UserModel.findOne({ name: req.body.name })
    .then(result => {
      if (result.password == req.body.password) {
        console.log(result._id);
        var payload = { id: result._id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.send({ message: "ok", token: token });
      } else {
        res.status(401).json({ message: "passwords did not match" });
      }
    })
    .catch(err => {
      res.status(401).json({ message: "user not in database" });
    });
});

app.get("/secret", passport.authenticate("jwt", { session: false }), function(
  req,
  res
) {
  res.json("Success! You can not see this without a token");
});

// app.use("/auth", auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// start the server
app.listen(8081, () => {
  console.log("listening on port 8081");
});

module.exports = app;
