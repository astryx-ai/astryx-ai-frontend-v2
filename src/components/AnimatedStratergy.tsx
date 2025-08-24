import { motion } from "framer-motion";
import { STRATEGIES } from "@/constants/signinConstants";

const AnimatedStratergy = ({
  handlePromptSubmit,
}: {
  handlePromptSubmit: (prompt: string) => void;
}) => {
  return (
    <motion.div
      initial={{ height: "fit-content", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col gap-2 mt-10 max-w-3xl w-full m-auto"
    >
      <p className="text-lg text-[#181818] dark:text-white-50 font-semibold">Trending Today</p>
      {STRATEGIES.slice(0, 3).map((strategy, index) => (
        <motion.div
          key={strategy.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center border border-width-0.5 border-black-10 dark:border-white-20 rounded-lg p-4 gap-4 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-white-20 dark:hover:border-white-40"
          onClick={() => handlePromptSubmit(strategy.description)}
        >
          <span className="text-xl p-4 rounded-full bg-gray-50 dark:invert dark:bg-black-10 dark:text-white-10 z-0">
            {strategy.icon}
          </span>
          <div>
            <p className="font-medium">{strategy.title}</p>
            <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedStratergy;
