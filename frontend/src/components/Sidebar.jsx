// Sidebar component: displays contacts and chat rooms, allows switching between them
import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import FriendsList from "./FriendsList";
import { Users, UserPlus, UserCheck, Search } from "lucide-react";
import toast from "react-hot-toast";


// Main Sidebar UI for contacts and chat rooms
const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    chatRooms,
    getChatRooms,
    selectedRoom,
    setSelectedRoom,
    joinChatRoom,
    isRoomsLoading,
  } = useChatStore();
  // Track if this is the first load for skeleton
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (!isUsersLoading && !isRoomsLoading) isFirstLoad.current = false;
  }, [isUsersLoading, isRoomsLoading]);

  // Messenger-style: Animate badge when unreadCount increases
  const prevUnreadCounts = useRef({});
  // ...all logic and hooks above...
  // Main sidebar layout: friends and group chats
  // ...existing code...


  // Only fetch users and chat rooms on mount (first load)
  useEffect(() => {
    if (!users.length) getUsers();
    if (!chatRooms.length) getChatRooms();
    // After first load, all updates are socket-driven (see useChatStore.js)
  }, []);

  // Remove old onlineFriends/offlineFriends logic; now handled in FriendsList

  // Add Friend modal state and logic
  const [activePanel, setActivePanel] = useState(null); // 'add', 'search', 'requests', or null
  const [friendSearch, setFriendSearch] = useState("");
  const [friendInput, setFriendInput] = useState("");

  // Zustand friends system state/actions
  const {
    friends,
    incomingRequests,
    getFriends,
    getIncomingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    setIncomingRequests
  } = useChatStore();

  // UI state for add friend bar
  const [friendRequestStatus, setFriendRequestStatus] = useState("");
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  // State for managing group chats UI
  const [groupChatsCollapsed, setGroupChatsCollapsed] = useState(false); // Collapse/expand group chats
  const [groupChatsHeight, setGroupChatsHeight] = useState(160); // Height of group chat area (px)
  const [dragging, setDragging] = useState(false); // Drag state for resizing group chat area

  // Fetch friends and requests on mount
  useEffect(() => {
    getFriends();
    getIncomingRequests();
  }, []);

  // Add friend handler
  const handleSendFriendRequest = async (input) => {
    setFriendRequestLoading(true);
    setFriendRequestStatus("");
    if (!input || input.length < 3) {
      setFriendRequestStatus("Please enter a valid username.");
      setFriendRequestLoading(false);
      return;
    }
    try {
      await sendFriendRequest(input);
      setFriendRequestStatus("Friend request sent!");
      setFriendInput("");
      getSentRequests();
    } catch (e) {
      setFriendRequestStatus("Failed to send friend request.");
    }
    setFriendRequestLoading(false);
  };
  // Accept/reject handlers
  const handleAcceptRequest = async (user) => {
    await acceptFriendRequest(user._id);
    getFriends();
    getIncomingRequests();
  };
  const handleRejectRequest = async (user) => {
    // Optimistically remove from UI
    const prevIncoming = [...safeIncomingRequests];
    setIncomingRequests(safeIncomingRequests.filter(u => u._id !== user._id));
    try {
      await rejectFriendRequest(user._id);
      getIncomingRequests();
    } catch (e) {
      setIncomingRequests(prevIncoming);
      toast.error("Failed to reject request");
    }
  };


  // Cancel sent friend request handler (pro version)
  // handleCancelRequest removed: users can no longer cancel sent requests

  // Defensive: ensure required data is present
  const safeAuthUser = typeof authUser === 'object' && authUser !== null ? authUser : {};
  const safeSelectedRoom = typeof selectedRoom === 'object' && selectedRoom !== null ? selectedRoom : {};
  const safeChatRooms = Array.isArray(chatRooms) ? chatRooms : [];
  const safeIncomingRequests = Array.isArray(incomingRequests) ? incomingRequests : [];

  // Show loading skeleton if users or rooms are loading
  if (isFirstLoad.current && (isUsersLoading || isRoomsLoading)) return <SidebarSkeleton />;

  // Main sidebar layout: friends and group chats
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative bg-base-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Friends Section */}
        <div className="border-b border-base-300 w-full p-5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Friends</span>
            {/* Add a friend icon */}
            <button
              className="ml-2 relative group"
              title="Add a friend"
              onClick={() => setActivePanel(activePanel === 'add' ? null : 'add')}
              type="button"
            >
              <UserPlus className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </button>
            {/* Outgoing friend requests icon */}
            <button
              className="ml-1 relative group"
              title="Pending Invites"
              onClick={() => setActivePanel(activePanel === 'requests' ? null : 'requests')}
              type="button"
            >
              <UserCheck className="size-5 text-primary group-hover:scale-110 transition-transform" />
              {safeIncomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">{safeIncomingRequests.length}</span>
              )}
            </button>
            {/* Search friends icon */}
            <button
              className="ml-1 group"
              title="Search Friends"
              onClick={() => setActivePanel(activePanel === 'search' ? null : 'search')}
              type="button"
            >
              <Search className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </button>
            {/* Removed presence selector as requested */}
          </div>
        </div>
        {/* Friends grouped by online/offline with expand/collapse and search/add/request panels */}
        <div className="overflow-y-auto w-full py-3 pr-1 flex-1 transition-all duration-200">
          {/* Add a friend bar */}
          {activePanel === 'add' && (
            <div className="mb-2 flex items-center gap-2 px-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                placeholder="Enter username..."
                value={friendInput}
                onChange={e => setFriendInput(e.target.value)}
                autoFocus
              />
              <button
                className="btn btn-xs btn-primary"
                onClick={() => handleSendFriendRequest(friendInput)}
                disabled={friendRequestLoading}
              >
                {friendRequestLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          )}
          {/* Friend search bar */}
          {activePanel === 'search' && (
            <div className="mb-2 flex items-center gap-2 px-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                placeholder="Search friends..."
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {activePanel === 'requests' && (
            <div className="mb-2 px-2">
              <div className="font-semibold text-sm mb-1">Incoming Requests <span className="text-xs text-zinc-400">({safeIncomingRequests.length})</span></div>
              <ul className="space-y-1 mb-2">
                {safeIncomingRequests.length === 0 && <li className="text-xs text-zinc-500">No incoming requests</li>}
                {safeIncomingRequests.map(user => (
                  <li key={user._id} className="flex items-center gap-2 p-2 rounded bg-base-200">
                    <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-7 rounded-full" />
                    <span className="flex-1 truncate">{user.fullName} <span className="text-xs text-zinc-400">@{user.username}</span></span>
                    <button className="btn btn-xs btn-success" onClick={() => handleAcceptRequest(user)}>Accept</button>
                    <button className="btn btn-xs btn-error" onClick={() => handleRejectRequest(user)}>Reject</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Friends List (only mutually accepted friends) */}
          <FriendsList friendSearch={friendSearch} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </div>

        {/* Group Chats (blended, collapsible, draggable) */}
        <div id="sidebar-groupchats" className="border-t border-base-300 bg-base-200/95 shadow-inner select-none relative">
          {/* Draggable resizer - always on top, not covered by sticky header */}
          <div
            className="w-full h-2 cursor-row-resize flex items-center justify-center group"
            style={{ position: 'relative', zIndex: 20 }}
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
            aria-label="Resize group chats"
          >
            <div className="w-8 h-1.5 rounded bg-base-300 group-hover:bg-base-400 transition-colors" />
          </div>
          {/* Sticky header below drag handle */}
          <div className="flex w-full items-center gap-2 px-4 py-2 group hover:bg-base-300/60 transition-colors sticky top-2 z-10 bg-base-200/95">
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => {
                if (groupChatsCollapsed || groupChatsHeight <= 0) {
                  setGroupChatsCollapsed(false);
                  setGroupChatsHeight(160);
                } else {
                  setGroupChatsCollapsed(true);
                  setGroupChatsHeight(0);
                }
              }}
              aria-label={groupChatsCollapsed ? 'Expand group chats' : 'Collapse group chats'}
              style={{ userSelect: 'none' }}
            >
              <span className={`transition-transform duration-200 ${groupChatsCollapsed ? 'rotate-90' : ''}`}> 
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="font-semibold text-base-content/80 text-sm flex-1 text-left hidden lg:block">Chat Rooms</span>
              <span className="font-semibold text-base-content/80 text-xs flex-1 text-left block lg:hidden">Rooms</span>
            </button>
            {/* Button to open create room modal */}
            <button
              type="button"
              className="ml-auto flex items-center justify-center rounded hover:bg-base-300/60 transition-colors p-1"
              onClick={e => {
                e.stopPropagation();
                if (window.openCreateRoomModal) window.openCreateRoomModal();
              }}
              aria-label="Create Chat Room"
              tabIndex={0}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* List of group chat rooms */}
          {groupChatsHeight > 0 && (
            <div
              className="overflow-y-auto custom-scrollbar"
              style={{ maxHeight: groupChatsHeight, minHeight: 0, transition: 'max-height 0.2s, min-height 0.2s' }}
            >
              {safeChatRooms.length === 0 && (
                <div className="text-center text-zinc-500 py-4">No chat rooms</div>
              )}
              {safeChatRooms.map((room) => {
                const isMember = Array.isArray(room.members) && safeAuthUser?._id ? room.members.includes(safeAuthUser._id) : false;
                return (
                  <div
                    key={room._id}
                    className={`w-full flex items-center gap-3 hover:bg-base-300/80 transition-colors px-2 py-2 lg:px-3 lg:py-2 ${safeSelectedRoom?._id === room._id ? "bg-base-300 ring-1 ring-primary/40" : ""}`}
                    style={{ borderBottom: '1px solid var(--tw-border-opacity, 0.1)' }}
                  >
                    <button
                      onClick={() => {
                        if (isMember) {
                          setSelectedRoom(room); // This will also clear selectedUser
                        } else {
                          joinChatRoom(room._id);
                        }
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      style={{ background: "none", border: "none", padding: 0 }}
                    >
                      {/* Room avatar or initials */}
                      <div className="relative">
                        {room.avatar ? (
                          <img src={room.avatar} alt="avatar" className="size-12 object-cover rounded-full border border-base-300" />
                        ) : (
                          <span className="size-12 rounded-full bg-base-300 flex items-center justify-center text-base-content/70 text-xl font-bold uppercase border border-base-300">
                            {room.name?.replace(/[^a-zA-Z0-9]/g, '').slice(0,2) || 'GC'}
                          </span>
                        )}
                        {/* Unread badge */}
                        {room.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 rounded-full w-3 h-3 bg-red-500" />
                        )}
                      </div>
                      {/* Room name - hidden on small screens, visible on lg+ */}
                      <div className="min-w-0 flex-1 text-left hidden lg:block">
                        <div className="font-medium truncate text-base-content text-xs lg:text-sm">{room.name}</div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
export default Sidebar;
