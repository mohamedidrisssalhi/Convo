import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-base-300 p-8 rounded-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-center text-base-content/60">Enter your email to receive a password reset link.</p>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full" disabled={loading || sent}>
          {loading ? "Sending..." : sent ? "Email Sent" : "Send Reset Link"}
        </button>
        {sent && <div className="alert alert-success mt-2">Check your email for a reset link.</div>}
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
