var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  name: String,
  password: String
});
UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
