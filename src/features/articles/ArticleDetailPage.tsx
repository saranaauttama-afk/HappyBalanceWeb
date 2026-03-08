import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { articlesService } from "../../services/articles.service";
import type { Article } from "../../types/models";

type ArticleLocationState = {
  article?: Article;
};

function formatPublishedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const location = useLocation();
  const state = location.state as ArticleLocationState | null;
  const decodedArticleId = articleId ? decodeURIComponent(articleId) : "";

  const initialArticle =
    state?.article && state.article.id === decodedArticleId ? state.article : null;

  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!decodedArticleId) {
      setLoading(false);
      setError("ไม่พบบทความที่เลือก");
      return;
    }

    if (article && article.id === decodedArticleId) {
      return;
    }

    let cancelled = false;

    async function loadArticleDetail() {
      try {
        setLoading(true);
        setError(null);

        const response = await articlesService.listArticles(100);

        if (!response.success || !Array.isArray(response.data)) {
          throw new Error(response.error || "ไม่สามารถโหลดบทความได้");
        }

        const selectedArticle =
          response.data.find((item) => item.id === decodedArticleId) ?? null;

        if (!selectedArticle) {
          throw new Error("ไม่พบบทความที่เลือก");
        }

        if (!cancelled) {
          setArticle(selectedArticle);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadArticleDetail();

    return () => {
      cancelled = true;
    };
  }, [decodedArticleId, article]);

  return (
    <MobileShell withBottomNav>
      <AppHeader title="รายละเอียดบทความ" showBack showBell />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">กำลังโหลดรายละเอียดบทความ...</p>
          </InfoCard>
        ) : error || !article ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error || "ไม่พบบทความที่เลือก"}</p>
              <Link
                to="/home"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                กลับหน้าหลัก
              </Link>
            </div>
          </InfoCard>
        ) : (
          <InfoCard>
            <article className="space-y-4">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="h-52 w-full rounded-2xl object-cover"
                />
              ) : null}

              <h1 className="text-xl font-bold leading-8 text-slate-900">{article.title}</h1>

              {formatPublishedDate(article.published_at ?? article.created_at) ? (
                <p className="text-xs text-slate-400">
                  เผยแพร่ {formatPublishedDate(article.published_at ?? article.created_at)}
                </p>
              ) : null}

              <p className="text-sm leading-7 text-slate-700">{article.description}</p>

              {article.link_url ? (
                <a
                  href={article.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-[#d88d80] px-4 py-2 text-sm font-medium text-[#d88d80]"
                >
                  เปิดลิงก์บทความต้นฉบับ
                </a>
              ) : null}
            </article>
          </InfoCard>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}
