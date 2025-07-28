// Cloudinary upload utility for frontend
// Usage: import uploadToCloudinary from './cloudinary';

export default async function uploadToCloudinary(file) {
  // Use Vite env variable for cloud name
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhxqyj4pl";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app-avatars"); // You may need to create this preset in your Cloudinary dashboard

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  const data = await res.json();
  return data.secure_url;
}
