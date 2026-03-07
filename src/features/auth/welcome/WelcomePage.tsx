import { Link } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";

export default function WelcomePage() {
  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col justify-center px-6 py-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            Happy Balance
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Find your balance in everyday life
          </h1>

          <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
            Track your wellness goals, reflect on your daily mood, and stay
            connected with support when you need it.
          </p>

          <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
            Small steps every day can lead to a healthier and happier life.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <Link
            to="/login"
            className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-medium text-white"
          >
            Log In
          </Link>

          <Link
            to="/register"
            className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-center font-medium text-slate-700"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/terms"
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            By continuing you agree to our Terms and Privacy Policy
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}