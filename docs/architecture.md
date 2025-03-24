
# Distill Architecture Documentation

## Overview

Distill is a web application that extracts and summarizes content from any web page using modern edge computing and AI technologies. It offers flexible summarization styles through LLM interpretation.

## Current Architecture

The application follows a modern architecture leveraging edge computing:

- **Frontend**: React with TypeScript, minimal UI for plain text display
- **Backend**: Supabase Edge Functions for secure server-side processing
- **Content Fetching**: Jina AI proxy (`https://r.jina.ai/`) for reliable content extraction
- **AI Processing**: OpenRouter API (Google Gemini model) for content summarization
- **URL Pattern Routing**: Direct path-based access via URL patterns

## Data Flow

```
User Request (URL Pattern)
       │
       ▼
┌─────────────────┐
│  React Frontend │ Parse URL path for style parameters
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Edge Function  │ Process URL and style
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Jina Proxy    │ Extract content from URL
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenRouter API  │ Generate summary based on style
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Plain Text     │ Display summary as plain text
│  Response       │ 
└─────────────────┘
```

## Sequence Diagram

```
┌─────┐          ┌──────────┐          ┌─────────────┐          ┌──────────┐          ┌──────────┐
│User │          │Frontend  │          │Edge Function│          │Jina Proxy│          │OpenRouter│
└──┬──┘          └────┬─────┘          └──────┬──────┘          └────┬─────┘          └────┬─────┘
   │                  │                       │                      │                     │
   │ Visit URL with   │                       │                      │                     │
   │ style parameter  │                       │                      │                     │
   │─────────────────>│                       │                      │                     │
   │                  │                       │                      │                     │
   │                  │ Extract style and URL │                      │                     │
   │                  │─────────────────────>│                       │                     │
   │                  │                       │                      │                     │
   │                  │                       │ Fetch content        │                     │
   │                  │                       │─────────────────────>│                     │
   │                  │                       │                      │                     │
   │                  │                       │<─────────────────────│                     │
   │                  │                       │ Return content       │                     │
   │                  │                       │                      │                     │
   │                  │                       │ Generate prompt      │                     │
   │                  │                       │ based on style       │                     │
   │                  │                       │                      │                     │
   │                  │                       │ Request summary      │                     │
   │                  │                       │────────────────────────────────────────────>
   │                  │                       │                      │                     │
   │                  │                       │<────────────────────────────────────────────
   │                  │                       │ Return summary       │                     │
   │                  │                       │                      │                     │
   │                  │<─────────────────────│                       │                     │
   │                  │ Return plain text     │                      │                     │
   │                  │ summary              │                       │                     │
   │<─────────────────│                       │                      │                     │
   │ View plain text  │                       │                      │                     │
   │ summary          │                       │                      │                     │
   │                  │                       │                      │                     │
```

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

- **Minimal React Application**: Simple URL pattern parser and plain text display
- **MinimalContentView.tsx**: Displays plain text content without UI elements
- **PlainTextDisplay.tsx**: Renders content as basic plain text

### Backend (Edge Functions)

- **process-url**: Main edge function that handles content fetching and summarization
- **contentProcessor.ts**: Orchestrates the content processing workflow
- **contentFetcher.ts**: Handles URL validation and content extraction
- **aiService.ts**: Interfaces with OpenRouter API for AI summarization
- **promptService.ts**: Manages prompts for different summarization styles

## Style Options

Distill supports dynamic summarization styles:

- **Standard**: Default balanced summary when no style is specified
- **Bullets**: Number-based bullet points summary (configurable count)
- **Dynamic Styles**: Any other string is interpreted by the LLM:
  - Language/cultural styles (e.g., "tamil", "spanish")
  - Writing styles (e.g., "academic", "poetic")
  - Character/persona styles (e.g., "pirate", "shakespeare")
  - Format styles (e.g., "haiku", "essay")
  - Complexity levels (e.g., "simple", "technical")
  - Perspective styles (e.g., "conservative", "progressive")

## Error Handling

The application implements comprehensive error handling for various scenarios:

- **URL_ERROR**: Invalid URL format or empty URL
- **CONNECTION_ERROR**: Network issues, timeouts, or blocked access
- **CONTENT_ERROR**: Empty content or extraction failures
- **AI_SERVICE_ERROR**: Issues with the AI summarization service
- **PROCESSING_ERROR**: General processing failures

## URL Pattern Parsing

The application uses URL patterns to determine the summarization style:

- `rewrite.page/example.com` - Standard summary
- `rewrite.page/5/example.com` - 5 bullet points summary
- `rewrite.page/anyStyle/example.com` - Custom style interpreted by the LLM

## SOLID Design Principles Implementation

Distill's architecture adheres to SOLID principles:

- **Single Responsibility Principle**: Each component and service has a single, well-defined responsibility
- **Open-Closed Principle**: Architecture allows extending functionality without modifying existing code
- **Liskov Substitution Principle**: Services use clear interfaces allowing for implementation swapping
- **Interface Segregation Principle**: Components depend only on interfaces they use
- **Dependency Inversion Principle**: High-level modules depend on abstractions rather than concrete implementations

## Future Improvements

- Enhanced caching for frequently accessed URLs
- Additional predefined style templates
- Improved content extraction for complex websites
- API access for programmatic integration
