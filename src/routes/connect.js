var schemas = require("../schemas");
var nodemailer = require("nodemailer");
var Email = require("email-templates");
const CONFIG = {
  serverUrl: "http://192.168.1.122:8081/"
};

var smtpConfig = {
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "hello@knowledgeincommon.com",
    pass: "RM#rGE11yLc@"
  }
};

const sendEmails = false;

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
    _id: req.body.requester
  })
    .then(result => {
      requestingUser = result;
      // now find match user
      UserModel.findOne({ _id: req.body.matchId })
        .then(result => {
          matchUser = result;
        })
        .then(() => {
          // first create the match record so the email response has something to update
          let newMatch = new MatchModel({
            topic: req.body.topic,
            requester: requestingUser._id,
            serverUrl: CONFIG.serverUrl + "connect/", //"http://192.168.1.122:8081/connect/"
            teacher:
              req.body.mode.toLowerCase() == "teach"
                ? requestingUser._id
                : matchUser._id,
            learner:
              req.body.mode.toLowerCase() == "learn"
                ? requestingUser._id
                : matchUser._id
          });

          newMatch.save().then(result => {
            // we should have everybody here. Now craft the email

            const email = new Email({
              message: {
                from: "hello@knowledgeincommon.com"
              },
              send: sendEmails,
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
                  matchId: result._id,
                  requesterName: requestingUser.username
                    ? requestingUser.username
                    : "A Knowledge in Common user",
                  mode: req.body.mode.toLowerCase(),
                  oppMode:
                    req.body.mode.toLowerCase() == "learn" ? "teach" : "learn",
                  topic: req.body.topic,
                  wantToKnow: req.body.wantToKnow,
                  skillLevel: req.body.skillLevel,
                  anythingElse: req.body.anythingElse,
                  backgroundPhrase:
                    req.body.mode.toLowerCase() == "teach"
                      ? " their background in "
                      : " what they want to know about "
                }
              })
              .then(result => {
                res.send(result);
              })
              .catch(err => {
                console.log(err);
              });
          });
        });
    })
    .catch(err => {
      console.log(err);
    });
};

confirmMatch = (req, res) => {
  console.log(req.body.matchId);
  MatchModel.findOneAndUpdate({ _id: req.body.matchId }, { success: true })
    .then(matchResult => {
      console.log(matchResult);
      // TODO: send connection email to both requester and target connecting them

      let requestingUser;
      let targetUser;
      var transporter = nodemailer.createTransport(smtpConfig);
      let mode;

      UserModel.findOne({ _id: matchResult.requester }).then(reqUserResult => {
        requestingUser = reqUserResult;
        console.log(requestingUser);
        let targetUserId;
        if (req.body.requester === req.body.learner) {
          // the target is the teacher
          targetUserId = matchResult.teacher;
          mode = "LEARN";
        } else {
          // target is the learner
          targetUserId = req.body.learner;
          mode = "TEACH";
        }
        UserModel.findOne({ _id: targetUserId }).then(targetUserResult => {
          targetUser = targetUserResult;

          // now we have everyone. send emails!

          // first to the requester
          const email = new Email({
            message: {
              from: "hello@knowledgeincommon.com"
            },
            send: sendEmails,
            transport: transporter
          });
          email
            .send({
              template: "matchConfirm-requester",
              message: {
                to: requestingUser.email
              },
              locals: {
                name: requestingUser.username
                  ? requestingUser.username
                  : "there",
                matchName: targetUser.username
                  ? targetUser.username
                  : "another user",
                mode: mode.toLowerCase(),
                topic: matchResult.topic,
                contactInfo: targetUser.email
              }
            })
            .finally(() => {
              // then to the target
              const email = new Email({
                message: {
                  from: "hello@knowledgeincommon.com"
                },

                send: sendEmails,
                transport: transporter
              });

              email
                .send({
                  template: "matchConfirm-target",
                  message: {
                    to: targetUser.email
                  },
                  locals: {
                    requesterEmail: requestingUser.email,
                    topic: matchResult.topic,
                    matchName: requestingUser.username
                      ? requestingUser.username
                      : requestingUser.email
                  }
                })
                .catch(err => {
                  console.log("Failed to send email");
                  res.status(400).send(err);
                })
                .finally(() => {
                  res.send({ message: "Emails sent successfully" });
                });
            });
        });
      });
    })

    .catch(err => {
      console.log(err);
      res.status(400).send({
        message: "Could not find match with id {}".format(req.body.matchId)
      });
    });
};

denyMatch = (req, res) => {
  MatchModel.findOneAndUpdate({ _id: req.body.matchId }, { success: false })
    .then(matchResult => {
      UserModel.findOne({ _id: matchResult.requester })
        .then(requesterResult => {
          var transporter = nodemailer.createTransport(smtpConfig);
          const email = new Email({
            message: {
              from: "hello@knowledgeincommon.com"
            },
            send: sendEmails,
            transport: transporter
          });

          email
            .send({
              template: "matchDeny",
              message: {
                to: requesterResult.email
              },
              locals: {
                topic: matchResult.topic
              }
            })
            .then(result => {
              res.send(result);
            })
            .catch(res.status(400).send({ message: "Email failed to send" }));
        })
        .catch(err => {
          res.status(400).send({
            message: "Unable to find user {}".format(matchResult.requester)
          });
        });
    })
    .catch(err => {
      res.status(400).send({
        message: "Unable to look up match {}".format(req.body.matchId)
      });
    });
};

exports.getConnections = getConnections;
exports.requestMatch = requestMatch;
exports.confirmMatch = confirmMatch;
exports.denyMatch = denyMatch;
