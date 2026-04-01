const SHEET_NAMES = {
  users: "users",
  goals: "goals",
  dailyLogs: "daily_logs",
  restTaskLogs: "rest_task_logs",
  mentalTaskLogs: "mental_task_logs",
  socialTaskLogs: "social_task_logs",
  balanceTaskLogs: "balance_task_logs",
  passwordResetTokens: "password_reset_tokens",
  appointments: "appointments",
  monthlyGoals: "monthly_goals",
  articles: "articles",
};
const APP_SCRIPT_VERSION = "GAS-PERF-BALANCE-2026-03-14B";
const APP_SCRIPT_DEPLOYED_AT = "2026-03-14T13:30:00+07:00";

const STRUCTURED_TASK_LOG_HEADERS = [
  "id",
  "daily_log_id",
  "user_id",
  "log_date",
  "entry_type",
  "category",
  "activity",
  "task",
  "score",
  "point",
  "achieved",
  "mood",
  "energy",
  "stress",
  "note",
  "created_at",
  "updated_at",
];

const PASSWORD_RESET_TOKEN_HEADERS = [
  "id",
  "user_id",
  "email",
  "token",
  "expires_at",
  "used_at",
  "created_at",
  "updated_at",
];

const TASK_LOG_SPECS = {
  rest: {
    sheetName: SHEET_NAMES.restTaskLogs,
    idPrefix: "restlog",
    entry_type: "rest_task",
    category: "physical",
    activity: "rest",
  },
  mental: {
    sheetName: SHEET_NAMES.mentalTaskLogs,
    idPrefix: "mentallog",
    entry_type: "mental_task",
    category: "mental",
    activity: "",
  },
  social: {
    sheetName: SHEET_NAMES.socialTaskLogs,
    idPrefix: "sociallog",
    entry_type: "social_task",
    category: "social",
    activity: "",
  },
  balance: {
    sheetName: SHEET_NAMES.balanceTaskLogs,
    idPrefix: "balancelog",
    entry_type: "balance_task",
    category: "balance",
    activity: "",
  },
};

function doGet(e) {
  try {
    const action = getParam_(e, "action");

    switch (action) {
      case "testVersion":
        return jsonOutput_(testVersion_());
      case "getUser":
        return jsonOutput_(getUser_(getParam_(e, "id")));
      case "validatePasswordResetToken":
        return jsonOutput_(
          validatePasswordResetToken_(getParam_(e, "token"))
        );
      case "listGoals":
        return jsonOutput_(listGoals_(getParam_(e, "userId")));
      case "listDailyLogs":
        return jsonOutput_(
          listDailyLogs_(getParam_(e, "userId"), {
            from: getParam_(e, "from"),
            to: getParam_(e, "to"),
            limit: getParam_(e, "limit"),
            entry_type: getParam_(e, "entry_type"),
            category: getParam_(e, "category"),
            activity: getParam_(e, "activity"),
            task: getParam_(e, "task"),
          })
        );
      case "listRestTaskLogs":
        return jsonOutput_(
          listRestTaskLogs_(
            getParam_(e, "userId"),
            getParam_(e, "task"),
            getParam_(e, "limit"),
            getParam_(e, "from"),
            getParam_(e, "to")
          )
        );
      case "listMentalTaskLogs":
        return jsonOutput_(
          listMentalTaskLogs_(
            getParam_(e, "userId"),
            getParam_(e, "activity"),
            getParam_(e, "task"),
            getParam_(e, "limit"),
            getParam_(e, "from"),
            getParam_(e, "to")
          )
        );
      case "listSocialTaskLogs":
        return jsonOutput_(
          listSocialTaskLogs_(
            getParam_(e, "userId"),
            getParam_(e, "activity"),
            getParam_(e, "task"),
            getParam_(e, "limit"),
            getParam_(e, "from"),
            getParam_(e, "to")
          )
        );
      case "listBalanceTaskLogs":
        return jsonOutput_(
          listBalanceTaskLogs_(
            getParam_(e, "userId"),
            getParam_(e, "activity"),
            getParam_(e, "task"),
            getParam_(e, "limit"),
            getParam_(e, "from"),
            getParam_(e, "to")
          )
        );
      case "listAppointments":
        return jsonOutput_(listAppointments_(getParam_(e, "userId")));
      case "listMonthlyGoals":
        return jsonOutput_(
          listMonthlyGoals_(getParam_(e, "userId"), getParam_(e, "month_key"))
        );
      case "listArticles":
        return jsonOutput_(listArticles_(getParam_(e, "limit")));
      default:
        return jsonOutput_({
          success: false,
          data: null,
          error: `Unknown GET action: ${action}`,
        });
    }
  } catch (error) {
    return jsonOutput_(errorResponse_(error));
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = body.action;

    switch (action) {
      case "registerUser":
        return jsonOutput_(registerUser_(body));
      case "loginUser":
        return jsonOutput_(loginUser_(body));
      case "requestPasswordReset":
        return jsonOutput_(requestPasswordReset_(body));
      case "resetPassword":
        return jsonOutput_(resetPassword_(body));
      case "createGoal":
        return jsonOutput_(createGoal_(body));
      case "updateGoal":
        return jsonOutput_(updateGoal_(body));
      case "createDailyLog":
        return jsonOutput_(createDailyLog_(body));
      case "updateProfile":
        return jsonOutput_(updateProfile_(body));
      case "uploadProfileAvatar":
        return jsonOutput_(uploadProfileAvatar_(body));
      case "createAppointment":
        return jsonOutput_(createAppointment_(body));
      case "upsertMonthlyGoal":
        return jsonOutput_(upsertMonthlyGoal_(body));
      default:
        return jsonOutput_({
          success: false,
          data: null,
          error: `Unknown POST action: ${action}`,
        });
    }
  } catch (error) {
    return jsonOutput_(errorResponse_(error));
  }
}

