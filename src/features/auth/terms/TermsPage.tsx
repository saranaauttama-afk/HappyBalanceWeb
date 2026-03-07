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
      <AppHeader title="ข้อกำหนดการใช้งาน" showBack />

      <div className="px-5 py-6 space-y-4">

        {/* Tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setTab("terms")}
            className={`flex-1 py-3 text-sm font-medium ${
              tab === "terms"
                ? "bg-rose-300 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            ข้อกำหนดและเงื่อนไข
          </button>

          <button
            onClick={() => setTab("privacy")}
            className={`flex-1 py-3 text-sm font-medium ${
              tab === "privacy"
                ? "bg-rose-300 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            นโยบายความเป็นส่วนตัว
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 p-4 text-sm leading-7 text-slate-700 space-y-3">

          {tab === "terms" && (
            <>
              <p>
                แอปพลิเคชันนี้มีจุดมุ่งหมายเพื่อใช้ในการศึกษาภายใต้งานวิจัย
                เรื่องนวัตกรรมการปรึกษาเชิงจิตวิทยาเพื่อเสริมสร้างภาวะสุขสมดุล
                ของบุคคลวัยทำงาน
              </p>

              <p>
                คำตอบของท่านจะเป็นประโยชน์และมีความสำคัญอย่างยิ่งต่อการศึกษาและการวิจัย
              </p>

              <p>
                คำตอบที่ท่านตอบไม่มีถูกหรือผิด ผู้วิจัยขอความกรุณาให้ท่านทำกิจกรรม
                ตามความเป็นจริงและตรงกับความคิดความรู้สึกมากที่สุด
              </p>

              <p>
                ข้อมูลที่ได้จากแอปพลิเคชันนี้จะถูกเก็บเป็นความลับ
                ไม่มีการเผยแพร่เป็นรายบุคคล
                และจะรายงานผลในภาพรวมเท่านั้น
              </p>

              <p>
                งานวิจัยดำเนินการโดย  
                <br />
                นางสาวชนินาฏ วัฒนา
                <br />
                นิสิตระดับปริญญาเอก สาขาวิชาจิตวิทยาการปรึกษา
                มหาวิทยาลัยบูรพา
              </p>

              <p>
                อาจารย์ที่ปรึกษา
                <br />
                รองศาสตราจารย์ ดร.เพ็ญนภา กุลนภาดล
                <br />
                รองศาสตราจารย์ ดร.ภรภัทร์ เฮงอุดมทรัพย์
              </p>
            </>
          )}

          {tab === "privacy" && (
            <>
              <p>
                นโยบายความเป็นส่วนตัวนี้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                พ.ศ. 2565
              </p>

              <p>
                นโยบายนี้ใช้กับแอปพลิเคชัน Happy Balance
                และบริการที่เกี่ยวข้องกับการสื่อสารระหว่างผู้ใช้และผู้วิจัย
              </p>

              <p>
                ผู้วิจัยอาจมีการเก็บรวบรวมข้อมูลส่วนตัวและข้อมูลด้านสุขภาพของผู้ใช้
                ระหว่างการใช้งานแอปพลิเคชัน
              </p>

              <p>
                ข้อมูลดังกล่าวจะถูกจัดเก็บ ดูแล และปกปิดตามหลักการคุ้มครองข้อมูล
                เพื่อประโยชน์ในการวิจัยเท่านั้น
              </p>

              <p>
                หากผู้ใช้งานไม่ยอมรับนโยบายความเป็นส่วนตัวนี้
                ไม่ควรใช้งานแอปพลิเคชันต่อไป
              </p>
            </>
          )}
        </div>

        {/* Accept */}
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />

          <span>
            ฉันยอมรับข้อกำหนดและเงื่อนไขในการใช้บริการ
            “Happy Balance” รวมถึงนโยบายความเป็นส่วนตัว
          </span>
        </label>

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={!accepted}
          className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
            accepted
              ? "bg-rose-300 hover:bg-rose-400"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          ต่อไป
        </button>
      </div>
    </MobileShell>
  );
}