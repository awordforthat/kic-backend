var schemas = require("../schemas");

/* POST request for connections */

getConnections = (req, res) => {
  if (!req.body.id || req.body.id === "") {
    res
      .status(400)
      .send({ message: "You must provide an id with your profile request" });
  }
  console.log(req.body.id);

  if (
    !req.body.mode ||
    !(req.body.mode === "teach" || req.body.mode === "learn")
  ) {
    res.status(400).send({
      message:
        "Body parameter 'mode' required. Provide one of: 'teach', 'learn'"
    });
  }

  console.log(req.body.mode);

  if (!req.body.topics) {
    res.status(400).send({
      message: "No topics provided"
    });
  }
  console.log(req.body.topics);

  let topics = req.body.topics;

  if (typeof topics === "string") {
    try {
      topics = JSON.parse(req.body.topics);
    } catch (error) {
      console.log("Badly formed JSON");
      res.status(400).send({ message: "Badly formed JSON in request body" });
    }
  }
  console.log(topics);
  const filter =
    req.body.mode === "teach"
      ? { learn: { $in: topics }, _id: { $ne: req.body.id } }
      : { teach: { $in: topics }, _id: { $ne: req.body.id } };
  console.log(filter);
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
      console.log(matches);
      res.send({ users: matches });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: "Lookup failed", error: err });
    });
};

exports.getConnections = getConnections;
