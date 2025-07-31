import express from "express";
import passportAuth from "../middleware/passportAuth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, getRoomMessages, sendRoomMessage } from "../controllers/message.controller.js";

const router = express.Router();


// User-to-user
router.get("/users", passportAuth, getUsersForSidebar);
router.get("/:id", passportAuth, getMessages);
router.post("/send/:id", passportAuth, sendMessage);

// Room-based
router.get("/room/:roomId", passportAuth, getRoomMessages);
router.post("/room/:roomId", passportAuth, sendRoomMessage);

export default router;
