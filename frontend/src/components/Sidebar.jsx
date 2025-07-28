
// Sidebar component: displays contacts and chat rooms, allows switching between them
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";


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
    leaveChatRoom,
    isRoomsLoading,
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  // State for filtering contacts and managing group chat area
  const [showOnlineOnly, setShowOnlineOnly] = useState(false); // Show only online contacts
  const [groupChatsCollapsed, setGroupChatsCollapsed] = useState(false); // Collapse/expand group chats
  const [groupChatsHeight, setGroupChatsHeight] = useState(160); // Height of group chat area (px)
  const [dragging, setDragging] = useState(false); // Drag state for resizing group chat area

  // Keep collapse state and height in sync for group chats

  // Keep collapse state and height in sync for group chats
  useEffect(() => {
    if (groupChatsHeight <= 0 && !groupChatsCollapsed) {
      setGroupChatsCollapsed(true);
    } else if (groupChatsHeight > 0 && groupChatsCollapsed) {
      setGroupChatsCollapsed(false);
    }
  }, [groupChatsHeight, groupChatsCollapsed]);

  // Mouse/touch drag handlers for group chats

  // Handle mouse/touch drag for resizing group chat area
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      let clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const sidebarRect = document.getElementById('sidebar-groupchats')?.getBoundingClientRect();
      if (!sidebarRect) return;
      // Calculate new height based on mouse position from top of group chats area
      let newHeight = sidebarRect.bottom - clientY;
      // Clamp height: allow 0 (fully collapsed) up to 320px
      newHeight = Math.max(0, Math.min(newHeight, 320));
      setGroupChatsHeight(newHeight);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);


  // Fetch users and chat rooms on mount
  useEffect(() => {
    getUsers();
    getChatRooms();
  }, [getUsers, getChatRooms]);


  // Filter users based on online status if toggled
  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;


  // Show loading skeleton if users or rooms are loading
  if (isUsersLoading || isRoomsLoading) return <SidebarSkeleton />;


  // Main sidebar layout: contacts and group chats
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative bg-base-100">
      {/* Contacts + Group Chats (blended, Steam-like) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contacts Section */}
        <div className="border-b border-base-300 w-full p-5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <div className="mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        </div>
        {/* List of contacts */}
        <div className="overflow-y-auto w-full py-3 pr-1 flex-1">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                setSelectedUser(user); // This will also clear selectedRoom
              }}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              {/* User avatar and online indicator */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>
              {/* User name and status */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No online users</div>
          )}
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
              {chatRooms.length === 0 && (
                <div className="text-center text-zinc-500 py-4">No chat rooms</div>
              )}
              {chatRooms.map((room) => {
                const isMember = room.members.includes(authUser?._id);
                return (
                  <div
                    key={room._id}
                    className={`w-full flex items-center gap-3 hover:bg-base-300/80 transition-colors px-2 py-2 lg:px-3 lg:py-2 ${selectedRoom?._id === room._id ? "bg-base-300 ring-1 ring-primary/40" : ""}`}
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
};
export default Sidebar;
