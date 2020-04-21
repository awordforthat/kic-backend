var express = require("express");
var router = express.Router();

/* GET users listing. */
// router.get("/", function(req, res, next) {
//   console.log("Got a get/user/ request");
//   res.send("respond with a resource");
// });

/* GET user profile. */
router.get("/profile", function(req, res, next) {
  res.send(req.user);
});

router.get("/user", (req, res) => {
  console.log("Got here...");
  res.send("user route");
});
/* POST user profile.*/
router.post("/user", (req, res) => {
  let newUser = new User({
    authToken: req.body.authToen,
    userName: req.body.userName,
    email: req.body.email
  });

  User.findOne({ authToken: req.body.authToken })
    .catch(err => {
      res.status(400).send("database error");
      return;
    })
    .then(value => {
      if (!value) {
        console.log("Brand new user");
        newUser.save().then(item => {
          res.send({ status: 0, user: newUser });
        });
      } else {
        console.log("old user, exists");
        res.send({ status: 1, user: value });
      }
    });
});

module.exports = router;
