import { STRATEGIES } from "@/constants/signinConstants";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import AuthModal from "../components/AuthModal";
import { useRef, useState } from "react";
import ThemeToggleIcon from "../components/ui/ThemeToggleIcon";
import { useTheme } from "@/lib/useTheme";
import LandingOverview from "@/components/LandingOverview";
import LandingFooter from "@/components/LandingFooter";
import { ArrowDown, ChartCandlestick } from "lucide-react";
import { motion } from "framer-motion";
import LandingOverviewMobile from "@/components/LandingOverviewMobile";

const LandingPage = () => {
  const { session } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const astryxStackSection = useRef<HTMLDivElement | null>(null);
  const landingOverviewSection = useRef<HTMLDivElement | null>(null);

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
            className="px-6 py-2 bg-blue-astryx hover:bg-blue-astryx dark:bg-white dark:text-black relative after:absolute after:border after:border-blue-astryx dark:after:border-white after:rounded-full after:left-1 after:-bottom-1 after:h-full after:w-full after:-z-10 after:bg-white dark:after:bg-transparent text-white rounded-full transition-all duration-200 font-semibold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 astryx-bg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="max-w-3xl mx-auto mt-[8%] border-2 border-blue-astryx py-10 px-2 md:p-10 bg-white dark:bg-black-90 dark:border-white-80 rounded-4xl shdw-box-r"
        >
          <div className="flex flex-col gap-4 text-xl sm:text-2xl md:text-3xl font-medium text-center font-family-parkinsans">
            <p className="text-blue-astryx font-bold dark:text-white-90">
              Build, test, and execute strategies,
            </p>
            <p className="text-blue-astryx dark:text-white-90">Let Astryx do it all for you!</p>
          </div>

          <div className="flex flex-col mt-10">
            {STRATEGIES.map(strategy => (
              <div
                key={strategy.id}
                className="flex items-center border-b last:border-b-0 border-black-5 dark:border-white/5 hover:rounded-lg px-4 py-6 gap-4 cursor-pointer
                 
                  hover:bg-blue-astryx hover:text-white hover:dark:bg-black-85 
                  transition-colors startegy-card"
              >
                <span className="text-xl p-4 rounded-full strategy-icon dark:bg-black-80/80">
                  <span className="text-blue-astryx dark:text-white strategy-icon">
                    {strategy.icon}
                  </span>
                </span>
                <div>
                  <p className="font-medium text-blue-astryx dark:text-white-90 title">
                    {strategy.title}
                  </p>
                  <p className="text-sm text-black-50 dark:text-white-60 mt-1 desc">
                    {strategy.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        viewport={{ once: false, amount: 0.3 }}
        className="max-w-2xl m-auto mt-10 ps-14"
      >
        <p
          onClick={() => astryxStackSection.current?.scrollIntoView({ behavior: "smooth" })}
          className="text-blue-astryx dark:text-white font-semibold cursor-pointer"
        >
          ↓ <span className="ps-10">know more...</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        viewport={{ once: false, amount: 0.3 }}
        ref={astryxStackSection}
        className="w-full my-40 m-auto py-10 px-3"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center gap-5">
          <div className="text-blue-astryx dark:text-white font-light text-xl md:text-2xl font-family-parkinsans lg:w-[50%]">
            <h3>Astryx blends deep multi-asset intelligence with everyday automation.</h3>
            <h3 className="mt-3">
              From filtering market noise to delivering decision-ready insights
            </h3>
            <h3> —right where you trade.</h3>
          </div>
          <div className="card-stack relative grid grid-cols-4 w-full h-full py-10 translate-x-[-20%] lg:translate-x-[-70px] mt-3 lg:w-[50%] p-8">
            <div className="h-[200px] w-[130px] sm:h-[170px] md:h-[250px] md:w-[180px]  xl:w-[200px] bg-white rounded-2xl shdw-box hover:bg-blue-astryx dark:text-white hover:dark:bg-black-95 text-blue-astryx hover:border-white border-blue-astryx hover:text-white dark:border-white dark:bg-black-90 border-2 p-4 flex justify-start items-end translate-x-[70px] sm:translate-x-[161px] md:translate-x-[275px] lg:translate-x-[17px] transition-all duration-500 ease-out hover:z-[2] cursor-pointer hover:scale-105 hover:shadow-lg">
              <div className="font-semibold text-sm md:text-base">
                <p>Price</p>
                <p>Fluctuation</p>
              </div>
            </div>
            <div className="h-[200px] w-[130px]  sm:h-[170px] md:h-[250px] md:w-[180px] xl:w-[200px] rounded-2xl shdw-box bg-white hover:bg-blue-astryx dark:text-white hover:dark:bg-black-95 text-blue-astryx border-blue-astryx hover:text-white dark:border-white dark:bg-black-90 hover:border-white border-2 p-4 flex flex-col justify-between py-4 items-start md:translate-x-[182px] translate-x-[61px] md:translate-y-[-39px] translate-y-[-44px] lg:translate-x-[41px] lg:translate-y-[-39px] rotate-[17deg] z-[1] hover:z-[4] cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg">
              <ChartCandlestick />
              <div className=" font-semibold text-sm md:text-base">
                <p>Fundamental</p>
                <p>Analysis</p>
              </div>
            </div>
            <div className="h-[200px] w-[130px] sm:h-[170px] md:h-[250px] bg-white md:w-[180px] xl:w-[200px] rounded-2xl shdw-box hover:bg-blue-astryx dark:text-white hover:dark:bg-black-95 text-blue-astryx hover:border-white border-blue-astryx hover:text-white dark:bg-black-90 dark:border-white  border-2 p-4 flex justify-start items-end translate-x-[-1px] sm:translate-x-[-85px] translate-y-[47px] md:translate-x-[-29px] md:translate-y-[93px] rotate-[-5deg] transition-all duration-500 ease-out hover:z-[3] cursor-pointer hover:scale-105 hover:shadow-lg">
              <div className="font-semibold text-sm md:text-base">
                <p>News</p>
                <p>Sentiment</p>
              </div>
            </div>
            <div className="h-[200px] w-[130px] sm:h-[170px] md:h-[250px] bg-white md:w-[180px] xl:w-[200px] rounded-2xl shdw-box hover:bg-blue-astryx dark:text-white hover:dark:bg-black-95 text-blue-astryx hover:border-white border-blue-astryx hover:text-white dark:bg-black-90 dark:border-white border-2 p-4 flex justify-start items-end translate-x-[-5px] translate-y-[-16px] sm:translate-x-[-177px] md:translate-x-[-96px] md:translate-y-[8px] lg:translate-x-[29px] lg:translate-y-[10px] rotate-[-23deg] z-[2] transition-all duration-500 ease-out hover:z-[2] cursor-pointer hover:scale-105 hover:shadow-lg">
              <div className="font-semibold text-sm md:text-base">
                <p>Macro</p>
                <p>Indicators</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => landingOverviewSection.current?.scrollIntoView({ behavior: "smooth" })}
            className="cursor-pointer mt-10"
          >
            <ArrowDown
              className="border border-blue-astryx dark:border-white dark:text-white text-blue-astryx rounded-full p-1"
              size={40}
            />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        viewport={{ once: false, amount: 0.3 }}
        ref={landingOverviewSection}
        className="relative my-40 px-3"
        id="deep-research"
      >
        <LandingOverview />
        <LandingOverviewMobile />
      </motion.div>
      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={open => setIsAuthModalOpen(open)} />
    </div>
  );
};

export default LandingPage;
