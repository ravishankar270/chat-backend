import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import "dotenv/config";

const PORT = process.env.port || 3500;
const app = express();
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
      // Upon connection - to all others
      socket.broadcast.emit('connected', `${socket.id.substring(0, 5)}}`)

      // Listening for a message event
      socket.on("message", (data) => {
        console.log(data);
        io.emit("message", `${data}`);
      });

      // // When user disconnects - to all others
      // socket.on('disconnect', () => {
      //     socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)}} disconnected`)
      // })

      // Listen for activity
      socket.on("activity", (name) => {
        socket.broadcast.emit("activity", name);
      });
    });
  })
  .catch(() => {
    console.log("connection failed");
  });
