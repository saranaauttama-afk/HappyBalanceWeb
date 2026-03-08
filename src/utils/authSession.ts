import type { User } from "../types/models";

const AUTH_USER_KEY = "hb_current_user";

export function setCurrentUser(user: User) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as User;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.id;
}

export function clearCurrentUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}
