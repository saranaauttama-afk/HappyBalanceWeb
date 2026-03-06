import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "../../features/auth/welcome/WelcomePage";
import LoginPage from "../../features/auth/login/LoginPage";
import ForgotPasswordPage from "../../features/auth/forgot-password/ForgotPasswordPage";
import TermsPage from "../../features/auth/terms/TermsPage";
import RegisterPage from "../../features/auth/register/RegisterPage";
import HomePage from "../../features/home/HomePage";
import GoalsPage from "../../features/goals/GoalsPage";
import GoalCategoryPage from "../../features/goals/category-detail/GoalCategoryPage";
import GoalActivityPage from "../../features/goals/activity-detail/GoalActivityPage";
import CreateGoalPage from "../../features/goals/create/CreateGoalPage";
import AppointmentsPage from "../../features/appointments/AppointmentsPage";
import ProfilePage from "../../features/profile/ProfilePage";
import DailyLogPage from "../../features/daily-log/DailyLogPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/goals/create" element={<CreateGoalPage />} />
      <Route path="/goals/:category" element={<GoalCategoryPage />} />
      <Route
        path="/goals/:category/:activity"
        element={<GoalActivityPage />}
      />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/daily-log" element={<DailyLogPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}