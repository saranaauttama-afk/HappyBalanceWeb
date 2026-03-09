export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  sleep_goal_minutes?: number | string;
  water_goal_ml?: number | string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: string;
  activity: string;
  current_value: number;
  target_value: number;
  status: "active" | "completed" | "paused";
  created_at?: string;
  updated_at?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: string;
  energy: number;
  stress: number;
  note: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  appointment_date: string;
  type: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
  note: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  month_key: string;
  goal_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  published_at?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
