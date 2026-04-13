import { api } from "./api";
import type { ApiResponse } from "../types/models";
import type { DailyLog } from "../types/models";
import { getCurrentWeekRange } from "../utils/weekPeriod";

const DEMO_USER_ID = "demo-user-001";
const READ_CACHE_TTL_MS = 90 * 1000;

type ListLogsFilters = {
  from?: string;
  to?: string;
  limit?: number;
  entry_type?: string;
  category?: string;
  activity?: string;
  task?: string;
  forceRefresh?: boolean;
};

type RestTaskLogsFilters = {
  task?: string;
  from?: string;
  to?: string;
  limit?: number;
  forceRefresh?: boolean;
};

type StructuredTaskLogsFilters = {
  activity?: string;
  task?: string;
  from?: string;
  to?: string;
  limit?: number;
  forceRefresh?: boolean;
};

type CacheEntry = {
  expiresAt: number;
  response: ApiResponse<DailyLog[]>;
};

const readCache = new Map<string, CacheEntry>();

function buildReadCacheKey(action: string, userId: string, filters: Record<string, unknown>) {
  const query = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");

  return `${action}|${userId}|${query}`;
}

function cloneResponse(response: ApiResponse<DailyLog[]>): ApiResponse<DailyLog[]> {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data.map((item) => ({ ...item })) : [],
  };
}

function getCachedRead(key: string) {
  const cached = readCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    readCache.delete(key);
    return null;
  }
  return cloneResponse(cached.response);
}

function setCachedRead(key: string, response: ApiResponse<DailyLog[]>) {
  if (!response.success) return;
  readCache.set(key, {
    expiresAt: Date.now() + READ_CACHE_TTL_MS,
    response: cloneResponse(response),
  });
}

function invalidateUserLogCache(userId: string) {
  for (const key of readCache.keys()) {
    if (key.includes(`|${userId}|`)) {
      readCache.delete(key);
    }
  }
}

function applyCurrentWeekDefaults<T extends { from?: string; to?: string }>(filters: T): T {
  if (filters.from || filters.to) {
    return filters;
  }

  const currentWeek = getCurrentWeekRange();
  return {
    ...filters,
    from: currentWeek.from,
    to: currentWeek.to,
  };
}

export const logsService = {
  async listDailyLogs(userId?: string, filters: ListLogsFilters = {}) {
    const resolvedUserId = userId ?? DEMO_USER_ID;
    const { forceRefresh, ...rawFilters } = filters;
    const params = {
      userId: resolvedUserId,
      ...rawFilters,
    };
    const cacheKey = buildReadCacheKey("listDailyLogs", resolvedUserId, rawFilters);

    if (!forceRefresh) {
      const cached = getCachedRead(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<DailyLog[]>("listDailyLogs", params);
    setCachedRead(cacheKey, response);
    return response;
  },

  async listRestTaskLogs(userId?: string, filters: RestTaskLogsFilters = {}) {
    const resolvedUserId = userId ?? DEMO_USER_ID;
    const { forceRefresh, ...rawFilters } = filters;
    const effectiveFilters = applyCurrentWeekDefaults(rawFilters);
    const params = {
      userId: resolvedUserId,
      ...effectiveFilters,
    };
    const cacheKey = buildReadCacheKey("listRestTaskLogs", resolvedUserId, effectiveFilters);

    if (!forceRefresh) {
      const cached = getCachedRead(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<DailyLog[]>("listRestTaskLogs", params);
    setCachedRead(cacheKey, response);
    return response;
  },

  async listMentalTaskLogs(userId?: string, filters: StructuredTaskLogsFilters = {}) {
    const resolvedUserId = userId ?? DEMO_USER_ID;
    const { forceRefresh, ...rawFilters } = filters;
    const effectiveFilters = applyCurrentWeekDefaults(rawFilters);
    const params = {
      userId: resolvedUserId,
      ...effectiveFilters,
    };
    const cacheKey = buildReadCacheKey("listMentalTaskLogs", resolvedUserId, effectiveFilters);

    if (!forceRefresh) {
      const cached = getCachedRead(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<DailyLog[]>("listMentalTaskLogs", params);
    setCachedRead(cacheKey, response);
    return response;
  },

  async listSocialTaskLogs(userId?: string, filters: StructuredTaskLogsFilters = {}) {
    const resolvedUserId = userId ?? DEMO_USER_ID;
    const { forceRefresh, ...rawFilters } = filters;
    const effectiveFilters = applyCurrentWeekDefaults(rawFilters);
    const params = {
      userId: resolvedUserId,
      ...effectiveFilters,
    };
    const cacheKey = buildReadCacheKey("listSocialTaskLogs", resolvedUserId, effectiveFilters);

    if (!forceRefresh) {
      const cached = getCachedRead(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<DailyLog[]>("listSocialTaskLogs", params);
    setCachedRead(cacheKey, response);
    return response;
  },

  async listBalanceTaskLogs(userId?: string, filters: StructuredTaskLogsFilters = {}) {
    const resolvedUserId = userId ?? DEMO_USER_ID;
    const { forceRefresh, ...rawFilters } = filters;
    const effectiveFilters = applyCurrentWeekDefaults(rawFilters);
    const params = {
      userId: resolvedUserId,
      ...effectiveFilters,
    };
    const cacheKey = buildReadCacheKey("listBalanceTaskLogs", resolvedUserId, effectiveFilters);

    if (!forceRefresh) {
      const cached = getCachedRead(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<DailyLog[]>("listBalanceTaskLogs", params);
    setCachedRead(cacheKey, response);
    return response;
  },

  async createDailyLog(payload: {
    user_id?: string;
    log_date: string;
    mood: string;
    energy: number;
    stress: number;
    note: string;
  }) {
    const resolvedUserId = payload.user_id ?? DEMO_USER_ID;
    const response = await api.post<DailyLog>("createDailyLog", {
      ...payload,
      user_id: resolvedUserId,
    });

    if (response.success) {
      invalidateUserLogCache(resolvedUserId);
    }

    return response;
  },
};
