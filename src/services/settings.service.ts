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
  async getCategorySettings(): Promise<AppSettingsData> {
    if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
    try {
      const res = await api.get<AppSettingsData>("getAppSettings");
      if (res.success && res.data) {
        _cache = res.data;
        _cacheAt = Date.now();
        return res.data;
      }
    } catch {
      // fall through to default
    }
    return DEFAULT_SETTINGS;
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
