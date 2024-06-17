import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter user name"],
  },

  email: {
    type: String,
    required: [true, "Please enter user email"],
  },
  image: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
  },
  active: { type: Boolean },
});

// Add a static method to the schema to find a user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

const User = mongoose.model("User", userSchema);

export default User;
