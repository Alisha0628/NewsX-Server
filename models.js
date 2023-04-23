const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  likedItemsURL: [],
  searchHistory: [],
});

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
  url: String,
  likes: Number,
});

const Item = mongoose.model("Item", itemSchema);

module.exports = {
  User,
  Item,
};
