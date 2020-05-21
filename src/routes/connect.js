var schemas = require("../schemas");
var nodemailer = require("nodemailer");
var Email = require("email-templates");

/* POST request for connections */

getConnections = (req, res) => {
  if (!req.body.id || req.body.id === "") {
    res
      .status(400)
      .send({ message: "You must provide an id with your profile request" });
  }

  if (
    !req.body.mode ||
    !(req.body.mode === "teach" || req.body.mode === "learn")
  ) {
    res.status(400).send({
      message:
        "Body parameter 'mode' required. Provide one of: 'teach', 'learn'"
    });
  }

  if (!req.body.topics) {
    res.status(400).send({
      message: "No topics provided"
    });
  }

  let topics = req.body.topics;

  if (typeof topics === "string") {
    try {
      topics = JSON.parse(req.body.topics);
    } catch (error) {
      console.log("Badly formed JSON");
      res.status(400).send({ message: "Badly formed JSON in request body" });
    }
  }
  const filter =
    req.body.mode === "teach"
      ? { learn: { $in: topics }, _id: { $ne: req.body.id } }
      : { teach: { $in: topics }, _id: { $ne: req.body.id } };

  schemas.UserModel.find(filter)
    .then(result => {
      const matches = result.map((user, index) => {
        return {
          username: user.username,
          id: user._id,
          topics:
            req.body.mode === "teach"
              ? user.learn.filter(topic => {
                  return topics.indexOf(topic) !== -1;
                })
              : user.teach.filter(topic => {
                  return topics.indexOf(topic) !== -1;
                })
        };
      });
      res.send({ users: matches });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: "Lookup failed", error: err });
    });
};

requestMatch = (req, res) => {
  let requestingUser;
  let matchUser;

  var smtpConfig = {
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hello@knowledgeincommon.com",
      pass: "RM#rGE11yLc@"
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);

  // this would be a lot nicer if it used async/await

  // get request user
  UserModel.findOne({
    _id: req.body.requesterId
  })
    .then(result => {
      requestingUser = result;
      // now find match user
      UserModel.findOne({ _id: req.body.matchId })
        .then(result => {
          matchUser = result;
        })
        .then(() => {
          // we should have everybody here. Now craft the email
          const Email = require("email-templates");

          const email = new Email({
            message: {
              from: "hello@knowledgeincommon.com"
            },
            // uncomment below to send emails in development/test env:
            //send: true,
            transport: transporter
          });

          email
            .send({
              template: "matchRequest",
              message: {
                to: "emilywcharles@gmail.com"
              },
              locals: {
                name: matchUser.username ? matchUser.username : " there",
                requesterName: requestingUser.username
                  ? requestingUser.username
                  : "A Knowledge in Common user",
                mode: req.body.mode.toLowerCase(),
                oppMode: req.body.mode === "LEARN" ? "teach" : "learn",
                topic: req.body.topic,
                wantToKnow: req.body.wantToKnow,
                skillLevel: req.body.skillLevel,
                anythingElse: req.body.anythingElse
              }
            })
            .then(result => {
              res.send(result);
            })
            .catch(console.error);
        });
    })
    .catch(err => {
      console.log(err);
    });

  // craft message to match based on mode, topic, and notes

  // send email

  // return results
  res.send("ok!");
};

testEmail = (req, res) => {
  var smtpConfig = {
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hello@knowledgeincommon.com",
      pass: "RM#rGE11yLc@"
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);

  // transporter.verify(function(error, success) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Server is ready to take our messages");
  //   }
  // });

  var mailData = {
    from: "hello@knowledgeincommon.com",
    to: "emily.w.charles@gmail.com",
    subject: "Hello Bear",
    text: "Bear bear bear",
    html: "<div><i>Bear</i> <b>bear</b> bear</div>"
  };
  transporter.sendMail(mailData, function(error, info) {
    if (error) {
      res.send(error);
    } else {
      res.send(info);
    }
  });
};

exports.getConnections = getConnections;
exports.requestMatch = requestMatch;
exports.testEmail = testEmail;
