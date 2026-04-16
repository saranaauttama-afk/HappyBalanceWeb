import { ChevronLeft, ChevronRight } from "lucide-react";

type WeekNavBarProps = {
  weekStartDate: Date;
  weekEndDate: Date;
  isCurrentWeek: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  isPrevDisabled?: boolean;
};

function formatWeekLabel(from: Date, to: Date) {
  const fromStr = from.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const toStr = to.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  return `${fromStr} – ${toStr}`;
}

export default function WeekNavBar({
  weekStartDate,
  weekEndDate,
  isCurrentWeek,
  onPrev,
  onNext,
  isPrevDisabled = false,
}: WeekNavBarProps) {
  const showNav = !!(onPrev || onNext);

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_4px_16px_rgba(31,47,61,0.08)] backdrop-blur">
        {showNav ? (
          <button
            type="button"
            onClick={onPrev}
            disabled={isPrevDisabled}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-default disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
        ) : (
          <div className="w-7" />
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {formatWeekLabel(weekStartDate, weekEndDate)}
          </span>
          {!isCurrentWeek && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              ย้อนหลัง
            </span>
          )}
        </div>

        {showNav ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isCurrentWeek}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-default disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>
    </div>
  );
}
