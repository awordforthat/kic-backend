var express = require("express");
var path = require("path");
// var favicon = require('serve-favicon');
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var passportJWT = require("passport-jwt");
var passport = require("passport");
var cors = require("cors");
var bcrypt = require("bcrypt");

var userRoutes = require("./routes/user");
var topicRoutes = require("./routes/topic");
var schemas = require("./schemas");

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

// set up cross origin
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb+srv://admin:mongoadmin@kicdata-7esya.mongodb.net/test?retryWrites=true&w=majority",
  {
    dbName: "knowledge-in-common",
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "tasmanianDevil";

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  schemas.UserModel.findOne({ _id: jwt_payload.id })
    .then(result => {
      next(null, result);
    })
    .catch(err => {
      next(null, false);
    });
});
passport.use(strategy);

app.post("/login", function(req, res) {
  schemas.UserModel.findOne({ email: req.body.email.toLowerCase() })
    .then(result => {
      if (bcrypt.compareSync(req.body.password, result.password)) {
        var payload = { id: result._id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.send({
          message: "ok",
          token: token,
          username: result.username,
          email: result.email,
          id: result._id,
          status: 200
        });
      } else {
        // passwords did not match
        res.status(401).send({ message: "login failure", status: 401 });
      }
    })
    .catch(err => {
      // user not in database
      res.status(401).send({ message: "user not in database", status: 401 });
    });
});


app.put("/topic", topicRoutes.addTopic);
app.get("/topic", topicRoutes.getTopics);

app.put("/user", userRoutes.addUser);
app.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  getUserProfile
);
app.post("/user/topics", userRoutes.addUserTopics);


app.get("/secret", passport.authenticate("jwt", { session: false }), function(
  req,
  res
) {
  res.json("Success! You can not see this without a token");
});

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
