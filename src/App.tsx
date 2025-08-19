import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import SavedChats from "./pages/SavedChats";
import TaskScheduler from "./pages/TaskScheduler";
import TaskNotifications from "./pages/TaskNotifications";
import TaskDetail from "./pages/TaskDetail";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import useAuthStore from "./store/authStore";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsNConditions";

function App() {
  const { session, setSession, loading, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={session ? <Home /> : <LandingPage />} />
          <Route path="/saved" element={session ? <SavedChats /> : <LandingPage />} />
          <Route path="/task-scheduler" element={session ? <TaskScheduler /> : <LandingPage />} />
          <Route
            path="/task-notifications"
            element={session ? <TaskNotifications /> : <LandingPage />}
          />
          <Route
            path="/task-scheduler/:taskId"
            element={session ? <TaskDetail /> : <LandingPage />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
