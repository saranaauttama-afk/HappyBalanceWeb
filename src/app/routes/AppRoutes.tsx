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
import RestActivityPage from "../../features/goals/activity-detail/RestActivityPage";
import CreateGoalPage from "../../features/goals/create/CreateGoalPage";
import AppointmentsPage from "../../features/appointments/AppointmentsPage";
import ProfilePage from "../../features/profile/ProfilePage";
import DailyLogPage from "../../features/daily-log/DailyLogPage";
import GoalSettingPage from "../../features/goals/activity-goal/GoalSettingPage";
import ActivityTaskPage from "../../features/goals/task-detail/ActivityTaskPage";
import SleepGoalPage from "../../features/goals/task-detail/SleepGoalPage";
import ScreenTimeGoalPage from "../../features/goals/task-detail/ScreenTimeGoalPage";
import SettingsPage from "../../features/profile/settings/SettingsPage";
import SleepGoalSettingsPage from "../../features/profile/settings/SleepGoalSettingsPage";
import WaterGoalSettingsPage from "../../features/profile/settings/WaterGoalSettingsPage";
import PersonalInfoPage from "../../features/profile/personal-info/PersonalInfoPage";
import CounselingRecordPage from "../../features/profile/counseling-record/CounselingRecordPage";
import EvaluationResultPage from "../../features/profile/evaluation-result/EvaluationResultPage";
import HelpPage from "../../features/profile/help/HelpPage";
import MentalTaskPage from "../../features/goals/task-detail/MentalTaskPage";
import PositiveThinkingTaskPage from "../../features/goals/task-detail/PositiveThinkingTaskPage";
import SmileTaskPage from "../../features/goals/task-detail/SmileTaskPage";
import StressTaskPage from "../../features/goals/task-detail/StressTaskPage";
import SunlightTaskPage from "../../features/goals/task-detail/SunlightTaskPage";
import SocialTaskPage from "../../features/goals/task-detail/SocialTaskPage";
import FamilyRelationshipTaskPage from "../../features/goals/task-detail/FamilyRelationshipTaskPage";
import ListenAcceptTaskPage from "../../features/goals/task-detail/ListenAcceptTaskPage";
import WorkplaceRelationshipTaskPage from "../../features/goals/task-detail/WorkplaceRelationshipTaskPage";
import ShareItemsTaskPage from "../../features/goals/task-detail/ShareItemsTaskPage";
import BalanceTaskPage from "../../features/goals/task-detail/BalanceTaskPage";
import FamilySocialBalanceTaskPage from "../../features/goals/task-detail/FamilySocialBalanceTaskPage";
import ThanksSorryTaskPage from "../../features/goals/task-detail/ThanksSorryTaskPage";
import WorkBalanceTaskPage from "../../features/goals/task-detail/WorkBalanceTaskPage";
import ArticleDetailPage from "../../features/articles/ArticleDetailPage";

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
      <Route path="/goals/physical/rest" element={<RestActivityPage />} />
      <Route path="/goals/:category/:activity" element={<GoalActivityPage />} />
      <Route
        path="/goals/:category/:activity/goal"
        element={<GoalSettingPage />}
      />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
      <Route path="/profile/counseling-record" element={<CounselingRecordPage />} />
      <Route path="/profile/evaluation-result" element={<EvaluationResultPage />} />
      <Route path="/profile/help" element={<HelpPage />} />
      <Route path="/daily-log" element={<DailyLogPage />} />
      <Route path="/articles/:articleId" element={<ArticleDetailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/goals/:category/:activity/:task"
        element={<ActivityTaskPage />}
      />
      <Route
        path="/goals/:category/:activity/sleep/goal"
        element={<SleepGoalPage />}
      />
      <Route
        path="/goals/:category/:activity/limit-screen-time/goal"
        element={<ScreenTimeGoalPage />}
      />
      <Route path="/profile/settings" element={<SettingsPage />} />
      <Route
        path="/profile/settings/sleep-goal"
        element={<SleepGoalSettingsPage />}
      />
      <Route
        path="/profile/settings/water-goal"
        element={<WaterGoalSettingsPage />}
      />
      <Route path="/goals/mental/:activity/task" element={<MentalTaskPage />} />
      <Route
        path="/goals/mental/positive-thinking/smile-when-disappointed"
        element={<SmileTaskPage />}
      />
      <Route
        path="/goals/mental/positive-thinking/:task"
        element={<PositiveThinkingTaskPage />}
      />
      <Route
        path="/goals/mental/stress-level/get-sunlight"
        element={<SunlightTaskPage />}
      />
      <Route
        path="/goals/mental/stress-level/:task"
        element={<StressTaskPage />}
      />
      <Route path="/goals/social/:activity/task" element={<SocialTaskPage />} />
      <Route
        path="/goals/social/family-relationship/:task"
        element={<FamilyRelationshipTaskPage />}
      />
      <Route
        path="/goals/social/family-relationship/listen-and-accept"
        element={<ListenAcceptTaskPage />}
      />
      <Route
        path="/goals/social/workplace-relationship/:task"
        element={<WorkplaceRelationshipTaskPage />}
      />
      <Route
        path="/goals/social/workplace-relationship/share-items-with-colleagues"
        element={<ShareItemsTaskPage />}
      />
      <Route
        path="/goals/balance/:activity/task"
        element={<BalanceTaskPage />}
      />
      <Route
        path="/goals/balance/family-social-balance/:task"
        element={<FamilySocialBalanceTaskPage />}
      />
      <Route
  path="/goals/balance/family-social-balance/say-thanks-or-sorry"
  element={<ThanksSorryTaskPage />}
/>
<Route
  path="/goals/balance/work-balance/:task"
  element={<WorkBalanceTaskPage />}
/>
    </Routes>
  );
}
