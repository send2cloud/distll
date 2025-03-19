
# Distill Technical Guide

## Technology Stack

Distill is built with the following technologies:

- **Frontend**:
  - React 18.3+ with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - shadcn/ui component library
  - React Router for navigation
  - React Query for data fetching

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
│   └── utils/               # Helper functions
└── supabase/
    └── functions/           # Edge Functions
        └── process-url/     # Content processing function
            ├── services/    # Edge function services
            └── utils/       # Edge function utilities
```

## Key Components and Services

### Frontend Components

- **Index.tsx**: Main landing page with URL input form
- **Distill.tsx**: Results page displaying processed content
- **ContentTabs.tsx**: Tabs for switching between summary and original content
- **ErrorDisplay.tsx**: Error handling and user feedback
- **LoadingIndicator.tsx**: Progress indication during processing
- **SettingsModal.tsx**: User configuration options

### Custom Hooks

- **useContentProcessor.tsx**: Manages content processing state and API communication
- **useMobile.tsx**: Responsive design helper

### Services

- **edgeFunctionService.ts**: Frontend service for invoking Edge Functions
- **contentProcessor.ts**: Edge function for orchestrating content processing
- **contentFetcher.ts**: Edge function for URL validation and content fetching
- **aiService.ts**: Edge function for AI model integration
- **promptService.ts**: Edge function for managing AI prompts

## Data Flow

1. User enters a URL in the frontend (Index.tsx)
2. The URL is validated and normalized
3. The frontend calls the Edge Function via `invokeProcessFunction`
4. The Edge Function fetches content using Jina AI proxy
5. The content is processed by OpenRouter API with the selected style
6. The results are returned to the frontend
7. Content is displayed in the appropriate tabs

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

### Edge Function Request Flow

```
Client Request
    ↓
CORS Validation
    ↓
Request Parsing
    ↓
Content Processing
    ↓   ↙                  ↘
    URL Processing      Direct Content Processing
        ↓                   ↓
    Fetch Content           |
        ↓                   ↓
    AI Summarization ←-----┘
        ↓
    Response Formatting
        ↓
Client Response
```

## Error Handling Strategy

Distill implements a comprehensive error handling strategy:

1. **Frontend Validation**: Basic URL validation before submission
2. **Error Categorization**: Errors are categorized into specific types:
   - URL_ERROR
   - CONNECTION_ERROR
   - CONTENT_ERROR
   - AI_SERVICE_ERROR
   - PROCESSING_ERROR
3. **User-Friendly Messages**: Technical errors are translated into user-friendly messages
4. **Toast Notifications**: Important errors are displayed as toast notifications
5. **Error Component**: Dedicated component for displaying errors with guidance

## Security Considerations

- API keys are stored securely in Edge Functions
- Content processing happens server-side
- Error messages are sanitized to avoid leaking sensitive information
- CORS headers are properly configured in Edge Functions

## Performance Optimizations

- Single request flow to reduce network overhead
- Progress indicators to improve perceived performance
- Error handling to provide feedback on failures
- Timeout handling for long-running requests

## Development Guidelines

### Adding New Summarization Styles

1. Update `promptService.ts` to include the new style prompt
2. Add the style to the UI components in the frontend
3. Update type definitions if necessary

### Modifying Content Processing

1. Update the relevant service in the Edge Function
2. Test thoroughly with various URL types
3. Ensure proper error handling

### UI Modifications

1. Use the existing shadcn/ui components for consistency
2. Follow the established design patterns
3. Ensure responsive design for all screen sizes

## Deployment

The application is deployed using Lovable's built-in deployment pipeline, which handles:

1. Building the frontend assets
2. Deploying Edge Functions
3. Setting up routes and hosting

## SOLID Principles Implementation

Distill follows SOLID principles in its architecture:

- **Single Responsibility**: Each component and service has a specific, well-defined responsibility
- **Open-Closed**: The architecture is extensible without requiring modification of existing code
- **Liskov Substitution**: Services follow clear interfaces allowing for implementation swapping
- **Interface Segregation**: Components depend only on the interfaces they need
- **Dependency Inversion**: High-level modules depend on abstractions, not implementations

## Monitoring and Debugging

- Edge Function logs are available in the Supabase dashboard
- Frontend errors are captured and displayed to users
- Console logging is used throughout the application for debugging
