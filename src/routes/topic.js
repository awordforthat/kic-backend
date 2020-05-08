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

addTopics = (req, res) => {
  if (!req.body.topics) {
    res.status(400).send({
      message: "No topics were included with the request. String[] required"
    });
  }

  console.log(req.body.topics);
  let topics;

  try {
    topics = JSON.parse(req.body.topics);
  } catch (err) {
    res.status(400).send({ message: "Invalid JSON in request body" });
    return;
  }

  const addedTopics = [];
  const errorTopics = [];
  const noOpTopics = [];
  console.log("About to start for loop");

  topics.forEach((topic, index) => {
    console.log(topic);
    schemas.TopicModel.findOne({
      name: topic
    }).then(result => {
      if (result) {
        console.log("Topic " + topic + " already in database");
        noOpTopics.push(topic);
      } else {
        new TopicModel({ name: topic.toLowerCase() })
          .save()
          .then(result => {
            addedTopics.push(topic);
            console.log("topic saved successfully");
          })
          .catch(err => {
            errorTopics.push(topic);
            console.log("Failed to save topic " + topic);
          });
      }
    });
  });
  res.send({
    message: "See data for results",
    data: { added: addedTopics, errors: errorTopics, noOps: noOpTopics }
  });
};

getTopics = (req, res) => {
  schemas.TopicModel.find({}, null, { sort: { name: 1 } })
    .then(result => {
      res.status(200).send({ message: "ok", data: result });
    })
    .catch(err => {
      res.status(400).send({
        message: "failed to get results (or no values exist in database)",
        data: []
      });
    });
};

exports.addTopic = addTopic;
exports.addTopics = addTopics;
exports.getTopics = getTopics;
