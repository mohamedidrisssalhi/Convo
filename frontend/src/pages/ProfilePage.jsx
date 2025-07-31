import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Camera, Mail, User } from "lucide-react";

// ...existing code...


const ProfilePage = () => {
  // Change Password UI state
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const { changePassword, authUser, isUpdatingProfile, updateProfile, checkAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [setupSuccess, setSetupSuccess] = useState(false);
  // Removed Google link/unlink logic
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") === "1" && authUser?.needsProfileSetup) {
      setShowSetup(true);
    }
  }, [authUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") === "1" && authUser?.needsProfileSetup) {
      setShowSetup(true);
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) return toast.error("New password must be at least 6 characters");
    if (newPw !== confirmPw) return toast.error("Passwords do not match");
    setPwLoading(true);
    try {
      await changePassword({ oldPassword: oldPw, newPassword: newPw });
      setOldPw(""); setNewPw(""); setConfirmPw(""); setShowChangePw(false);
    } catch (err) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (showSetup) {
    return (
      <>
        <div className="h-screen pt-20 flex items-center justify-center">
          <div className="max-w-md w-full bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold ">Complete Your Profile</h1>
              <p className="mt-2">Set a password and profile picture to finish signing up.</p>
            </div>
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateProfile({ password, profilePic: selectedImg });
                setSetupSuccess(true);
                setShowSetup(false);
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 "
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      absolute bottom-0 right-0 
                      bg-base-content hover:scale-105
                      p-2 rounded-full cursor-pointer 
                      transition-all duration-200
                      ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                    `}
                  >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <p className="text-sm text-zinc-400">
                  {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
                </p>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Set Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Set a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Saving..." : "Finish Setup"}
              </button>
              {setupSuccess && (
                <div className="text-green-500 text-center mt-2">Profile setup complete!</div>
              )}
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>
          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {editMode ? (
                <input
                  className="input input-bordered w-full"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Full Name"
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              {editMode ? (
                <input
                  className="input input-bordered w-full"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {editMode ? (
              <>
                <button
                  className="btn btn-primary"
                  disabled={isUpdatingProfile}
                  onClick={async () => {
                    await updateProfile({ fullName: editName, email: editEmail });
                    setEditMode(false);
                  }}
                >Save</button>
                <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => {
                  setEditName(authUser.fullName);
                  setEditEmail(authUser.email);
                  setEditMode(true);
                }}>Edit Profile</button>
                {/* Change Password Button next to Edit Profile */}
                <button className="btn btn-outline" onClick={() => setShowChangePw(true)}>Change Password</button>
              </>
            )}
          </div>
          {/* Change Password Modal/Form */}
          {showChangePw && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-base-300 rounded-xl p-8 w-full max-w-md shadow-lg">
                <form className="space-y-3" onSubmit={handleChangePassword}>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Current password"
                    value={oldPw}
                    onChange={e => setOldPw(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="New password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    minLength={6}
                    required
                  />
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    minLength={6}
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button className="btn btn-primary" type="submit" disabled={pwLoading}>{pwLoading ? "Saving..." : "Change Password"}</button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowChangePw(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Wrap the following in a fragment to avoid adjacent JSX elements */}
          <>
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
            {/* Google link/unlink buttons removed */}
          </>
        </div>
      </div>
    </div>
  );
}
export default ProfilePage;
