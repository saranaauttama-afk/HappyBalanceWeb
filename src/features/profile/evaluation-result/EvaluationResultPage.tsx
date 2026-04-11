import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  LoaderCircle,
  Lock,
  Save,
  Scale,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import WellbeingRadarChart from "../../../components/charts/WellbeingRadarChart";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import Dialog from "../../../components/ui/Dialog";
import InfoCard from "../../../components/ui/InfoCard";
import { evaluationService } from "../../../services/evaluation.service";
import type { WellbeingEvaluation } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";

type CategoryKey = "physical" | "mental" | "social" | "balance";

type DraftScores = Record<CategoryKey, string>;

type CategoryMeta = {
  key: CategoryKey;
  subtitle: string;
  description: string;
  Icon: typeof Activity;
  chipClass: string;
  softClass: string;
};

const CATEGORY_META: CategoryMeta[] = [
  {
    key: "physical",
    subtitle: "ด้านสุขภาพร่างกาย",
    description:
      "ประเมินพลังงาน การนอน การกิน การเคลื่อนไหว และความพร้อมของร่างกายโดยรวม",
    Icon: Activity,
    chipClass: "bg-[#eef7fd] text-[#2e6a8b]",
    softClass: "bg-[#f4fbff]",
  },
  {
    key: "mental",
    subtitle: "ด้านสุขภาวะทางใจ",
    description:
      "ประเมินอารมณ์ ความเครียด ความมั่นคงทางใจ และความรู้สึกพึงพอใจกับชีวิต",
    Icon: Brain,
    chipClass: "bg-[#eef8f2] text-[#2f7b56]",
    softClass: "bg-[#f4fcf7]",
  },
  {
    key: "social",
    subtitle: "ด้านสุขภาวะทางสังคม",
    description:
      "ประเมินความสัมพันธ์กับครอบครัว คนรอบตัว ชุมชน และการทำงานร่วมกับผู้อื่น",
    Icon: Users,
    chipClass: "bg-[#fff6ef] text-[#8a5a3a]",
    softClass: "bg-[#fffaf6]",
  },
  {
    key: "balance",
    subtitle: "ด้านความสมดุลของชีวิต",
    description:
      "ประเมินความสมดุลระหว่างงาน ครอบครัว สังคม และเวลาส่วนตัวในภาพรวม",
    Icon: Scale,
    chipClass: "bg-[#fff1f6] text-[#7a2a48]",
    softClass: "bg-[#fff7fa]",
  },
];

const EMPTY_DRAFT: DraftScores = {
  physical: "",
  mental: "",
  social: "",
  balance: "",
};

