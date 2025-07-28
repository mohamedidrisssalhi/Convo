import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, getRoomMessages, sendRoomMessage } from "../controllers/message.controller.js";

const router = express.Router();


// User-to-user
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// Room-based
router.get("/room/:roomId", protectRoute, getRoomMessages);
router.post("/room/:roomId", protectRoute, sendRoomMessage);

export default router;
