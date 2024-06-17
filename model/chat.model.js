import mongoose from "mongoose";
const chatSchema = mongoose.Schema({
  participant1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participant2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  unread: {
    type: Number,
    default: 0,
  },
});

// Add a static method to the schema to find a user by email
chatSchema.statics.findBySenderReceiver = function (sender, receiver) {
  return this.findOne({
    $or: [
      { $and: [{ participant1: sender }, { participant2: receiver }] },
      { $and: [{ participant1: receiver }, { participant2: sender }] },
    ],
  });
};

chatSchema.statics.findBySingleParticipant = function (participant) {
  return this.find({
    $or: [{ participant1: participant }, { participant2: participant }],
  });
};

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
