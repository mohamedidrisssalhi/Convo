import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

const Sidebar = () => {
  const {
    chatRooms,
    getChatRooms,
    selectedRoom,
    joinChatRoom,
    leaveChatRoom,
    setSelectedRoom,
    roomMembers,
  } = useChatStore();

  useEffect(() => {
    getChatRooms();
  }, [getChatRooms]);

  return (
    <aside className="w-64 bg-base-200 h-full p-4">
      <h2 className="text-lg font-bold mb-4">Chat Rooms</h2>
      <ul>
        {chatRooms.length === 0 && (
          <li className="text-center text-zinc-500 py-4">No chat rooms</li>
        )}
        {chatRooms.map((room) => (
          <li key={room._id} className={`mb-2 ${selectedRoom && selectedRoom._id === room._id ? 'font-bold' : ''}`}>
            <button
              className="w-full text-left px-2 py-1 rounded hover:bg-base-300"
              onClick={() => setSelectedRoom(room)}
            >
              {room.name}
            </button>
            {selectedRoom && selectedRoom._id === room._id && roomMembers.length > 0 && (
              <div className="text-xs text-zinc-500 mt-1 ml-2">
                Members: {roomMembers.map((m) => m.username || m).join(", ")}
              </div>
            )}
            <button
              className="ml-2 btn btn-xs btn-outline"
              onClick={() => leaveChatRoom(room._id)}
            >Leave</button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
