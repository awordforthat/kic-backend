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

  let topics = [];
  try {
    topics = JSON.parse(req.body.topics);
  } catch (error) {
    res.status(400).send({ message: "Badly formed JSON in request body" });
  }

  topics.forEach(topic => {
    console.log(topic);
  });
  res.send("ok!");
};

exports.getConnections = getConnections;