function formatThaiDate(value: Date | string) {
  const parsed = value instanceof Date ? value : new Date(value);
  return parsed.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toSafeScore(value: string | number | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function hasCompletedDraft(draft: DraftScores) {
  return Object.values(draft).every((value) => value !== "");
}

function buildDraftFromEvaluation(evaluation: WellbeingEvaluation): DraftScores {
  return {
    physical: String(toSafeScore(evaluation.physical_score)),
    mental: String(toSafeScore(evaluation.mental_score)),
    social: String(toSafeScore(evaluation.social_score)),
    balance: String(toSafeScore(evaluation.balance_score)),
  };
}

export default function EvaluationResultPage() {
  const userId = getCurrentUserId();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<WellbeingEvaluation | null>(null);
  const [draft, setDraft] = useState<DraftScores>(EMPTY_DRAFT);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvaluation() {
      try {
        setLoading(true);
        setError(null);

        const response = await evaluationService.getWellbeingEvaluation(userId ?? undefined);
        if (!response.success) {
          throw new Error(response.error || "ไม่สามารถโหลดผลประเมินตั้งต้นได้");
        }

        const nextEvaluation = response.data ?? null;
        if (!cancelled) {
          setEvaluation(nextEvaluation);
          setDraft(nextEvaluation ? buildDraftFromEvaluation(nextEvaluation) : EMPTY_DRAFT);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const previewScores = useMemo(
    () => ({
      physical: toSafeScore(draft.physical),
      mental: toSafeScore(draft.mental),
      social: toSafeScore(draft.social),
      balance: toSafeScore(draft.balance),
    }),
    [draft]
  );

  const overallScore = useMemo(() => {
    const values = Object.values(previewScores);
    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round(total / values.length);
  }, [previewScores]);

  const isReadOnly = Boolean(evaluation);
  const canSave = !loading && !saving && !isReadOnly && hasCompletedDraft(draft);

  function updateDraft(key: CategoryKey, rawValue: string) {
    const cleaned = rawValue === "" ? "" : String(toSafeScore(rawValue));
    setDraft((current) => ({
      ...current,
      [key]: cleaned,
    }));
  }

  async function confirmSaveEvaluation() {
    try {
      setSaving(true);
      setError(null);

      const response = await evaluationService.createWellbeingEvaluation({
        user_id: userId ?? undefined,
        physical_score: previewScores.physical,
        mental_score: previewScores.mental,
        social_score: previewScores.social,
        balance_score: previewScores.balance,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกผลประเมินตั้งต้นได้");
      }

      setEvaluation(response.data);
      setDraft(buildDraftFromEvaluation(response.data));
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="ผลประเมินภาวะสุขสมดุล"
          subtitle={
            loading
              ? "กำลังโหลดค่าประเมินตั้งต้น..."
              : isReadOnly
                ? "แสดงผลประเมินตั้งต้นครั้งแรกของทั้ง 4 ด้าน"
                : "กรอกคะแนนตั้งต้นของทั้ง 4 ด้านเพื่อใช้เป็นจุดเริ่มต้นของโครงการ"
          }
          showBack
          showBell
          variant="soft"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          {error ? (
            <InfoCard className="rounded-3xl border-rose-200 bg-rose-50/90">
              <p className="text-sm text-rose-700">{error}</p>
            </InfoCard>
          ) : null}

          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.92)_46%,rgba(238,248,242,0.9)_100%)] p-5 shadow-[0_24px_52px_rgba(31,47,61,0.14)] backdrop-blur">
            <div className="pointer-events-none absolute -left-12 top-16 h-36 w-36 rounded-full bg-[#ffd8bf]/22 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#9ad4be]/18 blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#255f54]">
                  WELLBEING BASELINE
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">
                  คะแนนตั้งต้นภาวะสุขสมดุล 4 ด้าน
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  ใช้บันทึกคะแนนตั้งต้นก่อนติดตามกิจกรรมจริงในโครงการ เพื่อให้เราเห็นจุดเริ่มต้นของคุณอย่างชัดเจน
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORY_META.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-2xl border border-white/90 ${item.softClass} p-3`}
                  >
                    <p className="text-xs font-medium text-slate-500">{item.subtitle}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {previewScores[item.key]}
                    </p>
                  </div>
                ))}
              </div>

              {isReadOnly ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8f2] px-3 py-1.5 text-xs font-semibold text-[#2f7b56]">
                  <Lock size={14} />
                  <span>
                    บันทึกครั้งแรกแล้วเมื่อ {formatThaiDate(evaluation?.created_at || new Date())}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <Lock size={14} />
                  <span>แบบประเมินนี้บันทึกได้ครั้งเดียว กรุณาตรวจสอบคะแนนให้ดีก่อนกดยืนยัน</span>
                </div>
              )}
            </div>
          </section>

          <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">กราฟสุขสมดุลตั้งต้น</h3>
                  <p className="text-xs text-slate-500">คะแนนเฉลี่ยรวม {overallScore}%</p>
                </div>
                <span className="rounded-full bg-[#f5fbff] px-3 py-1 text-xs font-semibold text-[#315d75]">
                  เฉลี่ย {overallScore}%
                </span>
              </div>

              {loading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  <LoaderCircle size={18} className="animate-spin text-slate-400" />
                  <span>กำลังโหลดผลประเมินตั้งต้น...</span>
                </div>
              ) : (
                <WellbeingRadarChart
                  physical={previewScores.physical}
                  mental={previewScores.mental}
                  social={previewScores.social}
                  balance={previewScores.balance}
                />
              )}
            </div>
          </InfoCard>

          <section className="space-y-3">
            {CATEGORY_META.map((item, index) => {
              const value = draft[item.key];
              const numericValue = previewScores[item.key];
              return (
                <InfoCard
                  key={item.key}
                  className="rounded-3xl border-white/70 bg-white/82 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.softClass}`}
                    >
                      <item.Icon size={20} className="text-slate-700" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {index + 1}. {item.subtitle}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.chipClass}`}
                        >
                          {value === "" ? "ยังไม่ได้กรอก" : `${numericValue} / 100`}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-500">{item.description}</p>

                      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <label
                            className="text-sm font-medium text-slate-700"
                            htmlFor={`score-${item.key}`}
                          >
                            คะแนนตั้งต้น
                          </label>
                          <input
                            id={`score-${item.key}`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            value={value}
                            onChange={(event) => updateDraft(item.key, event.target.value)}
                            disabled={loading || saving || isReadOnly}
                            className="h-11 w-24 rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm font-semibold text-slate-900 outline-none transition focus:border-[#7dcdb8] disabled:cursor-not-allowed disabled:bg-slate-100"
                            placeholder="0-100"
                          />
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={numericValue}
                          onChange={(event) => updateDraft(item.key, event.target.value)}
                          disabled={loading || saving || isReadOnly}
                          className="h-2 w-full cursor-pointer accent-[#7dcdb8] disabled:cursor-not-allowed"
                        />

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>น้อย</span>
                          <span>0 - 100 คะแนน</span>
                          <span>มาก</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoCard>
              );
            })}
          </section>

          {!isReadOnly ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!canSave}
              className="flex w-full items-center justify-center gap-2 rounded-[26px] bg-[#d88d80] px-4 py-4 text-base font-semibold text-white shadow-[0_18px_34px_rgba(216,141,128,0.32)] transition hover:brightness-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? "กำลังบันทึกผลประเมิน..." : "บันทึกคะแนนตั้งต้น"}</span>
            </button>
          ) : null}
        </main>

        <Dialog
          open={confirmOpen}
          onClose={() => {
            if (!saving) setConfirmOpen(false);
          }}
          icon={<AlertTriangle size={18} />}
          title="ยืนยันการบันทึกคะแนนตั้งต้น"
          description="ข้อมูลชุดนี้จะถูกใช้เป็นคะแนนเริ่มต้นของโครงการ และบันทึกได้เพียงครั้งเดียว"
          closeOnOverlayClick={!saving}
          footer={
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => void confirmSaveEvaluation()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d88d80] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(216,141,128,0.24)] transition hover:brightness-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}</span>
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-500">
              กรุณาตรวจสอบคะแนนทั้ง 4 ด้านให้แน่ใจก่อนดำเนินการต่อ
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_META.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-2xl border border-white/80 ${item.softClass} p-3`}
                >
                  <p className="text-xs font-medium text-slate-500">{item.subtitle}</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {previewScores[item.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Dialog>

        <Dialog
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          icon={<CheckCircle2 size={18} />}
          title="บันทึกผลประเมินตั้งต้นเรียบร้อยแล้ว"
          description="จากนี้กราฟจะแสดงคะแนนตั้งต้นของคุณ และไม่สามารถแก้ไขชุดข้อมูลนี้ซ้ำได้"
          footer={
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl bg-[#d88d80] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(216,141,128,0.24)] transition hover:brightness-[1.02]"
            >
              รับทราบ
            </button>
          }
        >
          <div className="rounded-2xl bg-[#f8fcfb] p-4 text-sm leading-6 text-slate-600">
            คะแนนตั้งต้นของทั้ง 4 ด้านถูกจัดเก็บเรียบร้อยแล้ว และพร้อมใช้เป็นจุดเริ่มต้นของการติดตามผลในระยะต่อไป
          </div>
        </Dialog>
      </div>
    </MobileShell>
  );
}
