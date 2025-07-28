import { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";

const Navbar = () => {
  const [showRoomModal, setShowRoomModal] = useState(false);
  if (typeof window !== 'undefined') {
    window.openCreateRoomModal = () => setShowRoomModal(true);
  }
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center h-full">
          <span className="flex items-center gap-2.5 font-bold text-lg">Convo</span>
          <button className="ml-4 btn btn-sm btn-primary" onClick={() => setShowRoomModal(true)}>
            Create Room
          </button>
        </div>
      </div>
      {showRoomModal && (
        <CreateRoomModal isOpen={showRoomModal} onClose={() => setShowRoomModal(false)} />
      )}
    </header>
  );
};
export default Navbar;
