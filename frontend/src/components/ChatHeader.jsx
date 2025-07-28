import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedRoom, setSelectedRoom, chatRooms, roomMembers } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  if (selectedRoom) {
    // Find room info
    const room = chatRooms.find((r) => r._id === selectedRoom._id) || selectedRoom;
    return (
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
              <p className="text-sm text-base-content/70 transition-all duration-300" style={{ minWidth: 60, display: 'inline-block' }}>
                {roomMembers?.length ?? room.members?.length ?? 0} members
              </p>
            </div>
          </div>
          {/* Close button */}
          <button onClick={() => setSelectedRoom(null)}>
            <X />
          </button>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            </div>
            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    );
  }
  return null;
};
export default ChatHeader;
