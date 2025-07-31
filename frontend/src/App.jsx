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
import LinkSuccessPage from "./pages/LinkSuccessPage";
import LinkErrorPage from "./pages/LinkErrorPage";
import { bindChatSocketEvents } from "./store/useChatStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";


// Main App component: handles theme, authentication, and routing
const App = () => {
  // Get authentication and theme state from Zustand stores
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket, bindSocketEvents } = useAuthStore();
  // Bind socket events for real-time updates after authUser and socket are set
  useEffect(() => {
    if (authUser && socket) {
      bindSocketEvents();
      bindChatSocketEvents(socket);
    }
  }, [authUser, socket, bindSocketEvents]);
  const { theme } = useThemeStore();

  // Log online users for debugging
  console.log({ onlineUsers });

  // On mount, check if the user is authenticated (e.g., by checking JWT)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Log current authenticated user for debugging
  console.log({ authUser });

  // Check for token in URL (after Google redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const setup = params.get("setup");
    if (token) {
      localStorage.setItem("jwt", token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Call checkAuth to update state
      checkAuth();
      // Set a flag so we know to redirect after authUser is set
      if (setup === "1") {
        localStorage.setItem("justLoggedInProfile", "1");
      } else {
        localStorage.setItem("justLoggedInHome", "1");
      }
    }
  }, [checkAuth]);

  // After authUser is set, redirect if justLoggedIn flag is present
  useEffect(() => {
    if (authUser) {
      if (localStorage.getItem("justLoggedInProfile")) {
        localStorage.removeItem("justLoggedInProfile");
        window.location.href = "/profile";
      } else if (localStorage.getItem("justLoggedInHome")) {
        localStorage.removeItem("justLoggedInHome");
        window.location.href = "/";
      }
    }
  }, [authUser]);

  // Show a loading spinner while checking authentication
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Main app layout and routing
  return (
    <div data-theme={theme} className="min-h-screen flex flex-col bg-base-200">
      <Toaster position="top-center" />
      {/* Navigation bar at the top */}
      <Navbar />
      <ErrorBoundary>
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

          {/* Google link popup result pages */}
          <Route path="/profile/link-success" element={<LinkSuccessPage />} />
          <Route path="/profile/link-error" element={<LinkErrorPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
