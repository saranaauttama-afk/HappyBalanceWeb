import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";

export default function TermsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const [accepted, setAccepted] = useState(false);

  function handleContinue() {
    if (!accepted) return;
    navigate("/register");
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-16 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader title="ข้อกำหนดการใช้งาน" showBack />

        <main className="relative z-10 space-y-4 px-4 py-4">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(31,47,61,0.14)] backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#1f6658]">HAPPY BALANCE POLICY</p>
            <h1 className="mt-2 text-xl font-extrabold text-[#1d3140]">ก่อนเริ่มใช้งาน กรุณาอ่านและยอมรับเงื่อนไข</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ข้อมูลของคุณจะถูกใช้เพื่อวัตถุประสงค์ด้านการวิจัยและพัฒนาการให้คำปรึกษาเท่านั้น
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTab("terms")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  tab === "terms"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ข้อกำหนดและเงื่อนไข
              </button>

              <button
                type="button"
                onClick={() => setTab("privacy")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  tab === "privacy"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                นโยบายความเป็นส่วนตัว
              </button>
            </div>

            <div className="mt-3 max-h-[48vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {tab === "terms" && (
                <>
                  <p>
                    แอปพลิเคชันนี้มีจุดมุ่งหมายเพื่อใช้ในการศึกษาภายใต้งานวิจัย เรื่องนวัตกรรมการปรึกษาเชิง
                    จิตวิทยาเพื่อเสริมสร้างภาวะสุขสมดุลของบุคคลวัยทำงาน
                  </p>

                  <p>คำตอบของท่านมีความสำคัญอย่างยิ่งต่อการศึกษาและการพัฒนารูปแบบการดูแลสุขภาวะ</p>

                  <p>แบบประเมินและกิจกรรมไม่มีถูกหรือผิด กรุณาตอบตามความเป็นจริงของท่านมากที่สุด</p>

                  <p>
                    ข้อมูลที่ได้จากการใช้งานจะถูกเก็บเป็นความลับ ไม่มีการเผยแพร่เป็นรายบุคคล และรายงานผลใน
                    ภาพรวมเท่านั้น
                  </p>

                  <p>
                    งานวิจัยดำเนินการโดย นางสาวชนินาฏ วัฒนา นิสิตระดับปริญญาเอก สาขาวิชาจิตวิทยาการปรึกษา
                    มหาวิทยาลัยบูรพา
                  </p>

                  <p>
                    อาจารย์ที่ปรึกษา: รองศาสตราจารย์ ดร.เพ็ญนภา กุลนภาดล และ รองศาสตราจารย์ ดร.ภรภัทร์ เฮงอุดมทรัพย์
                  </p>
                </>
              )}

              {tab === "privacy" && (
                <>
                  <p>
                    นโยบายความเป็นส่วนตัวนี้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2565 และใช้กับ
                    แอปพลิเคชัน Happy Balance รวมถึงบริการที่เกี่ยวข้อง
                  </p>

                  <p>
                    ระบบอาจเก็บรวบรวมข้อมูลส่วนตัว ข้อมูลสุขภาวะ และข้อมูลการใช้งาน เพื่อใช้ในการวิเคราะห์และ
                    พัฒนากระบวนการให้คำปรึกษา
                  </p>

                  <p>
                    ข้อมูลดังกล่าวจะถูกจัดเก็บ ดูแล และปกปิดตามมาตรฐานความปลอดภัย โดยจำกัดการเข้าถึงเฉพาะผู้มี
                    ส่วนเกี่ยวข้องกับงานวิจัยเท่านั้น
                  </p>

                  <p>
                    หากผู้ใช้งานไม่ยอมรับนโยบายความเป็นส่วนตัวนี้ ไม่ควรใช้งานแอปพลิเคชันต่อไป
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#d88d80]"
                checked={accepted}
                onChange={() => setAccepted((prev) => !prev)}
              />

              <span>
                ฉันยอมรับข้อกำหนดและเงื่อนไขในการใช้บริการ “Happy Balance” รวมถึงนโยบายความเป็นส่วนตัว
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!accepted}
              className={`mt-4 w-full rounded-2xl px-4 py-3 text-base font-semibold text-white transition ${
                accepted
                  ? "bg-[#d88d80] hover:brightness-105"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              ต่อไป
            </button>
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
