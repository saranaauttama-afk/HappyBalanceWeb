import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { REST_TASKS } from "../tasks/restTasks";
import { MENTAL_TASKS } from "../tasks/mentalTasks";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";
import { STRESS_TASKS } from "../tasks/stressTasks";
import { SOCIAL_TASKS } from "../tasks/socialTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";
import { BALANCE_TASKS } from "../tasks/balanceTasks";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";
import { ChevronRight, Smile, Sparkles, Sun } from "lucide-react";

const PHYSICAL_UNDER_CONSTRUCTION_MAP: Record<
  string,
  {
    title: string;
    subtitle: string;
    emoji: string;
    tips: string[];
  }
> = {
  "food-intake": {
    title: "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£",
    subtitle: "ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢",
    emoji: "ÃƒÂ°Ã…Â¸Ã‚Â¥Ã¢â‚¬â€",
    tips: [
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¸ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å“ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£",
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¸ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢",
    ],
  },
  exercise: {
    title: "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢",
    subtitle: "ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢",
    emoji: "ÃƒÂ°Ã…Â¸Ã‚ÂÃ†â€™",
    tips: [
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢",
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬â„¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å“ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´",
    ],
  },
  "body-hygiene": {
    title: "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â©ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢",
    subtitle: "ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¤ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¢",
    emoji: "ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¼",
    tips: [
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¤ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢",
      "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¹Ã…â€™",
    ],
  },
};

function getMentalTitle(activity?: string) {
  if (activity === "positive-thinking") return "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â";
  if (activity === "stress-level") return "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Â";
  if (activity === "life-satisfaction") return "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢";
  if (activity === "self-worth") return "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å“ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡";
  return "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡";
}

function getSocialTitle(activity?: string) {
  if (activity === "family-relationship") {
    return "ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§";
  }
  if (activity === "community-participation") {
    return "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡";
  }
  if (activity === "workplace-relationship") {
    return "ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢";
  }
  return "ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡";
}

