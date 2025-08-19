import { useState } from "react";
import { Send } from "lucide-react";
import { useSendSupportEmail } from "@/hooks/useSupport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  issue: string;
}

const SupportDialog = ({ open, onOpenChange }: SupportDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    issue: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const sendSupport = useSendSupportEmail();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset status when user starts typing
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  };

  const validateForm = (): boolean => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.issue.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    sendSupport.mutate(
      {
        username: formData.name,
        useremail: formData.email,
        issue: formData.issue,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          setTimeout(() => {
            setFormData({ name: "", email: "", issue: "" });
            onOpenChange(false);
            setSubmitStatus("idle");
          }, 2000);
        },
        onError: error => {
          console.error("Failed to send support request:", error);
          setSubmitStatus("error");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", issue: "" });
    setSubmitStatus("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-50 dark:bg-black-85 border border-gray-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white-100">Contact Support</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-white-60">
            Have a question or issue? We're here to help! Fill out the form below and we'll get back
            to you soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-white-80">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md 
                         text-gray-900 dark:text-white-100
                         focus:outline-none 
                         placeholder:text-gray-500 dark:placeholder:text-white/50"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white-80">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md 
                         text-gray-900 dark:text-white-100
                         focus:outline-none 
                         placeholder:text-gray-500 dark:placeholder:text-white/50"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="issue" className="text-sm font-medium text-gray-700 dark:text-white-80">
              Describe your issue *
            </label>
            <textarea
              id="issue"
              value={formData.issue}
              onChange={e => handleInputChange("issue", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md 
                         text-gray-900 dark:text-white-100
                         focus:outline-none 
                         placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none"
              placeholder="Please describe your issue or question in detail..."
              required
            />
          </div>

          {submitStatus === "error" && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {!validateForm()
                ? "Please fill in all fields with valid information."
                : "Failed to send message. Please try again."}
            </div>
          )}

          {submitStatus === "success" && (
            <div className="text-green-600 dark:text-green-400 text-sm">
              Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-white/60 
                         hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validateForm() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-astryx 
                         hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-white/20 
                         disabled:text-gray-500 dark:disabled:text-white/40 
                         rounded-md transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
