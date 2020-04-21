const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = passportJWT.Strategy;

require("./schemas");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    function(email, password, cb) {
      console.log("Past authentication step");
      //Assume there is a DB module pproviding a global UserModel
      return UserModel.findOne({ email, password })
        .then(user => {
          if (!user) {
            return cb(null, false, { message: "Incorrect email or password." });
          }

          return cb(null, user, {
            message: "Logged In Successfully"
          });
        })
        .catch(err => {
          console.log("did not find user");
          return cb(err);
        });
    }
  )
);
