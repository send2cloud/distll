export function normalizeUrl(rawUrl: string): string {
    const processedUrl = rawUrl.trim();

    if (!processedUrl) {
        throw new Error("URL is empty");
    }

    // Detect if URL contains protocol
    const hasProtocol = processedUrl.match(/^[a-zA-Z]+:\/\//);

    // Ensure the URL has a protocol prefix
    return hasProtocol ? processedUrl : `https://${processedUrl}`;
}
