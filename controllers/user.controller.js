import User from "../model/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createUser = async (req, res) => {
  try {
    let user;
    user = await User.findByEmail(req.body.email);
    if (!user) {
      user = await User.create(req.body);
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
