import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import "dotenv/config";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import cors from "cors";
import User from "./model/user.model.js";
import Chat from "./model/chat.model.js";

const PORT = process.env.port || 3500;
const app = express();

// Define the CORS options
const corsOptions = {
  credentials: true,
  origin:
    process.env.NODE_ENV === "production"
      ? false
      : ["http://localhost:3000", "http://127.0.0.1:5500"],
};
app.use(cors(corsOptions));
// middlewares
app.use(express.json());

// routing
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);

// app.get("/api/v1/")

// let onlineUsers = {};

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.DB_CLUSTER}`
  )
  .then(() => {
    console.log("Connected to Database");
    const expressServer = app.listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    });

    const io = new Server(expressServer, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? false
            : ["http://localhost:3000", "http://127.0.0.1:5500"],
      },
    });
    io.on("connection", (socket) => {
      const handleLogout = async () => {
        try {
          const user = await User.updateOne(
            { socketId: socket.id },
            { $set: { socketId: "", active: false } }
          );
          socket.broadcast.emit("user_disconnected", user);
        } catch (error) {
          console.log(error);
        }
      };

      // Upon connection - to all others
      socket.on("user_connected", async (userData) => {
        try {
          await User.updateOne(
            { email: userData.email },
            {
              $set: {
                socketId: socket.id,
                active: true,
                // image: userData.image,
              },
            }
          );
          // send new user list of users who are online
          socket.emit("online_users");
          // notify other users that new has joined
          socket.broadcast.emit("new_user");
        } catch (error) {
          console.log(error);
        }
      });

      // Listening for a message event
      socket.on("message", async ({ sender, receiver, message, socketId }) => {
        try {
          const newMessage = {
            from: sender,
            message,
            timestamp: new Date(),
          };
          const data = await Chat.findOneAndUpdate(
            {
              $or: [
                {
                  $and: [{ participant1: sender }, { participant2: receiver }],
                },
                {
                  $and: [{ participant1: receiver }, { participant2: sender }],
                },
              ],
            }, // Filter
            {
              $setOnInsert: {
                participant1: sender,
                participant2: receiver,
              },
              $push: { messages: newMessage },
              $inc: {
                unread: 1,
              },
            }, // Update
            { upsert: true, new: true } // Options
          );

          // const data = await chatMessage.save();
          socket.emit("message", data.messages[data.messages.length - 1]);
          io.to(socketId).emit(
            "message",
            data.messages[data.messages.length - 1]
          );
          io.to(socketId).emit("message_added", {
            read: data.unread,
            id: sender,
          });
        } catch (error) {
          console.log("error ocurred while save data", error);
        }
      });

      socket.on("read", async ({ sender, receiver }) => {
        const data = await Chat.updateOne(
          {
            $or: [
              {
                $and: [{ participant1: sender }, { participant2: receiver }],
              },
              {
                $and: [{ participant1: receiver }, { participant2: sender }],
              },
            ],
          }, // Filter
          {
            $set: {
              unread: 0,
            },
          }
        );
        if (data.modifiedCount === 1) {
          console.log("inside");
          socket.emit("updated_unread", receiver);
        }
      });

      // Listen for activity
      socket.on("activity", (name) => {
        socket.broadcast.emit("activity", name);
      });
      // When user disconnects - to all others
      socket.on("disconnect", handleLogout);
    });
  })
  .catch(() => {
    console.log("connection failed");
  });
