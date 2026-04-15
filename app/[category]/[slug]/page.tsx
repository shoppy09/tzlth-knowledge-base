import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getCategoryFiles, getFileContent, CATEGORY_DEFS, extractTitle } from '@/lib/knowledge';

export const revalidate = 300;

marked.setOptions({ gfm: true, breaks: false });

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const def = CATEGORY_DEFS[category];
  if (!def) notFound();

  let content: string;
  try {
    content = await getFileContent(category, slug);
  } catch {
    notFound();
  }

  const title = extractTitle(content, slug);
  const html = await marked(content);
  const siblings = await getCategoryFiles(category).catch(() => []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>知識庫</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <a href={`/${category}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{def.label}</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--charcoal-soft)' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Main article */}
        <article style={{
          flex: 1,
          minWidth: 0,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '2rem 2.25rem',
        }}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Sidebar: other files in same category */}
        {siblings.length > 1 && (
          <aside style={{
            width: 220,
            flexShrink: 0,
            position: 'sticky',
            top: 72,
          }}>
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {def.icon} {def.label}
              </div>
              {siblings.map((s) => (
                <a
                  key={s.slug}
                  href={`/${category}/${s.slug}`}
                  className={`sidebar-item${s.slug === slug ? ' active' : ''}`}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ marginTop: '1.5rem' }}>
        <a
          href={`/${category}`}
          style={{
            color: 'var(--muted)',
            textDecoration: 'none',
            fontSize: '0.8125rem',
          }}
        >
          ← 返回 {def.label}
        </a>
      </div>
    </div>
  );
}
