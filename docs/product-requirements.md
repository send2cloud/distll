
# Rewrite.Page: Web Content Summarization Service - Product Requirements Document (MVP)

## Core Value Proposition
Rewrite.Page transforms any web page into concise, customizable summaries using edge computing and AI, saving users time while preserving key information.

## MVP Overview
The MVP version of Rewrite.Page focuses exclusively on URL-based summarization through a simple URL pattern approach, eliminating the need for a complex landing page form.

## Key MVP Features

### URL-Based Processing
- Direct URL summarization through URL patterns: `rewrite.page/{style}/{url}`
- Automatic content extraction from provided URLs
- Immediate summarized results display as plain text only

### Summarization Styles
- Standard: Balanced summary of key points (`rewrite.page/example.com`)
- Bullets: Key points in bullet format (`rewrite.page/5/example.com` for 5 bullets)
- Custom styles: Any other text in the style position becomes an instruction to the LLM
  - Example: `rewrite.page/academic/example.com` for academic style
  - Example: `rewrite.page/pirate/example.com` for pirate-speak
  - Example: `rewrite.page/tamil/example.com` for Tamil language or cultural context
  - The LLM interprets the style modifier and adapts accordingly

### Minimal User Experience
- No landing page with forms needed - just use URL patterns
- Clean, distraction-free plain text output only
- Fast processing (target: <2 seconds)
- No UI elements like copy buttons or formatting controls
- Error handling with clear text-based feedback

## MVP Architecture
- Frontend: Minimal React app serving plain text only
- Backend: Serverless Edge Functions only
- Content Extraction: Jina AI proxy
- AI Processing: OpenRouter API (Google Gemini)
- URL Schema: `rewrite.page/{style}/{url}` for direct processing

## MVP User Journey
1. User creates a URL in the pattern `rewrite.page/{style}/{url}`
2. System processes content through Edge Function
3. User receives plain text summary in the browser
4. Any copying or sharing relies on browser native functionality

## Error Handling
- Invalid URL validation with clear text messages
- Connection issues detection
- Empty content handling
- Simple, text-based error displays

## Privacy and Security
- No persistent storage of processed content
- Server-side processing of all operations
- No user accounts or data collection

## Post-MVP Features (Future Roadmap)
- Landing page with URL input form
- Authentication for premium features
- Additional language support
- Direct text input option
- API for developer integration

## System Prompt for LLM Coding Implementation

You are tasked with implementing Rewrite.Page, a web content summarization tool. Follow these instructions:

1. Create a minimal React app that:
   - Accepts URL patterns in the format `rewrite.page/{style}/{url}` or `rewrite.page/{url}`
   - Displays summarized content as plain text without any UI elements
   - Shows appropriate loading and error states in plain text

2. Implement an Edge Function architecture with these components:
   - `process-url` function that handles the core processing logic
   - Content fetching service using Jina AI proxy
   - Summarization service using OpenRouter API (Gemini model)
   - Error handling and validation

3. Create these specific services in your Edge Function:
   ```typescript
   // contentProcessor.ts - Orchestrates the workflow
   export async function processUrl(url: string, style: string, bulletCount?: number): Promise<{
     originalContent: string;
     summary: string;
   }>

   // contentFetcher.ts - Handles content extraction
   export async function fetchContent(url: string): Promise<string>

   // aiService.ts - Manages AI summarization
   export async function summarizeContent(content: string, style: string, bulletCount?: number): Promise<string>

   // promptService.ts - Creates prompts for different styles
   export class SummarizationPromptFactory {
     static getPrompt(style: string, bulletCount?: number): string
   }
   ```

4. Use these summarization styles:
   - 'standard': Balanced summary
   - 'bullets': Key points in bullet format (with optional count)
   - Any other string: Pass to the LLM as a style instruction for interpretation

5. Implement URL pattern parsing:
   ```typescript
   function getSummarizationStyleFromPath(pathname: string): {
     style: string;
     bulletCount?: number;
   }
   ```

6. Use this Edge Function workflow:
   - Parse incoming URL for style parameters
   - Fetch content from the URL using Jina proxy
   - Pass content to OpenRouter API with appropriate prompt
   - Return both original and summarized content as plain text
   - Handle errors with appropriate categorization

7. Create a minimal UI that:
   - Shows a loading text during processing
   - Displays the summary as plain text
   - Shows helpful error messages when things go wrong

Focus on creating a working MVP with just URL-based functionality. No landing page with forms is needed for this version. The output should be pure plain text without any UI elements or formatting controls.
