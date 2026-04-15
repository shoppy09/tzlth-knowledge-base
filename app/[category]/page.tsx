import { notFound } from 'next/navigation';
import {
  getCategoryFiles,
  getFileContent,
  CATEGORY_DEFS,
  extractTitle,
  extractSnippet,
  countEntries,
} from '@/lib/knowledge';

export const revalidate = 300;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const def = CATEGORY_DEFS[category];
  if (!def) notFound();

  const files = await getCategoryFiles(category);
  const isReferences = category === 'references';

  const fileDetails = await Promise.all(
    files.map(async (f) => {
      try {
        const content = await getFileContent(category, f.slug);
        return {
          ...f,
          title: extractTitle(content, f.slug),
          snippet: isReferences ? null : extractSnippet(content),
          entryCount: isReferences ? countEntries(content) : null,
          syncDate: content.match(/最後同步：(\S+)/)?.[1] ?? null,
        };
      } catch {
        return { ...f, title: f.slug, snippet: null, entryCount: null, syncDate: null };
      }
    })
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>知識庫</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span>{def.label}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>{def.icon}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '-0.01em' }}>
            {def.label}
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>{def.description}</p>
      </div>

      {/* File count badge */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          background: 'rgba(196,98,45,0.08)',
          border: '1px solid rgba(196,98,45,0.2)',
          borderRadius: 5,
          padding: '0.25rem 0.75rem',
          fontSize: '0.8125rem',
          color: 'var(--accent)',
        }}>
          {files.length} 份文件
        </span>
      </div>

      {/* File list */}
      {fileDetails.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--muted)',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 8,
        }}>
          此分類尚無文件
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {fileDetails.map((f) => (
            <a
              key={f.slug}
              href={`/${category}/${f.slug}`}
              className="file-item"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--charcoal)', marginBottom: '0.25rem' }}>
                    {f.title}
                  </div>
                  {f.snippet && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {f.snippet}
                    </div>
                  )}
                  {f.entryCount !== null && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                      {f.entryCount} 條知識條目
                      {f.syncDate && <span> · 最後同步 {f.syncDate}</span>}
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--accent)', fontSize: '0.875rem', flexShrink: 0, paddingTop: '0.125rem' }}>
                  閱讀 →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
