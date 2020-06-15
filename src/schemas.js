var mongoose = require("mongoose");

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
  teacherName: String,
  learner: { type: String, required: true },
  learnerName: String,
  success: { type: Boolean }
});

MatchModel = mongoose.model("Match", matchSchema);

// users
var userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  teach: { type: Array },
  learn: { type: Array },
  pending: { type: [matchSchema] }
});
UserModel = mongoose.model("User", userSchema);

exports.UserModel = UserModel;
exports.TopicModel = TopicModel;
