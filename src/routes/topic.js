var schemas = require("../schemas");

addTopic = (req, res) => {
  schemas.TopicModel.findOne({
    name: req.body.topic
  })
    .then(result => {
      console.log("Result: " + result);
      if (result) {
        res
          .status(200)
          .send({ message: "Topic already in database - this is a no-op" });
      } else {
        let newTopic = new TopicModel({ name: req.body.topic });
        newTopic
          .save()
          .then(result => {
            console.log("saved successfully");
            res.status(200).send({ message: "ok", data: result });
          })
          .catch(err => {
            console.log("failed to save topic");
            res.status(400).send({ message: "failed to save topic" });
          });
      }
    })
    .catch(err => {
      console.log(err);
      console.log("database error");
      res.sendStatus(500).send({ message: "database error" });
    });
};

getTopics = (req, res) => {
  schemas.TopicModel.find({}, null, { sort: { name: 1 } })
    .then(result => {
      res.status(200).send({ message: "ok", data: result });
    })
    .catch(err => {
      res.status(400).send({
        message: "failed to get results (or no values exist in database",
        data: []
      });
    });
};

exports.addTopic = addTopic;
exports.getTopics = getTopics;
