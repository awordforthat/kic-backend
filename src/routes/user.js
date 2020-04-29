var jwt = require("jsonwebtoken");
var passportJWT = require("passport-jwt");
var bcrypt = require("bcrypt");
var schemas = require("../schemas");

var ExtractJwt = passportJWT.ExtractJwt;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "tasmanianDevil";

/* GET user profile.*/
getUserProfile = (req, res) => {
  console.log("Getting user profile...");
  schemas.UserModel.findOne({ authToken: req.body.authToken })
    .then(value => {
      if (!value) {
        console.log("no data found");
        res.send({ message: "No data found", data: [] });
      } else {
        console.log("found some data");
        res.send({
          message: "Found some data, boss",
          data: {
            teach: ["Gardening", "Cooking", "Skateboarding"],
            learn: ["Whittling", "Swimming", "Forestry"]
          }
        });
      }
    })
    .catch(err => {
      console.log("Got an error");
      res.status(400).send({ message: "Could not find resource", status: 400 });
    });
};

/* PUT user profile.*/
addUser = (req, res) => {
  schemas.UserModel.findOne({
    email: req.body.email.toLowerCase()
  })
    .then(result => {
      if (result) {
        res.status(400).send({ status: 400, message: "user already exists" });
      } else {
        const hash = bcrypt.hashSync(req.body.password, 10);
        console.log("Saving pw as: " + hash);
        let newUser = new UserModel({
          email: req.body.email.toLowerCase(),
          password: hash,
          username: req.body.username
        });

        newUser
          .save()
          .then(result => {
            var payload = { id: result._id };
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.status(200).send({
              message: "ok",
              token: token,
              username: newUser.username,
              email: newUser.email,
              id: newUser._id,
              status: 200
            });
          })
          .catch(err => {
            console.log(err);
            res
              .status(500)
              .send({ message: "Unable to create new user", status: 500 });
          });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Server error", status: 500 });
    });
};
exports.addUser = addUser;
