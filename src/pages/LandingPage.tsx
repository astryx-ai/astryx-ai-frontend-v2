import { STRATEGIES } from "@/constants/signinConstants";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import AuthModal from "../components/AuthModal";
import { useState } from "react";
import ThemeToggleIcon from "../components/ui/ThemeToggleIcon";
import { useTheme } from "@/lib/useTheme";
import LandingOverview from "@/components/LandingOverview";
import LandingFooter from "@/components/LandingFooter";
import { ChartCandlestick } from "lucide-react";

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
            className="px-6 py-2 bg-blue-astryx hover:bg-blue-astryx dark:bg-white dark:text-black relative after:absolute after:border after:border-(--primary-blue) dark:after:border-white after:rounded-full after:left-1 after:-bottom-1 after:h-full after:w-full after:-z-10 after:bg-white dark:after:bg-transparent text-white rounded-full transition-all duration-200 font-semibold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto mt-[8%] border-2 border-(--primary-blue) py-10 px-2 md:p-10 bg-white dark:bg-black-90 dark:border-white-80 rounded-4xl shdw-box-r">
          <div className="flex flex-col gap-4 text-xl sm:text-2xl md:text-3xl font-medium text-center font-family-parkinsans">
            <p className="text-(--primary-blue) font-bold dark:text-white-90">
              Build, test, and execute strategies,
            </p>
            <p className="text-(--primary-blue) dark:text-white-90">
              Let Astryx do it all for you!
            </p>
          </div>

          <div className="flex flex-col mt-10">
            {STRATEGIES.map(strategy => (
              <div
                key={strategy.id}
                className="flex items-center border-b last:border-b-0 border-black-5 dark:border-white/5 hover:rounded-lg px-4 py-6 gap-4 cursor-pointer
                 
                  hover:bg-(--primary-blue) hover:text-white hover:dark:bg-black-85 
                  transition-colors startegy-card"
              >
                <span className="text-xl p-4 rounded-full border border-black-50 strategy-icon dark:bg-black-80/80">
                  <span className="text-(--primary-blue) dark:text-white strategy-icon">
                    {strategy.icon}
                  </span>
                </span>
                <div>
                  <p className="font-medium text-(--primary-blue) dark:text-white-90 title">
                    {strategy.title}
                  </p>
                  <p className="text-sm text-black-50 dark:text-white-60 mt-1 desc">
                    {strategy.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-2xl m-auto mt-10 ps-14">
          <p className="text-(--primary-blue) dark:text-white font-semibold">
            ↓ <span className="ps-10">know more...</span>
          </p>
        </div>

        <div className="w-full my-32 py-10">
          <div className="flex flex-col gap-10 lg:flex-row justify-center items-center">
            <div className="text-(--primary-blue) dark:text-white font-medium text-lg xl:text-xl xl:ps-20">
              <h3>Astryx blends deep multi-asset intelligence with everyday automation.</h3>
              <h3 className="mt-3">
                From filtering market noise to delivering decision-ready insights
              </h3>
              <h3> —right where you trade.</h3>
            </div>
            <div className="card-stack relative flex items-center justify-center w-full h-full py-10 translate-x-[-20%] lg:translate-x-[-40px] mt-3">
              <div className="h-[110px] sm:h-[170px] md:h-[250px] w-[200px] bg-white rounded-2xl shdw-box border-(--primary-blue) dark:border-white dark:bg-black-90 border-2 p-4 flex justify-start items-end translate-x-[120px] md:translate-x-[328px]">
                <div className="text-(--primary-blue) dark:text-white font-semibold text-sm md:text-base">
                  <p>Price</p>
                  <p>Fluctuation</p>
                </div>
              </div>
              <div className="h-[130px] sm:h-[170px] md:h-[250px] w-[200px] rounded-2xl shdw-box bg-(--primary-blue) dark:bg-black-95 dark:border-white border-white border-2 p-4 flex flex-col justify-between py-4 items-start md:translate-x-[217px] translate-x-[83px] md:translate-y-[-66px] translate-y-[-51px] rotate-[17deg] z-[1]">
                <ChartCandlestick color="white" />
                <div className="text-white font-semibold text-sm md:text-base">
                  <p>Fundamental</p>
                  <p>Analysis</p>
                </div>
              </div>
              <div className="h-[130px] sm:h-[170px] md:h-[250px] bg-white w-[200px] rounded-2xl shdw-box border-(--primary-blue) dark:bg-black-90 dark:border-white  border-2 p-4 flex justify-start items-end translate-x-[-10px] translate-y-[28px] md:translate-x-[100px] md:translate-y-[90px] rotate-[-5deg]">
                <div className="text-(--primary-blue) dark:text-white font-semibold text-sm md:text-base">
                  <p>News</p>
                  <p>Sentiment</p>
                </div>
              </div>
              <div className="h-[130px] sm:h-[170px] md:h-[250px] bg-white w-[200px] rounded-2xl shdw-box border-(--primary-blue) dark:bg-black-90 dark:border-white border-2 p-4 flex justify-start items-end translate-x-[-34px] translate-y-[-31px] md:translate-x-[-7px] md:translate-y-[-8px] rotate-[-23deg] z-[2]">
                <div className="text-(--primary-blue) dark:text-white font-semibold text-sm md:text-base">
                  <p>Macro</p>
                  <p>Indicators</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative my-40">
          <LandingOverview />
        </div>

        <div className="relative my-40">
          <LandingOverview sectionName={"deep-research"} />
          {theme !== "dark" ? (
            <img
              src={"/chat.png"}
              alt="Image"
              className="w-[450px] h-[300px] md:h-[240px] md:w-[350px] lg:h-[350px] lg:w-[500px] rounded-3xl shadow-2xl dark:shadow-white-30 absolute -bottom-20 md:right-16 xl:right-40 md:top-24"
            />

          ) : (
            <img
            src={"/chat-dark.png"}
            alt="Image"
            className="w-[450px] h-[300px] md:h-[240px] md:w-[350px] lg:h-[350px] lg:w-[500px] rounded-3xl shadow-2xl dark:shadow-white-30 absolute -bottom-20 md:right-16 xl:right-40 md:top-24"
          />
          )}
        </div>

        <div className="relative my-40">
          <LandingOverview sectionName={"scheduling-alerts"} />
          {theme !== "dark" ? (
            <img
              src={"/chat.png"}
              alt="Image"
              className="w-[450px] h-[300px] md:h-[240px] md:w-[350px] lg:h-[350px] lg:w-[500px] rounded-3xl shadow-2xl dark:shadow-white-30 absolute top-20 md:-left-6 xl:left-30 md:top-30"
            />

          ): (
            <img
            src={"/chat-dark.png"}
            alt="Image"
            className="w-[450px] h-[300px] md:h-[240px] md:w-[350px] lg:h-[350px] lg:w-[500px] rounded-3xl shadow-2xl dark:shadow-white-30 absolute top-20 md:-left-6 xl:left-30 md:top-30"
          />
          )}
        </div>
      </div>
      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={open => setIsAuthModalOpen(open)} />
    </div>
  );
};

export default LandingPage;
