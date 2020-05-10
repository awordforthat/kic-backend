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
  if (!req.query.id || req.query.id === "") {
    res
      .status(400)
      .send({ message: "You must provide an id with your profile request" });
  }
  schemas.UserModel.findOne({ _id: req.query.id })

    .then(value => {
      if (!value) {
        res.status(404).send({ message: "No data found", data: [] });
      } else {
        noPwUser = Object.create(value);
        noPwUser.password = "HIDE";
        res.send({
          message: "Success",
          data: noPwUser
        });
      }
    })
    .catch(err => {
      console.log("Got an error");
      res.status(404).send({ message: "Could not find resource", status: 404 });
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
            res.status(201).send({
              message: "ok",
              token: token,
              username: newUser.username,
              email: newUser.email,
              id: newUser._id,
              status: 201
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

/* PUT multiple topics */

addUserTopics = (req, res) => {
  if (!req.body.email) {
    res
      .status(400)
      .send({ message: "You  must provide a user email in the request body" });
  }
  schemas.UserModel.findOne({
    email: req.body.email.toLowerCase()
  })
    .then(result => {
      let topics = [];
      try {
        topics = JSON.parse(req.body.topics);
      } catch (err) {
        res.status(400).send({ message: "Invalid JSON in request body" });
        return;
      }

      let userData = [];
      let mode = "";
      if (req.body.topicSet.toLowerCase() === "teach") {
        userData = JSON.parse(JSON.stringify(result.teach));
        mode = "teach";
      } else if (req.body.topicSet.toLowerCase() === "learn") {
        userData = JSON.parse(JSON.stringify(result.learn));
        mode = "learn";
      } else {
        res.status(400).send({
          message: "Unrecognized topicSet. Expect either 'teach' or 'learn'."
        });
        return;
      }

      // add to existing list, making sure values are unique
      let newTopics = userData;
      topics.forEach(val => {
        if (userData.indexOf(val.toLowerCase()) === -1) {
          newTopics.push(val.toLowerCase());
        }
      });
      result[mode] = newTopics;

      result
        .save()
        .then(res.status(200).send(newTopics))
        .catch(err => {
          res.status(500).send({ message: "Unable to save to database" });
        });
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .send({ message: "Unable to retrieve user from database" });
    });
};
exports.addUser = addUser;
exports.addUserTopics = addUserTopics;
