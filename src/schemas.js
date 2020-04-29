var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  teach: { type: Array },
  learn: { type: Array }
});
UserModel = mongoose.model("User", userSchema);

var topicSchema = new mongoose.Schema({
  name: { type: String, required: true }
});
TopicModel = mongoose.model("Topic", topicSchema);
exports.UserModel = UserModel;
exports.TopicModel = TopicModel;
