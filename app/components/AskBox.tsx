'use client';

import { useState } from 'react';

/**
 * AskBox — 開放圖書館 AI 問答框（RCF-143 工程 3，D4：首頁問答框）
 * POST 同源 /api/ask（CSP connect-src 'self' ✅；瀏覽器自動夾帶 Basic Auth 憑證）。
 * 站台慣例：inline styles + CSS vars（非 Tailwind），比照 SearchBar / page.tsx。
 */

interface Source {
  name: string;
  path: string;
  url: string;
}

export default function AskBox() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [err, setErr] = useState('');

  async function ask() {
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setErr('');
    setAnswer('');
    setSources([]);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || '查詢失敗，請稍後再試。');
      } else {
        setAnswer(data.answer || '');
        setSources(Array.isArray(data.sources) ? data.sources : []);
      }
    } catch {
      setErr('連線失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1.25rem 1.5rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--charcoal)',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>💬</span>
        <span>問知識庫（AI）</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>
          — 對話式查詢分析／案例／趨勢／合成語料，附來源
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          placeholder="例如：跨背景轉職的履歷翻譯常見卡點是什麼？"
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 240,
            padding: '0.625rem 0.875rem',
            fontSize: '0.9375rem',
            color: 'var(--charcoal)',
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            outline: 'none',
          }}
        />
        <button
          onClick={ask}
          disabled={loading || !q.trim()}
          style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--white)',
            background: loading || !q.trim() ? 'var(--muted)' : 'var(--accent)',
            border: 'none',
            borderRadius: 6,
            cursor: loading || !q.trim() ? 'default' : 'pointer',
          }}
        >
          {loading ? '查詢中…' : '詢問'}
        </button>
      </div>

      {err && (
        <div style={{ marginTop: '0.875rem', fontSize: '0.875rem', color: 'var(--accent)' }}>
          ⚠️ {err}
        </div>
      )}

      {answer && (
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              fontSize: '0.9375rem',
              color: 'var(--charcoal-soft)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {answer}
          </div>
          {sources.length > 0 && (
            <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                📎 引用來源
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sources.map((s) => (
                  <a
                    key={s.path}
                    href={s.url}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--accent)',
                      background: 'var(--cream)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '0.2rem 0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: 'var(--muted)' }}>
        僅檢索開放圖書館語料（分析／案例／趨勢／合成）；諮詢方法論請查 NotebookLM 顧問工作台（A 館）。
      </div>
    </div>
  );
}
