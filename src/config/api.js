// API base URL - defaults to Django dev server
// Override with NEXT_PUBLIC_API_URL env var for production
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
