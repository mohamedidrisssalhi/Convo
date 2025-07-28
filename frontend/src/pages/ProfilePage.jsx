import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

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

  return (
    <div>
      <h1>Profile</h1>
      <p>Your profile information</p>
      <div>
        <img src={selectedImg || authUser?.profilePic || "/avatar.png"} alt="Profile" />
        <label htmlFor="avatar-upload">
          Upload
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUpdatingProfile}
          />
        </label>
      </div>
      <p>{isUpdatingProfile ? "Uploading..." : "Click upload to update your photo"}</p>
      <div>
        <span>Full Name</span>
        <p>{authUser?.fullName}</p>
      </div>
      <div>
        <span>Email</span>
        <p>{authUser?.email}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
