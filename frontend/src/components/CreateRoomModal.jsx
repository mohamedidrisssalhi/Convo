
// import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import uploadToCloudinary from "../lib/cloudinary";

const CreateRoomModal = ({ isOpen, onClose }) => {
  const { theme } = useThemeStore();
  const { users, createChatRoom, getChatRooms, setSelectedRoom } = useChatStore();
  const { authUser } = useAuthStore();
  const [roomName, setRoomName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([authUser?._id]);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(file);
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    let avatarUrl = "";
    if (avatar) {
      try {
        avatarUrl = await uploadToCloudinary(avatar);
      } catch (err) {
        setLoading(false);
        alert("Failed to upload avatar");
        return;
      }
    }
    await createChatRoom({ name: roomName.trim(), members: selectedUsers, avatar: avatarUrl });
    await getChatRooms();
    setLoading(false);
    setRoomName("");
    setAvatar(null);
    setAvatarPreview(null);
    setSelectedUsers([authUser?._id]);
    onClose();
  };

  return (
    isOpen && (
      <div>
        <h2>Create a New Chat Room</h2>
        <form onSubmit={handleSubmit}>
          {/* Avatar uploader */}
          <div>
            <label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
              {avatarPreview ? (
                <img src={avatarPreview} alt="Room avatar" />
              ) : (
                <span>No avatar</span>
              )}
            </label>
            <span>Room picture (optional)</span>
          </div>
          {/* Room name */}
          <div>
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>
          {/* Add members */}
          <div>
            <div>Add Members</div>
            <div>
              {users.filter(u => u._id !== authUser?._id).map((user) => (
                <label key={user._id}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserToggle(user._id)}
                  />
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                  />
                  <span>{user.fullName}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !roomName.trim()}
            >
              {loading ? "Creating..." : "Create Chat Room"}
            </button>
          </div>
        </form>
      </div>
    )
  );
};

export default CreateRoomModal;
