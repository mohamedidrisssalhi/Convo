
// Main chat container component: displays messages, header, and input for the selected chat
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useMemo, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import React from "react";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";


// ErrorBoundary for catching render errors in any child
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error("[ErrorBoundary]", error, errorInfo);
  }
  render() {
    if (this.state.error) {
      return <div className="text-red-500 p-8 text-center">Error: {this.state.error.message || this.state.error.toString()}</div>;
    }
    return this.props.children;
  }
}

const ChatContainer = () => {
  // Zustand chat store state and actions
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    selectedRoom,
    users,
  } = useChatStore();

  // Debug: log Zustand state on every render
  useEffect(() => {
    console.log("[DEBUG Zustand]", {
      messages,
      selectedUser,
      selectedRoom,
      users,
    });
  }, [messages, selectedUser, selectedRoom, users]);
  const { authUser } = useAuthStore(); // Authenticated user info
  const messageEndRef = useRef(null);  // Ref for auto-scrolling to latest message

  // Fetch messages only on initial chat/room select (socket keeps them live after)
  useEffect(() => {
    if (selectedRoom) {
      getMessages(selectedRoom._id, "room");
    } else if (selectedUser) {
      getMessages(selectedUser._id, "user");
    }
    // After initial load, all updates are socket-driven (see useChatStore.js)
  }, [selectedUser, selectedRoom]);

  // Always treat messages as an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Helper: Get sender avatar and name for each message
  // For room chat, use sender info from users list; for user chat, use selectedUser/authUser
  const getSenderInfo = (message) => {
    if (selectedRoom) {
      const sender = users.find((u) => u._id === message.senderId) || authUser;
      return {
        avatar: sender && sender.profilePic ? sender.profilePic : "/avatar.png",
        name: sender && sender.fullName ? sender.fullName : "User",
      };
    } else {
      return {
        avatar:
          authUser && message.senderId === authUser._id
            ? (authUser.profilePic || "/avatar.png")
            : (selectedUser && selectedUser.profilePic) || "/avatar.png",
        name:
          authUser && message.senderId === authUser._id
            ? (authUser.fullName || "You")
            : (selectedUser && selectedUser.fullName) || "User",
      };
    }
  };

  // Memoize message rendering for performance
  const renderedMessages = useMemo(() =>
    safeMessages.length > 0
      ? safeMessages.map((message) => {
          const senderInfo = getSenderInfo(message);
          return (
            <div
              key={message._id}
              className={`chat ${authUser && message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
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
        })
      : <div className="text-center text-zinc-400 py-8">No messages yet. Start the conversation!</div>
  , [safeMessages, authUser, users, selectedRoom, selectedUser]);

  // Auto-scroll to the latest message when messages change, with robust error handling
  useEffect(() => {
    try {
      if (messageEndRef.current && Array.isArray(messages) && messages.length > 0) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("[Auto-scroll effect error]", err, { messages, messageEndRef });
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


  // Main chat UI layout with error boundaries and robust fallback
  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Chat header with error boundary */}
        <ErrorBoundary>
          <ChatHeader />
        </ErrorBoundary>

        {/* Message list with fallback for undefined/null state */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {renderedMessages || <div className="text-center text-zinc-400 py-8">No messages to display.</div>}
        </div>

        {/* Message input box with error boundary */}
        <ErrorBoundary>
          <MessageInput />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};
export default ChatContainer;
