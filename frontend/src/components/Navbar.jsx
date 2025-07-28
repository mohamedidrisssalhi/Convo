import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Hash } from "lucide-react";
import { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  const [showRoomModal, setShowRoomModal] = useState(false);

  // Expose a global function to open the create room modal from anywhere (e.g., Sidebar)
  if (typeof window !== 'undefined') {
    window.openCreateRoomModal = () => setShowRoomModal(true);
  }

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Convo</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Chat Room Button removed as per new design */}
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    {showRoomModal && (
      <CreateRoomModal isOpen={showRoomModal} onClose={() => setShowRoomModal(false)} />
    )}
    </header>
  );
};
export default Navbar;
