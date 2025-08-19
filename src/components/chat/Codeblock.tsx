import { CopyIcon } from "lucide-react";
import { useState } from "react";

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`copy-button ${copied ? "copied" : ""}`}
      title={copied ? "Copied!" : "Copy code"}
    >
      <CopyIcon className="w-4 h-4" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const CodeBlock = ({ children, className }: { children: string; className?: string }) => {
  const language = className ? className.replace("language-", "") : "";

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">{language || "Code"}</span>
        <CopyButton code={children} />
      </div>
      <pre className="bg-red-500">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
