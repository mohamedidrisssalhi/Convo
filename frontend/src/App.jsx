
// Import main navigation bar
import Navbar from "./components/Navbar";

// Import main page components
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage"; // This is the RegisterForm component (user registration)
import LoginPage from "./pages/LoginPage";   // This is the LoginForm component (user login)
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";


// Main App component: handles theme, authentication, and routing
const App = () => {
  // Get authentication and theme state from Zustand stores
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  // Log online users for debugging
  console.log({ onlineUsers });

  // On mount, check if the user is authenticated (e.g., by checking JWT)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Log current authenticated user for debugging
  console.log({ authUser });

  // Show a loading spinner while checking authentication
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Main app layout and routing
  return (
    <div data-theme={theme}>
      {/* Navigation bar at the top */}
      <Navbar />

      {/* Define all app routes using React Router */}
      <Routes>
        {/* Home page: only accessible if authenticated */}
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        {/* Registration page: SignUpPage is the RegisterForm */}
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        {/* Login page: LoginPage is the LoginForm */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        {/* Settings page: accessible to all users */}
        <Route path="/settings" element={<SettingsPage />} />
        {/* Profile page: only accessible if authenticated */}
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Toast notifications for user feedback */}
      <Toaster />
    </div>
  );
};

export default App;