export default function GoalActivityPage() {
  const { category, activity } = useParams<{
    category: string;
    activity: string;
  }>();

  if (category === "physical" && activity === "rest") {
    return (
      <MobileShell>
        <AppHeader title="ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚ÂÃƒÂ¯Ã‚Â¸Ã‚Â</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                7
              </div>
              <span className="text-4xl">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚ÂÃƒÂ¯Ã‚Â¸Ã‚Â</span>
            </div>
          </div>

          <div className="space-y-3">
            {REST_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/physical/rest/${task.slug}`}
                className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                  task.completed
                    ? "border-green-400 bg-green-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {task.label}
              </Link>
            ))}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "physical" && activity) {
    const physicalConfig = PHYSICAL_UNDER_CONSTRUCTION_MAP[activity];

    if (physicalConfig) {
      return (
        <MobileShell>
          <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
            <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

            <AppHeader title={physicalConfig.title} showBack showBell variant="soft" subtitle="ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬â„¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°" />

            <main className="relative z-10 space-y-4 px-4 py-4">
              <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">UNDER CONSTRUCTION</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    {physicalConfig.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{physicalConfig.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{physicalConfig.subtitle}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <h3 className="text-base font-semibold text-slate-900">ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°</h3>
                <div className="mt-3 space-y-2">
                  {physicalConfig.tips.map((tip) => (
                    <div key={tip} className="rounded-2xl border border-[#dcecf5] bg-[#f6fbff] px-3 py-2 text-sm text-slate-600">
                      {tip}
                    </div>
                  ))}
                </div>
              </section>

              <Link
                to="/goals/physical"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#c8e2ef] bg-[#eef8fd] px-4 py-3 text-sm font-medium text-[#2e6a8b]"
              >
                ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢
              </Link>
            </main>
          </div>
        </MobileShell>
      );
    }
  }

  if (category === "mental" && activity === "positive-thinking") {
    const completedCount = POSITIVE_THINKING_TASKS.filter((task) => task.completed).length;
    const totalCount = POSITIVE_THINKING_TASKS.length;
    const progressPercent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â"
            showBack
            showBell
            variant="soft"
            subtitle="ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¤ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">POSITIVE THINKING</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â</h2>
                  <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Âµ 1 ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2e6a8b] shadow-sm">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§ {completedCount} / {totalCount} ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {POSITIVE_THINKING_TASKS.map((task) => {
                const path =
                  task.slug === "smile-when-disappointed"
                    ? "/goals/mental/positive-thinking/smile-when-disappointed"
                    : `/goals/mental/positive-thinking/${task.slug}`;
                const isDaily = task.slug === "smile-when-disappointed";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢" : "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No (ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§" : "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚Â"}
                            </span>
                            {isDaily ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4ec] px-2.5 py-1 text-xs font-medium text-[#a95f3a]">
                                <Smile size={12} />
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "mental" && activity === "stress-level") {
    const completedCount = STRESS_TASKS.filter((task) => task.completed).length;
    const totalCount = STRESS_TASKS.length;
    const progressPercent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Â"
            showBack
            showBell
            variant="soft"
            subtitle="ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">STRESS LEVEL</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Â</h2>
                  <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Âµ 1 ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2e6a8b] shadow-sm">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§ {completedCount} / {totalCount} ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {STRESS_TASKS.map((task) => {
                const path =
                  task.slug === "get-sunlight"
                    ? "/goals/mental/stress-level/get-sunlight"
                    : `/goals/mental/stress-level/${task.slug}`;
                const isDaily = task.slug === "get-sunlight";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢" : "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No (ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§" : "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚Â"}
                            </span>
                            {isDaily ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                <Sun size={12} />
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "social" && activity === "family-relationship") {
    const completedCount = FAMILY_RELATIONSHIP_TASKS.filter((task) => task.completed).length;
    const totalCount = FAMILY_RELATIONSHIP_TASKS.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§"
            showBack
            showBell
            variant="soft"
            subtitle="ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">FAMILY RELATIONSHIP</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§</h2>
                  <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ Yes/No ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â° 1 ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â©ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â§
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§ {completedCount} / {totalCount} ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {FAMILY_RELATIONSHIP_TASKS.map((task) => {
                const path =
                  task.slug === "listen-and-accept"
                    ? "/goals/social/family-relationship/listen-and-accept"
                    : `/goals/social/family-relationship/${task.slug}`;
                const isDaily = task.slug === "listen-and-accept";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢" : "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No (ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§" : "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚Â"}
                            </span>
                            {isDaily ? (
                              <span className="rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "social" && activity === "community-participation") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡"
            showBack
            showBell
            variant="soft"
            subtitle="ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">COMMUNITY PARTICIPATION</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                    ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¸ÃƒÂ Ã‚Â¸Ã¢â‚¬Å“ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€  ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ÃƒÂ°Ã…Â¸Ã‚Â¤Ã‚Â
                </div>
              </div>
            </section>

            <Link
              to="/goals/social/community-participation/task"
              className="block rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold leading-7 text-slate-900">ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°</h3>
                  <p className="mt-1 text-sm text-slate-500">ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes / No ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Âµ</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                    Yes / No
                  </span>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "social" && activity === "workplace-relationship") {
    const completedCount = WORKPLACE_RELATIONSHIP_TASKS.filter((task) => task.completed).length;
    const totalCount = WORKPLACE_RELATIONSHIP_TASKS.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢"
            showBack
            showBell
            variant="soft"
            subtitle="ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¤ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">WORKPLACE RELATIONSHIP</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ÃƒÂ Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢</h2>
                  <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ Yes/No ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â° 1 ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¼
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§ {completedCount} / {totalCount} ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {WORKPLACE_RELATIONSHIP_TASKS.map((task) => {
                const path =
                  task.slug === "share-items-with-colleagues"
                    ? "/goals/social/workplace-relationship/share-items-with-colleagues"
                    : `/goals/social/workplace-relationship/${task.slug}`;
                const isDaily = task.slug === "share-items-with-colleagues";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢" : "ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…â€œÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No (ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â³ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â§" : "ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚Â"}
                            </span>
                            {isDaily ? (
                              <span className="rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "family-social-balance") {
    const completedCount = FAMILY_SOCIAL_BALANCE_TASKS.filter((task) => task.completed).length;
    const totalCount = FAMILY_SOCIAL_BALANCE_TASKS.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลระหว่างครอบครัวและสังคม"
            showBack
            showBell
            variant="soft"
            subtitle="รักษาความสัมพันธ์ที่ดีทั้งกับครอบครัวและผู้คนรอบตัว"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.5)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.14em] text-white/75">FAMILY &amp; SOCIAL BALANCE</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold leading-tight text-white/90">Stay close to the people who matter</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                  🤝
                </div>
              </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                </div>
                <div className="min-w-0 flex-1 pt-6">
                  <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                    <span>Total progress</span>
                    <span className="font-semibold text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white/90">
                    Completed {completedCount} / {totalCount} tasks
                  </p>
                </div>
              </div>
              </div>
            </section>

            <section className="space-y-3">
              {FAMILY_SOCIAL_BALANCE_TASKS.map((task) => {
                const path =
                  task.slug === "say-thanks-or-sorry"
                    ? "/goals/balance/family-social-balance/say-thanks-or-sorry"
                    : `/goals/balance/family-social-balance/${task.slug}`;
                const isDaily = task.slug === "say-thanks-or-sorry";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "Daily count log" : "Yes/No summary log"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "Done" : "Pending"}
                            </span>
                            {isDaily ? (
                              <span className="rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "work-balance") {
    const completedCount = WORK_BALANCE_TASKS.filter((task) => task.completed).length;
    const totalCount = WORK_BALANCE_TASKS.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลการทำงาน"
            showBack
            showBell
            variant="soft"
            subtitle="จัดจังหวะการทำงานให้พอดี ไม่หนักจนเกินไป"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.46)_0%,rgba(8,12,16,0.64)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">WORK BALANCE</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Keep work steady, not overwhelming</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    💼
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 pt-6">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">
                      Completed {completedCount} / {totalCount} tasks
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {WORK_BALANCE_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/balance/work-balance/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">Yes/No summary log</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              task.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.completed ? "Done" : "Pending"}
                          </span>
                          <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                            Yes / No
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "personal-life-balance") {
    const completedCount = PERSONAL_LIFE_BALANCE_TASKS.filter((task) => task.completed).length;
    const totalCount = PERSONAL_LIFE_BALANCE_TASKS.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลระหว่างชีวิตส่วนตัว"
            showBack
            showBell
            variant="soft"
            subtitle="เว้นพื้นที่ให้ตัวเองด้วยกิจกรรมเล็ก ๆ ที่เติมพลัง"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.48)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">PERSONAL LIFE BALANCE</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Make space for yourself</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    🌿
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-white/90">Completed {completedCount} / {totalCount} tasks</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {PERSONAL_LIFE_BALANCE_TASKS.map((task) => (
                <Link
                  key={task.slug}
                  to={`/goals/balance/personal-life-balance/${task.slug}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              task.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.completed ? "Done" : "Pending"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              task.type === "counter"
                                ? "bg-[#fff5ea] text-[#9a5b34]"
                                : "bg-[#eef8fd] text-[#2e6a8b]"
                            }`}
                          >
                            {task.type === "counter" ? "Counter" : "Yes / No"}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="Life Balance"
            showBack
            showBell
            variant="soft"
            subtitle="Choose one area to log and track"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">LIFE BALANCE</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">
                Track balance across work, family/social, and personal life
              </h2>
              <p className="mt-1 text-sm text-slate-600">Your logs here are used to calculate this category score</p>
            </section>

            <section className="space-y-3">
              {BALANCE_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/balance/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">Open and update subtasks in this area</p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "social") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader title={getSocialTitle(activity)} showBack showBell variant="soft" subtitle="ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡" />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">SOCIAL WELLBEING</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂªÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‹Å“ÃƒÂ Ã‚Â¹Ã…â€™ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§</h2>
              <p className="mt-1 text-sm text-slate-600">ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¾ÃƒÂ Ã‚Â¸Ã‚Â¤ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â²ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â·ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã…Â¡ Yes/No</p>
            </section>

            <section className="space-y-3">
              {SOCIAL_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/social/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">ÃƒÂ Ã‚Â¹Ã¢â€šÂ¬ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂºÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã¢â‚¬ÂÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¹Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚Â°ÃƒÂ Ã‚Â¸Ã…Â¡ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã¢â‚¬â€ÃƒÂ Ã‚Â¸Ã‚Â¶ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¹Ã†â€™ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚Â«ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã‚Â§ÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã¢â€žÂ¢ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¹Ã¢â‚¬Â°</p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "mental") {
    const currentTask = MENTAL_TASKS.find((task) => task.slug === activity);

    return (
      <MobileShell>
        <AppHeader title={getMentalTitle(activity)} showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â </span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-200 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â </span>
            </div>
          </div>

          {currentTask ? (
            <Link
              to={`/goals/mental/${currentTask.slug}/task`}
              className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                currentTask.completed
                  ? "border-pink-300 bg-pink-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {currentTask.label}
            </Link>
          ) : (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-slate-500 shadow-sm">
              ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡
            </div>
          )}
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppHeader title="ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡" showBack showBell />
      <main className="px-4 py-6 text-center text-slate-500">
        ÃƒÂ Ã‚Â¸Ã‚Â¢ÃƒÂ Ã‚Â¸Ã‚Â±ÃƒÂ Ã‚Â¸Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Å¾ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¹Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚ÂµÃƒÂ Ã‚Â¸Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¹Ã¢â‚¬Â°ÃƒÂ Ã‚Â¸Ã‚Â­ÃƒÂ Ã‚Â¸Ã‚Â¡ÃƒÂ Ã‚Â¸Ã‚Â¹ÃƒÂ Ã‚Â¸Ã‚Â¥ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â´ÃƒÂ Ã‚Â¸Ã‹â€ ÃƒÂ Ã‚Â¸Ã‚ÂÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â£ÃƒÂ Ã‚Â¸Ã‚Â¡
      </main>
    </MobileShell>
  );
}
