import type { ApiResponse } from "../types/models";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://example.com";
const SHOULD_LOG_TIMING =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_API_TIMING === "true";
const TIMED_ACTIONS = new Set([
  "listDailyLogs",
  "listRestTaskLogs",
  "listGoals",
  "createDailyLog",
  "updateGoal",
]);

type HttpMethod = "GET" | "POST";

function getNowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function logApiTiming(
  method: HttpMethod,
  action: string,
  startedAt: number,
  success: boolean
) {
  if (!SHOULD_LOG_TIMING || !TIMED_ACTIONS.has(action)) return;
  const elapsed = getNowMs() - startedAt;
  const status = success ? "ok" : "error";
  console.info(`[api-timing] ${method} ${action} ${elapsed.toFixed(1)}ms ${status}`);
}

async function request<T>(
  method: HttpMethod,
  action: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const startedAt = getNowMs();
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

      const json = (await response.json()) as ApiResponse<T>;
      logApiTiming(method, action, startedAt, json.success);
      return json;
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

    const json = (await response.json()) as ApiResponse<T>;
    logApiTiming(method, action, startedAt, json.success);
    return json;
  } catch (error) {
    logApiTiming(method, action, startedAt, false);
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
