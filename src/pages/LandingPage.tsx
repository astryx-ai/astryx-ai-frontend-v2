import { STRATEGIES } from "@/constants/signinConstants";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import AuthModal from "../components/AuthModal";
import { useState } from "react";
import ThemeToggleIcon from "../components/ui/ThemeToggleIcon";
import { useTheme } from "@/lib/useTheme";

const LandingPage = () => {
  const { session } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (session) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 dark:bg-black-95 hide-scrollbar">
      <div className="p-4 sticky top-0 z-10 bg-white/80 dark:bg-black-90/80 backdrop-blur-sm flex justify-between items-center border-b border-black-5 dark:border-white/5">
        <img
          src={theme === "dark" ? "/logo/logo-white.svg" : "/logo/logo.svg"}
          alt="astryx"
          className="w-auto h-10"
        />
        <div className="flex items-center gap-4">
          <ThemeToggleIcon theme={theme} onToggle={handleThemeToggle} />
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2 bg-blue-astryx/90 hover:bg-blue-astryx text-white rounded-full transition-all duration-200 font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto mt-[8%]">
          <div className="flex flex-col gap-4 text-xl sm:text-2xl md:text-3xl font-medium text-center font-family-parkinsans">
            <p className="text-black-90 dark:text-white-90">Build, test, and execute strategies,</p>
            <p className="text-black-90 dark:text-white-90">Let Astryx do it all for you!</p>
          </div>

          <div className="flex flex-col gap-2 mt-10">
            {STRATEGIES.map(strategy => (
              <div
                key={strategy.id}
                className="flex items-center border border-black-5 dark:border-white/5 rounded-lg p-4 gap-4 
                  bg-white/50 dark:bg-black-90/50
                  hover:bg-white hover:dark:bg-black-85 
                  transition-colors"
              >
                <span className="text-xl p-4 rounded-full bg-gray-100/80 dark:bg-black-80/80">
                  <span className="text-black-80 dark:invert">{strategy.icon}</span>
                </span>
                <div>
                  <p className="font-medium text-black-90 dark:text-white-90">{strategy.title}</p>
                  <p className="text-sm text-black-60 dark:text-white-60 mt-1">
                    {strategy.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={open => setIsAuthModalOpen(open)} />
    </div>
  );
};

export default LandingPage;
