import {
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  Star,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface ProfileDropdownProps {
  user: User | undefined;
  onSignOut: () => void;
}

const ProfileDropdown = ({ user, onSignOut }: ProfileDropdownProps) => {
  const navigate = useNavigate();

  const handleProfile = () => {
    console.log("Profile clicked");
    toast.info("Coming soon");
  };

  const handleSaved = () => {
    navigate("/saved");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    toast.info("Coming soon");
  };

  const handleBilling = () => {
    console.log("Billing clicked");
    toast.info("Coming soon");
  };

  const handleHelp = () => {
    console.log("Help clicked");
    toast.info("Coming soon");
  };

  const handleLogout = () => {
    onSignOut();
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "No email provided";
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 p-1 border rounded-full bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <img
            src={userAvatar ? userAvatar : "/user.jpeg"}
            alt="profile"
            className="w-8 h-8 rounded-full"
            onError={e => {
              e.currentTarget.src = "/user.jpeg";
            }}
          />
          <p className="text-black dark:text-white font-medium">{userName}</p>
          <ChevronDown className="w-4 h-4 text-black/30 dark:text-white/30" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 p-2">
          <img
            src={userAvatar ? userAvatar : "/user.jpeg"}
            alt="profile"
            className="w-10 h-10 rounded-full flex-shrink-0"
            onError={e => {
              e.currentTarget.src = "/user.jpeg";
            }}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleProfile} className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSaved} className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          Saved
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleBilling} className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Billing
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleHelp} className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </DropdownMenuItem>

        <Link to="/privacy-policy">
          <DropdownMenuItem className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </DropdownMenuItem>
        </Link>

        <Link to="/terms-and-conditions">
          <DropdownMenuItem className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
