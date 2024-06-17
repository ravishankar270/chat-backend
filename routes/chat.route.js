import { Router } from "express";
import { getChat, getSinglUserChats } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.get("/:sender/:receiver", getChat);
chatRouter.get("/:participant", getSinglUserChats);

export default chatRouter;