/* =========================
   USERS
========================= */

function getUser_(id) {
  if (!id) {
    throw new Error("Missing user id");
  }

  const rows = getAllObjects_(SHEET_NAMES.users);
  const user = rows.find((row) => row.id === id) || null;

  return {
    success: true,
    data: user,
  };
}

function requestPasswordReset_(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error("Missing email");
  }

  ensureSheetWithHeaders_(
    SHEET_NAMES.passwordResetTokens,
    PASSWORD_RESET_TOKEN_HEADERS
  );

  const users = getAllObjects_(SHEET_NAMES.users);
  const user = users.find(function (row) {
    return (
      String(row.email || "").trim().toLowerCase() === email &&
      String(row.status || "active") === "active"
    );
  });

  if (!user) {
    return {
      success: true,
      data: {
        message:
          "If the email exists, a reset link has been sent successfully.",
      },
    };
  }

  const tokenSheet = getSheet_(SHEET_NAMES.passwordResetTokens);
  const resetRows = getAllObjects_(SHEET_NAMES.passwordResetTokens);
  const now = nowIso_();

  resetRows.forEach(function (row, index) {
    if (
      String(row.user_id || "") === String(user.id || "") &&
      !String(row.used_at || "")
    ) {
      updateRowByIndex_(tokenSheet, index + 2, {
        ...row,
        used_at: now,
        updated_at: now,
      });
    }
  });

  const token = generatePasswordResetToken_();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const resetLink =
    resolveAppBaseUrl_(payload) +
    "/reset-password?token=" +
    encodeURIComponent(token);

  appendObject_(SHEET_NAMES.passwordResetTokens, {
    id: generateId_("pwreset"),
    user_id: user.id,
    email: email,
    token: token,
    expires_at: expiresAt,
    used_at: "",
    created_at: now,
    updated_at: now,
  });

  MailApp.sendEmail({
    to: email,
    subject: "Reset your Happy Balance password",
    htmlBody: buildPasswordResetEmailHtml_(user.full_name, resetLink),
    name: "Happy Balance",
  });

  return {
    success: true,
    data: {
      message: "Password reset email has been sent.",
    },
  };
}

function validatePasswordResetToken_(token) {
  const resetRow = getValidPasswordResetRow_(token);
  if (!resetRow) {
    return {
      success: true,
      data: {
        valid: false,
        error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
      },
    };
  }

  return {
    success: true,
    data: {
      valid: true,
      email: maskEmail_(String(resetRow.email || "")),
    },
  };
}

