import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知識庫 | 職涯停看聽",
  description: "職涯停看聽內部知識庫 — 方法論、操作 SOP、決策記錄、參考文件",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+TC:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--white)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 1.5rem',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <a href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--charcoal)',
            }}>
              <span style={{ fontSize: '1.25rem' }}>📚</span>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
                職涯停看聽・知識庫
              </span>
            </a>
            <a
              href="https://hq-dashboard.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ← 總部儀表板
            </a>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '0.8125rem',
        }}>
          職涯停看聽 · 內部知識庫 · 由 GitHub 自動同步
        </footer>
      </body>
    </html>
  );
}
