import type { ApiResponse } from "../types/models";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://example.com";

type HttpMethod = "GET" | "POST";

async function request<T>(
  method: HttpMethod,
  action: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    if (!API_BASE_URL || API_BASE_URL === "https://example.com") {
      throw new Error("VITE_API_BASE_URL is not configured");
    }

    if (method === "GET") {
      const url = new URL(API_BASE_URL);
      url.searchParams.set("action", action);

      if (body) {
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as ApiResponse<T>;
    }

    const formData = new URLSearchParams();
    formData.set("action", action);

    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, String(value));
        }
      });
    }

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const api = {
  get: <T>(action: string, params?: Record<string, unknown>) =>
    request<T>("GET", action, params),
  post: <T>(action: string, body?: Record<string, unknown>) =>
    request<T>("POST", action, body),
};