function resetPassword_(payload) {
  const token = String(payload.token || "").trim();
  const newPassword = String(payload.new_password || "");

  if (!token) {
    throw new Error("Missing token");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const resetRow = getValidPasswordResetRow_(token);
  if (!resetRow) {
    throw new Error("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
  }

  const usersSheet = getSheet_(SHEET_NAMES.users);
  const users = getAllObjects_(SHEET_NAMES.users);
  const userIndex = users.findIndex(function (row) {
    return String(row.id || "") === String(resetRow.user_id || "");
  });

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const now = nowIso_();
  updateRowByIndex_(usersSheet, userIndex + 2, {
    ...users[userIndex],
    password_hash: hashPassword(newPassword),
    updated_at: now,
  });

  const resetSheet = getSheet_(SHEET_NAMES.passwordResetTokens);
  const resetRows = getAllObjects_(SHEET_NAMES.passwordResetTokens);
  const resetIndex = resetRows.findIndex(function (row) {
    return String(row.id || "") === String(resetRow.id || "");
  });

  if (resetIndex !== -1) {
    updateRowByIndex_(resetSheet, resetIndex + 2, {
      ...resetRows[resetIndex],
      used_at: now,
      updated_at: now,
    });
  }

  return {
    success: true,
    data: {
      message: "Password has been reset successfully.",
    },
  };
}

function updateProfile_(payload) {
  const id = payload.id;
  if (!id) {
    throw new Error("Missing user id");
  }

  const sheet = getSheet_(SHEET_NAMES.users);
  const rows = getAllObjects_(SHEET_NAMES.users);
  const index = rows.findIndex((row) => row.id === id);

  if (index === -1) {
    throw new Error(`User not found: ${id}`);
  }

  const sleepGoalMinutes =
    payload.sleep_goal_minutes !== undefined &&
    payload.sleep_goal_minutes !== null &&
    payload.sleep_goal_minutes !== ""
      ? Number(payload.sleep_goal_minutes)
      : rows[index].sleep_goal_minutes;

  const waterGoalMl =
    payload.water_goal_ml !== undefined &&
    payload.water_goal_ml !== null &&
    payload.water_goal_ml !== ""
      ? Number(payload.water_goal_ml)
      : rows[index].water_goal_ml;

  const updated = {
    ...rows[index],
    full_name: payload.full_name || rows[index].full_name,
    email: payload.email || rows[index].email,
    phone: payload.phone || rows[index].phone,
    avatar_url: payload.avatar_url || rows[index].avatar_url || "",
    sleep_goal_minutes: sleepGoalMinutes,
    water_goal_ml: waterGoalMl,
    updated_at: nowIso_(),
  };

  updateRowByIndex_(sheet, index + 2, updated);

  return {
    success: true,
    data: updated,
  };
}

function uploadProfileAvatar_(payload) {
  const id = String(payload.id || "").trim();
  const imageBase64 = String(payload.image_base64 || "").trim();
  const fileName = String(payload.file_name || "avatar.jpg");
  const mimeType = String(payload.mime_type || "image/jpeg");
  const allowedMimeTypes = {
    "image/jpeg": true,
    "image/png": true,
    "image/webp": true,
  };
  const maxAvatarBytes = 2 * 1024 * 1024;

  if (!id) {
    throw new Error("Missing user id");
  }

  if (!imageBase64) {
    throw new Error("Missing image_base64");
  }

  if (!allowedMimeTypes[mimeType]) {
    throw new Error("Unsupported avatar file type");
  }

  const sheet = getSheet_(SHEET_NAMES.users);
  const headers = getHeaders_(sheet);
  const avatarColumnIndex = headers.indexOf("avatar_url");
  if (avatarColumnIndex === -1) {
    throw new Error("Missing avatar_url column in users sheet");
  }

  const rows = getAllObjects_(SHEET_NAMES.users);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) {
    throw new Error(`User not found: ${id}`);
  }

  const parsedImage = parseImagePayload_(imageBase64, mimeType);
  if (!allowedMimeTypes[parsedImage.mimeType]) {
    throw new Error("Unsupported avatar file type");
  }

  const decodedBytes = Utilities.base64Decode(parsedImage.base64);
  if (decodedBytes.length > maxAvatarBytes) {
    throw new Error("Avatar file is too large");
  }

  const blob = Utilities.newBlob(
    decodedBytes,
    parsedImage.mimeType,
    buildAvatarFileName_(id, fileName, parsedImage.mimeType)
  );

  let folder;
  let file;
  try {
    folder = getAvatarFolder_();
    file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    throw new Error(
      "Avatar upload permission denied. Re-deploy Apps Script as 'Execute as: Me' and authorize Drive access."
    );
  }
  const avatarUrl = `https://drive.google.com/uc?export=view&id=${file.getId()}`;

  const updated = {
    ...rows[index],
    avatar_url: avatarUrl,
    updated_at: nowIso_(),
  };

  updateRowByIndex_(sheet, index + 2, updated);

  return {
    success: true,
    data: {
      ...updated,
      password_hash: undefined,
    },
  };
}

/* =========================
   GOALS
========================= */

function listGoals_(userId) {
  return withTiming_("listGoals_", function () {
    if (!userId) {
      throw new Error("Missing userId");
    }

    const cacheKey = buildReadCacheKey_("goals", {
      userId: userId,
      v: getUserDataVersion_(userId),
    });
    const cachedRows = getCachedObject_(cacheKey);
    if (cachedRows) {
      return {
        success: true,
        data: cachedRows,
      };
    }

    const rows = getAllObjects_(SHEET_NAMES.goals).filter(
      (row) => row.user_id === userId
    );

    setCachedObject_(cacheKey, rows, 120);

    return {
      success: true,
      data: rows,
    };
  });
}

function createGoal_(payload) {
  return withTiming_("createGoal_", function () {
    const requiredFields = [
      "user_id",
      "category",
      "activity",
      "current_value",
      "target_value",
      "status",
    ];
    validateRequired_(payload, requiredFields);

    const newGoal = {
      id: generateId_("goal"),
      user_id: payload.user_id,
      category: payload.category,
      activity: payload.activity,
      current_value: Number(payload.current_value),
      target_value: Number(payload.target_value),
      status: payload.status,
      created_at: nowIso_(),
      updated_at: nowIso_(),
    };

    appendObject_(SHEET_NAMES.goals, newGoal);
    bumpUserDataVersion_(newGoal.user_id);

    return {
      success: true,
      data: newGoal,
    };
  });
}

function updateGoal_(payload) {
  return withTiming_("updateGoal_", function () {
    const id = payload.id;
    if (!id) {
      throw new Error("Missing goal id");
    }

    const sheet = getSheet_(SHEET_NAMES.goals);
    const rows = getAllObjects_(SHEET_NAMES.goals);
    const index = rows.findIndex((row) => row.id === id);

    if (index === -1) {
      throw new Error(`Goal not found: ${id}`);
    }

    const updated = {
      ...rows[index],
      category: payload.category || rows[index].category,
      activity: payload.activity || rows[index].activity,
      current_value:
        payload.current_value !== undefined
          ? Number(payload.current_value)
          : Number(rows[index].current_value),
      target_value:
        payload.target_value !== undefined
          ? Number(payload.target_value)
          : Number(rows[index].target_value),
      status: payload.status || rows[index].status,
      updated_at: nowIso_(),
    };

    updateRowByIndex_(sheet, index + 2, updated);
    bumpUserDataVersion_(updated.user_id);

    return {
      success: true,
      data: updated,
    };
  });
}

/* =========================
   DAILY LOGS
========================= */

function listDailyLogs_(userId, filters) {
  return withTiming_("listDailyLogs_", function () {
    if (!userId) {
      throw new Error("Missing userId");
    }

    const normalized = normalizeLogFilters_(filters);
    const cacheKey = buildReadCacheKey_("daily_logs", {
      userId: userId,
      v: getUserDataVersion_(userId),
      from: normalized.from,
      to: normalized.to,
      limit: normalized.limit,
      entry_type: normalized.entry_type,
      category: normalized.category,
      activity: normalized.activity,
      task: normalized.task,
    });
    const cachedRows = getCachedObject_(cacheKey);
    if (cachedRows) {
      return {
        success: true,
        data: cachedRows,
      };
    }

    const rows = getAllObjects_(SHEET_NAMES.dailyLogs)
      .filter((row) => matchesLogFilters_(row, userId, normalized))
      .sort(compareLogRowsDesc_)
      .slice(0, normalized.limit > 0 ? normalized.limit : undefined);

    setCachedObject_(cacheKey, rows, 90);

    return {
      success: true,
      data: rows,
    };
  });
}

function listRestTaskLogs_(userId, task, limitParam, fromParam, toParam) {
  return listStructuredTaskLogs_("listRestTaskLogs_", TASK_LOG_SPECS.rest, userId, {
    entry_type: TASK_LOG_SPECS.rest.entry_type,
    category: TASK_LOG_SPECS.rest.category,
    activity: TASK_LOG_SPECS.rest.activity,
    task: task,
    limit: limitParam,
    from: fromParam,
    to: toParam,
  });
}

function listMentalTaskLogs_(userId, activity, task, limitParam, fromParam, toParam) {
  return listStructuredTaskLogs_("listMentalTaskLogs_", TASK_LOG_SPECS.mental, userId, {
    entry_type: TASK_LOG_SPECS.mental.entry_type,
    category: TASK_LOG_SPECS.mental.category,
    activity: activity,
    task: task,
    limit: limitParam,
    from: fromParam,
    to: toParam,
  });
}

function listSocialTaskLogs_(userId, activity, task, limitParam, fromParam, toParam) {
  return listStructuredTaskLogs_("listSocialTaskLogs_", TASK_LOG_SPECS.social, userId, {
    entry_type: TASK_LOG_SPECS.social.entry_type,
    category: TASK_LOG_SPECS.social.category,
    activity: activity,
    task: task,
    limit: limitParam,
    from: fromParam,
    to: toParam,
  });
}

function listBalanceTaskLogs_(userId, activity, task, limitParam, fromParam, toParam) {
  return listStructuredTaskLogs_("listBalanceTaskLogs_", TASK_LOG_SPECS.balance, userId, {
    entry_type: TASK_LOG_SPECS.balance.entry_type,
    category: TASK_LOG_SPECS.balance.category,
    activity: activity,
    task: task,
    limit: limitParam,
    from: fromParam,
    to: toParam,
  });
}

function listStructuredTaskLogs_(label, spec, userId, filters) {
  return withTiming_(label, function () {
    if (!userId) {
      throw new Error("Missing userId");
    }

    const normalized = normalizeLogFilters_(filters);
    const cacheKey = buildReadCacheKey_(spec.sheetName, {
      userId: userId,
      v: getUserDataVersion_(userId),
      activity: normalized.activity,
      task: normalized.task,
      from: normalized.from,
      to: normalized.to,
      limit: normalized.limit,
    });
    const cachedRows = getCachedObject_(cacheKey);
    if (cachedRows) {
      return {
        success: true,
        data: cachedRows,
      };
    }

    const structuredRows = getAllObjectsIfSheetExists_(spec.sheetName);
    const sourceRows =
      structuredRows.length > 0
        ? structuredRows
        : getAllObjects_(SHEET_NAMES.dailyLogs);

    const rows = sourceRows
      .filter((row) => matchesLogFilters_(row, userId, normalized))
      .sort(compareLogRowsDesc_)
      .slice(0, normalized.limit > 0 ? normalized.limit : undefined);

    setCachedObject_(cacheKey, rows, 90);

    return {
      success: true,
      data: rows,
    };
  });
}

function createDailyLog_(payload) {
  return withTiming_("createDailyLog_", function () {
    const requiredFields = [
      "user_id",
      "log_date",
      "mood",
      "energy",
      "stress",
      "note",
    ];
    validateRequired_(payload, requiredFields);

    const newLog = {
      id: generateId_("log"),
      user_id: payload.user_id,
      log_date: payload.log_date,
      mood: payload.mood,
      energy: Number(payload.energy),
      stress: Number(payload.stress),
      note: payload.note,
      created_at: nowIso_(),
      updated_at: nowIso_(),
    };

    appendObject_(SHEET_NAMES.dailyLogs, newLog);
    appendStructuredTaskLogIfNeeded_(newLog);
    bumpUserDataVersion_(newLog.user_id);

    return {
      success: true,
      data: newLog,
    };
  });
}

/* =========================
   APPOINTMENTS
========================= */

function listAppointments_(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const rows = getAllObjects_(SHEET_NAMES.appointments)
    .filter((row) => row.user_id === userId)
    .sort((a, b) =>
      String(a.appointment_date).localeCompare(String(b.appointment_date))
    );

  return {
    success: true,
    data: rows,
  };
}

function createAppointment_(payload) {
  const requiredFields = ["user_id", "appointment_date", "type", "status", "note"];
  validateRequired_(payload, requiredFields);

  const newAppointment = {
    id: generateId_("appt"),
    user_id: payload.user_id,
    appointment_date: payload.appointment_date,
    type: payload.type,
    status: payload.status,
    note: payload.note,
    created_at: nowIso_(),
    updated_at: nowIso_(),
  };

  appendObject_(SHEET_NAMES.appointments, newAppointment);

  return {
    success: true,
    data: newAppointment,
  };
}

function listMonthlyGoals_(userId, monthKey) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const normalizedMonthKey = monthKey ? String(monthKey).trim() : "";

  const rows = getAllObjects_(SHEET_NAMES.monthlyGoals)
    .filter((row) => {
      if (row.user_id !== userId) return false;
      if (!normalizedMonthKey) return true;
      return String(row.month_key) === normalizedMonthKey;
    })
    .sort((a, b) => String(b.month_key).localeCompare(String(a.month_key)));

  return {
    success: true,
    data: rows,
  };
}

