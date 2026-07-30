import { getAllCategories } from '@/lib/knowledge';
import SearchBar from '@/app/components/SearchBar';
import AskBox from '@/app/components/AskBox';

export const revalidate = 300;

export default async function HomePage() {
  const categories = await getAllCategories();
  const totalFiles = categories.reduce((s, c) => s + c.files.length, 0);

  // Flatten all files for search
  const searchFiles = categories.flatMap((cat) =>
    cat.files.map((f) => ({
      slug: f.slug,
      name: f.name,
      categoryKey: cat.key,
      categoryLabel: cat.label,
      categoryIcon: cat.icon,
    }))
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>

      {/* Hero */}
      <div style={{ marginBottom: '2rem' }}>
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
          <span>共 {totalFiles} 份文件 · {categories.length} 個分類</span>
        </div>
      </div>

      {/* AI 問答框（RCF-143 工程 3，D4）*/}
      <AskBox />

      {/* Search */}
      <SearchBar files={searchFiles} />

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

      {/* Usage guide */}
      <div style={{
        marginTop: '3rem',
        padding: '1.25rem 1.5rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--charcoal)',
          marginBottom: '0.75rem',
        }}>
          💡 如何使用知識庫
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}>
          <div><strong style={{ color: 'var(--charcoal-soft)' }}>🔍 搜尋</strong><br/>上方搜尋列可跨分類搜尋檔案名稱</div>
          <div><strong style={{ color: 'var(--charcoal-soft)' }}>🧠 方法論</strong><br/>諮詢前查閱框架與診斷邏輯</div>
          <div><strong style={{ color: 'var(--charcoal-soft)' }}>📖 參考文件</strong><br/>LINE 群組同步的外部知識，含 AI 分析</div>
          <div><strong style={{ color: 'var(--charcoal-soft)' }}>📦 產品知識庫</strong><br/>工作坊與課程的完整設計文件</div>
        </div>
      </div>

      {/* Sync info */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem 1.25rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.8125rem',
        color: 'var(--muted)',
        flexWrap: 'wrap',
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
