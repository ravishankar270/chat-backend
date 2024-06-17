import Chat from "../model/chat.model.js";

export const getChat = async (req, res) => {
  try {
    const sender = req.params.sender;
    const receiver = req.params.receiver;
    const chat = await Chat.findBySenderReceiver(sender, receiver);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getSinglUserChats = async (req, res) => {
  try {
    const participant = req.params.participant;
    const chats = await Chat.findBySingleParticipant(participant);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};