function upsertMonthlyGoal_(payload) {
  const userId = String(payload.user_id || "").trim();
  const monthKey = String(payload.month_key || "").trim();
  const goalText = String(payload.goal_text || "").trim();

  if (!userId) {
    throw new Error("Missing user_id");
  }

  if (!monthKey) {
    throw new Error("Missing month_key");
  }

  const sheet = getSheet_(SHEET_NAMES.monthlyGoals);
  const rows = getAllObjects_(SHEET_NAMES.monthlyGoals);
  const index = rows.findIndex(
    (row) => row.user_id === userId && String(row.month_key) === monthKey
  );

  if (index === -1) {
    const newGoal = {
      id: generateId_("mgoal"),
      user_id: userId,
      month_key: monthKey,
      goal_text: goalText,
      created_at: nowIso_(),
      updated_at: nowIso_(),
    };

    appendObject_(SHEET_NAMES.monthlyGoals, newGoal);

    return {
      success: true,
      data: newGoal,
    };
  }

  const updated = {
    ...rows[index],
    goal_text: goalText,
    updated_at: nowIso_(),
  };

  updateRowByIndex_(sheet, index + 2, updated);

  return {
    success: true,
    data: updated,
  };
}

/* =========================
   ARTICLES
========================= */

function listArticles_(limitParam) {
  const limit = Number(limitParam) > 0 ? Number(limitParam) : 5;

  const rows = getAllObjects_(SHEET_NAMES.articles)
    .sort((a, b) => {
      const aDate = String(a.published_at || a.created_at || "");
      const bDate = String(b.published_at || b.created_at || "");
      return bDate.localeCompare(aDate);
    })
    .slice(0, limit);

  return {
    success: true,
    data: rows,
  };
}

