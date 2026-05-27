import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AuthProvider,
  useAuth,
  ADMIN_UIDS,
  parseDate,
  isUserAdmin as checkIsAdmin,
} from "./hooks/useAuth";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Courses from "./pages/Courses";
import IELTS from "./pages/IELTS";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Vocabulary from "./pages/Vocabulary";
import LevelTest from "./pages/LevelTest";
import Grammar from "./pages/Grammar";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/AdminPanel";
import Pricing from "./pages/Pricing";
import Leaderboard from "./pages/Leaderboard";
import Battle from "./pages/Battle";
import Certificates from "./pages/Certificates";
import FeedbackButton from "./components/FeedbackButton";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const protectedRoutes = [
      "/courses",
      "/grammar",
      "/vocabulary",
      "/level-test",
      "/ielts",
      "/dashboard",
      "/leaderboard",
      "/battle",
      "/certificates",
      "/admin",
    ];

    const currentPath = location.pathname.toLowerCase();
    const isProtected = protectedRoutes.some(
      (route) => currentPath === route || currentPath.startsWith(route + "/"),
    );

    if (!isProtected) return;

    // 1. Not logged in -> Go to login
    if (!user || !profile) {
      navigate("/login");
      return;
    }

    // 2. Admin access always allowed
    const isUserAdmin = checkIsAdmin(user);
    if (isUserAdmin) return;

    // Non-admins cannot access /admin
    if (currentPath.startsWith("/admin") && !isUserAdmin) {
      navigate("/dashboard");
      return;
    }

    // 3. User verification of Trial or Paid Subscription
    const isTrialActive =
      profile.plan === "trial" &&
      profile.trialExpiry &&
      parseDate(profile.trialExpiry).getTime() > Date.now();

    const isSubscriptionPaid =
      (profile.plan === "pro" || profile.plan === "premium") &&
      profile.paymentStatus === "Paid" &&
      (profile.planExpiry || profile.accessExpiry) &&
      parseDate(profile.planExpiry || profile.accessExpiry).getTime() >
        Date.now();

    const hasAccess = isTrialActive || isSubscriptionPaid;

    if (!hasAccess) {
      navigate("/pricing");
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#58007E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#141414]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/level-test" element={<LevelTest />} />
            <Route path="/ielts" element={<IELTS />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <FeedbackButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
