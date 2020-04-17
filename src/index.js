//import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const mongoose = require("mongoose");

// define the Express app
const app = express();

// the real database
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/knowledgeincommon", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var categorySchema = new mongoose.Schema({ name: String });
var Category = mongoose.model("Category", categorySchema);

var topicSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String
});
var Topic = mongoose.model("Topic", topicSchema);

var userSchema = new mongoose.Schema({
  authToken: String,
  email: String,
  userName: String
});
var User = mongoose.model("User", userSchema);

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan("combined"));

// easy body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// retrieve all questions

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

app.get("/category", (req, res) => {
  Category.find({})
    .then(val => {
      res.send(val);
    })
    .catch(err => {
      console.log(err);
      res.status(400).send("Unable to retrieve category list");
    });

  //res.send(cats);
});

app.get("/category/:name", (req, res) => {
  Topic.find({ category: req.params.name })
    .then(val => {
      res.send(val);
    })
    .catch(err => {
      res.send("Unable to retrieve categories");
    });
});

app.get("/topic", (req, res) => {
  Topic.find({})
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send("Unable to retrieve topics from the server");
    });
});

app.post("/topic", async (req, res) => {
  var newTopic = new Topic(req.body);

  // little bit of error protection
  if (!dataExists(req.body.name) || !dataExists(req.body.category)) {
    res
      .status(400)
      .send({ error: "Argument error - arguments cannot be null" });
  }
  if (req.body.name === "") {
    res
      .status(400)
      .send({ error: "Argument error - name may not be empty string" });
  }

  let result = await Topic.findOne({
    name: req.body.name,
    category: req.body.category
  }).catch(err => {
    res.send({ error: "Database error" }).catch(reason => {
      console.log(reason);
    });
  });

  if (result) {
    res.status(400).send({ error: "Cannot add duplicate topic" });
  }

  // if the topic doesn't exist in our collection, add it
  let category = await Category.findOne({ name: req.body.category }).catch(
    err => {
      res.send({ error: "Database error" });
    }
  );

  if (!category) {
    let newCat = new Category({ name: req.body.category });
    newCat.save().catch(err => {
      res
        .status(400)
        .send("unable to save to database")
        .catch(err => {
          console.log("Failed to send error to client");
        });
    });
  }

  // now good to add the topic to the database

  newTopic
    .save()
    .then(item => {
      res.status(200).send("New topic added");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

app.get("/user/:id", (req, res) => {
  User.findOne({ authToken: req.params.authToken })
    .then(item => {
      if (item) {
        res.send(item);
      } else {
        res
          .status(404)
          .send("User " + req.params.authToken + " does not exist");
      }
    })
    .catch(() => {
      res.send(err);
    });
});

app.post("/user", (req, res) => {
  let newUser = new User({
    authToken: req.body.authToen,
    userName: req.body.userName,
    email: req.body.email
  });

  User.findOne({ authToken: req.body.authToken })
    .catch(err => {
      res.status(400).send("database error");
      return;
    })
    .then(value => {
      if (!value) {
        console.log("Brand new user");
        newUser.save().then(item => {
          res.send({ status: 0, user: newUser });
        });
      } else {
        console.log("old user, exists");
        res.send({ status: 1, user: value });
      }
    });
});

// start the server
app.listen(8081, () => {
  console.log("listening on port 8081");
});

function dataExists(data) {
  return data != null && data != undefined;
}
