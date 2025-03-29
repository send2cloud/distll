
# Distill - Web Content Summarization App

Distill is a web application that extracts and summarizes content from any URL using AI. It offers various summarization styles and formatting options.

## Project info

**URL**: https://lovable.dev/projects/99d45188-0e94-40f1-b1e7-83c5bd06873c

## How It Works

### Architecture Overview

Distill uses a simple, URL-driven architecture:

```mermaid
graph TD
    A[User Browser] -->|style/url| B[Edge Function "Sofia"]
    B -->|Prompt + Jina URL| C[OpenRouter AI API]
    C -->|Fetches content via| D[Jina AI Proxy]
    D -->|Returns web content| C
    C -->|Generated Summary| B
    B -->|Formatted HTML| A
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:2px
    style B fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style C fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style D fill:#fee2e2,stroke:#dc2626,stroke-width:2px
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Landing Page
    participant Sofia as Edge Function
    participant OpenRouter as OpenRouter API
    participant Jina as Jina AI Proxy
    
    %% Direct URL Access
    User->>Sofia: Visit rewrite.page/[style]/[url]
    Sofia->>Sofia: Parse style and URL from path
    Sofia->>OpenRouter: Send prompt with Jina URL (r.jina.ai/[url])
    OpenRouter->>Jina: Fetch content via proxy
    Jina-->>OpenRouter: Return web content
    OpenRouter->>Sofia: Return AI-generated summary
    Sofia->>User: Display formatted HTML
    
    %% Frontend Form Flow
    User->>Frontend: Enter URL & select style in form
    Frontend->>Frontend: Construct path: /[style]/[url]
    Frontend->>User: Redirect to rewrite.page/[style]/[url]
    Note over User,Sofia: Continues with direct URL flow above
```

### Data Flow

```mermaid
flowchart LR
    A[User Input] --> B{Access Type}
    B -->|Direct URL| C[Edge Function]
    B -->|Form Submission| D[Frontend]
    D -->|URL Redirect| C
    C --> E[Format Request]
    E --> F[OpenRouter AI]
    F --> G[Jina Content Proxy]
    G --> F
    F --> C
    C --> H[Format Response]
    H --> I[Display to User]
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:1px
    style B fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px
    style C fill:#dbeafe,stroke:#2563eb,stroke-width:1px
    style D fill:#dcfce7,stroke:#16a34a,stroke-width:1px
    style E fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style F fill:#fae8ff,stroke:#a21caf,stroke-width:1px
    style G fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style H fill:#dbeafe,stroke:#2563eb,stroke-width:1px
    style I fill:#f9f9f9,stroke:#333,stroke-width:1px
```

## Core Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Single Supabase Edge Function ("Sofia")
- **Content Extraction**: Via Jina AI proxy (handled by LLM)
- **AI Processing**: OpenRouter API (Google Gemini model)
- **Caching**: Edge function caching (1 day TTL)

## Summarization Styles

Distill supports various summarization styles:

- **Standard**: Concise, clear summary of key points
- **Simple**: Easy-to-understand language with short sentences
- **Bullets**: Key points presented as bullet points
- **ELI5**: Explains content as if to a five-year-old
- **Concise**: Ultra-compact summary of essential points
- **Tweet**: Summary in 140 characters or less
- **Clickbait**: Attention-grabbing sensationalist style
- **Custom**: User-defined style with custom parameters

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/99d45188-0e94-40f1-b1e7-83c5bd06873c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/99d45188-0e94-40f1-b1e7-83c5bd06873c) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
