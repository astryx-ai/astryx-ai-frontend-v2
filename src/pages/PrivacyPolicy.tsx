import ThemeToggleIcon from "@/components/ui/ThemeToggleIcon";
import { useTheme } from "@/lib/useTheme";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
            to="/test"
            className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-blue-500 dark:hover:text-blue-500"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Effective Date: 1st August 2025</p>

        <p className="mb-4">
          This Privacy Policy explains how <strong>Small Things Big Money Private Limited</strong>{" "}
          ("Company", "we", "us", or "our") collects, uses, discloses, and protects your information
          when you access or use our websites, applications, APIs, and related services
          (collectively, the "Services").
        </p>
        <p className="mb-6">
          By using our Services, you agree to the collection and use of your information in
          accordance with this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Company Information</h2>
        <address className="mb-6 not-italic">
          Small Things Big Money Private Limited
          <br />
          LG-4, 5, 6 & 7, Somdutt Chambers-II,
          <br />
          9, Bhikaji Cama Place,
          <br />
          New Delhi-110066, India
        </address>

        <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>

        <h3 className="text-lg font-medium mt-4 mb-1">a. Personal Information</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>User account credentials</li>
          <li>Billing or payment information (processed via third-party providers)</li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">b. Usage Data</h3>
        <ul className="list-disc list-inside mb-4">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Time zone and location (approximate)</li>
          <li>Pages visited and features used</li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">c. Trading Activity Data</h3>
        <ul className="list-disc list-inside mb-6">
          <li>Strategy inputs and parameters</li>
          <li>Backtest results</li>
          <li>Execution history and logs</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Provide and improve our Services</li>
          <li>Create and manage your user account</li>
          <li>Analyze usage for performance optimization</li>
          <li>Communicate with you (service updates, support, etc.)</li>
          <li>Process payments and subscriptions</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p className="mb-6">We do not sell or rent your personal data.</p>

        <h2 className="text-xl font-semibold mb-2">
          4. Legal Basis for Processing (if applicable under GDPR)
        </h2>
        <ul className="list-disc list-inside mb-6">
          <li>Your consent</li>
          <li>Contractual necessity (e.g., providing you the services)</li>
          <li>Legal obligations</li>
          <li>Legitimate interests, such as security, fraud prevention, and service improvement</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">5. Data Sharing and Disclosure</h2>
        <ul className="list-disc list-inside mb-6">
          <li>
            With service providers (e.g., cloud hosting, analytics, payment processors) under
            confidentiality agreements
          </li>
          <li>If required by law, court order, or government authority</li>
          <li>
            In connection with business transfers such as mergers, acquisitions, or restructuring
          </li>
        </ul>
        <p className="mb-6">
          We do not share your strategies or trading data with other users unless explicitly
          authorized by you.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Cookies and Tracking Technologies</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Maintain your session</li>
          <li>Personalize your experience</li>
          <li>Track user behavior for analytics</li>
        </ul>
        <p className="mb-6">
          You can disable cookies via your browser settings, but some features may be affected.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Encryption (SSL/TLS)</li>
          <li>Access controls</li>
          <li>Secure infrastructure</li>
        </ul>
        <p className="mb-6">
          However, no system is 100% secure. You are responsible for keeping your login credentials
          safe.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Data Retention</h2>
        <p className="mb-2">We retain your information as long as necessary to:</p>
        <ul className="list-disc list-inside mb-6">
          <li>Provide the Services</li>
          <li>Comply with legal, accounting, or reporting requirements</li>
        </ul>
        <p className="mb-6">
          You may request deletion of your account and associated data, subject to regulatory
          constraints.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Your Rights</h2>
        <p className="mb-2">Subject to applicable law, you may have rights to:</p>
        <ul className="list-disc list-inside mb-6">
          <li>Access the personal data we hold about you</li>
          <li>Request correction or deletion</li>
          <li>Object to certain processing</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with a regulatory authority</li>
        </ul>
        <p className="mb-6">
          To exercise these rights, email us at{" "}
          <span className="text-blue-600 underline cursor-pointer">legal@astryx.ai</span>.
        </p>

        <h2 className="text-xl font-semibold mb-2">10. Children's Privacy</h2>
        <p className="mb-6">
          Our Services are not intended for individuals under the age of 18. We do not knowingly
          collect personal information from minors. If you believe we have inadvertently collected
          such data, contact us to request deletion.
        </p>

        <h2 className="text-xl font-semibold mb-2">11. International Users</h2>
        <p className="mb-6">
          If you are accessing our Services from outside India, please be aware that your
          information may be transferred to and processed in India or other countries with different
          data protection laws than your jurisdiction.
        </p>

        <h2 className="text-xl font-semibold mb-2">12. Updates to This Privacy Policy</h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. We will notify you of any significant
          changes via our website or by email. Continued use of our Services after changes means you
          accept the updated policy.
        </p>

        <h2 className="text-xl font-semibold mb-2">13. Contact Us</h2>
        <address className="not-italic mb-2">
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

export default PrivacyPolicy;
