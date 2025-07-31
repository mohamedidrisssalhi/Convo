import React from "react";
import { useChatStore } from "../store/useChatStore";

const RoomMembersModal = ({ open, onClose }) => {
  const { roomMembers } = useChatStore();
  if (!open) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h2 className="font-bold text-lg mb-4">Room Members</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {roomMembers && roomMembers.length > 0 ? (
            roomMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2 rounded hover:bg-base-200">
                <div className="avatar">
                  <div className="size-8 rounded-full bg-base-300 overflow-hidden">
                    <img src={member.profilePic || "/avatar.png"} alt={member.fullName} className="object-cover w-full h-full" />
                  </div>
                </div>
                <span className="font-medium">{member.fullName}</span>
              </div>
            ))
          ) : (
            <div className="text-base-content/60">No members found.</div>
          )}
        </div>
        <div className="modal-action mt-4">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RoomMembersModal;
