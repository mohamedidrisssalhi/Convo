import express from 'express';
import chatRoomController from '../controllers/chatRoom.controller.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();
// All routes require authentication
router.use(protectRoute);
// Create a new chat room
router.post('/', chatRoomController.createRoom);
// List all chat rooms
router.get('/', chatRoomController.getRooms);
// Join a chat room
router.post('/:roomId/join', chatRoomController.joinRoom);
// Leave a chat room
router.post('/:roomId/leave', chatRoomController.leaveRoom);

export default router;
