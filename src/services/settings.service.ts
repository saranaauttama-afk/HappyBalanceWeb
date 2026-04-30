import { api } from "./api";
import type { ApiResponse } from "../types/models";

export type CategoryKey = "physical" | "mental" | "social" | "balance";

export type CategoryEnabled = Record<CategoryKey, boolean>;

export type AppSettingsData = {
  categoryEnabled: CategoryEnabled;
};

const DEFAULT_SETTINGS: AppSettingsData = {
  categoryEnabled: { physical: true, mental: true, social: true, balance: true },
};

let _cache: AppSettingsData | null = null;
let _cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const settingsService = {
  invalidateCache() {
    _cache = null;
    _cacheAt = 0;
  },

  async getCategorySettings(options?: { fresh?: boolean }): Promise<{ data: AppSettingsData; fromServer: boolean; error?: string }> {
    if (!options?.fresh && _cache && Date.now() - _cacheAt < CACHE_TTL) {
      return { data: _cache, fromServer: false };
    }
    try {
      const res = await api.get<AppSettingsData>("getAppSettings");
      if (res.success && res.data?.categoryEnabled) {
        const merged: AppSettingsData = {
          categoryEnabled: {
            ...DEFAULT_SETTINGS.categoryEnabled,
            ...res.data.categoryEnabled,
          },
        };
        _cache = merged;
        _cacheAt = Date.now();
        return { data: merged, fromServer: true };
      }
      const errMsg = res.error ?? "getAppSettings returned no data";
      console.warn("[settings] load failed:", errMsg, res);
      return { data: DEFAULT_SETTINGS, fromServer: false, error: errMsg };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("[settings] load error:", errMsg);
      return { data: DEFAULT_SETTINGS, fromServer: false, error: errMsg };
    }
  },

  async updateCategoryEnabled(
    adminEmail: string,
    category: CategoryKey,
    enabled: boolean
  ): Promise<ApiResponse<{ key: string; value: string }>> {
    _cache = null;
    return api.post("updateAppSetting", {
      adminEmail,
      key: `category_enabled_${category}`,
      value: String(enabled),
    });
  },
};
