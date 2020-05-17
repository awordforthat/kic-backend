var schemas = require("../schemas");

/* PUT route */
addTopic = (req, res) => {
  if (!req.body.topic) {
    res
      .status(400)
      .send({ message: "Body parameter 'topic' must be provided" });
  }

  schemas.TopicModel.findOne({
    name: req.body.topic
  })
    .then(result => {
      if (result) {
        res
          .status(200)
          .send({ message: "Topic already in database - this is a no-op" });
      } else {
        let newTopic = new TopicModel({
          name: req.body.topic,
          teachable: req.body.teachable.toLowerCase() === "true",
          learnable: req.body.learnable.toLowerCase() === "true"
        });
        newTopic
          .save()
          .then(result => {
            res.status(200).send({ message: "ok", data: result });
          })
          .catch(err => {
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

/* PUT route */
addTopics = (req, res) => {
  if (!req.body.topics) {
    res.status(400).send({
      message: "No topics were included with the request. String[] required"
    });
  }

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

  topics.forEach((topic, index) => {
    console.log(topic.name);
    schemas.TopicModel.findOne({
      name: topic.name
    }).then(result => {
      if (result) {
        noOpTopics.push(topic);
        if (index === topics.length - 1) {
          res.send({
            message: "See data for results",
            data: {
              added: addedTopics,
              errors: errorTopics,
              noOps: noOpTopics
            }
          });
        }
      } else {
        new TopicModel({
          name: topic.name.toLowerCase(),
          teachable: topic.teachable,
          learnable: topic.learnable
        })
          .save()
          .then(result => {
            addedTopics.push(topic);
            if (index === topics.length - 1) {
              res.send({
                message: "See data for results",
                data: {
                  added: addedTopics,
                  errors: errorTopics,
                  noOps: noOpTopics
                }
              });
            }
          })
          .catch(err => {
            errorTopics.push(topic);
            if (index === topics.length - 1) {
              res.send({
                message: "See data for results",
                data: {
                  added: addedTopics,
                  errors: errorTopics,
                  noOps: noOpTopics
                }
              });
            }
          });
      }
    });
  });
};

/* GET route */

/**
 * Provide mode = "teach" or mode = "learn" to get those subsets.
 * Omitting the mode parameter will return all topics.
 */
getTopics = (req, res) => {
  if (req.query.mode == "teach") {
    schemas.TopicModel.find({ teachable: true }, null, {
      sort: { name: 1 }
    }).then(result => {
      res.status(200).send({ message: "ok", data: result });
    });
  } else if (req.query.mode === "learn") {
    schemas.TopicModel.find({ learnable: true }, null, {
      sort: { name: 1 }
    }).then(result => {
      res.status(200).send({ message: "ok", data: result });
    });
  } else {
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
  }
};

updateTopics = (req, res) => {
  schemas.TopicModel.find({})
    .then(result => {
      result.forEach((topic, index) => {
        const learn = Math.floor(Math.random() * 10) % 2 === 0;
        const teach = Math.floor(Math.random() * 10) % 2 === 0;
        schemas.TopicModel.updateOne(
          { name: topic.name },
          { learnable: learn, teachable: teach }
        ).then(topicResult => {
          if (index == result.length - 1) {
            res.send("ok!");
          }
        });
      });
    })
    .catch(err => {
      res.send(err);
    });
};

exports.addTopic = addTopic;
exports.addTopics = addTopics;
exports.getTopics = getTopics;
exports.updateTopics = updateTopics;
