import { MoonStar, Sun } from "lucide-react";

const ThemeToggleIcon = ({
  theme,
  onToggle,
  isAbsolute,
}: {
  theme: string;
  onToggle: () => void;
  isAbsolute?: boolean;
}) =>
  theme === "dark" ? (
    <Sun
      onClick={onToggle}
      className={`w-5 h-5 ${isAbsolute ? "absolute right-4" : ""} text-black-100 dark:text-white-100 cursor-pointer`}
    />
  ) : (
    <MoonStar
      onClick={onToggle}
      className={`w-5 h-5 ${isAbsolute ? "absolute right-4" : ""} text-black-100 dark:text-white-100 cursor-pointer`}
    />
  );

export default ThemeToggleIcon;
