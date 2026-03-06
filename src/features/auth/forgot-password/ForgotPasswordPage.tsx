import { Link } from "react-router-dom";
import { useState } from "react";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";
import { text } from "../../../i18n/en";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <MobileShell>
      <AppHeader title={text.forgotPassword} showBack />

      <div className="px-5 py-6">
        <p className="mb-5 text-sm leading-6 text-slate-500">
          Enter your email address and we will send you a reset link.
        </p>

        {submitted ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Reset request submitted. Please check your email.
            </p>

            <Link
              to="/login"
              className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-medium text-white"
            >
              {text.backToLogin}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {text.email}
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white"
            >
              {text.sendResetLink}
            </button>
          </form>
        )}
      </div>
    </MobileShell>
  );
}