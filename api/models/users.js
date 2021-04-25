// model for our Users

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

let userSchema = new Schema(
  {
    phonenumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
  }
);

userSchema.plugin(uniqueValidator, { message: "Phonenumber already in use!" });
module.exports = mongoose.model("User", userSchema);
