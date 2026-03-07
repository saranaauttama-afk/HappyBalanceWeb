import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F4F7F8",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "32px 24px",
          textAlign: "center",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        {/* ชื่อโครงการวิจัย */}
        <div
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          นวัตกรรมการปรึกษาเชิงจิตวิทยา
          <br />
          เพื่อเสริมสร้างภาวะสุขสมดุล
          <br />
          ของบุคคลวัยทำงาน
        </div>

        {/* ชื่อแอป */}
        <h1
          style={{
            fontSize: "26px",
            marginBottom: "28px",
            fontWeight: "700",
          }}
        >
          Road to HAPPY BALANCE
        </h1>

        {/* คำถาม */}
        <p
          style={{
            marginBottom: "24px",
            color: "#444",
            fontSize: "16px",
          }}
        >
          คุณมีบัญชีแล้วหรือยัง?
        </p>

        {/* ปุ่มเข้าสู่ระบบ */}
        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#D68B8B",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          เข้าสู่ระบบ
        </button>

        {/* ปุ่มสร้างบัญชี */}
        <button
          onClick={() => navigate("/terms")}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #D68B8B",
            background: "white",
            color: "#D68B8B",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          สร้างบัญชีใหม่
        </button>
      </div>
    </div>
  );
}