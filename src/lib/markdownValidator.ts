interface MarkdownValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ChartValidationResult {
  isValid: boolean;
  errors: string[];
  chartCount: number;
}

export class MarkdownValidator {
  /**
   * Validates markdown content for common issues
   */
  static validateMarkdown(content: string): MarkdownValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for basic markdown structure issues
    this.checkHeaderHierarchy(content, errors);
    this.checkListFormatting(content, warnings);
    this.checkTableFormatting(content, errors);
    this.checkCodeBlockFormatting(content, errors);
    this.checkLinkFormatting(content, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates chart blocks specifically
   */
  static validateCharts(content: string): ChartValidationResult {
    const errors: string[] = [];
    let chartCount = 0;

    // Find all chart blocks
    const chartRegex = /```chart\s*\n?\s*({[\s\S]*?})\s*\n?\s*```/g;
    let match;

    while ((match = chartRegex.exec(content)) !== null) {
      chartCount++;
      try {
        const chartData = JSON.parse(match[1]);

        // Validate required chart properties
        if (!chartData.type) {
          errors.push(`Chart ${chartCount}: Missing 'type' property`);
        }
        if (!chartData.title) {
          errors.push(`Chart ${chartCount}: Missing 'title' property`);
        }
        if (!chartData.dataKey) {
          errors.push(`Chart ${chartCount}: Missing 'dataKey' property`);
        }
        if (!chartData.data || !Array.isArray(chartData.data)) {
          errors.push(`Chart ${chartCount}: Missing or invalid 'data' array`);
        } else if (chartData.data.length === 0) {
          errors.push(`Chart ${chartCount}: Empty data array`);
        }

        // Validate data structure
        if (chartData.data && Array.isArray(chartData.data)) {
          const firstItem = chartData.data[0];
          if (firstItem && !firstItem[chartData.dataKey]) {
            errors.push(`Chart ${chartCount}: Data items missing '${chartData.dataKey}' property`);
          }
        }

        // Validate optional properties
        if (chartData.height && (typeof chartData.height !== "number" || chartData.height < 200)) {
          errors.push(`Chart ${chartCount}: Invalid height (should be number >= 200)`);
        }
      } catch (e) {
        errors.push(
          `Chart ${chartCount}: Invalid JSON format - ${e instanceof Error ? e.message : "Unknown error"}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      chartCount,
    };
  }

  /**
   * Check for proper header hierarchy (H1 -> H2 -> H3, etc.)
   */
  private static checkHeaderHierarchy(content: string, errors: string[]): void {
    const lines = content.split("\n");
    let lastHeaderLevel = 0;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s/);
      if (headerMatch) {
        const currentLevel = headerMatch[1].length;

        // Check if jumping more than one level
        if (currentLevel > lastHeaderLevel + 1 && lastHeaderLevel > 0) {
          errors.push(
            `Line ${index + 1}: Header level jumps from H${lastHeaderLevel} to H${currentLevel}`
          );
        }

        lastHeaderLevel = currentLevel;
      }
    });
  }

  /**
   * Check for proper list formatting
   */
  private static checkListFormatting(content: string, warnings: string[]): void {
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Check for inconsistent list markers
      if (line.match(/^\s*[-*+]\s/) && line.includes("- ") && line.includes("* ")) {
        warnings.push(`Line ${index + 1}: Mixed list markers (- and *)`);
      }
    });
  }

  /**
   * Check for proper table formatting
   */
  private static checkTableFormatting(content: string, errors: string[]): void {
    const lines = content.split("\n");
    let inTable = false;
    let expectedColumns = 0;

    lines.forEach((line, index) => {
      if (line.includes("|") && line.trim() !== "") {
        const columns = line.split("|").length - 2; // Subtract 2 for leading/trailing empty parts

        if (!inTable) {
          // First table row
          inTable = true;
          expectedColumns = columns;
        } else if (columns !== expectedColumns && !line.match(/^\s*\|[\s-:|]+\|\s*$/)) {
          // Not a separator row, check column count
          errors.push(
            `Line ${index + 1}: Table row has ${columns} columns, expected ${expectedColumns}`
          );
        }
      } else if (inTable && line.trim() === "") {
        // Empty line ends table
        inTable = false;
        expectedColumns = 0;
      }
    });
  }

  /**
   * Check for proper code block formatting
   */
  private static checkCodeBlockFormatting(content: string, errors: string[]): void {
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const block = match[0];

      // Check if code block is properly closed
      if (!block.endsWith("```")) {
        errors.push(`Unclosed code block starting at position ${match.index}`);
      }

      // Check for nested code blocks (which can break rendering)
      const innerMatches = block.slice(3, -3).match(/```/g);
      if (innerMatches && innerMatches.length > 0) {
        errors.push(`Code block contains nested ''' which may break rendering`);
      }
    }
  }

  /**
   * Check for proper link formatting
   */
  private static checkLinkFormatting(content: string, warnings: string[]): void {
    // Check for malformed links
    const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];

      if (!linkText.trim()) {
        warnings.push(`Empty link text for URL: ${linkUrl}`);
      }

      if (!linkUrl.trim()) {
        warnings.push(`Empty URL for link text: ${linkText}`);
      }
    }
  }

  /**
   * Complete validation of content including both markdown and charts
   */
  static validateContent(content: string): {
    markdown: MarkdownValidationResult;
    charts: ChartValidationResult;
    overall: { isValid: boolean; summary: string };
  } {
    const markdownResult = this.validateMarkdown(content);
    const chartsResult = this.validateCharts(content);

    const totalErrors = markdownResult.errors.length + chartsResult.errors.length;
    const isValid = totalErrors === 0;

    let summary = `Found ${chartsResult.chartCount} chart(s)`;
    if (totalErrors > 0) {
      summary += `, ${totalErrors} error(s)`;
    }
    if (markdownResult.warnings.length > 0) {
      summary += `, ${markdownResult.warnings.length} warning(s)`;
    }

    return {
      markdown: markdownResult,
      charts: chartsResult,
      overall: { isValid, summary },
    };
  }
}
