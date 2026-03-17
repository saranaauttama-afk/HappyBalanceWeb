import { goalsService } from "../services/goals.service";
import { profileService } from "../services/profile.service";
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

function getGoalTimestamp(targetValue?: string | number, updatedAt?: string, createdAt?: string) {
  const updated = updatedAt ? new Date(updatedAt).getTime() : Number.NaN;
  if (Number.isFinite(updated)) return updated;

  const created = createdAt ? new Date(createdAt).getTime() : Number.NaN;
  if (Number.isFinite(created)) return created;

  const target = Number(targetValue);
  return Number.isFinite(target) ? target : 0;
}

function toPositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function getPostAuthRedirectPath(user: User) {
  if (!user?.id) return "/home";

  try {
    const [profileResponse, goalsResponse] = await Promise.all([
      profileService.getUser(user.id),
      goalsService.listGoals(user.id),
    ]);

    if (!profileResponse.success || !goalsResponse.success) {
      return "/home";
    }

    const sleepGoalMinutes = toPositiveNumber(profileResponse.data?.sleep_goal_minutes);
    const waterGoalMl = toPositiveNumber(profileResponse.data?.water_goal_ml);
    const screenTimeGoal = [...(goalsResponse.data || [])]
      .filter((goal) => goal.category === "physical" && goal.activity === "limit-screen-time")
      .sort(
        (a, b) =>
          getGoalTimestamp(b.target_value, b.updated_at, b.created_at) -
          getGoalTimestamp(a.target_value, a.updated_at, a.created_at)
      )[0];
    const screenTimeGoalMinutes = toPositiveNumber(screenTimeGoal?.target_value);

    if (sleepGoalMinutes > 0 && waterGoalMl > 0 && screenTimeGoalMinutes > 0) {
      return "/home";
    }

    return "/profile/settings";
  } catch {
    return "/home";
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}
