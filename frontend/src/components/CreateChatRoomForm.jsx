import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const CreateChatRoomForm = () => {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const createChatRoom = useChatStore((s) => s.createChatRoom);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    await createChatRoom(roomName.trim());
    setRoomName("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="New room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !roomName.trim()}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
};

export default CreateChatRoomForm;
