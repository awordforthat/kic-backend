var mongoose = require("mongoose");

// users
var userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  teach: { type: Array },
  learn: { type: Array }
});
UserModel = mongoose.model("User", userSchema);

// topics
var topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teachable: { type: Boolean },
  learnable: { type: Boolean }
});

TopicModel = mongoose.model("Topic", topicSchema);

// matches
var matchSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  requester: { type: String, required: true },
  teacher: { type: String, required: true },
  learner: { type: String, required: true },
  success: { type: Boolean }
});

MatchModel = mongoose.model("Match", matchSchema);

exports.UserModel = UserModel;
exports.TopicModel = TopicModel;
