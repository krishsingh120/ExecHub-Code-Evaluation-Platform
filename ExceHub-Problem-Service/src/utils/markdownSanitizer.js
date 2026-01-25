const sanitizeHtmlLibrary = require("sanitize-html");
// const markdown = require("marked");
const TurndownService = require("turndown");

async function sanitizeMarkdownContent(markdownContent) {
  const { marked } = await import("marked"); // ✅ ESM-safe

  const turndownService = new TurndownService();

  // 1. convert markdown to html
  const convertedHtml = marked.parse(markdownContent);
  // console.log("markdown data", convertedHtml);

  // 2. sanitized html
  const sanitizedHtml = sanitizeHtmlLibrary(convertedHtml, {
    allowedTags: sanitizeHtmlLibrary.defaults.allowedTags.concat(["img"]),
  });
  // console.log("sanitized data", sanitizedHtml);

  // 3. Convert the sanitized html back to markdown
  const sanitizedMarkdown = turndownService.turndown(sanitizedHtml);
  // console.log("Sanitized markdown", sanitizedMarkdown);

  return sanitizedMarkdown;
}

module.exports = sanitizeMarkdownContent;

// const input = `
// # Hello

// ### This is markdown

// - Something

// <script>alert('hello')</script>

// [Link](www.google.com)

// `;

// sanitizeMarkdownContent(input);
