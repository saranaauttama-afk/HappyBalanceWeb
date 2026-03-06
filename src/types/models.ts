export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: string;
  activity: string;
  current_value: number;
  target_value: number;
  status: "active" | "completed" | "paused";
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: string;
  energy: number;
  stress: number;
  note: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  appointment_date: string;
  type: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
  note: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}