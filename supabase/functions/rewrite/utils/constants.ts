
/**
 * Define constants used throughout the application
 * Following Single Responsibility Principle by centralizing constant definitions
 */

// Cache duration in seconds (1 day)
export const CACHE_DURATION = 86400;

// Landing page HTML
export const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Rewrite.page</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css">
    <meta http-equiv="refresh" content="0;url=/">
  </head>
  <body class="bg-gray-50 text-gray-800">
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <h1 class="text-2xl font-bold mb-4">Redirecting...</h1>
      <p class="mb-4">Redirecting to homepage.</p>
    </div>
  </body>
</html>
`;
