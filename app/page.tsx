import { getAllCategories } from '@/lib/knowledge';

export const revalidate = 300;

export default async function HomePage() {
  const categories = await getAllCategories();
  const totalFiles = categories.reduce((s, c) => s + c.files.length, 0);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>

      {/* Hero */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: 'var(--charcoal)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: '0.75rem',
        }}>
          知識庫
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '1rem' }}>
          職涯停看聽內部知識庫 — 方法論、操作 SOP、決策記錄、同步自 LINE 群組的參考文件
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(196,98,45,0.08)',
          border: '1px solid rgba(196,98,45,0.2)',
          borderRadius: 6,
          padding: '0.375rem 0.875rem',
          fontSize: '0.8125rem',
          color: 'var(--accent)',
        }}>
          <span>📄</span>
          <span>共 {totalFiles} 份文件 · 4 個分類</span>
        </div>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {categories.map((cat) => (
          <a
            key={cat.key}
            href={`/${cat.key}`}
            className="category-card"
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--charcoal)' }}>
              {cat.label}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              {cat.description}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                background: 'var(--cream)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--muted)',
              }}>
                {cat.files.length} 份文件
              </span>
              <span style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>查看 →</span>
            </div>
          </a>
        ))}
      </div>

      {/* Sync info */}
      <div style={{
        marginTop: '3rem',
        padding: '1rem 1.25rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.8125rem',
        color: 'var(--muted)',
      }}>
        <span>🔄</span>
        <span>
          參考文件每週一 09:30 自動從 LINE 群組同步 ·
          方法論與 SOP 由 Tim 手動更新 ·
          內容儲存於{' '}
          <a
            href="https://github.com/shoppy09/tzlth-hq/tree/main/knowledge"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            GitHub
          </a>
        </span>
      </div>
    </div>
  );
}
