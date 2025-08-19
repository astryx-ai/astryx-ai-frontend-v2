import React, { useState } from "react";
import { MarkdownValidator } from "@/lib/markdownValidator";

interface MarkdownValidationHelperProps {
  content: string;
  showValidation?: boolean;
}

export const MarkdownValidationHelper: React.FC<MarkdownValidationHelperProps> = ({
  content,
  showValidation = false,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateContent = () => {
    setIsValidating(true);
    try {
      const result = MarkdownValidator.validateContent(content);
      setValidationResult(result);
    } catch (error) {
      console.error("Validation error:", error);
    }
    setIsValidating(false);
  };

  if (!showValidation) return null;

  return (
    <div className="markdown-validation-helper p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📝 Markdown Validation
        </h3>
        <button
          onClick={validateContent}
          disabled={isValidating}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isValidating ? "Validating..." : "Validate"}
        </button>
      </div>

      {validationResult && (
        <div className="space-y-3">
          {/* Overall Summary */}
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${validationResult.overall.isValid ? "text-green-500" : "text-red-500"}`}
            >
              {validationResult.overall.isValid ? "✅" : "❌"}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {validationResult.overall.summary}
            </span>
          </div>

          {/* Chart Validation */}
          {validationResult.charts.chartCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                📊 Charts ({validationResult.charts.chartCount})
              </h4>
              {validationResult.charts.errors.map((error: string, index: number) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400">
                  • {error}
                </div>
              ))}
              {validationResult.charts.errors.length === 0 && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  All charts are valid!
                </div>
              )}
            </div>
          )}

          {/* Markdown Errors */}
          {validationResult.markdown.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Errors</h4>
              {validationResult.markdown.errors.map((error: string, index: number) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400">
                  • {error}
                </div>
              ))}
            </div>
          )}

          {/* Markdown Warnings */}
          {validationResult.markdown.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Warnings</h4>
              {validationResult.markdown.warnings.map((warning: string, index: number) => (
                <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                  • {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkdownValidationHelper;
