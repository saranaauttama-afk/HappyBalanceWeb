import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { profileService } from "../../services/profile.service";
import type { User } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";

const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_DIMENSION = 720;

const menuItems = [
  {
    label: "ข้อมูลส่วนตัว",
    subtitle: "จัดการข้อมูลพื้นฐานของบัญชีผู้ใช้งาน",
    to: "/profile/personal-info",
  },
  {
    label: "บันทึกการให้การปรึกษา",
    subtitle: "ดูประวัติและรายละเอียดการรับคำปรึกษา",
    to: "/profile/counseling-record",
  },
  {
    label: "ผลประเมินภาวะสุขสมดุล",
    subtitle: "ติดตามผลประเมินและพัฒนาการของคุณ",
    to: "/profile/evaluation-result",
  },
  {
    label: "การตั้งค่า",
    subtitle: "กำหนดเป้าหมายและการใช้งานแอป",
    to: "/profile/settings",
  },
  {
    label: "ช่วยเหลือ",
    subtitle: "คำถามที่พบบ่อยและช่องทางติดต่อ",
    to: "/profile/help",
  },
];

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
    image.src = source;
  });
}

async function buildOptimizedAvatarDataUrl(file: File) {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const scale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.width, image.height)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("ไม่สามารถประมวลผลรูปภาพได้");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export default function ProfilePage() {
  const userId = getCurrentUserId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function loadUser() {
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getUser(userId ?? undefined);

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบัญชีผู้ใช้งานได้");
      }

      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUser();
  }, [userId]);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HB";

  function openFilePicker() {
    setAvatarError(null);
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    const sizeLimit = MAX_AVATAR_SIZE_MB * 1024 * 1024;
    if (file.size > sizeLimit) {
      setAvatarError(`ขนาดรูปต้องไม่เกิน ${MAX_AVATAR_SIZE_MB}MB`);
      return;
    }

    try {
      setAvatarUploading(true);
      const optimizedDataUrl = await buildOptimizedAvatarDataUrl(file);
      const response = await profileService.uploadProfileAvatar({
        id: userId ?? undefined,
        file_name: file.name,
        mime_type: "image/jpeg",
        image_base64: optimizedDataUrl,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้");
      }

      setUser(response.data);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้");
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fff4e8]/65 to-transparent" />

        <AppHeader
          title="บัญชี"
          subtitle="จัดการข้อมูลและการตั้งค่า"
          showBell
          variant="soft"
        />

        <main className="relative z-10 flex-1 space-y-4 px-4 py-4">
          {loading ? (
            <InfoCard className={cardClassName}>
              <p className="text-sm text-slate-500">กำลังโหลดข้อมูลบัญชี...</p>
            </InfoCard>
          ) : error ? (
            <InfoCard className={cardClassName}>
              <div className="space-y-3">
                <p className="text-sm text-rose-600">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadUser()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  ลองใหม่
                </button>
              </div>
            </InfoCard>
          ) : user ? (
            <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl`}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e6b58f] via-[#f6d9be] to-[#cbe8dd]" />

              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-[#e7f6f0] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658]">
                  HAPPY BALANCE MEMBER
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#f8c6a3_0%,#d7f2e8_100%)] text-2xl font-bold text-[#1f2f3d] ring-4 ring-white/80 shadow-md">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Profile avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={openFilePicker}
                      disabled={avatarUploading}
                      className={`absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white text-white shadow-md transition ${
                        avatarUploading
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-[#d88d80] hover:brightness-105"
                      }`}
                      aria-label="อัปโหลดรูปโปรไฟล์"
                      title="อัปโหลดรูปโปรไฟล์"
                    >
                      <Camera size={14} />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleAvatarChange(e)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-3xl font-semibold text-slate-900">
                      {user.full_name || "บัญชีผู้ใช้งาน"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">{user.phone || "-"}</p>
                    <p className="truncate text-sm text-slate-500">{user.email || "-"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {avatarUploading ? "กำลังอัปโหลดรูปโปรไฟล์..." : "แตะไอคอนกล้องเพื่อเปลี่ยนรูป"}
                    </p>
                  </div>
                </div>

                {avatarError ? <p className="text-xs text-rose-600">{avatarError}</p> : null}
              </div>
            </InfoCard>
          ) : (
            <InfoCard className={cardClassName}>
              <p className="text-sm text-slate-500">ไม่พบข้อมูลบัญชีผู้ใช้งาน</p>
            </InfoCard>
          )}

          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <InfoCard className={cardClassName}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="text-sm text-slate-400 transition group-hover:translate-x-0.5">›</span>
                  </div>
                </InfoCard>
              </Link>
            ))}
          </div>
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}
