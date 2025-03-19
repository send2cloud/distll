
# Distill Architecture Documentation

## Overview

Distill is a web application that extracts and summarizes content from any web page using modern edge computing and AI technologies. It offers various summarization styles and formatting options to suit different user needs.

## Current Architecture

The application follows a modern architecture leveraging edge computing:

- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Supabase Edge Functions for secure server-side processing
- **Content Fetching**: Jina AI proxy (`https://r.jina.ai/`) for reliable content extraction
- **AI Processing**: OpenRouter API (Google Gemini model) for content summarization
- **State Management**: React Query and React hooks

## Data Flow

1. User enters a URL in the frontend
2. Request is sent to Supabase Edge Function (`process-url`)
3. Edge Function fetches content using Jina AI proxy
4. Content is sent to OpenRouter API for summarization
5. Summarized content is returned to the frontend
6. Frontend displays both original and summarized content

## Security Features

- API keys are securely stored in Edge Functions
- No client-side exposure of sensitive operations
- Server-side content processing for better reliability
- Proper error handling and user feedback

## Performance Metrics

- Average processing time: ~1.5 seconds (depending on content size)
- Single network request for processing
- Server-side caching capabilities
- Reliable content extraction (~95% success rate)

## Key Components

### Frontend

- **Index.tsx**: Main landing page with URL input and style selection
- **Distill.tsx**: Content display page showing original and summarized content
- **ContentTabs.tsx**: Tab interface for switching between summary and original content
- **SettingsModal.tsx**: Configuration options for summary styles and preferences

### Backend (Edge Functions)

- **process-url**: Main edge function that handles content fetching and summarization
- **contentProcessor.ts**: Orchestrates the content processing workflow
- **contentFetcher.ts**: Handles URL validation and content extraction
- **aiService.ts**: Interfaces with OpenRouter API for AI summarization
- **promptService.ts**: Manages prompts for different summarization styles

## Style Options

Distill supports various summarization styles:

- **Simple**: Straightforward summary of content
- **ELI5**: Explains content as if to a five-year-old
- **Clickbait**: Summarizes in an attention-grabbing style
- **Tamil**: Translates and summarizes content in Tamil
- **Executive Summary**: Business-oriented formal summary
- **Bullets**: Summarizes content in bullet points (configurable count)
- **Custom**: User-defined style through custom input

## Error Handling

The application implements comprehensive error handling for various scenarios:

- **URL_ERROR**: Invalid URL format or empty URL
- **CONNECTION_ERROR**: Network issues, timeouts, or blocked access
- **CONTENT_ERROR**: Empty content or extraction failures
- **AI_SERVICE_ERROR**: Issues with the AI summarization service
- **PROCESSING_ERROR**: General processing failures

## SOLID Design Principles Implementation

Distill's architecture adheres to SOLID principles:

- **Single Responsibility Principle**: Each component and service has a single, well-defined responsibility
- **Open-Closed Principle**: Architecture allows extending functionality without modifying existing code
- **Liskov Substitution Principle**: Services use clear interfaces allowing for implementation swapping
- **Interface Segregation Principle**: Components depend only on interfaces they use
- **Dependency Inversion Principle**: High-level modules depend on abstractions rather than concrete implementations

## Future Improvements

- Enhanced caching for frequently accessed URLs
- User accounts to save favorite summaries
- Additional summarization styles and languages
- Improved content extraction for complex websites
- Mobile application development
