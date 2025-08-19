import ThemeToggleIcon from "@/components/ui/ThemeToggleIcon";
import { useTheme } from "@/lib/useTheme";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 dark:bg-black/50 bg-white/50 border-b-2 border-gray-200 dark:border-gray-800">
        <img src={"/logo/logo.svg"} alt="" />
        <ThemeToggleIcon theme={theme} onToggle={handleThemeToggle} />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 dark:text-white">
        <div className="back-button mb-6 inline-block">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-blue-500 dark:hover:text-blue-500"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>

        <p className="mb-4">
          This Terms of Service ("Agreement") is a legal agreement between you ("User", "you", or
          "your") and <strong>Small Things Big Money Private Limited</strong>, a company
          incorporated under the Companies Act, 2013 and having its registered office at LG-4, 5, 6
          & 7, Somdutt Chambers-II, 9, Bhikaji Cama Place, New Delhi-110066, India ("Company", "we",
          "our", or "us").
        </p>
        <p className="mb-6">
          By accessing or using any part of our platform, websites, applications, or services
          (collectively, the “Services”), you agree to be bound by the terms of this Agreement. If
          you do not agree to these Terms, do not use or access the Services.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Nature of Services</h2>
        <p className="mb-6">
          The Company provides an AI-powered trading copilot that enables users to build, test, and
          execute trading strategies using data, analytics, and automation tools. The Services are
          designed to assist users in their trading decision-making process but are not intended to
          offer or constitute investment advice.
          <br />
          We are not a registered broker, investment advisor, or financial planner.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Be at least 18 years old</li>
          <li>Have the legal capacity to enter into a binding contract under applicable law</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Account Registration</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Provide true, current, and complete information</li>
          <li>Maintain confidentiality of your login credentials</li>
          <li>Be responsible for all activities under your account</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">4. Permitted Use</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Use the Services only for lawful purposes</li>
          <li>Do not use the Services to perform or support illegal activity</li>
          <li>Do not reverse-engineer or interfere with the platform</li>
          <li>Do not copy, modify, or distribute content without authorization</li>
          <li>Do not use bots or automated access methods without permission</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">5. Risk Disclosure</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Trading involves inherent risk including potential capital loss</li>
          <li>Past performance does not guarantee future results</li>
          <li>AI outputs are not guaranteed to be accurate or profitable</li>
          <li>You are solely responsible for all trading decisions</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">6. No Investment Advice</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Services do not constitute financial, legal, or tax advice</li>
          <li>We do not recommend buying, selling, or holding securities</li>
        </ul>
        <p className="mb-6">
          Consult a licensed financial advisor before making investment decisions.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Intellectual Property</h2>
        <p className="mb-6">
          All content, including software, algorithms, logos, designs, and technology, is the
          intellectual property of Small Things Big Money Private Limited or its licensors. You are
          granted a limited, non-transferable, non-exclusive license for personal or internal
          business use only.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Fees and Payments</h2>
        <ul className="list-disc list-inside mb-6">
          <li>Pay applicable fees as described at time of purchase</li>
          <li>Authorize charges to your selected payment method</li>
          <li>Understand that fees are non-refundable unless stated otherwise</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">9. Suspension & Termination</h2>
        <p className="mb-2">We may suspend or terminate your access without notice if:</p>
        <ul className="list-disc list-inside mb-2">
          <li>You breach these Terms</li>
          <li>Your use causes legal risk or harm to others or the platform</li>
        </ul>
        <p className="mb-6">Upon termination, all rights granted to you immediately cease.</p>

        <h2 className="text-xl font-semibold mb-2">10. Limitation of Liability</h2>
        <ul className="list-disc list-inside mb-6">
          <li>We are not liable for indirect, incidental, or consequential damages</li>
          <li>No liability for trading decisions or service interruptions</li>
          <li>Total liability capped at the fees paid in the last 6 months</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">11. Indemnity</h2>
        <p className="mb-2">
          You agree to indemnify and hold harmless the Company from any claims arising out of:
        </p>
        <ul className="list-disc list-inside mb-6">
          <li>Your use of the Services</li>
          <li>Your breach of these Terms</li>
          <li>Your violation of laws or third-party rights</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">12. Governing Law and Jurisdiction</h2>
        <p className="mb-6">
          These Terms are governed by the laws of India. Any disputes shall be subject to the
          exclusive jurisdiction of the courts in New Delhi, India.
        </p>

        <h2 className="text-xl font-semibold mb-2">13. Amendments</h2>
        <p className="mb-6">
          We may update these Terms at any time. Continued use of the Services after changes
          indicates your acceptance of the revised Terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">14. Contact Us</h2>
        <address className="not-italic">
          Small Things Big Money Private Limited
          <br />
          LG-4, 5, 6 & 7, Somdutt Chambers-II,
          <br />
          9, Bhikaji Cama Place,
          <br />
          New Delhi-110066, India
        </address>
      </div>
    </div>
  );
};

export default TermsOfService;
