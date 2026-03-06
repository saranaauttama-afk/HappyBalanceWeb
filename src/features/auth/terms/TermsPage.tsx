import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";
import { text } from "../../../i18n/en";

const TERMS_CONTENT = `
Happy Balance is designed as a wellness-focused application experience.
This MVP version is for guided personal wellbeing activities, self-tracking,
and a calm mobile-first experience.

Users should provide accurate information and use the platform responsibly.
`;

const PRIVACY_CONTENT = `
Your personal information may be stored for app functionality.
In the MVP stage, data may be kept in Google Sheets through a lightweight backend.

Do not store sensitive production data until security hardening is complete.
`;

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const content = useMemo(() => {
    return activeTab === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT;
  }, [activeTab]);

  return (
    <MobileShell>
      <AppHeader title={text.terms} showBack />

      <div className="space-y-4 px-5 py-6">
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeTab === "terms"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {text.termsTab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeTab === "privacy"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {text.privacyTab}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="max-h-[320px] overflow-y-auto whitespace-pre-line text-sm leading-6 text-slate-600">
            {content}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm text-slate-700">{text.accept}</span>
        </label>

        <button
          type="button"
          disabled={!accepted}
          onClick={() => navigate("/register")}
          className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
            accepted ? "bg-slate-900" : "bg-slate-300"
          }`}
        >
          {text.continue}
        </button>
      </div>
    </MobileShell>
  );
}