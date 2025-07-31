import React, { useState } from "react";
import RoomMembersModal from "./RoomMembersModal";
import { X, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedRoom, setSelectedRoom, chatRooms, roomMembers, removeFriend } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Dropdown state for user chat
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showMembersModal, setShowMembersModal] = useState(false);
  if (selectedRoom) {
    // Find room info
    const room = chatRooms.find((r) => r._id === selectedRoom._id) || selectedRoom;
    return (
      <>
        <div className="p-2.5 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar (same style as contacts) */}
              <div className="avatar">
                <div className="size-10 rounded-full relative bg-base-300 flex items-center justify-center overflow-hidden">
                  {room.avatar ? (
                    <img src={room.avatar} alt="avatar" className="object-cover w-full h-full" />
                  ) : (
                    <span className="font-bold text-base-content/70 text-lg uppercase flex items-center justify-center w-full h-full">
                      {room.name?.replace(/[^a-zA-Z0-9]/g, '').slice(0,2) || 'GC'}
                    </span>
                  )}
                </div>
              </div>
              {/* Info (same as contacts) */}
              <div>
                <h3 className="font-medium">{room.name}</h3>
                <button
                  className="text-xs text-base-content/70 hover:underline ml-0.5"
                  onClick={() => setShowMembersModal(true)}
                  style={{ minWidth: 60, display: 'inline-block' }}
                  aria-label="Show room members"
                >
                  {roomMembers?.length ?? room.members?.length ?? 0} members
                </button>
              </div>
            </div>
            {/* Close button */}
            <button onClick={() => { setSelectedRoom(null); setSelectedUser(null); }}>
              <X />
            </button>
          </div>
        </div>
        <RoomMembersModal open={showMembersModal} onClose={() => setShowMembersModal(false)} />
      </>
    );
  }

  if (selectedUser) {
    return (
      <div className="p-2.5 border-b border-base-300 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            </div>
            {/* User info + dropdown */}
            <div className="flex items-center gap-1">
              <div>
                <h3 className="font-medium flex items-center gap-1">
                  {selectedUser.fullName}
                  <button
                    className="ml-1 p-1 rounded hover:bg-base-300/60 transition-colors"
                    onClick={() => setDropdownOpen((v) => !v)}
                    style={{ lineHeight: 0 }}
                    aria-label="Show options"
                  >
                    <ChevronDown className={`size-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <p className="text-sm text-base-content/70">
                  {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
          {/* Close button */}
          <button onClick={() => { setSelectedUser(null); setSelectedRoom(null); }}>
            <X />
          </button>
        </div>
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute left-16 top-14 z-50 bg-base-200 border border-base-300 rounded shadow-lg py-1 w-36">
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 font-medium"
              onClick={async () => {
                setDropdownOpen(false);
                await removeFriend(selectedUser._id);
                setSelectedUser(null);
                setSelectedRoom(null);
              }}
              type="button"
            >
              Unfriend
            </button>
          </div>
        )}
      </div>
    );
  }
  return null;
};
export default ChatHeader;
