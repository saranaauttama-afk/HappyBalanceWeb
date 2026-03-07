type Props = {
  hour: number;
  minute: number;
  onHourChange: (value: number) => void;
  onMinuteChange: (value: number) => void;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clampHour(value: number) {
  if (value < 0) return 23;
  if (value > 23) return 0;
  return value;
}

function clampMinute(value: number) {
  if (value < 0) return 59;
  if (value > 59) return 0;
  return value;
}

type WheelColumnProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

function WheelColumn({ value, onDecrease, onIncrease }: WheelColumnProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onDecrease}
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xl text-rose-300 transition hover:bg-rose-50"
        aria-label="ลดค่า"
      >
        ˄
      </button>

      <div className="flex h-24 w-20 items-center justify-center rounded-[24px] bg-white text-5xl font-black tracking-wider text-slate-900 shadow-sm ring-1 ring-slate-200">
        {pad(value)}
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className="mt-2 flex h-8 w-8 items-center justify-center rounded-full text-xl text-rose-300 transition hover:bg-rose-50"
        aria-label="เพิ่มค่า"
      >
        ˅
      </button>
    </div>
  );
}

export default function TimeWheelPicker({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <WheelColumn
        value={hour}
        onDecrease={() => onHourChange(clampHour(hour - 1))}
        onIncrease={() => onHourChange(clampHour(hour + 1))}
      />

      <div className="px-1 text-5xl font-black text-slate-900">:</div>

      <WheelColumn
        value={minute}
        onDecrease={() => onMinuteChange(clampMinute(minute - 1))}
        onIncrease={() => onMinuteChange(clampMinute(minute + 1))}
      />
    </div>
  );
}
