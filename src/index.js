//import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// define the Express app
const app = express();

// the database
const topics = [
  { id: 0, name: "Spinning", category: "FIBER_ARTS" },
  { id: 1, name: "Parkour", category: "SPORTS" },
  { id: 2, name: "Python", category: "COMPUTER_SCIENCE" },
  { id: 3, name: "C#/Unity", category: "COMPUTER_SCIENCE" },
  { id: 4, name: "Knitting", category: "FIBER_ARTS" },
  { id: 5, name: "Woodturning", category: "WOODWORKING" }
];

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan("combined"));

// retrieve all questions
app.get("/", (req, res) => {
  res.send(topics);
});

// get a specific question
app.get("/:id", (req, res) => {
  const question = topics.filter(q => q.id === parseInt(req.params.id));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();
  res.send(question[0]);
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-1owvbktc.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: "s7IeBAB7VpE6Dp8Ja1NO1rmUEcfAA7pT",
  issuer: `https://<YOUR_AUTH0_DOMAIN>/`,
  algorithms: ["RS256"]
});

// insert a new question
app.post("/", checkJwt, (req, res) => {
  const { title, description } = req.body;
  const newQuestion = {
    id: topics.length + 1,
    title,
    description,
    answers: [],
    author: req.user.name
  };
  topics.push(newQuestion);
  res.status(200).send();
});

// insert a new answer to a question
app.post("/answer/:id", checkJwt, (req, res) => {
  const { answer } = req.body;

  const question = topics.filter(q => q.id === parseInt(req.params.id));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();

  question[0].answers.push({
    answer,
    author: req.user.name
  });

  res.status(200).send();
});

// start the server
app.listen(8081, () => {
  console.log("listening on port 8081");
});
