import { Link } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";
import { text } from "../../../i18n/en";

export default function WelcomePage() {
  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col justify-center px-6 py-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            {text.appName}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {text.welcomeTitle}
          </h1>

          <p className="text-sm leading-6 text-slate-500">
            {text.welcomeSubtitle}
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <Link
            to="/login"
            className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-medium text-white"
          >
            {text.login}
          </Link>

          <Link
            to="/terms"
            className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-center font-medium text-slate-700"
          >
            {text.createAccount}
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}