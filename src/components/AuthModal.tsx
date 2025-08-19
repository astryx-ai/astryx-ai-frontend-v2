import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || "/";

  // Extend the default ThemeSupa to override only the brand color
  const customTheme = {
    ...ThemeSupa,
    default: {
      ...ThemeSupa.default,
      colors: {
        ...ThemeSupa.default?.colors,
        brand: "var(--color-blue-astryx)",
        brandAccent: "var(--color-blue-astryx)",
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Sign In to Astryx</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: customTheme,
              style: {
                button: {
                  backgroundColor: "rgb(243 244 246)",
                  color: "#000000",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                },
                input: {
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                },
                label: {
                  marginBottom: "2px",
                  marginLeft: "6px",
                },
              },
            }}
            providers={["google"]}
            redirectTo={redirectUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
