// Function to scroll to bottom
export const scrollToBottom = (messagesEndRef: React.RefObject<HTMLDivElement | null>) => {
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

// Function to clean and process text for typewriter animation
export const processTextForTypewriter = (text: string): string[] => {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Clean and filter the words array to prevent undefined values
  const words = text
    .split(" ")
    .filter(word => word !== "" && word !== undefined && word !== null)
    .map(word => word.trim())
    .filter(word => word.length > 0);

  return words;
};

// Function to validate and format text content
export const validateTextContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (content === null || content === undefined) {
    return "";
  }

  // Convert other types to string and clean
  return String(content).trim();
};

// Function to process JSON content and fix formatting issues
export const processJsonContent = (jsonContent: string): string => {
  return jsonContent
    .replace(/\\n/g, "\n") // Convert escaped newlines to actual newlines
    .replace(/\n \n/g, "\n\n") // Clean up extra spaces after newlines
    .replace(/\n\s+/g, "\n") // Remove extra spaces at the beginning of lines
    .trim(); // Remove leading/trailing whitespace
};

// Function to parse dual content and split into main and side sections
export const parseDualContent = (content: string) => {
  if (!content) return { main: "", side: "" };

  // Check if content contains the [[[ ]]] syntax
  const dualScreenPattern = /\[\[\[(.*?)\]\]\]/s;
  const match = content.match(dualScreenPattern);

  if (match) {
    // Extract content inside [[[ ]]]
    const sideContent = match[1].trim();

    // Remove the [[[ ]]] section from the main content
    const mainContent = content.replace(dualScreenPattern, "").trim();

    return {
      main: mainContent,
      side: sideContent,
    };
  }

  // Fallback to the old ### Side: and ### Main: syntax
  const lines = content.split("\n");
  let mainContent = "";
  let sideContent = "";
  let isInSideSection = false;

  for (const line of lines) {
    if (line.trim().startsWith("### Side:") || line.trim().startsWith("### SIDE:")) {
      isInSideSection = true;
      continue;
    }

    if (line.trim().startsWith("### Main:") || line.trim().startsWith("### MAIN:")) {
      isInSideSection = false;
      continue;
    }

    if (isInSideSection) {
      sideContent += line + "\n";
    } else {
      mainContent += line + "\n";
    }
  }

  return {
    main: mainContent.trim(),
    side: sideContent.trim(),
  };
};

// Helper function to copy content to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Content copied to clipboard:", text);
    return true;
  } catch (err) {
    console.error("Failed to copy content:", err);
    return false;
  }
};
