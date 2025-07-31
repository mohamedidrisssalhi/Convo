import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
      setSuccess(true);
      toast.success("Password reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-base-300 p-8 rounded-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="btn btn-primary w-full" disabled={loading || success}>
          {loading ? "Resetting..." : success ? "Success!" : "Reset Password"}
        </button>
        {success && <div className="alert alert-success mt-2">Password reset! Redirecting...</div>}
      </form>
    </div>
  );
};

export default ResetPasswordPage;
