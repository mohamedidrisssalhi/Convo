import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getIncomingRequests,
  getSentRequests,
  removeFriend
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.post("/reject", rejectFriendRequest);
// router.post("/cancel", cancelFriendRequest); // Disabled: users can no longer cancel sent requests
router.get("/", getFriends);
router.get("/requests/incoming", getIncomingRequests);
router.get("/requests/sent", getSentRequests);
router.delete("/:id", removeFriend);

export default router;
