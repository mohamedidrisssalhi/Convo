
// Main chat container component: displays messages, header, and input for the selected chat
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";


const ChatContainer = () => {
  // Zustand chat store state and actions
  const {
    messages,                // Array of chat messages for the current chat
    getMessages,             // Function to fetch messages for a user or room
    isMessagesLoading,       // Loading state for messages
    selectedUser,            // Currently selected user (for 1-1 chat)
    selectedRoom,            // Currently selected room (for group chat)
    subscribeToMessages,     // Subscribe to real-time message events
    unsubscribeFromMessages, // Unsubscribe from real-time events
    chatRooms,               // List of all chat rooms
    users,                   // List of all users
  } = useChatStore();
  const { authUser } = useAuthStore(); // Authenticated user info
  const messageEndRef = useRef(null);  // Ref for auto-scrolling to latest message

  // Fetch messages and subscribe to real-time updates when chat changes
  useEffect(() => {
    if (selectedRoom) {
      getMessages(selectedRoom._id, "room");
    } else if (selectedUser) {
      getMessages(selectedUser._id, "user");
    }
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedRoom, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to the latest message when messages change
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show loading skeleton while messages are loading
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Helper: Get sender avatar and name for each message
  // For room chat, use sender info from users list; for user chat, use selectedUser/authUser
  const getSenderInfo = (message) => {
    if (selectedRoom) {
      const sender = users.find((u) => u._id === message.senderId) || authUser;
      return {
        avatar: sender.profilePic || "/avatar.png",
        name: sender.fullName || "User",
      };
    } else {
      return {
        avatar:
          message.senderId === authUser._id
            ? authUser.profilePic || "/avatar.png"
            : selectedUser.profilePic || "/avatar.png",
        name:
          message.senderId === authUser._id
            ? authUser.fullName || "You"
            : selectedUser.fullName || "User",
      };
    }
  };

  // Main chat UI layout
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat header with room/user info and close/leave buttons */}
      <ChatHeader />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const senderInfo = getSenderInfo(message);
          return (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              {/* Sender avatar */}
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={senderInfo.avatar}
                    alt="profile pic"
                  />
                </div>
              </div>
              {/* Sender name and message timestamp */}
              <div className="chat-header mb-1">
                <span className="font-semibold text-xs">{senderInfo.name}</span>
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              {/* Message bubble with optional image and text */}
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message input box */}
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
