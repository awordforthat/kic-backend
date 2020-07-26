var nodemailer = require("nodemailer");
var Email = require("email-templates");

var config = require("./config");

sendContactForm = (req, res) => {
  var transporter = nodemailer.createTransport(config.smtpConfig);
  const email = new Email({
    message: {
      from: "hello@knowledgeincommon.com",
    },
    send: false,
    transport: transporter,
  });

  email
    .send({
      template: "contact",
      message: {
        to: "emily.w.charles@gmail.com",
      },
      locals: {
        userEmail: req.body.userEmail,
        responseEmail: req.body.responseEmail,
        userId: req.body.id,
        subject: req.body.subject,
        body: req.body.body,
      },
    })
    .then((result) => {
      res.status(200).send({ result: "Success" });
    })
    .catch((err) => {
      res.status(400).send({ result: "Failure" });
    });
};

exports.sendContactForm = sendContactForm;