/* =========================
   HELPERS
========================= */

function withTiming_(label, fn) {
  const startedAt = new Date().getTime();
  try {
    return fn();
  } finally {
    const elapsedMs = new Date().getTime() - startedAt;
    console.log(`[perf] ${label} ${elapsedMs}ms`);
  }
}

function normalizeLogFilters_(filters) {
  const source = filters || {};
  const limitNumber = Number(source.limit);

  return {
    from: source.from ? String(source.from).trim() : "",
    to: source.to ? String(source.to).trim() : "",
    limit:
      Number.isFinite(limitNumber) && limitNumber > 0
        ? Math.floor(limitNumber)
        : 0,
    entry_type: source.entry_type ? String(source.entry_type).trim() : "",
    category: source.category ? String(source.category).trim() : "",
    activity: source.activity ? String(source.activity).trim() : "",
    task: source.task ? String(source.task).trim() : "",
  };
}

function matchesLogFilters_(row, userId, filters) {
  if (row.user_id !== userId) return false;

  const logDate = String(row.log_date || "");
  if (filters.from && logDate < filters.from) return false;
  if (filters.to && logDate > filters.to) return false;

  const requiresNoteParse =
    !!filters.entry_type || !!filters.category || !!filters.activity || !!filters.task;
  if (!requiresNoteParse) return true;

  const parsed = getStructuredLogFilterFields_(row);
  if (!parsed) return false;

  if (filters.entry_type && parsed.entry_type !== filters.entry_type) return false;
  if (filters.category && parsed.category !== filters.category) return false;
  if (filters.activity && parsed.activity !== filters.activity) return false;
  if (filters.task && parsed.task !== filters.task) return false;

  return true;
}

