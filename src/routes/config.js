const smtpConfig = {
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "hello@knowledgeincommon.com",
    pass: "RM#rGE11yLc@",
  },
};

const CONFIG = {
  serverUrl: "http://192.168.1.122:8081/",
};

module.exports.smtpConfig = smtpConfig;
module.exports.CONFIG = CONFIG;
