const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
/* POST login. */
// router.post("/loginX", function(req, res, next) {
//   passport.authenticate("local", { session: false }, (err, user, info) => {
//     if (err || !user) {
//       return res.status(400).json({
//         message: "Something is not right",
//         user: user
//       });
//     }
//     req.login(user, { session: false }, err => {
//       if (err) {
//         res.send(err);
//       }
//       // generate a signed son web token with the contents of user object and return it in the response
//       const token = jwt.sign(user, "your_jwt_secret");
//       return res.json({ user, token });
//     });
//   })(req, res);
// });
router.post("/login", function(req, res) {
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