function getStructuredLogFilterFields_(row) {
  if (!row) return null;

  const hasStructuredFields =
    row.entry_type !== undefined ||
    row.category !== undefined ||
    row.activity !== undefined ||
    row.task !== undefined;

  if (hasStructuredFields) {
    return {
      entry_type: row.entry_type ? String(row.entry_type) : "",
      category: row.category ? String(row.category) : "",
      activity: row.activity ? String(row.activity) : "",
      task: row.task ? String(row.task) : "",
    };
  }

  return parseTaskNoteForFilter_(row.note);
}

function parseTaskNoteForFilter_(note) {
  if (!note) return null;

  try {
    const parsed = JSON.parse(String(note));
    return {
      entry_type: parsed.entry_type ? String(parsed.entry_type) : "",
      category: parsed.category ? String(parsed.category) : "",
      activity: parsed.activity ? String(parsed.activity) : "",
      task: parsed.task ? String(parsed.task) : "",
    };
  } catch (_error) {
    return null;
  }
}

function compareLogRowsDesc_(a, b) {
  const dateCompare = String(b.log_date || "").localeCompare(String(a.log_date || ""));
  if (dateCompare !== 0) return dateCompare;

  const bTs = getLogTimestampMs_(b);
  const aTs = getLogTimestampMs_(a);
  return bTs - aTs;
}

