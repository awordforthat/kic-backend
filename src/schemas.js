var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String
});
UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
