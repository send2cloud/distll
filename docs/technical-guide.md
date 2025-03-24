
# Distill Technical Guide

## Technology Stack

Distill is built with the following technologies:

- **Frontend**:
  - React 18.3+ with TypeScript
  - Vite for build tooling
  - Minimal UI for plain text display

- **Backend**:
  - Supabase Edge Functions (Deno runtime)
  - OpenRouter API (Google Gemini AI model)
  - Jina AI proxy for content extraction

## Project Structure

```
distill/
├── docs/                    # Documentation
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # UI components (shadcn)
│   │   ├── common/          # Common components
│   │   └── distill/         # Distill-specific components
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Application pages
│   ├── services/            # API service wrappers
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
└── supabase/
    └── functions/           # Edge Functions
        └── process-url/     # Content processing function
            ├── services/    # Edge function services
            └── utils/       # Edge function utilities
```

## Key Components and Services

### Frontend Components

- **MinimalContentView.tsx**: Plain text display component
- **PlainTextDisplay.tsx**: Renders text without formatting
- **ContentStateDisplay.tsx**: Error and loading state handler

### Edge Function Services

- **contentProcessor.ts**: Edge function for orchestrating content processing
- **contentFetcher.ts**: Edge function for URL validation and content fetching
- **aiService.ts**: Edge function for AI model integration
- **promptService.ts**: Edge function for managing AI prompts

## Data Flow

### Detailed Request Flow Diagram

```
┌─────────────┐     ┌────────────────┐     ┌─────────────────┐
│ URL Request │────>│ URL Parsing    │────>│ Edge Function   │
└─────────────┘     │ path/style/url │     │ Invocation      │
                    └────────────────┘     └────────┬────────┘
                                                    │
                                                    ▼
┌─────────────┐     ┌────────────────┐     ┌─────────────────┐
│ Plain Text  │<────│ Frontend       │<────│ Content         │
│ Display     │     │ Processing     │     │ Processing      │
└─────────────┘     └────────────────┘     └────────┬────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │ Jina Content    │
                                           │ Extraction      │
                                           └────────┬────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │ OpenRouter      │
                                           │ Summarization   │
                                           └─────────────────┘
```

1. User enters URL in the pattern `rewrite.page/{style}/{url}`
2. Frontend parses the URL to extract style and target URL
3. Edge Function is invoked with style and URL parameters
4. Content is fetched using Jina AI proxy
5. Content is summarized by OpenRouter API using the specified style
6. Plain text result is returned to the frontend
7. Plain text is displayed directly without UI elements

## Edge Function Architecture

```
process-url/
├── index.ts                  # Main entry point and request handler
├── services/
│   ├── contentProcessor.ts   # Orchestrates content processing
│   ├── contentFetcher.ts     # Handles content extraction
│   ├── aiService.ts          # Manages AI API interactions
│   └── promptService.ts      # Generates prompts for different styles
└── utils/
    ├── cors.ts               # CORS handling utilities
    └── text.ts               # Text processing utilities
```

### Edge Function Processing Flow

```
┌─────────────┐     ┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ HTTP        │────>│ Request         │────>│ CORS            │────>│ Request         │
│ Request     │     │ Parsing        │     │ Validation      │     │ Parameter       │
└─────────────┘     └────────────────┘     └─────────────────┘     │ Extraction      │
                                                                   └────────┬────────┘
                                                                            │
                    ┌────────────────┐     ┌─────────────────┐              │
                    │ Error          │<────│ URL             │<─────────────┘
                    │ Response       │     │ Validation      │
                    └────────────────┘     └─────────────────┘
                                                   │
                                                   │ Valid URL
                                                   ▼
                    ┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
                    │ Response       │<────│ AI              │<────│ Jina Content    │
                    │ Formatting     │     │ Summarization   │     │ Extraction      │
                    └────────────────┘     └─────────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ HTTP        │
                    │ Response    │
                    └─────────────┘
```

### SummarizationPromptFactory Behavior

The `SummarizationPromptFactory` class dynamically generates prompts based on the input style:

1. If style is 'bullets' and a number is provided:
   - Creates a prompt for extracting exactly that number of bullet points

2. If style is empty or 'standard':
   - Uses a general summarization prompt

3. For any other style string:
   - Passes the string directly to the LLM with instructions for interpretation
   - LLM determines how to interpret the style (language, writing style, persona, etc.)

## URL Pattern Structure

```
rewrite.page/{style}/{url}
```

- **{style}**: 
  - Optional style parameter
  - If numeric (e.g., "5"), interpreted as bullet count
  - If text, interpreted as style instruction by the LLM
  - If omitted, defaults to 'standard'

- **{url}**: 
  - Target URL to summarize
  - Can be with or without protocol prefix
  - Will have https:// added if missing

## Error Handling Strategy

Distill implements a comprehensive error handling strategy:

1. **Error Categorization**:
   - URL_ERROR: Invalid URL format, empty URL
   - CONNECTION_ERROR: Network issues, timeouts, blocked websites
   - CONTENT_ERROR: Empty content, extraction failures
   - AI_SERVICE_ERROR: OpenRouter API issues, token limits
   - PROCESSING_ERROR: General/uncategorized errors

2. **User-Friendly Messages**:
   - Technical errors are translated into plain text user-friendly messages
   - Messages provide clear guidance on how to resolve the issue

3. **Error Propagation**:
   - Errors from Edge Functions include appropriate HTTP status codes
   - Frontend displays error messages as plain text

## Security Considerations

- API keys are stored securely in Edge Functions
- Content processing happens server-side
- Error messages are sanitized to avoid leaking sensitive information
- CORS headers are properly configured in Edge Functions

## Performance Optimizations

- Single request flow to reduce network overhead
- Minimal UI for faster rendering
- Plain text output eliminates rendering overhead
- Error handling to provide immediate feedback on failures

## Development Guidelines

### Adding Additional Edge Function Features

1. Modify the relevant service in the Edge Function
2. Update the error handling to account for new error types
3. Test with various URL types and edge cases

### Modifying Front-End Components

1. Keep the UI minimal with focus on plain text display
2. Ensure the component handles loading and error states gracefully
3. Maintain the URL pattern parsing logic

## Testing and Deployment

### Testing Strategy

- Test with various URL formats and content types
- Verify error handling for different error scenarios
- Check performance with different-sized content

### Deployment Process

The application is deployed using the built-in deployment pipeline, which handles:
1. Building the frontend assets
2. Deploying Edge Functions
3. Setting up routes and hosting

## LLM Style Interpretation

The LLM dynamically interprets style instructions passed in the URL:

- **Language/Culture**: "tamil", "spanish", "japanese"
- **Writing Style**: "academic", "poetic", "technical"
- **Character Voice**: "pirate", "shakespeare", "yoda"
- **Format**: "haiku", "sonnet", "tweet"
- **Complexity**: "simple", "advanced", "eli5"
- **Perspective**: "conservative", "progressive", "neutral"

The LLM uses its training to determine the appropriate way to adapt the content to the requested style.
