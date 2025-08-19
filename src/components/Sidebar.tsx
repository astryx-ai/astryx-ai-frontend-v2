import { motion } from "framer-motion";
import SidebarContent from "./SidebarContent";

interface SidebarProps {
  showSidebar: boolean;
}

const Sidebar = ({ showSidebar }: SidebarProps) => {
  return (
    <motion.div
      initial={{ width: 70 }}
      animate={{ width: showSidebar ? 250 : 70 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`min-h-full  h-[100dvh] sticky top-0 z-10 bg-white duration-200 transition-all dark:bg-black-90 flex-col justify-between p-4 border-black-10 dark:border-white-30 border-r-0.5 overflow-hidden flex-shrink-0 hidden md:flex ease-in-out ${
        showSidebar ? "md:min-w-[250px]" : "md:min-w-[70px]"
      }`}
    >
      <SidebarContent showSidebar={showSidebar} isMobile={false} />
    </motion.div>
  );
};

export default Sidebar;
