
# Rewrite.Page: Web Content Summarization Service - Product Requirements Document (MVP)

## Core Value Proposition
Rewrite.Page transforms any web page into concise, customizable summaries using edge computing and AI, saving users time while preserving key information.

## MVP Overview
The MVP version of Rewrite.Page focuses exclusively on URL-based summarization through a simple URL pattern approach, eliminating the need for a complex landing page form.

## Key MVP Features

### URL-Based Processing
- Direct URL summarization through URL patterns: `rewrite.page/{style}/{url}`
- Automatic content extraction from provided URLs
- Immediate summarized results display

### Summarization Styles
- Standard: Balanced summary of key points (`rewrite.page/example.com`)
- Simple: Easy-to-understand version (`rewrite.page/simple/example.com`)
- Bullets: Key points in bullet format (`rewrite.page/5/example.com` for 5 bullets)
- ELI5: Simplified explanation (`rewrite.page/eli5/example.com`)
- Concise: Ultra-compact summary (`rewrite.page/concise/example.com`)
- Tweet: Summary in 140 characters (`rewrite.page/tweet/example.com`)

### Minimal User Experience
- No landing page with forms needed - just use URL patterns
- Clean, distraction-free summary display
- Fast processing (target: <2 seconds)
- Copy functionality for easy sharing
- Error handling with clear user feedback

## MVP Architecture
- Frontend: Minimal React app with Tailwind CSS
- Backend: Serverless Edge Functions only
- Content Extraction: Jina AI proxy
- AI Processing: OpenRouter API (Google Gemini)
- URL Schema: `rewrite.page/{style}/{url}` for direct processing

## MVP User Journey
1. User creates a URL in the pattern `rewrite.page/{style}/{url}`
2. System processes content through Edge Function
3. User receives summary in the selected style
4. User can copy or share the result

## Error Handling
- Invalid URL validation with clear messages
- Connection issues detection
- Empty content handling
- Simple, user-friendly error displays

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
   - Displays summarized content in a clean, readable format
   - Shows appropriate loading and error states
   - Provides a copy button for the summary

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
   - 'simple': Easy-to-understand version
   - 'bullets': Key points in bullet format (with optional count)
   - 'eli5': Explain Like I'm 5
   - 'concise': Ultra-compact summary
   - 'tweet': 140-character summary

5. Implement URL pattern parsing:
   ```typescript
   function getSummarizationStyleFromPath(pathname: string): {
     style: 'standard' | 'simple' | 'bullets' | 'eli5' | 'concise' | 'tweet';
     bulletCount?: number;
   }
   ```

6. Use this Edge Function workflow:
   - Parse incoming URL for style parameters
   - Fetch content from the URL using Jina proxy
   - Pass content to OpenRouter API with appropriate prompt
   - Return both original and summarized content
   - Handle errors with appropriate categorization

7. Create a minimal UI that:
   - Shows a loading indicator during processing
   - Displays the summary in a readable format
   - Shows helpful error messages when things go wrong
   - Provides a copy button

Focus on creating a working MVP with just URL-based functionality. No landing page with forms is needed for this version.