function getLogTimestampMs_(log) {
  const updatedAt = log && log.updated_at ? new Date(log.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const createdAt = log && log.created_at ? new Date(log.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  const logDate = log && log.log_date ? new Date(log.log_date).getTime() : Number.NaN;
  if (Number.isFinite(logDate)) return logDate;

  return 0;
}

function getReadCache_() {
  return CacheService.getScriptCache();
}

function buildReadCacheKey_(prefix, params) {
  const normalized = Object.keys(params || {})
    .sort()
    .map((key) => `${key}:${String(params[key] || "")}`)
    .join("|");

  return `rb:${prefix}:${normalized}`.slice(0, 240);
}

function getCachedObject_(cacheKey) {
  if (!cacheKey) return null;

  const cached = getReadCache_().get(cacheKey);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch (_error) {
    return null;
  }
}

function setCachedObject_(cacheKey, value, ttlSeconds) {
  if (!cacheKey) return;
  getReadCache_().put(cacheKey, JSON.stringify(value), ttlSeconds || 60);
}

function getUserDataVersion_(userId) {
  if (!userId) return "0";
  const props = PropertiesService.getScriptProperties();
  const key = `user_data_version_${userId}`;
  return props.getProperty(key) || "0";
}

function bumpUserDataVersion_(userId) {
  if (!userId) return;

  const props = PropertiesService.getScriptProperties();
  const key = `user_data_version_${userId}`;
  const current = Number(props.getProperty(key) || "0");
  props.setProperty(key, String(current + 1));
}

function getParam_(e, key) {
  return e && e.parameter ? e.parameter[key] : null;
}

function parseBody_(e) {
  if (!e || !e.parameter) {
    throw new Error("Missing POST body");
  }

  return e.parameter;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function errorResponse_(error) {
  return {
    success: false,
    data: null,
    error: error && error.message ? error.message : String(error),
  };
}

function validateRequired_(payload, fields) {
  fields.forEach((field) => {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === ""
    ) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
}

function nowIso_() {
  return new Date().toISOString();
}

function generateId_(prefix) {
  return `${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
}

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  return sheet;
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    throw new Error(`Sheet has no headers: ${sheet.getName()}`);
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function getAllObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  return values.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function getAllObjectsIfSheetExists_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    return [];
  }

  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

  return values.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const row = headers.map((header) =>
    obj[header] !== undefined ? obj[header] : ""
  );
  sheet.appendRow(row);
}

function appendObjects_(sheetName, objects) {
  if (!objects || objects.length === 0) return;

  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const rows = objects.map((obj) =>
    headers.map((header) => (obj[header] !== undefined ? obj[header] : ""))
  );

  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length)
    .setValues(rows);
}

function updateRowByIndex_(sheet, rowIndex, obj) {
  const headers = getHeaders_(sheet);
  const row = headers.map((header) =>
    obj[header] !== undefined ? obj[header] : ""
  );
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
}

function appendStructuredTaskLogIfNeeded_(dailyLog) {
  const spec = getTaskLogSpecByDailyLog_(dailyLog);
  if (!spec) return;

  const structured = buildStructuredTaskLogRow_(dailyLog, spec);
  if (!structured) return;

  ensureSheetWithHeaders_(spec.sheetName, STRUCTURED_TASK_LOG_HEADERS);
  appendObject_(spec.sheetName, structured);
}

function getTaskLogSpecByDailyLog_(dailyLog) {
  const parsed = parseTaskNotePayload_(dailyLog && dailyLog.note);
  return getTaskLogSpecByFields_(
    parsed && parsed.entry_type,
    parsed && parsed.category
  );
}

function getTaskLogSpecByFields_(entryType, category) {
  const specs = Object.keys(TASK_LOG_SPECS).map(function (key) {
    return TASK_LOG_SPECS[key];
  });

  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index];
    if (spec.entry_type === entryType && spec.category === category) {
      return spec;
    }
  }

  return null;
}

function buildStructuredTaskLogRow_(dailyLog, spec) {
  const parsed = parseTaskNotePayload_(dailyLog && dailyLog.note);
  if (!parsed) return null;

  if (
    parsed.entry_type !== spec.entry_type ||
    parsed.category !== spec.category ||
    (spec.activity && parsed.activity !== spec.activity) ||
    !parsed.activity ||
    !parsed.task
  ) {
    return null;
  }

  const payload = parsed.payload || {};
  const score = Number(parsed.score);
  const fallbackAchieved = Number.isFinite(score) ? score > 0 : false;
  const achieved = getBooleanValue_(payload.achieved, fallbackAchieved);
  const point = Number(payload.point);

  return {
    id: generateId_(spec.idPrefix),
    daily_log_id: dailyLog.id,
    user_id: dailyLog.user_id,
    log_date: dailyLog.log_date,
    entry_type: parsed.entry_type,
    category: parsed.category,
    activity: parsed.activity,
    task: parsed.task,
    score: Number.isFinite(score) ? score : 0,
    point: Number.isFinite(point) ? point : achieved ? 1 : 0,
    achieved: achieved,
    mood: dailyLog.mood,
    energy: Number(dailyLog.energy),
    stress: Number(dailyLog.stress),
    note: dailyLog.note,
    created_at: dailyLog.created_at,
    updated_at: dailyLog.updated_at,
  };
}

function parseTaskNotePayload_(note) {
  if (!note) return null;

  try {
    const parsed = JSON.parse(String(note));
    return {
      entry_type: parsed.entry_type ? String(parsed.entry_type) : "",
      category: parsed.category ? String(parsed.category) : "",
      activity: parsed.activity ? String(parsed.activity) : "",
      task: parsed.task ? String(parsed.task) : "",
      score: parsed.score,
      payload: parsed.payload || {},
    };
  } catch (_error) {
    return null;
  }
}

function getBooleanValue_(value, fallback) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function ensureSheetWithHeaders_(sheetName, headers) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0 && sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }

  const currentHeaders = getHeaders_(sheet);
  const sameHeaders =
    currentHeaders.length === headers.length &&
    currentHeaders.every(function (header, index) {
      return header === headers[index];
    });

  if (!sameHeaders) {
    throw new Error(`Unexpected headers in sheet: ${sheetName}`);
  }

  return sheet;
}

function backfillRestTaskLogs_() {
  return backfillStructuredTaskLogs_("backfillRestTaskLogs_", TASK_LOG_SPECS.rest);
}

function backfillMentalTaskLogs_() {
  return backfillStructuredTaskLogs_("backfillMentalTaskLogs_", TASK_LOG_SPECS.mental);
}

function backfillSocialTaskLogs_() {
  return backfillStructuredTaskLogs_("backfillSocialTaskLogs_", TASK_LOG_SPECS.social);
}

function backfillBalanceTaskLogs_() {
  return backfillStructuredTaskLogs_("backfillBalanceTaskLogs_", TASK_LOG_SPECS.balance);
}

function backfillAllStructuredTaskLogs_() {
  return {
    success: true,
    data: {
      rest: backfillStructuredTaskLogs_("backfillRestTaskLogs_", TASK_LOG_SPECS.rest).data,
      mental: backfillStructuredTaskLogs_("backfillMentalTaskLogs_", TASK_LOG_SPECS.mental).data,
      social: backfillStructuredTaskLogs_("backfillSocialTaskLogs_", TASK_LOG_SPECS.social).data,
      balance: backfillStructuredTaskLogs_("backfillBalanceTaskLogs_", TASK_LOG_SPECS.balance).data,
    },
  };
}

function backfillStructuredTaskLogs_(label, spec) {
  return withTiming_(label, function () {
    ensureSheetWithHeaders_(spec.sheetName, STRUCTURED_TASK_LOG_HEADERS);

    const existingRows = getAllObjectsIfSheetExists_(spec.sheetName);
    const existingDailyLogIds = {};
    existingRows.forEach(function (row) {
      if (row.daily_log_id) {
        existingDailyLogIds[String(row.daily_log_id)] = true;
      }
    });

    const sourceLogs = getAllObjects_(SHEET_NAMES.dailyLogs);
    const rowsToInsert = sourceLogs
      .map(function (row) {
        return buildStructuredTaskLogRow_(row, spec);
      })
      .filter(function (row) {
        return row && !existingDailyLogIds[String(row.daily_log_id)];
      });

    appendObjects_(spec.sheetName, rowsToInsert);

    return {
      success: true,
      data: {
        inserted: rowsToInsert.length,
        existing: existingRows.length,
        sheet: spec.sheetName,
      },
    };
  });
}

function testVersion_() {
  return {
    success: true,
    data: {
      version: APP_SCRIPT_VERSION,
      deployed_at: APP_SCRIPT_DEPLOYED_AT,
      server_time: new Date().toISOString(),
    },
  };
}

function hashPassword(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, "0")).join("");
}

function registerUser_(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("users");
  if (!sh) return { success: false, data: null, error: "users sheet not found" };

  const email = String(params.email || "").trim().toLowerCase();
  const fullName = String(params.full_name || "").trim();
  const phone = String(params.phone || "").trim();
  const password = String(params.password || "");
  const authProvider = String(params.auth_provider || "password");

  if (!email || !fullName || !phone || !password) {
    return { success: false, data: null, error: "Missing required fields" };
  }

  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const emailIdx = headers.indexOf("email");

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][emailIdx] || "").toLowerCase() === email) {
      return { success: false, data: null, error: "Email already exists" };
    }
  }

  const now = new Date().toISOString();
  const id = "user-" + Date.now();

  sh.appendRow([
    id,
    email,
    fullName,
    phone,
    hashPassword(password),
    authProvider,
    "",
    "active",
    now,
    now
  ]);

  return {
    success: true,
    data: { id, email, full_name: fullName, phone, auth_provider: authProvider, status: "active", created_at: now, updated_at: now }
  };
}

function parseImagePayload_(imageBase64, fallbackMimeType) {
  const value = String(imageBase64 || "").trim();
  const matched = value.match(/^data:([^;]+);base64,(.+)$/);

  if (matched) {
    return {
      mimeType: matched[1],
      base64: matched[2],
    };
  }

  return {
    mimeType: fallbackMimeType || "image/jpeg",
    base64: value,
  };
}

function buildAvatarFileName_(userId, originalName, mimeType) {
  const extByMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extByMime[mimeType] || "jpg";
  const safeName = String(originalName || "avatar")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.[^.]+$/, "");

  return `avatar_${userId}_${safeName}_${new Date().getTime()}.${ext}`;
}

function getAvatarFolder_() {
  const folderId = PropertiesService.getScriptProperties().getProperty(
    "PROFILE_AVATAR_FOLDER_ID"
  );
  if (!folderId) {
    return DriveApp.getRootFolder();
  }

  return DriveApp.getFolderById(folderId);
}

function generatePasswordResetToken_() {
  return (
    Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "")
  );
}

function resolveAppBaseUrl_(payload) {
  const bodyBaseUrl = String(payload.app_base_url || "").trim();
  if (/^https?:\/\//i.test(bodyBaseUrl)) {
    return bodyBaseUrl.replace(/\/+$/, "");
  }

  const propertyBaseUrl = String(
    PropertiesService.getScriptProperties().getProperty("APP_BASE_URL") || ""
  ).trim();
  if (/^https?:\/\//i.test(propertyBaseUrl)) {
    return propertyBaseUrl.replace(/\/+$/, "");
  }

  return "http://localhost:5173";
}

function buildPasswordResetEmailHtml_(fullName, resetLink) {
  const safeName = escapeHtml_(String(fullName || "คุณ"));
  const safeLink = escapeHtml_(resetLink);

  return (
    '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#243447;">' +
    `<p>สวัสดี ${safeName},</p>` +
    "<p>เราได้รับคำขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชี Happy Balance ของคุณ</p>" +
    `<p><a href="${safeLink}" style="display:inline-block;padding:12px 18px;background:#d88d80;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;">ตั้งรหัสผ่านใหม่</a></p>` +
    "<p>ลิงก์นี้จะหมดอายุภายใน 30 นาที หากคุณไม่ได้เป็นผู้ขอรีเซ็ต คุณสามารถละเว้นอีเมลฉบับนี้ได้</p>" +
    `<p>หากปุ่มใช้งานไม่ได้ ให้คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>${safeLink}</p>` +
    "<p>ด้วยความปรารถนาดี<br>Happy Balance</p>" +
    "</div>"
  );
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getValidPasswordResetRow_(token) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) return null;

  ensureSheetWithHeaders_(
    SHEET_NAMES.passwordResetTokens,
    PASSWORD_RESET_TOKEN_HEADERS
  );

  const rows = getAllObjects_(SHEET_NAMES.passwordResetTokens);
  const nowMs = Date.now();

  for (var index = 0; index < rows.length; index += 1) {
    var row = rows[index];
    if (String(row.token || "") !== normalizedToken) continue;
    if (String(row.used_at || "")) return null;

    var expiresAtMs = new Date(String(row.expires_at || "")).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs < nowMs) {
      return null;
    }

    return row;
  }

  return null;
}

function maskEmail_(email) {
  const normalized = String(email || "").trim();
  if (!normalized || normalized.indexOf("@") === -1) {
    return "";
  }

  const parts = normalized.split("@");
  const name = parts[0];
  const domain = parts.slice(1).join("@");
  if (name.length <= 2) {
    return name[0] + "***@" + domain;
  }

  return name[0] + "***" + name[name.length - 1] + "@" + domain;
}

function loginUser_(params) {
  const email = String(params.email || "").trim().toLowerCase();
  const password = String(params.password || "");

  if (!email || !password) {
    return { success: false, data: null, error: "Missing email or password" };
  }

  const rows = getAllObjects_(SHEET_NAMES.users);
  const user = rows.find((row) => String(row.email || "").toLowerCase() === email);

  if (!user) {
    return { success: false, data: null, error: "Invalid email or password" };
  }

  const hashed = hashPassword(password);
  if (String(user.password_hash || "") !== hashed) {
    return { success: false, data: null, error: "Invalid email or password" };
  }

  if (String(user.status || "active") !== "active") {
    return { success: false, data: null, error: "Account is not active" };
  }

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      auth_provider: user.auth_provider || "password",
      status: user.status || "active",
    },
  };
}
