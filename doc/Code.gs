const SHEET_NAMES = {
  users: "users",
  goals: "goals",
  dailyLogs: "daily_logs",
  appointments: "appointments",
  articles: "articles",
};

function doGet(e) {
  try {
    const action = getParam_(e, "action");

    switch (action) {
      case "testVersion":
        return jsonOutput_(testVersion_());
      case "getUser":
        return jsonOutput_(getUser_(getParam_(e, "id")));
      case "listGoals":
        return jsonOutput_(listGoals_(getParam_(e, "userId")));
      case "listDailyLogs":
        return jsonOutput_(listDailyLogs_(getParam_(e, "userId")));
      case "listAppointments":
        return jsonOutput_(listAppointments_(getParam_(e, "userId")));
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

  if (!id) {
    throw new Error("Missing user id");
  }

  if (!imageBase64) {
    throw new Error("Missing image_base64");
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
  const blob = Utilities.newBlob(
    Utilities.base64Decode(parsedImage.base64),
    parsedImage.mimeType,
    buildAvatarFileName_(id, fileName, parsedImage.mimeType)
  );

  const folder = getAvatarFolder_();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
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
  if (!userId) {
    throw new Error("Missing userId");
  }

  const rows = getAllObjects_(SHEET_NAMES.goals).filter(
    (row) => row.user_id === userId
  );

  return {
    success: true,
    data: rows,
  };
}

function createGoal_(payload) {
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

  return {
    success: true,
    data: newGoal,
  };
}

function updateGoal_(payload) {
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

  return {
    success: true,
    data: updated,
  };
}

/* =========================
   DAILY LOGS
========================= */

function listDailyLogs_(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const rows = getAllObjects_(SHEET_NAMES.dailyLogs)
    .filter((row) => row.user_id === userId)
    .sort((a, b) => String(b.log_date).localeCompare(String(a.log_date)));

  return {
    success: true,
    data: rows,
  };
}

function createDailyLog_(payload) {
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

  return {
    success: true,
    data: newLog,
  };
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

function appendObject_(sheetName, obj) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const row = headers.map((header) =>
    obj[header] !== undefined ? obj[header] : ""
  );
  sheet.appendRow(row);
}

function updateRowByIndex_(sheet, rowIndex, obj) {
  const headers = getHeaders_(sheet);
  const row = headers.map((header) =>
    obj[header] !== undefined ? obj[header] : ""
  );
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
}

function testVersion_() {
  return {
    success: true,
    data: {
      version: "GAS-NEW-FORM-PARAMS",
      timestamp: new Date().toISOString(),
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
