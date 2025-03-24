
# Rewrite.Page User Guide

## Introduction

Rewrite.Page is a streamlined web tool that transforms any web page content into concise, customizable summaries. It uses advanced AI to extract and summarize content directly from URLs, delivering plain text results.

## Getting Started

### How to Use Rewrite.Page

Rewrite.Page uses a simple URL pattern system. Simply construct a URL in one of these formats:

- `rewrite.page/{url}` - Standard summary of the target URL
- `rewrite.page/{style}/{url}` - Styled summary of the target URL
- `rewrite.page/{number}/{url}` - Summary with specified number of bullet points

### Examples

- `rewrite.page/example.com/article` - Standard summary of example.com/article
- `rewrite.page/academic/example.com/article` - Academic-style summary
- `rewrite.page/5/example.com/article` - 5 bullet points summary
- `rewrite.page/tweet/example.com/article` - Tweet-style (140 character) summary
- `rewrite.page/eli5/example.com/article` - Explain Like I'm 5 summary

## URL Format Guidelines

- Target URLs can be provided with or without `http://` or `https://` (https:// will be added automatically)
- The style or bullet count should be placed between `rewrite.page/` and the target URL
- For multi-word styles, use hyphens (e.g., `rewrite.page/executive-summary/example.com`)

## Summarization Styles

Rewrite.Page supports flexible, AI-interpreted summarization styles:

- **Numbers (e.g., "5")**: Creates a summary with exactly that number of bullet points
- **Standard**: Default balanced summary when no style is specified
- **Any text string**: Interpreted by the AI model for creative flexibility:
  - Languages: "tamil", "spanish", "japanese", etc.
  - Writing styles: "academic", "poetic", "technical", etc.
  - Character voices: "pirate", "shakespeare", "yoda", etc.
  - Formats: "haiku", "sonnet", "tweet", etc.
  - Complexity levels: "simple", "advanced", "eli5", etc.
  - Perspectives: "leftbias", "rightbias", "neutral", etc.

The AI model uses its understanding of the requested style to adapt the summary accordingly.

## Output Format

Results are displayed as plain text without any UI elements or formatting. This makes it easy to:
- Read quickly
- Copy and paste into other applications
- Use browser's built-in features (like text selection and copying)

## Error Messages

If something goes wrong, you'll see a plain text error message explaining the issue:

- Invalid URL format
- Connection problems
- Website access issues
- Content extraction problems
- AI processing errors

## Tips for Best Results

- **URL Accuracy**: Ensure the target URL is correct and accessible
- **Content Types**: Works best with articles, blog posts, and text-heavy pages
- **Style Instructions**: Be specific with style instructions for better results
- **Mobile Devices**: Works on all devices with a web browser

## Privacy and Data Security

- No content is stored permanently
- No user data is collected
- All processing happens securely through edge functions

## Technical Limitations

- Some websites may block content extraction
- Very large pages may take longer to process
- Dynamic JavaScript-heavy pages may have limited extraction
- Heavily paywalled content may not be accessible

## Quick Reference

| URL Pattern | Description |
|-------------|-------------|
| `rewrite.page/{url}` | Standard summary |
| `rewrite.page/{number}/{url}` | Bullet points (number specified) |
| `rewrite.page/{style}/{url}` | Custom style summary |

## Design Philosophy

Rewrite.Page is intentionally minimal, focusing exclusively on delivering high-quality content summaries without unnecessary UI elements or distractions. The plain text response format ensures maximum compatibility and simplicity.
