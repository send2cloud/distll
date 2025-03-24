
# Distill User Guide

## Introduction

Distill is a powerful web tool that extracts and summarizes content from any web page. It's designed to help you quickly understand the key points of articles, blog posts, or any text-based web content without having to read the entire page.

## Getting Started

### Accessing Distill

You can access Distill directly through your web browser at the application URL.

### Basic Usage

1. **Enter a URL**: On the homepage, input the web page URL you want to process in the URL field
2. **Select a Style** (Optional): Choose from predefined styles or enter a custom style
3. **Click "Distill"**: Process the URL to extract and summarize its content
4. **View Results**: Review the summarized content and original text in separate tabs

## URL Format

Distill accepts URLs in various formats:
- With protocol prefix: `https://example.com/article`
- Without protocol prefix: `example.com/article` (https:// will be added automatically)

## Summarization Styles

Distill offers different summarization styles to suit your needs:

- **Simple**: A straightforward, concise summary of the main points
- **ELI5** (Explain Like I'm 5): Simplifies complex topics into easy-to-understand language
- **Clickbait**: Presents information in an attention-grabbing style
- **Tamil**: Translates and summarizes content in Tamil language
- **Executive Summary**: Formal, business-oriented summary of key points
- **5 Bullets**: Summarizes content in 5 bullet points (number can be customized)

You can also enter a custom style in the "Custom style" field to get specialized summaries.

## URL Shortcuts

Distill supports direct URL patterns for quick access to specific styles:
- `distill.app/{style}/{url}` - Apply a specific style to a URL
- `distill.app/{url}` - Use the default style for a URL

Examples:
- `distill.app/executivesummary/example.com/article`
- `distill.app/5/example.com/article` (5 bullet points)

## Features

### Content Tabs

The result page provides two tabs:
- **Summary**: Shows the AI-generated summary of the content
- **Original**: Displays the extracted original content

### Copy Functionality

Each tab includes a copy button allowing you to easily copy the content to your clipboard.

### Progress Indicator

During processing, a progress bar shows the current stage of content extraction and summarization.

## Troubleshooting

### Common Errors

- **Invalid URL**: Check that your URL is correctly formatted
- **Connection Problem**: The website might be down or blocking access
- **Content Issue**: The page might have no meaningful text content
- **AI Service Issue**: There might be a temporary problem with the AI service

### Solutions

- Verify the URL is correct and accessible
- Try a different URL from the same website
- Check if the website allows content extraction
- Try again later if there are service issues

## Settings

Access the settings modal from the top-right corner of the application to:
- Customize default summarization style
- Adjust display preferences
- Configure other application settings

## Privacy and Data Security

Distill processes content securely using edge functions:
- No content is stored permanently
- API interactions are handled securely server-side
- No user data is collected beyond what's necessary for the service

## Support

If you encounter issues or have questions about using Distill, please refer to our FAQ or contact support through the application.
