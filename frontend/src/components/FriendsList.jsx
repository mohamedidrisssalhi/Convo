import React, { useMemo, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// FriendsList: Only shows mutually accepted friends, grouped by online/offline
const FriendsList = ({ friendSearch, selectedUser, setSelectedUser }) => {
  const { friends } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Group friends by online/offline
  const onlineFriends = useMemo(
    () => friends.filter((user) => onlineUsers.includes(user._id)),
    [friends, onlineUsers]
  );
  const offlineFriends = useMemo(
    () => friends.filter((user) => !onlineUsers.includes(user._id)),
    [friends, onlineUsers]
  );

  // Expand/collapse state
  const [onlineExpanded, setOnlineExpanded] = useState(true);
  const [offlineExpanded, setOfflineExpanded] = useState(true);

  // Filter by search
  const filterFn = (user) =>
    user.fullName.toLowerCase().includes(friendSearch.toLowerCase()) ||
    user.username?.toLowerCase().includes(friendSearch.toLowerCase());

  return (
    <>
      {/* Online Friends */}
      <div>
        <button
          className="w-full flex items-center gap-2 px-2 py-1 hover:bg-base-300/60 rounded transition-colors"
          type="button"
          aria-label={`Online friends`}
          tabIndex={0}
          onClick={() => setOnlineExpanded((prev) => !prev)}
        >
          <svg
            width="12"
            height="12"
            className={`transition-transform duration-200 ${onlineExpanded ? '' : 'rotate-[-90deg]'}`}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-xs text-base-content/80 flex-1 text-left">Online ({onlineFriends.length})</span>
        </button>
        {onlineExpanded && (
          <ul className="space-y-1 mt-1">
            {onlineFriends.filter(filterFn).map((user) => (
              <li key={user._id} className="transition-all duration-200">
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                  style={{ transition: 'background 0.2s, box-shadow 0.2s' }}
                  tabIndex={0}
                  aria-label={`Chat with ${user.fullName}`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img src={user.profilePic || "/avatar.png"} alt={user.name} className="size-12 object-cover rounded-full" />
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    {user.unreadCount > 0 && (
                      <span id={`badge-${user._id}`} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">Online</div>
                  </div>
                </button>
              </li>
            ))}
            {onlineFriends.filter(filterFn).length === 0 && (
              <div className="text-center text-zinc-500 py-2 text-xs">No friends online</div>
            )}
          </ul>
        )}
      </div>
      {/* Offline Friends */}
      <div className="mt-2">
        <button
          className="w-full flex items-center gap-2 px-2 py-1 hover:bg-base-300/60 rounded transition-colors"
          type="button"
          aria-label={`Offline friends`}
          tabIndex={0}
          onClick={() => setOfflineExpanded((prev) => !prev)}
        >
          <svg
            width="12"
            height="12"
            className={`transition-transform duration-200 ${offlineExpanded ? '' : 'rotate-[-90deg]'}`}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-xs text-base-content/80 flex-1 text-left">Offline ({offlineFriends.length})</span>
        </button>
        {offlineExpanded && (
          <ul className="space-y-1 mt-1">
            {offlineFriends.filter(filterFn).map((user) => (
              <li key={user._id} className="transition-all duration-200 opacity-60">
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                  style={{ transition: 'background 0.2s, box-shadow 0.2s' }}
                  tabIndex={0}
                  aria-label={`Chat with ${user.fullName}`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img src={user.profilePic || "/avatar.png"} alt={user.name} className="size-12 object-cover rounded-full grayscale" />
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">Offline</div>
                  </div>
                </button>
              </li>
            ))}
            {offlineFriends.filter(filterFn).length === 0 && (
              <div className="text-center text-zinc-500 py-2 text-xs">No friends offline</div>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default FriendsList;
