
import { Dialog, Transition } from "@headlessui/react";
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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose} static>
        <div data-theme={theme} key={theme}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center z-[1001] px-4 py-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg mx-auto px-8 py-7 border border-base-300 focus:outline-none">
                <Dialog.Title className="text-2xl font-bold mb-6 text-center text-base-content">Create a New Chat Room</Dialog.Title>
                <form onSubmit={handleSubmit}>
                  {/* Avatar uploader */}
                  <div className="flex flex-col items-center mb-6">
                    <label className="relative group cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-all">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Room avatar" className="object-cover w-full h-full" />
                        ) : (
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-base-content/30"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        )}
                        <span className="absolute bottom-1 right-1 bg-primary text-white text-xs rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Upload</span>
                      </div>
                    </label>
                    <span className="text-xs mt-2 text-base-content/60">Room picture (optional)</span>
                  </div>
                  {/* Room name */}
                  <div className="mb-6">
                    <input
                      type="text"
                      className="input input-bordered w-full text-base bg-base-200 border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Room name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                    />
                  </div>
                  {/* Add members */}
                  <div className="mb-6">
                    <div className="font-semibold mb-3 text-base-content">Add Members</div>
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
                      {users.filter(u => u._id !== authUser?._id).map((user) => (
                        <label key={user._id} className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-base-200 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserToggle(user._id)}
                            className="checkbox checkbox-sm border-base-300"
                          />
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-base-300"
                          />
                          <span className="text-base-content text-sm font-medium">{user.fullName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button type="button" className="btn btn-ghost px-5" onClick={onClose} disabled={loading}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-6 shadow-md"
                      disabled={loading || !roomName.trim()}
                    >
                      {loading ? "Creating..." : "Create Chat Room"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateRoomModal;
